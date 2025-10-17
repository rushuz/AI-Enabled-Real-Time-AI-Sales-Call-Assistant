import { AccessToken, AccessTokenOptions, VideoGrant } from "livekit-server-sdk";
import { RoomAgentDispatch, RoomConfiguration } from "@livekit/protocol";
import { NextRequest, NextResponse } from "next/server";

// NOTE: you are expected to define the following environment variables in `.env.local`:
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

// don't cache the results
export const revalidate = 0;

export type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
};

export async function GET(request: NextRequest) {
  try {
    if (LIVEKIT_URL === undefined) {
      throw new Error("LIVEKIT_URL is not defined");
    }
    if (API_KEY === undefined) {
      throw new Error("LIVEKIT_API_KEY is not defined");
    }
    if (API_SECRET === undefined) {
      throw new Error("LIVEKIT_API_SECRET is not defined");
    }

    // Get room name from URL parameters or use default
    const { searchParams } = new URL(request.url);
    const roomName = searchParams.get('roomName') || 'web-agent';
    const participantName = searchParams.get('participantName') || 
      `voice_assistant_user_${Math.floor(Math.random() * 10_000)}`;

    // Generate participant token with agent dispatch
    const participantToken = await createParticipantTokenWithAgent(
      { identity: participantName },
      roomName,
      "web-agent" // This should match your agent_name in Python
    );

    // Return connection details
    const data: ConnectionDetails = {
      serverUrl: LIVEKIT_URL,
      roomName,
      participantToken: participantToken,
      participantName: participantName,
    };
    
    const headers = new Headers({
      "Cache-Control": "no-store",
    });
    return NextResponse.json(data, { headers });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return new NextResponse(error.message, { status: 500 });
    }
  }
}

function createParticipantTokenWithAgent(userInfo: AccessTokenOptions, roomName: string, agentName: string) {
  const at = new AccessToken(API_KEY, API_SECRET, {
    ...userInfo,
    ttl: "15m",
  });
  
  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };
  
  // Add the room configuration with agent dispatch
  const roomConfig = new RoomConfiguration({
    agents: [
      new RoomAgentDispatch({
        agentName: agentName,
        metadata: JSON.stringify({ 
          source: "web-frontend",
          timestamp: new Date().toISOString()
        })
      })
    ]
  });

  at.addGrant(grant);
  at.roomConfig = roomConfig;
  
  return at.toJwt();
}