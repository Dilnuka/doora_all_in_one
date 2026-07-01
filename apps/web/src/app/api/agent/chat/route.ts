import { NextResponse } from "next/server";
import { prisma } from "@doora/database";
import { auth } from "@/lib/auth";
import { buildAgentContext, executeAgentTool, routineToToolCalls } from "@/lib/agent/execute-tool";
import { runGroqChat, isGroqToolUseError, isLikelyChitChat, type ChatMessage } from "@/lib/agent/groq";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({
        reply:
          "Doora AI needs a GROQ_API_KEY in your environment. Add it to apps/web/.env.local and restart.",
      });
    }

    const body = await request.json();
    const userMessage = String(body.message ?? "").trim();
    const history = (body.history ?? []) as { role: string; content: string }[];

    if (!userMessage) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const user = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      roomId: session.user.roomId,
      tower: session.user.tower,
      apartment: session.user.apartment,
    };

    const context = await buildAgentContext(user);
    const lower = userMessage.toLowerCase().replace(/[^a-z0-9 ]/g, "");

    const routines = await prisma.smartRoutine.findMany({ where: { userId: user.id } });
    const matchedRoutine = routines.find(
      (r) =>
        r.triggerPhrase.toLowerCase() === userMessage.toLowerCase() ||
        r.triggerPhrase.toLowerCase().replace(/[^a-z0-9 ]/g, "") === lower,
    );

    const executedTools: Awaited<ReturnType<typeof executeAgentTool>>[] = [];

    if (matchedRoutine) {
      const calls = routineToToolCalls(matchedRoutine.actions as Record<string, string | number>);
      for (const call of calls) {
        executedTools.push(await executeAgentTool(call.name, call.args, user));
      }
    }

    const systemPrompt = `You are Doora, the unified AI assistant for the Doora Platform (Food + Chat + Smart Room).

You can control the user's room, order food, check orders, search contacts, send messages, and answer questions.

Platform context:
${context}

Rules:
- Use tools only when the user's latest message asks you to DO something (order food, turn off lights, message someone).
- For greetings and casual chat, reply in plain text — do not call tools.
- Execute tools without asking for confirmation unless the request is ambiguous.
- Be concise and friendly.
- For cross-domain requests (e.g. "order biryani and dim the lights"), call multiple tools.
${matchedRoutine ? `\nThe user triggered routine "${matchedRoutine.triggerPhrase}" — actions were already executed. Summarize what was done.` : ""}`;

    let messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...history
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-10)
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      { role: "user", content: userMessage },
    ];

    if (matchedRoutine) {
      return NextResponse.json({
        reply: `Done! I've run your "${matchedRoutine.triggerPhrase}" routine — lights, climate, and other settings are updated.`,
        tools: executedTools,
      });
    }

    const useTools = !isLikelyChitChat(userMessage);

    let completion;
    try {
      completion = await runGroqChat(messages, useTools ? "tools" : "text");
    } catch (error) {
      if (useTools && isGroqToolUseError(error)) {
        completion = await runGroqChat(messages, "text");
      } else {
        throw error;
      }
    }

    const responseMessage = completion.choices[0].message;
    let reply = responseMessage.content ?? "";
    const toolCalls = responseMessage.tool_calls ?? [];

    if (toolCalls.length > 0) {
      messages.push(responseMessage as ChatMessage);

      for (const toolCall of toolCalls) {
        if (toolCall.type !== "function") continue;
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;
        const execResult = await executeAgentTool(functionName, functionArgs, user);
        executedTools.push(execResult);

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name: functionName,
          content: JSON.stringify(execResult),
        });
      }

      const finalCompletion = await runGroqChat(messages, "after-tools");
      if (finalCompletion.choices[0].message.content) {
        reply = finalCompletion.choices[0].message.content;
      }
    }

    if (!reply && executedTools.length > 0) {
      reply = "Done! I've taken care of that for you.";
    }

    await prisma.agentConversation.create({
      data: {
        userId: user.id,
        title: userMessage.slice(0, 80),
        messages: {
          create: [
            { role: "user", content: userMessage },
            {
              role: "assistant",
              content: reply,
              toolCalls: executedTools.length
                ? (JSON.parse(JSON.stringify(executedTools)) as object)
                : undefined,
              model: "llama-3.3-70b-versatile",
            },
          ],
        },
      },
    });

    return NextResponse.json({ reply, tools: executedTools });
  } catch (error) {
    console.error("POST /api/agent/chat:", error);
    const raw = error instanceof Error ? error.message : "Agent error";
    const friendly = isGroqToolUseError(error)
      ? "I had trouble with that request. Try rephrasing, or ask me to do one thing at a time."
      : raw.startsWith("400 ")
        ? "Doora AI hit a temporary model error. Please try again."
        : raw;
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}
