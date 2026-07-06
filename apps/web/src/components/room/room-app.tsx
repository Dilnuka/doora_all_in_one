"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { List, Zap } from "lucide-react";
import Link from "next/link";
import {
  RoomSimulationProvider,
  useRoomSimulation,
} from "@/components/room/room-simulation-provider";
import { RoomDashboard } from "@/components/room/room-dashboard";
import { SmartRoutinesModal } from "@/components/room/smart-routines-modal";

function RoomShell() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { isHydrated, setActiveRoomId } = useRoomSimulation();
  const [routinesOpen, setRoutinesOpen] = useState(false);
  const [adminRooms, setAdminRooms] = useState<{ id: string; code: string; name: string }[]>([]);

  const isAdmin = session?.user?.role === "ADMIN";
  const hasRoom = !!session?.user?.roomId || (isAdmin && !!searchParams.get("roomId"));

  useEffect(() => {
    const roomId = searchParams.get("roomId");
    if (roomId) setActiveRoomId(roomId);
  }, [searchParams, setActiveRoomId]);

  useEffect(() => {
    if (!isAdmin) return;
    fetch("/api/room/admin/rooms")
      .then((r) => r.json())
      .then((d) => setAdminRooms(d.rooms ?? []))
      .catch(() => {});
  }, [isAdmin]);

  if (!hasRoom) {
    if (isAdmin) {
      return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
          <p className="text-slate-400">Select a room from the header dropdown to monitor.</p>
        </div>
      );
    }
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <Zap className="mb-4 h-12 w-12 text-slate-600" />
        <h2 className="text-xl font-semibold text-white">No room assigned</h2>
        <p className="mt-2 max-w-md text-slate-400">
          Your account doesn&apos;t have a smart room linked yet. Try the demo guest account{" "}
          <code className="text-doora-orange">guest@doora.local</code> /{" "}
          <code className="text-doora-orange">guest123</code>.
        </p>
        <Link href="/" className="mt-6 text-doora-orange hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  if (!isHydrated) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-doora-orange border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 bg-slate-900/80 px-4 py-3">
        <div className="flex items-center gap-2">
          {isAdmin && adminRooms.length > 0 && (
            <select
              className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-white"
              value={searchParams.get("roomId") ?? ""}
              onChange={(e) => {
                const id = e.target.value;
                const url = id ? `/room?roomId=${id}` : "/room";
                window.location.href = url;
              }}
            >
              <option value="">My room / select...</option>
              {adminRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code} — {r.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setRoutinesOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
          >
            <List className="h-4 w-4" />
            Routines
          </button>
          <Link
            href="/doora"
            className="rounded-lg bg-doora-orange px-3 py-1.5 text-sm font-medium text-white hover:bg-doora-orange-dark"
          >
            Ask Doora
          </Link>
        </div>
      </header>
      <div className="min-h-0 flex-1">
        <RoomDashboard />
      </div>
      <SmartRoutinesModal open={routinesOpen} onClose={() => setRoutinesOpen(false)} />
    </div>
  );
}

export function RoomApp() {
  return (
    <RoomSimulationProvider>
      <RoomShell />
    </RoomSimulationProvider>
  );
}
