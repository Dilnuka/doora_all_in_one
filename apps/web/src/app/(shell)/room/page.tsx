import { Suspense } from "react";
import { RoomApp } from "@/components/room/room-app";

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center text-slate-400">Loading room...</div>
      }
    >
      <RoomApp />
    </Suspense>
  );
}
