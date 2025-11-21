export interface TokenRequest {
  identity: string;
  roomName: string;
  grantCanPublish?: boolean;
  grantCanPublishData?: boolean;
  grantCanSubscribe?: boolean;
  metadata?: string;
}

export interface TokenResponse {
  token: string;
  url: string;
  roomName: string;
  identity: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number;
}

export interface ChatRequest {
  message: string;
  roomName: string;
  identity: string;
  conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  timestamp: number;
  role: "assistant";
}

export interface RoomInfo {
  name: string;
  emptyTimeout: number;
  maxParticipants: number;
  creationTime: number;
  metadata: string;
  numParticipants: number;
  participants: ParticipantInfo[];
}

export interface ParticipantInfo {
  identity: string;
  name: string;
  state: "ACTIVE" | "JOINING" | "LEAVING";
  tracks: TrackInfo[];
  metadata: string;
}

export interface TrackInfo {
  sid: string;
  type: string;
  name: string;
  muted: boolean;
  width: number;
  height: number;
  bitrate: number;
  numForwarders: number;
}

export interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  livekit: boolean;
  uptime: number;
  version: string;
}

export interface EntityData {
  type: "workflow" | "task" | "lease" | "maintenance_request";
  id: string;
  data: Record<string, unknown>;
  timestamp: number;
}
