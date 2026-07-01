import { ChatSocketProvider } from "@/components/chat/chat-socket-provider";
import { ChatApp } from "@/components/chat/chat-app";

export default function ChatPage() {
  return (
    <ChatSocketProvider>
      <ChatApp />
    </ChatSocketProvider>
  );
}
