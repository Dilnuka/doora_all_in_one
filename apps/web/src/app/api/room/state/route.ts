import { NextResponse } from "next/server";
import { prisma } from "@doora/database";
import { auth } from "@/lib/auth";
import { parsePersistedRoomSnapshot } from "@/lib/room/room-state";

async function getSessionRoomId() {
  const session = await auth();
  const roomId = session?.user?.roomId;
  if (!roomId) {
    return { error: NextResponse.json({ error: "No room assigned to this account." }, { status: 403 }) };
  }
  return { roomId, session };
}

export async function GET() {
  try {
    const result = await getSessionRoomId();
    if ("error" in result) return result.error;

    const room = await prisma.room.findUnique({
      where: { id: result.roomId },
      select: { state: true, code: true, name: true },
    });

    const snapshot = parsePersistedRoomSnapshot(room?.state);
    if (!snapshot) {
      return NextResponse.json({
        roomState: null,
        serviceQueue: [],
        logs: [],
        roomCode: room?.code,
        roomName: room?.name,
      });
    }

    return NextResponse.json({
      ...snapshot,
      roomCode: room?.code,
      roomName: room?.name,
    });
  } catch (error) {
    console.error("GET /api/room/state:", error);
    return NextResponse.json({ error: "Failed to load room state." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const result = await getSessionRoomId();
    if ("error" in result) return result.error;

    const body = await request.json();
    if (!body?.roomState || typeof body.roomState !== "object") {
      return NextResponse.json({ error: "roomState is required." }, { status: 400 });
    }

    const payload = {
      roomState: body.roomState,
      serviceQueue: Array.isArray(body.serviceQueue) ? body.serviceQueue.slice(0, 30) : [],
      logs: Array.isArray(body.logs) ? body.logs.slice(0, 50) : [],
      updatedAt: new Date().toISOString(),
    };

    await prisma.room.update({
      where: { id: result.roomId },
      data: { state: payload },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PUT /api/room/state:", error);
    return NextResponse.json({ error: "Failed to save room state." }, { status: 500 });
  }
}
