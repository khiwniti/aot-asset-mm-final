# Frontend-Backend Integration Guide

Guide for connecting the React frontend to the LiveKit backend API.

## Overview

The frontend communicates with two services:

1. **Backend API** (Vercel): Token generation, chat, entity management
2. **LiveKit Cloud**: Direct WebRTC connection for voice

```
React Frontend (Vite)
     ↓ HTTPS/REST
Backend API (Vercel)
     ↓ gRPC
LiveKit Cloud (WebRTC)
     ↓
Voice Agent (Python)
```

## Configuration

### 1. Update Environment Variables

Create `.env.local` in project root:

```env
# Development
VITE_API_URL=http://localhost:3001/api
VITE_LIVEKIT_URL=wss://your-instance.livekit.cloud

# Production (Vercel)
# VITE_API_URL=https://your-backend.vercel.app/api
# VITE_LIVEKIT_URL=wss://your-instance.livekit.cloud
```

### 2. Update Services

#### livekitTokenService.ts

Replace with backend call:

```typescript
// services/livekitTokenService.ts
const API_URL = import.meta.env.VITE_API_URL;

export async function generateToken(
  identity: string,
  roomName: string,
  metadata?: string
) {
  const response = await fetch(`${API_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity, roomName, metadata }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate token');
  }

  return response.json();
}
```

#### livekitChatService.ts

Add backend chat calls:

```typescript
// services/livekitChatService.ts
const API_URL = import.meta.env.VITE_API_URL;

export async function sendMessage(
  message: string,
  roomName: string,
  identity: string
): Promise<string> {
  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, roomName, identity }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  const data = await response.json();
  return data.response;
}

export async function getChatHistory(
  roomName: string,
  identity: string
): Promise<ChatMessage[]> {
  const response = await fetch(
    `${API_URL}/chat-history/${roomName}/${identity}`
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.history || [];
}

export async function clearChat(roomName: string, identity: string) {
  await fetch(`${API_URL}/chat/${roomName}/${identity}`, {
    method: 'DELETE',
  });
}
```

## Entity Management Integration

### Create Entity

```typescript
// services/entityService.ts
const API_URL = import.meta.env.VITE_API_URL;

export async function createEntity(
  type: 'workflow' | 'task' | 'lease' | 'maintenance_request',
  data: Record<string, unknown>,
  roomName: string,
  identity: string
) {
  const response = await fetch(`${API_URL}/entities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, data, roomName, identity }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create ${type}`);
  }

  return response.json();
}
```

### Get Entities

```typescript
export async function getEntitiesByType(
  type: string,
  roomName: string
) {
  const response = await fetch(
    `${API_URL}/entities/type/${type}/${roomName}`
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.entities || [];
}

export async function getRoomEntities(roomName: string) {
  const response = await fetch(`${API_URL}/entities/room/${roomName}`);

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.entities || [];
}
```

### Update Entity

```typescript
export async function updateEntity(
  id: string,
  data: Record<string, unknown>,
  roomName: string
) {
  const response = await fetch(
    `${API_URL}/entities/${id}/${roomName}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to update entity');
  }

  return response.json();
}
```

### Delete Entity

```typescript
export async function deleteEntity(id: string, roomName: string) {
  const response = await fetch(
    `${API_URL}/entities/${id}/${roomName}`,
    { method: 'DELETE' }
  );

  if (!response.ok) {
    throw new Error('Failed to delete entity');
  }

  return response.json();
}
```

## Chat Context Integration

Update `ChatContext.tsx` to use backend:

```typescript
// context/ChatContext.tsx
import { createContext, useState, useCallback } from 'react';
import { sendMessage, getChatHistory } from '@/services/livekitChatService';

export const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [identity, setIdentity] = useState('');

  const handleMessage = useCallback(
    async (message: string) => {
      // Add user message optimistically
      setMessages(prev => [
        ...prev,
        { role: 'user', content: message, timestamp: Date.now() }
      ]);

      try {
        // Get response from backend
        const response = await sendMessage(message, roomName, identity);

        // Add assistant response
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: response, timestamp: Date.now() }
        ]);
      } catch (error) {
        console.error('Chat error:', error);
        // Handle error
      }
    },
    [roomName, identity]
  );

  return (
    <ChatContext.Provider value={{ messages, handleMessage, setRoomName, setIdentity }}>
      {children}
    </ChatContext.Provider>
  );
}
```

## Voice Setup

### Connect to Room

```typescript
// components/VoiceChat.tsx
import { useEffect, useState } from 'react';
import { useRoom, useParticipants } from '@livekit/components-react';
import { generateToken } from '@/services/livekitTokenService';

export function VoiceChat() {
  const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

  const connectToRoom = async (identity: string, roomName: string) => {
    try {
      // Get token from backend
      const { token } = await generateToken(identity, roomName);

      // Connect to LiveKit
      const room = await connect(LIVEKIT_URL, token, {
        autoSubscribe: true,
        dynacast: true,
      });

      console.log(`Connected to room: ${roomName}`);
      return room;
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  return (
    <div>
      {/* Voice UI */}
    </div>
  );
}
```

## Development Workflow

### 1. Start Both Services

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run dev:backend

# Terminal 3: Agent (optional)
cd backend/agents
python agent.py start
```

### 2. Test Integration

```typescript
// In browser console
const token = await fetch('http://localhost:3001/api/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identity: 'test-user',
    roomName: 'test-room'
  })
}).then(r => r.json());

