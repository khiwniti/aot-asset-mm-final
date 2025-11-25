import { Router, Request, Response } from "express";
import {
  generateToken,
  validateTokenRequest,
  parseRoomName,
  checkLiveKitHealth,
} from "./livekitService.js";
import {
  processChat,
  clearConversation,
  getConversationHistory,
  addToHistory,
} from "./chatService.js";
import {
  createEntity,
  updateEntity,
  deleteEntity,
  getEntity,
  getEntitiesByType,
  getRoomEntities,
  queryEntities,
} from "./entityService.js";
import { TokenRequest, ChatRequest, HealthResponse } from "./types.js";

const router = Router();

// Health check endpoint
router.get("/health", async (req: Request, res: Response) => {
  const livekitHealthy = await checkLiveKitHealth();

  const health: HealthResponse = {
    status: livekitHealthy ? "healthy" : "degraded",
    livekit: livekitHealthy,
    uptime: process.uptime(),
    version: "1.0.0",
  };

  const statusCode = livekitHealthy ? 200 : 503;
  res.status(statusCode).json(health);
});

// Generate LiveKit access token
router.post("/token", async (req: Request, res: Response) => {
  try {
    const tokenReq = req.body as Partial<TokenRequest>;

    // Validate request
    const validationError = validateTokenRequest(tokenReq);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Parse room name
    const roomName = parseRoomName(tokenReq.roomName!);

    // Generate token
    const token = await generateToken({
      identity: tokenReq.identity!,
      roomName,
      grantCanPublish: true,
      grantCanPublishData: true,
      grantCanSubscribe: true,
      metadata: tokenReq.metadata,
    });

    res.json(token);
  } catch (error) {
    console.error("Token generation error:", error);
    res
      .status(500)
      .json({ error: "Failed to generate token", details: String(error) });
  }
});

// Chat endpoint for non-voice interactions
router.post("/chat", async (req: Request, res: Response) => {
  try {
    const chatReq = req.body as Partial<ChatRequest>;

    if (!chatReq.message || !chatReq.roomName || !chatReq.identity) {
      return res.status(400).json({
        error: "Missing required fields: message, roomName, identity",
      });
    }

    const response = await processChat(chatReq as ChatRequest);
    res.json(response);
  } catch (error) {
    console.error("Chat error:", error);
    res
      .status(500)
      .json({ error: "Failed to process chat", details: String(error) });
  }
});

// Clear conversation history
router.delete("/chat/:roomName/:identity", (req: Request, res: Response) => {
  try {
    const { roomName, identity } = req.params;
    clearConversation(roomName, identity);
    res.json({ success: true, message: "Conversation cleared" });
  } catch (error) {
    console.error("Clear conversation error:", error);
    res.status(500).json({ error: "Failed to clear conversation" });
  }
});

// Get conversation history
router.get(
  "/chat-history/:roomName/:identity",
  (req: Request, res: Response) => {
    try {
      const { roomName, identity } = req.params;
      const history = getConversationHistory(roomName, identity);
      res.json({ history });
    } catch (error) {
      console.error("Get history error:", error);
      res.status(500).json({ error: "Failed to retrieve history" });
    }
  }
);

// Entity Management Endpoints

// Create entity
router.post("/entities", (req: Request, res: Response) => {
  try {
    const { type, data, roomName, identity } = req.body;

    if (!type || !data || !roomName || !identity) {
      return res.status(400).json({
        error: "Missing required fields: type, data, roomName, identity",
      });
    }

    const entity = createEntity(type, data, roomName, identity);
    res.status(201).json(entity);
  } catch (error) {
    console.error("Create entity error:", error);
    res.status(500).json({ error: "Failed to create entity" });
  }
});

// Get entity by ID
router.get("/entities/:id/:roomName", (req: Request, res: Response) => {
  try {
    const { id, roomName } = req.params;
    const entity = getEntity(id, roomName);

    if (!entity) {
      return res.status(404).json({ error: "Entity not found" });
    }

    res.json(entity);
  } catch (error) {
    console.error("Get entity error:", error);
    res.status(500).json({ error: "Failed to retrieve entity" });
  }
});

// Update entity
router.patch("/entities/:id/:roomName", (req: Request, res: Response) => {
  try {
    const { id, roomName } = req.params;
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ error: "Missing required field: data" });
    }

    const entity = updateEntity(id, data, roomName);
    if (!entity) {
      return res.status(404).json({ error: "Entity not found" });
    }

    res.json(entity);
  } catch (error) {
    console.error("Update entity error:", error);
    res.status(500).json({ error: "Failed to update entity" });
  }
});

// Delete entity
router.delete("/entities/:id/:roomName", (req: Request, res: Response) => {
  try {
    const { id, roomName } = req.params;
    const deleted = deleteEntity(id, roomName);

    if (!deleted) {
      return res.status(404).json({ error: "Entity not found" });
    }

    res.json({ success: true, message: "Entity deleted" });
  } catch (error) {
    console.error("Delete entity error:", error);
    res.status(500).json({ error: "Failed to delete entity" });
  }
});

// Get entities by type
router.get(
  "/entities/type/:type/:roomName",
  (req: Request, res: Response) => {
    try {
      const { type, roomName } = req.params;
      const validTypes = [
        "workflow",
        "task",
        "lease",
        "maintenance_request",
      ];

      if (!validTypes.includes(type)) {
        return res.status(400).json({
          error: `Invalid entity type. Must be one of: ${validTypes.join(", ")}`,
        });
      }

      const entities = getEntitiesByType(
        type as "workflow" | "task" | "lease" | "maintenance_request",
        roomName
      );
      res.json({ entities, count: entities.length });
    } catch (error) {
      console.error("Get entities by type error:", error);
      res.status(500).json({ error: "Failed to retrieve entities" });
    }
  }
);

// Get all room entities
router.get("/entities/room/:roomName", (req: Request, res: Response) => {
  try {
    const { roomName } = req.params;
    const entities = getRoomEntities(roomName);
    res.json({ entities, count: entities.length });
  } catch (error) {
    console.error("Get room entities error:", error);
    res.status(500).json({ error: "Failed to retrieve room entities" });
  }
});

// Query entities with filters
router.post("/entities/query/:roomName", (req: Request, res: Response) => {
  try {
    const { roomName } = req.params;
    const { type, createdBy, status } = req.body;

    const entities = queryEntities(roomName, {
      type,
      createdBy,
      status,
    });

    res.json({ entities, count: entities.length });
  } catch (error) {
    console.error("Query entities error:", error);
    res.status(500).json({ error: "Failed to query entities" });
  }
});

export default router;
