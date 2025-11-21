import { EntityData } from "./types.js";

interface Entity {
  id: string;
  type: "workflow" | "task" | "lease" | "maintenance_request";
  data: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
  roomName: string;
  createdBy: string;
}

// In-memory entity store (use database in production)
const entityStore: Map<string, Entity[]> = new Map();

/**
 * Create a new entity
 */
export function createEntity(
  type: Entity["type"],
  data: Record<string, unknown>,
  roomName: string,
  identity: string
): Entity {
  const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();

  const entity: Entity = {
    id,
    type,
    data,
    createdAt: now,
    updatedAt: now,
    roomName,
    createdBy: identity,
  };

  // Store by room for easy retrieval
  const roomKey = `room-${roomName}`;
  if (!entityStore.has(roomKey)) {
    entityStore.set(roomKey, []);
  }
  entityStore.get(roomKey)!.push(entity);

  return entity;
}

/**
 * Update an entity
 */
export function updateEntity(
  id: string,
  data: Partial<Record<string, unknown>>,
  roomName: string
): Entity | null {
  const roomKey = `room-${roomName}`;
  const entities = entityStore.get(roomKey) || [];

  const entity = entities.find((e) => e.id === id);
  if (!entity) {
    return null;
  }

  entity.data = { ...entity.data, ...data };
  entity.updatedAt = Date.now();
  return entity;
}

/**
 * Delete an entity
 */
export function deleteEntity(id: string, roomName: string): boolean {
  const roomKey = `room-${roomName}`;
  const entities = entityStore.get(roomKey) || [];

  const index = entities.findIndex((e) => e.id === id);
  if (index === -1) {
    return false;
  }

  entities.splice(index, 1);
  return true;
}

/**
 * Get entity by ID
 */
export function getEntity(id: string, roomName: string): Entity | null {
  const roomKey = `room-${roomName}`;
  const entities = entityStore.get(roomKey) || [];
  return entities.find((e) => e.id === id) || null;
}

/**
 * Get all entities of a type in a room
 */
export function getEntitiesByType(
  type: Entity["type"],
  roomName: string
): Entity[] {
  const roomKey = `room-${roomName}`;
  const entities = entityStore.get(roomKey) || [];
  return entities.filter((e) => e.type === type);
}

/**
 * Get all entities in a room
 */
export function getRoomEntities(roomName: string): Entity[] {
  const roomKey = `room-${roomName}`;
  return entityStore.get(roomKey) || [];
}

/**
 * Query entities with filtering
 */
export function queryEntities(
  roomName: string,
  filter?: {
    type?: Entity["type"];
    createdBy?: string;
    status?: string;
  }
): Entity[] {
  const roomKey = `room-${roomName}`;
  let entities = entityStore.get(roomKey) || [];

  if (filter?.type) {
    entities = entities.filter((e) => e.type === filter.type);
  }
  if (filter?.createdBy) {
    entities = entities.filter((e) => e.createdBy === filter.createdBy);
  }
  if (filter?.status) {
    entities = entities.filter((e) => e.data.status === filter.status);
  }

  return entities;
}

/**
 * Get entity audit trail (changes over time)
 */
export function getEntityAuditTrail(
  id: string,
  roomName: string
): { entity: Entity | null; changes: number } {
  const entity = getEntity(id, roomName);
  return {
    entity,
    changes: entity ? 1 : 0, // In production, track actual changes
  };
}

/**
 * Publish entity data (for LiveKit data channel)
 */
export function prepareEntityDataForPublish(entity: Entity): EntityData {
  return {
    type: entity.type,
    id: entity.id,
    data: entity.data,
    timestamp: entity.updatedAt,
  };
}

/**
 * Clean up expired entities (rooms)
 */
export function cleanupExpiredRooms(maxAgeMs: number = 24 * 60 * 60 * 1000): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  for (const [key, entities] of entityStore) {
    if (entities.length === 0) {
      keysToDelete.push(key);
      continue;
    }

    // Check if room is too old and has no recent updates
    const lastUpdate = Math.max(...entities.map((e) => e.updatedAt));
    if (now - lastUpdate > maxAgeMs) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => entityStore.delete(key));
}
