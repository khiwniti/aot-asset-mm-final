import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const LIVEKIT_URL = process.env.LIVEKIT_URL;
    const livekitHealthy = !!LIVEKIT_URL;

    const response = {
      status: livekitHealthy ? "healthy" : "degraded",
      service: "livekit-backend",
      version: "1.0.0",
      livekit: livekitHealthy,
      timestamp: new Date().toISOString(),
    };

    const statusCode = livekitHealthy ? 200 : 503;
    res.status(statusCode).json(response);
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({
      status: "unhealthy",
      error: "Health check failed",
    });
  }
}
