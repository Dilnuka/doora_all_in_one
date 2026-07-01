import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const FALLBACK_ICE_SERVERS = [{ urls: "stun:stun.relay.metered.ca:80" }];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.METERED_API_KEY;
  const domain = process.env.METERED_DOMAIN || "dilnukavsis.metered.live";

  if (!apiKey) {
    return NextResponse.json({ iceServers: FALLBACK_ICE_SERVERS });
  }

  try {
    const url = `https://${domain}/api/v1/turn/credentials?apiKey=${apiKey}`;
    const response = await fetch(url, { next: { revalidate: 3600 } });

    if (!response.ok) {
      throw new Error(`Metered API error: ${response.status}`);
    }

    const iceServers = await response.json();
    return NextResponse.json({ iceServers });
  } catch (error) {
    console.error("GET /api/chat/ice-servers:", error);
    return NextResponse.json({ iceServers: FALLBACK_ICE_SERVERS });
  }
}
