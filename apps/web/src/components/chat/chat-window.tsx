"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Phone, Send, Video } from "lucide-react";
import { chatApi, type ChatMessage, type Conversation } from "@/lib/chat/api";
import { useChatSocket } from "@/components/chat/chat-socket-provider";
import { ChatAvatar } from "@/components/chat/chat-avatar";

function formatMessageTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateDivider(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
}

export function ChatWindow({
  conversation,
  currentUserId,
  currentUserName,
  onBack,
  showBackButton,
  onStartCall,
  canCall = false,
}: {
  conversation: Conversation | null;
  currentUserId: string;
  currentUserName: string;
  onBack?: () => void;
  showBackButton?: boolean;
  onStartCall?: (callType: "audio" | "video") => void;
  canCall?: boolean;
}) {
  const { socket, connected } = useChatSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const participant = conversation?.participants?.[0];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!conversation) {
      setMessages([]);
      return;
    }

    let active = true;
    setLoading(true);
    void (async () => {
      try {
        const { messages: serverMsgs } = await chatApi.getMessages(conversation.id);
        if (active) setMessages(serverMsgs);
        chatApi.markAsRead(conversation.id).catch(() => {});
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [conversation?.id]);

  useEffect(() => {
    if (!loading) scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  useEffect(() => {
    if (!socket || !conversation) return;

    const conversationId = conversation.id;
    socket.emit("conversation:join", { conversationId });

    function onNewMessage({ message }: { message: ChatMessage }) {
      if (message.conversationId !== conversationId) return;
      setMessages((prev) => {
        const withoutPending = prev.filter(
          (m) => !(m.pending && m.content === message.content && m.isOwn),
        );
        if (withoutPending.some((m) => m.id === message.id)) return withoutPending;
        return [...withoutPending, { ...message, isOwn: message.senderId === currentUserId }];
      });
      if (message.senderId !== currentUserId) {
        chatApi.markAsRead(conversationId).catch(() => {});
      }
    }

    function onTypingStart({
      conversationId: cid,
      userId,
      displayName,
    }: {
      conversationId: string;
      userId: string;
      displayName: string;
    }) {
      if (cid === conversationId && userId !== currentUserId) {
        setTypingUser(displayName);
      }
    }

    function onTypingStop({ conversationId: cid, userId }: { conversationId: string; userId: string }) {
      if (cid === conversationId && userId !== currentUserId) {
        setTypingUser(null);
      }
    }

    socket.on("message:new", onNewMessage);
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);

    return () => {
      socket.emit("conversation:leave", { conversationId });
      socket.off("message:new", onNewMessage);
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
    };
  }, [socket, conversation, currentUserId]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || !conversation || !socket) return;

    const tempId = `pending-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: tempId,
      conversationId: conversation.id,
      senderId: currentUserId,
      senderName: currentUserName,
      content: text,
      createdAt: new Date().toISOString(),
      isOwn: true,
      pending: true,
    };

    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    socket.emit("typing:stop", { conversationId: conversation.id });
    socket.emit("message:send", { conversationId: conversation.id, content: text });
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
    if (!socket || !conversation || !connected) return;
    socket.emit("typing:start", { conversationId: conversation.id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", { conversationId: conversation.id });
    }, 2000);
  }

  if (!conversation) {
    return (
      <div className="hidden flex-1 flex-col items-center justify-center bg-doora-navy p-8 text-center md:flex">
        <MessageSquareIcon />
        <h2 className="mt-4 text-xl font-semibold text-white">Select a conversation</h2>
        <p className="mt-2 max-w-sm text-slate-400">
          Choose a chat from the sidebar or message a contact.
        </p>
      </div>
    );
  }

  let lastDate: string | null = null;

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-doora-navy">
      <div className="flex items-center gap-3 border-b border-doora-navy-light/50 bg-doora-navy-light/50 px-4 py-3">
        {showBackButton && onBack && (
          <button
            onClick={onBack}
            className="rounded-xl p-2 text-slate-300 hover:bg-doora-navy-light/50 md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <ChatAvatar
          name={conversation.name}
          color={participant?.avatarColor}
          avatarId={participant?.avatarId}
          status={participant?.status}
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold text-white">{conversation.name}</h2>
          <p className="text-xs text-slate-400">
            {typingUser
              ? `${typingUser} is typing...`
              : participant?.status === "online"
                ? "Online"
                : "Offline"}
          </p>
        </div>
        {onStartCall && conversation.type === "direct" && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onStartCall("audio")}
              disabled={!canCall}
              title={canCall ? "Voice call" : "Contact must be online"}
              className="rounded-xl p-2 text-slate-300 hover:bg-doora-navy-light/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Phone className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => onStartCall("video")}
              disabled={!canCall}
              title={canCall ? "Video call" : "Contact must be online"}
              className="rounded-xl p-2 text-slate-300 hover:bg-doora-navy-light/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Video className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-4 py-3">
        {loading && messages.length === 0 && (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-doora-orange border-t-transparent" />
          </div>
        )}
        {messages.map((msg) => {
          const msgDate = new Date(msg.createdAt).toDateString();
          const showDivider = msgDate !== lastDate;
          if (showDivider) lastDate = msgDate;

          return (
            <div key={msg.id}>
              {showDivider && (
                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-700/50" />
                  <span className="text-xs font-medium text-slate-500">
                    {formatDateDivider(msg.createdAt)}
                  </span>
                  <div className="h-px flex-1 bg-slate-700/50" />
                </div>
              )}
              <div className={`mb-2 flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 sm:max-w-[70%] ${
                    msg.isOwn
                      ? "rounded-br-md bg-doora-orange text-white"
                      : "rounded-bl-md bg-doora-navy-light text-slate-100"
                  } ${msg.pending ? "opacity-70" : ""}`}
                >
                  <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                  <p
                    className={`mt-1 text-[10px] ${msg.isOwn ? "text-doora-orange/40" : "text-slate-500"}`}
                  >
                    {formatMessageTime(msg.createdAt)}
                    {msg.pending && " · Sending"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {!connected && (
        <p className="bg-amber-500/20 px-4 py-1 text-center text-xs text-amber-300">
          Reconnecting — messages may be delayed
        </p>
      )}

      <form
        onSubmit={handleSend}
        className="border-t border-doora-navy-light/50 bg-doora-navy-light/30 px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            disabled={!connected}
            className="flex-1 rounded-2xl border border-doora-navy-light/50 bg-doora-navy px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-doora-orange/50 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || !connected}
            className="rounded-xl bg-doora-orange p-2.5 text-white hover:bg-doora-orange-dark disabled:opacity-40"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

function MessageSquareIcon() {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-doora-orange/10">
      <svg className="h-10 w-10 text-doora-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    </div>
  );
}
