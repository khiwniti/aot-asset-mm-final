import express from "express";
import cors from "cors";
import { config } from "dotenv";
import routes from "./routes.js";

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://vercel.app",
    ],
    credentials: true,
  })
);

// Request logging
app.use((req, express, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "livekit-backend",
    version: "1.0.0",
    environment: NODE_ENV,
  });
});

// Mount API routes
app.use("/api", routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    path: req.path,
    method: req.method,
  });
});

// Error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err.message);
    res.status(500).json({
      error: "Internal Server Error",
      message:
        NODE_ENV === "development" ? err.message : "An error occurred",
    });
  }
);

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 LiveKit Backend running on port ${PORT}`);
  console.log(`📝 Environment: ${NODE_ENV}`);
  console.log(
    `🎤 LiveKit URL: ${process.env.LIVEKIT_URL || "Not configured"}`
  );
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

export default app;
