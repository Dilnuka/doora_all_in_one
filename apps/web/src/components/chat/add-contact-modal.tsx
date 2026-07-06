"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { chatApi, type PublicChatUser } from "@/lib/chat/api";
import { ChatAvatar } from "@/components/chat/chat-avatar";

export function AddContactModal({
  onClose,
  onContactAdded,
}: {
  onClose: () => void;
  onContactAdded: (contact: PublicChatUser) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PublicChatUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { users } = await chatApi.searchUsers(query);
        setResults(users);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  async function handleAdd(user: PublicChatUser) {
    setAdding(user.id);
    setError("");
    try {
      const { contact } = await chatApi.addContact(user.id);
      onContactAdded(contact);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add contact");
    } finally {
      setAdding(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90dvh] w-full max-w-md flex-col rounded-t-2xl border border-doora-navy-light/50 bg-doora-navy sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-doora-navy-light/50 p-4">
          <h2 className="text-lg font-semibold text-white">Add contact</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username or name..."
            autoFocus
            className="w-full rounded-xl border border-doora-navy-light/50 bg-doora-navy-dark px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-doora-orange/50"
          />
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          <div className="mt-4 max-h-64 space-y-1 overflow-y-auto">
            {loading && <p className="py-4 text-center text-sm text-slate-400">Searching...</p>}
            {!loading && query.length >= 2 && results.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-400">No users found</p>
            )}
            {results.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 rounded-xl p-3 hover:bg-doora-navy-light/30"
              >
                <ChatAvatar
                  name={user.displayName}
                  color={user.avatarColor}
                  avatarId={user.avatarId}
                  status={user.status}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{user.displayName}</p>
                  <p className="truncate text-sm text-slate-400">@{user.username}</p>
                </div>
                <button
                  onClick={() => handleAdd(user)}
                  disabled={adding === user.id}
                  className="rounded-lg bg-doora-orange px-3 py-1.5 text-sm font-medium text-white hover:bg-doora-orange-dark disabled:opacity-50"
                >
                  {adding === user.id ? "Adding..." : "Add"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
