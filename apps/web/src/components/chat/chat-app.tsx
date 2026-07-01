"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { chatApi, type Conversation, type PublicChatUser } from "@/lib/chat/api";
import { useChatSocket } from "@/components/chat/chat-socket-provider";
import { useToast } from "@/components/providers/toast-provider";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatWindow } from "@/components/chat/chat-window";
import { AddContactModal } from "@/components/chat/add-contact-modal";
import { ConnectionBanner } from "@/components/chat/connection-banner";
import { useWebRTC } from "@/hooks/use-webrtc";
import { CallOverlay } from "@/components/chat/call-overlay";

export function ChatApp() {
  const { data: session } = useSession();
  const { socket, connected } = useChatSocket();
  const { showToast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<PublicChatUser[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const user = session?.user;
  const webrtc = useWebRTC(socket, user?.id);
  const showMobileChat = Boolean(activeConversation && mobileChatOpen);
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const loadData = useCallback(async () => {
    try {
      const [convRes, contactRes] = await Promise.all([
        chatApi.getConversations(),
        chatApi.getContacts(),
      ]);
      setConversations(convRes.conversations);
      setContacts(contactRes.contacts);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load chat", "error");
    }
  }, [showToast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!socket || !user?.id) return;

    function onConversationUpdated({
      conversationId,
      lastMessage,
    }: {
      conversationId: string;
      lastMessage: Conversation["lastMessage"];
    }) {
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                lastMessage,
                unreadCount:
                  activeConversation?.id === conversationId
                    ? c.unreadCount
                    : c.unreadCount + 1,
              }
            : c,
        );
        const exists = updated.some((c) => c.id === conversationId);
        if (!exists) {
          void loadData();
          return prev;
        }
        return updated.sort((a, b) => {
          const aTime = a.lastMessage?.createdAt || a.createdAt || "";
          const bTime = b.lastMessage?.createdAt || b.createdAt || "";
          return bTime.localeCompare(aTime);
        });
      });
    }

    function onUserStatus({
      userId,
      status,
      user: updatedUser,
    }: {
      userId: string;
      status: string;
      user?: PublicChatUser;
    }) {
      setContacts((prev) => prev.map((c) => (c.id === userId ? { ...c, status } : c)));
      setConversations((prev) =>
        prev.map((conv) => ({
          ...conv,
          participants: conv.participants.map((p) =>
            p.id === userId ? { ...p, status, ...(updatedUser || {}) } : p,
          ),
        })),
      );
      setActiveConversation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.map((p) =>
            p.id === userId ? { ...p, status } : p,
          ),
        };
      });
    }

    function onNewMessage({ message }: { message: { conversationId: string } }) {
      if (activeConversation?.id === message.conversationId) return;
    }

    socket.on("conversation:updated", onConversationUpdated);
    socket.on("user:status", onUserStatus);
    socket.on("message:new", onNewMessage);

    return () => {
      socket.off("conversation:updated", onConversationUpdated);
      socket.off("user:status", onUserStatus);
      socket.off("message:new", onNewMessage);
    };
  }, [socket, user?.id, activeConversation?.id, loadData]);

  if (!user) return null;

  const chatUser = {
    displayName: user.name ?? "User",
    avatarColor: "#6366f1",
    avatarId: null as string | null,
    statusMessage: "",
  };

  function handleSelectConversation(conv: Conversation) {
    setActiveConversation(conv);
    setMobileChatOpen(true);
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c)),
    );
    chatApi.markAsRead(conv.id).catch(() => {});
  }

  async function handleStartChat(contact: PublicChatUser) {
    try {
      const { conversation } = await chatApi.createDirectConversation(contact.id);
      setConversations((prev) => {
        if (prev.some((c) => c.id === conversation.id)) return prev;
        return [conversation, ...prev];
      });
      setActiveConversation(conversation);
      setMobileChatOpen(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not open chat", "error");
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ConnectionBanner connected={connected} />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div
          className={`${showMobileChat ? "max-md:hidden" : "max-md:flex"} md:flex w-full shrink-0 md:w-auto`}
        >
          <ChatSidebar
            user={chatUser}
            conversations={conversations}
            contacts={contacts}
            activeConversationId={activeConversation?.id}
            onSelectConversation={handleSelectConversation}
            onStartChat={handleStartChat}
            onAddContact={() => setShowAddContact(true)}
            connected={connected}
            totalUnread={totalUnread}
          />
        </div>

        <div
          className={`${
            showMobileChat || !activeConversation ? "flex" : "max-md:hidden"
          } min-w-0 flex-1 md:flex`}
        >
          <ChatWindow
            conversation={activeConversation}
            currentUserId={user.id}
            currentUserName={user.name ?? "You"}
            onBack={() => setMobileChatOpen(false)}
            showBackButton={showMobileChat}
            onStartCall={(callType) => {
              const target = activeConversation?.participants?.[0];
              if (!target || !activeConversation) return;
              void webrtc.startCall(
                activeConversation.id,
                target.id,
                target.displayName,
                callType,
              );
            }}
            canCall={activeConversation?.participants?.[0]?.status === "online"}
          />
        </div>
      </div>

      <CallOverlay
        callState={webrtc.callState}
        incomingCall={webrtc.incomingCall}
        activeCall={webrtc.activeCall}
        isMuted={webrtc.isMuted}
        isVideoOff={webrtc.isVideoOff}
        localVideoRef={webrtc.localVideoRef}
        remoteVideoRef={webrtc.remoteVideoRef}
        onAccept={() => void webrtc.acceptCall()}
        onReject={webrtc.rejectCall}
        onEnd={webrtc.endCall}
        onToggleMute={webrtc.toggleMute}
        onToggleVideo={webrtc.toggleVideo}
      />

      {showAddContact && (
        <AddContactModal
          onClose={() => setShowAddContact(false)}
          onContactAdded={(contact) => {
            setContacts((prev) =>
              prev.some((c) => c.id === contact.id) ? prev : [...prev, contact],
            );
            showToast(`${contact.displayName} added`, "success");
          }}
        />
      )}
    </div>
  );
}
