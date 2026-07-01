"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, MessageSquare, Users } from "lucide-react";
import { ChatAvatar } from "@/components/chat/chat-avatar";
import type { Conversation, PublicChatUser } from "@/lib/chat/api";

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60000) return "now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function ChatSidebar({
  user,
  conversations,
  contacts,
  activeConversationId,
  onSelectConversation,
  onStartChat,
  onAddContact,
  connected,
  totalUnread,
}: {
  user: {
    displayName: string;
    avatarColor: string;
    avatarId: string | null;
    statusMessage?: string;
  };
  conversations: Conversation[];
  contacts: PublicChatUser[];
  activeConversationId?: string;
  onSelectConversation: (c: Conversation) => void;
  onStartChat: (c: PublicChatUser) => void;
  onAddContact: () => void;
  connected: boolean;
  totalUnread: number;
}) {
  const [tab, setTab] = useState<"chats" | "contacts">("chats");
  const [search, setSearch] = useState("");

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredContacts = contacts.filter(
    (c) =>
      c.displayName.toLowerCase().includes(search.toLowerCase()) ||
      c.username.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex h-full w-full shrink-0 flex-col border-r border-slate-700/50 bg-slate-800 md:w-80 lg:w-96">
      <div className="border-b border-slate-700/50 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <ChatAvatar
              name={user.displayName}
              color={user.avatarColor}
              avatarId={user.avatarId}
              status="online"
            />
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">{user.displayName}</p>
              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`}
                />
                {connected ? "Connected" : "Reconnecting..."}
              </p>
            </div>
          </div>
          <Link
            href="/doora"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-700/50 hover:text-white"
            title="Doora AI"
          >
            <Bot className="h-5 w-5" />
          </Link>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full rounded-xl border border-slate-600/50 bg-slate-900 px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
      </div>

      <div className="flex border-b border-slate-700/50">
        <button
          onClick={() => setTab("chats")}
          className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium ${
            tab === "chats" ? "border-b-2 border-indigo-500 text-white" : "text-slate-400"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Chats
          {totalUnread > 0 && (
            <span className="rounded-full bg-indigo-600 px-1.5 text-xs">{totalUnread}</span>
          )}
        </button>
        <button
          onClick={() => setTab("contacts")}
          className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium ${
            tab === "contacts" ? "border-b-2 border-indigo-500 text-white" : "text-slate-400"
          }`}
        >
          <Users className="h-4 w-4" />
          Contacts
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "chats" ? (
          filteredConversations.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-400">No conversations yet</p>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className={`flex w-full items-center gap-3 border-b border-slate-700/30 p-4 text-left transition hover:bg-slate-700/20 ${
                  activeConversationId === conv.id ? "bg-slate-700/40" : ""
                }`}
              >
                <ChatAvatar
                  name={conv.name}
                  color={conv.participants[0]?.avatarColor}
                  avatarId={conv.participants[0]?.avatarId}
                  status={conv.participants[0]?.status}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-white">{conv.name}</p>
                    {conv.lastMessage && (
                      <span className="shrink-0 text-xs text-slate-500">
                        {formatTime(conv.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-slate-400">
                    {conv.lastMessage?.content || "No messages yet"}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-xs font-bold text-white">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            ))
          )
        ) : (
          <>
            <div className="p-3">
              <button
                onClick={onAddContact}
                className="w-full rounded-xl bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                + Add contact
              </button>
            </div>
            {filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => onStartChat(contact)}
                className="flex w-full items-center gap-3 border-b border-slate-700/30 p-4 text-left hover:bg-slate-700/20"
              >
                <ChatAvatar
                  name={contact.displayName}
                  color={contact.avatarColor}
                  avatarId={contact.avatarId}
                  status={contact.status}
                />
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{contact.displayName}</p>
                  <p className="text-sm text-slate-400">@{contact.username}</p>
                </div>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
