import { AccessToken } from 'livekit-server-sdk';

/**
 * Generates a LiveKit JWT token for client connections.
 * In production, this should be called from a backend endpoint.
 * For now, we generate it client-side using the SDK.
 */
export async function generateLiveKitToken(): Promise<{ token: string; url: string }> {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const url = process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !url) {
    throw new Error(
      'Missing LiveKit configuration. Please set LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL in your environment.'
    );
  }

  const roomName = 'ai-code-assistant-room';
  const identity = 'user-' + crypto.randomUUID();

  try {
    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      name: `User ${identity.slice(-8)}`,
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return {
      token,
      url,
    };
  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    throw error;
  }
}
