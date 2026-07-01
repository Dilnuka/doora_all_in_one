export type PublicChatUser = {
  id: string;
  username: string;
  displayName: string;
  avatarColor: string;
  avatarId: string | null;
  status: string;
  statusMessage: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatarColor?: string;
  senderAvatarId?: string | null;
  content: string;
  createdAt: string;
  isOwn?: boolean;
  pending?: boolean;
};

export type Conversation = {
  id: string;
  type: string;
  name: string;
  participants: PublicChatUser[];
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    createdAt: string;
  } | null;
  unreadCount: number;
  createdAt?: string;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/chat${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || "Request failed");
  }
  return data as T;
}

export const chatApi = {
  getSocketToken: () => request<{ token: string }>("/socket-token"),
  getContacts: () => request<{ contacts: PublicChatUser[] }>("/contacts"),
  searchUsers: (q: string) =>
    request<{ users: PublicChatUser[] }>(`/contacts/search?q=${encodeURIComponent(q)}`),
  addContact: (contactId: string) =>
    request<{ contact: PublicChatUser }>("/contacts", {
      method: "POST",
      body: JSON.stringify({ contactId }),
    }),
  getConversations: () => request<{ conversations: Conversation[] }>("/conversations"),
  createDirectConversation: (userId: string) =>
    request<{ conversation: Conversation }>("/conversations/direct", {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),
  getMessages: (conversationId: string) =>
    request<{ messages: ChatMessage[] }>(`/conversations/${conversationId}/messages`),
  markAsRead: (conversationId: string) =>
    request<{ success: boolean }>(`/conversations/${conversationId}/read`, {
      method: "POST",
    }),
  getIceServers: () =>
    request<{ iceServers: RTCIceServer[] }>("/ice-servers"),
};
