import Groq from "groq-sdk";
import { AGENT_TOOLS } from "./tools";

export type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content?: string | null;
  tool_calls?: Groq.Chat.Completions.ChatCompletionMessageToolCall[];
  tool_call_id?: string;
  name?: string;
};

export type GroqChatMode = "tools" | "text" | "after-tools";

function hasToolTurn(messages: ChatMessage[]) {
  return messages.some((m) => m.role === "tool" || (m.tool_calls && m.tool_calls.length > 0));
}

/** Casual messages — skip tools to avoid Groq malformed tool_call errors. */
export function isLikelyChitChat(message: string) {
  const text = message.toLowerCase().trim();
  if (/^hey\s+doora/i.test(text)) return true;
  if (
    /^(hi|hey|hello|yo|sup|thanks|thank you|ok|okay|cool|nice)\b/i.test(text) &&
    text.length < 40
  ) {
    return true;
  }
  const actionWords =
    /\b(order|light|lights|ac|door|tv|message|send|lock|unlock|temp|food|biryani|coffee|curtain|routine|online|contact)\b/i;
  return !actionWords.test(text) && text.length < 24;
}

export function isGroqToolUseError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("tool_use_failed") || message.includes("tool call validation failed");
}

export async function runGroqChat(messages: ChatMessage[], mode: GroqChatMode = "tools") {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const groq = new Groq({ apiKey });
  const base = {
    messages: messages as Groq.Chat.Completions.ChatCompletionMessageParam[],
    model: "llama-3.3-70b-versatile" as const,
    max_tokens: 300,
  };

  if (mode === "tools") {
    return groq.chat.completions.create({
      ...base,
      tools: AGENT_TOOLS as Groq.Chat.Completions.ChatCompletionTool[],
      tool_choice: "auto",
    });
  }

  // After tool results, tools must stay in the request but tool_choice must be "none".
  if (mode === "after-tools" || hasToolTurn(messages)) {
    return groq.chat.completions.create({
      ...base,
      tools: AGENT_TOOLS as Groq.Chat.Completions.ChatCompletionTool[],
      tool_choice: "none",
    });
  }

  return groq.chat.completions.create(base);
}
