import type { RoomSnapshot } from "./room-state";

export async function persistRoomSnapshot(snapshot: RoomSnapshot) {
  const res = await fetch("/api/room/state", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(snapshot),
    keepalive: true,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `Save failed (${res.status})`);
  }
  return res.json();
}

export async function loadRoomSnapshot(adminRoomId: string | null = null) {
  const url = adminRoomId
    ? `/api/room/admin/state?roomId=${encodeURIComponent(adminRoomId)}`
    : "/api/room/state";
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `Load failed (${res.status})`);
  }
  return res.json() as Promise<
    RoomSnapshot & { roomCode?: string; roomName?: string; readOnly?: boolean }
  >;
}
