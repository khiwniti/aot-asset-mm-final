import { AccessToken } from "livekit-server-sdk";
import { TokenRequest, TokenResponse, RoomInfo } from "./types.js";

const LIVEKIT_URL = process.env.LIVEKIT_URL || "";
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || "";
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || "";

if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
  console.warn(
    "Warning: LiveKit credentials not fully configured. Voice features will not work."
  );
}

/**
 * Generate a JWT access token for LiveKit WebRTC connection
 */
export async function generateToken(req: TokenRequest): Promise<TokenResponse> {
  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    throw new Error(
      "LiveKit API credentials not configured. Set LIVEKIT_API_KEY and LIVEKIT_API_SECRET."
    );
  }

  const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: req.identity,
    name: req.identity,
    metadata: req.metadata || JSON.stringify({ createdAt: Date.now() }),
  });

  // Grant permissions
  token.addGrant({
    roomJoin: true,
    room: req.roomName,
    canPublish: req.grantCanPublish !== false,
    canPublishData: req.grantCanPublishData !== false,
    canSubscribe: req.grantCanSubscribe !== false,
  });

  const jwt = await token.toJwt();

  return {
    token: jwt,
    url: LIVEKIT_URL,
    roomName: req.roomName,
    identity: req.identity,
  };
}

/**
 * Check if LiveKit server is healthy
 */
export async function checkLiveKitHealth(): Promise<boolean> {
  try {
    if (!LIVEKIT_URL) {
      return false;
    }
    // Simple health check by attempting to parse URL
    new URL(LIVEKIT_URL);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse room name from various formats
 */
export function parseRoomName(name: string): string {
  // Remove special characters and normalize
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .substring(0, 128);
}

/**
 * Validate token request parameters
 */
export function validateTokenRequest(req: Partial<TokenRequest>): string | null {
  if (!req.identity) {
    return "Missing required field: identity";
  }
  if (!req.roomName) {
    return "Missing required field: roomName";
  }
  if (req.identity.length > 256) {
    return "Identity exceeds maximum length of 256 characters";
  }
  if (req.roomName.length > 128) {
    return "Room name exceeds maximum length of 128 characters";
  }
  return null;
}

/**
 * Create room config for new rooms
 */
export interface CreateRoomOptions {
  roomName: string;
  emptyTimeout?: number;
  maxParticipants?: number;
  metadata?: string;
}

export function createRoomConfig(opts: CreateRoomOptions): Record<string, unknown> {
  return {
    name: parseRoomName(opts.roomName),
    empty_timeout: opts.emptyTimeout || 5 * 60, // 5 minutes default
    max_participants: opts.maxParticipants || 0, // 0 = unlimited
    metadata: opts.metadata || "",
  };
}
