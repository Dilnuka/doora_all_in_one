import { NextResponse } from "next/server";
import { prisma } from "@doora/database";
import { auth } from "@/lib/auth";
import { parsePersistedRoomSnapshot } from "@/lib/room/room-state";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const roomId = new URL(request.url).searchParams.get("roomId");
    if (!roomId) {
      return NextResponse.json({ error: "roomId is required." }, { status: 400 });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { state: true, code: true, name: true },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found." }, { status: 404 });
    }

    const snapshot = parsePersistedRoomSnapshot(room.state);
    if (!snapshot) {
      return NextResponse.json({
        roomState: null,
        serviceQueue: [],
        logs: [],
        roomCode: room.code,
        roomName: room.name,
        readOnly: true,
      });
    }

    return NextResponse.json({
      ...snapshot,
      roomCode: room.code,
      roomName: room.name,
      readOnly: true,
    });
  } catch (error) {
    console.error("GET /api/room/admin/state:", error);
    return NextResponse.json({ error: "Failed to load room state." }, { status: 500 });
  }
}
