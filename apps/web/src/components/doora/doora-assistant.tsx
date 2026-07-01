"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
  tools?: { name: string; success: boolean }[];
};

const WELCOME: Message = {
  role: "assistant",
  content:
    "Hi! I'm Doora — your unified assistant for Food, Chat, and Smart Room. I can order meals, message contacts, control lights and AC, and more. What can I help with?",
};

const SUGGESTIONS = [
  "Turn off all lights",
  "Order chicken biryani",
  "Who is online?",
  "What's my latest food order?",
  "Lock the door and set AC to 22°C",
];

export function DooraAssistant() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const content = text.trim();
    if (!content || loading) return;

    setError("");
    const userMessage: Message = { role: "user", content };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const history = nextMessages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, history: history.slice(0, -1) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");

      const tools = (data.tools as { name: string; success: boolean }[] | undefined)?.map(
        (t) => ({ name: t.name, success: t.success }),
      );

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, tools },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <header className="shrink-0 border-b border-violet-500/20 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-indigo-500 text-white shadow-lg shadow-violet-600/30">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-white">Doora AI</h1>
            <p className="text-xs text-slate-400">Food · Chat · Smart Room</p>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-violet-600 text-white"
                    : "border border-slate-700/60 bg-slate-800/80 text-slate-100"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.tools && msg.tools.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 border-t border-slate-600/50 pt-2">
                    {msg.tools.map((t, j) => (
                      <span
                        key={j}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                          t.success
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {t.name.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-700/60 bg-slate-800/80 px-4 py-3 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                Thinking…
              </div>
            </div>
          )}

          {messages.length === 1 && !loading && (
            <div className="flex flex-wrap gap-2 pt-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendMessage(s)}
                  className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-200 transition hover:border-violet-400/50 hover:bg-violet-500/20"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="px-6 text-center text-sm text-red-400">{error}</p>
      )}

      <form
        className="shrink-0 border-t border-slate-700/50 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
      >
        <div className="mx-auto flex max-w-2xl gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Doora anything…"
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-600/60 bg-slate-800/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-violet-600/25 transition hover:opacity-90 disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
