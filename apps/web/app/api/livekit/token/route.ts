import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";

export const runtime = "edge";

async function generateToken(room: string, identity: string) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: identity,
    ttl: "15m",
  });

  at.addGrant({ roomJoin: true, room: room });

  const token = await at.toJwt();

  return NextResponse.json({ token, accessToken: token });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const room = url.searchParams.get("roomName") || url.searchParams.get("room") || "sorborno-room";
  const participantName = url.searchParams.get("participantName") || url.searchParams.get("identity") || ("user-" + Math.floor(Math.random() * 10000));

  return generateToken(room, participantName);
}

export async function POST(request: Request) {
  let room = "sorborno-room";
  let participantName = "user-" + Math.floor(Math.random() * 10000);

  try {
    const body = await request.json();
    if (body.roomName || body.room) {
      room = body.roomName || body.room;
    }
    if (body.participantName || body.identity) {
      participantName = body.participantName || body.identity;
    }
  } catch (e) {
    // fallback to defaults if body cannot be parsed
  }

  return generateToken(room, participantName);
}
