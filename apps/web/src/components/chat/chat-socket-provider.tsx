"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { io, type Socket } from "socket.io-client";
import { chatApi } from "@/lib/chat/api";

type SocketContextValue = {
  socket: Socket | null;
  connected: boolean;
};

const SocketContext = createContext<SocketContextValue>({ socket: null, connected: false });

const REALTIME_URL =
  process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3001";

export function ChatSocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const { token } = await chatApi.getSocketToken();
        if (cancelled) return;

        const s = io(REALTIME_URL, {
          auth: { token },
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionAttempts: Infinity,
        });

        s.on("connect", () => setConnected(true));
        s.on("disconnect", () => setConnected(false));

        socketRef.current = s;
        setSocket(s);
      } catch (err) {
        console.error("Socket connection failed:", err);
      }
    })();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [session?.user?.id, status]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useChatSocket() {
  return useContext(SocketContext);
}