console.log(token);
```

### 3. Monitor Connections

Check browser DevTools:
- Network tab: HTTP requests to backend
- Console: LiveKit connection logs
- Application tab: LocalStorage for session data

## Production Deployment

### Update Environment Variables

In Vercel (Frontend) → Settings → Environment Variables:

```env
VITE_API_URL=https://your-backend.vercel.app/api
VITE_LIVEKIT_URL=wss://your-instance.livekit.cloud
```

In Vercel (Backend) → Settings → Environment Variables:

```env
LIVEKIT_URL=wss://your-instance.livekit.cloud
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
OPENAI_API_KEY=...
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Test Production Endpoints

```bash
API_URL="https://your-backend.vercel.app/api"

# Token
curl -X POST $API_URL/token \
  -H "Content-Type: application/json" \
  -d '{"identity":"user1","roomName":"test"}'

# Chat
curl -X POST $API_URL/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message":"Hello",
    "roomName":"test",
    "identity":"user1"
  }'
```

## Error Handling

### Network Errors

```typescript
async function handleAPICall(fn) {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof TypeError) {
      // Network error
      showNotification('Network connection failed');
    } else {
      // API error
      showNotification(error.message);
    }
  }
}
```

### Auth Errors

```typescript
const response = await fetch(url, options);

if (response.status === 401) {
  // Token expired, refresh
  refreshToken();
  // Retry request
}
```

## Debugging

### Enable API Logging

```typescript
// services/apiClient.ts
const API_URL = import.meta.env.VITE_API_URL;

async function apiCall(method, path, body?) {
  const url = `${API_URL}${path}`;
  
  console.log(`[API] ${method} ${path}`, body);
  
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  console.log(`[API Response] ${response.status}`, data);
  
  if (!response.ok) {
    throw new Error(data.error || 'API call failed');
  }

  return data;
}
```

### Check Backend Status

```typescript
async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_URL}/health`);
    const health = await response.json();
    console.log('Backend health:', health);
    return health.status === 'healthy';
  } catch (error) {
    console.error('Backend unavailable:', error);
    return false;
  }
}
```

## Common Issues

### CORS Errors

Error: `Access to XMLHttpRequest blocked by CORS policy`

**Fix**: Update `CORS_ORIGIN` in backend environment:
```env
CORS_ORIGIN=https://your-frontend.vercel.app
```

### 404 Errors

Error: `POST /api/token 404`

**Check**:
- Backend is running on correct port
- VITE_API_URL is correct
- Backend routes are registered

### 401 Errors

Error: `Failed to generate token`

**Check**:
- LIVEKIT_API_KEY is set
- LIVEKIT_API_SECRET is set
- Credentials are correct

### Timeout Errors

Error: `Request timeout`

**Check**:
- Backend is responding (health check)
- OpenAI API is reachable
- Network connectivity

## Performance Tips

1. **Cache Tokens**: Reuse tokens while valid
2. **Batch Entities**: Fetch multiple entities at once
3. **Debounce Chat**: Limit message frequency
4. **Optimize Images**: Compress assets
5. **Use CDN**: For static assets

## Security Considerations

1. **API Key**: Never expose OPENAI_API_KEY on frontend
2. **Token Expiry**: Implement token refresh
3. **HTTPS**: Always use HTTPS in production
4. **CORS**: Restrict to known origins
5. **Rate Limiting**: Implement on backend

## Next Steps

1. Implement proper error handling
2. Add loading states
3. Implement token refresh
4. Add analytics
5. Setup monitoring
