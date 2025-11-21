# LiveKit Backend Deployment Guide

This guide explains how to deploy the LiveKit backend across multiple platforms.

## Architecture Overview

The backend consists of two main components:

1. **Node.js API Server** (Vercel) - Handles token generation, chat, and entity management
2. **Python Agent** (Railway/Fly.io) - Processes voice interactions with OpenAI

## Prerequisites

- LiveKit Cloud account (wss://instance.livekit.cloud)
- OpenAI API key
- For Vercel: Vercel account
- For Agent: Railway or Fly.io account

## 1. Vercel Deployment (API Server)

### Step 1: Create Vercel Project

```bash
npm install -g vercel
cd backend
vercel link
```

### Step 2: Set Environment Variables

In Vercel Dashboard > Settings > Environment Variables:

```
LIVEKIT_URL=wss://your-instance.livekit.cloud
LIVEKIT_API_KEY=<your-api-key>
LIVEKIT_API_SECRET=<your-api-secret>
OPENAI_API_KEY=sk-proj-...
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Step 3: Deploy

```bash
vercel deploy --prod
```

Your API will be available at: `https://your-project.vercel.app/api`

### API Endpoints

- `POST /api/token` - Generate LiveKit access token
- `POST /api/chat` - Process chat message
- `GET /api/health` - Health check
- `POST /api/entities` - Create entity
- `GET /api/entities/:id/:roomName` - Get entity
- `PATCH /api/entities/:id/:roomName` - Update entity
- `DELETE /api/entities/:id/:roomName` - Delete entity

## 2. Railway Deployment (Python Agent)

### Step 1: Connect Repository

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Select "Deploy from GitHub"
4. Select this repository

### Step 2: Add Python Service

In Railway dashboard:
1. Create new service
2. Select "Dockerfile" deployment method
3. Point to `backend/Dockerfile`

### Step 3: Set Environment Variables

In Railway Settings > Variables:

```
LIVEKIT_URL=wss://your-instance.livekit.cloud
LIVEKIT_API_KEY=<your-api-key>
LIVEKIT_API_SECRET=<your-api-secret>
OPENAI_API_KEY=sk-proj-...
```

### Step 4: Configure Start Command

```
cd agents && python agent.py start
```

### Step 5: Deploy

Railway will automatically deploy on git push.

## 3. Local Development

### Node.js Backend

```bash
cd backend
npm install
npm run dev
```

Runs on `http://localhost:3001`

### Python Agent

```bash
cd backend/agents
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Copy .env.example to .env and fill in credentials
cp .env.example .env

python agent.py start
```

## 4. Testing

### Test Token Generation

```bash
curl -X POST http://localhost:3001/api/token \
  -H "Content-Type: application/json" \
  -d '{
    "identity": "user123",
    "roomName": "test-room"
  }'
```

### Test Chat

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is asset management?",
    "roomName": "test-room",
    "identity": "user123"
  }'
```

### Test Health

```bash
curl http://localhost:3001/api/health
```

## 5. Monitoring

### Vercel Logs

```bash
vercel logs <project-name>
```

### Railway Logs

In Railway dashboard > Deployments > Logs

### Python Agent Logs

```bash
# Local
python agent.py start

# Docker
docker logs <container-id>
```

## 6. Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| LIVEKIT_URL | WebSocket URL of LiveKit instance | wss://bks-j93.livekit.cloud |
| LIVEKIT_API_KEY | LiveKit API key | APICsTFD3VC8EET |
| LIVEKIT_API_SECRET | LiveKit API secret | 2xzwfXvcTuv1C0ppPPvWg0WFStyib0w3 |
| OPENAI_API_KEY | OpenAI API key | sk-proj-... |
| CORS_ORIGIN | Frontend URL for CORS | https://app.vercel.app |
| NODE_ENV | Node environment | production |
| PORT | Server port | 3001 |

## 7. Scaling Considerations

### Vercel
- Serverless functions auto-scale
- In-memory chat history (use Redis for production)
- Max 30s function duration

### Railway
- Set resource limits in dashboard
- Monitor CPU/memory usage
- Use load balancer for multiple agents

### Entity Storage
- Current: In-memory (production: use database)
- Implement: PostgreSQL or MongoDB for persistence
- Add: Cache layer (Redis) for performance

## 8. Production Checklist

- [ ] All environment variables set in production
- [ ] HTTPS enforced on frontend
- [ ] CORS properly configured
- [ ] Database for entity persistence
- [ ] Redis for session management
- [ ] Error tracking (Sentry)
- [ ] Monitoring and alerts
- [ ] Rate limiting configured
- [ ] API documentation published
- [ ] Security audit completed

## 9. Troubleshooting

### Token generation fails
- Check LIVEKIT_* environment variables
- Verify LiveKit instance is accessible
- Check API key permissions

### Chat not working
- Verify OPENAI_API_KEY is set
- Check OpenAI account has API credits
- Review API usage limits

### Agent not connecting
- Verify LIVEKIT_URL and credentials
- Check agent logs for errors
- Verify port 443 (WebSocket) is open

### Entity operations fail
- Check room name is valid
- Verify identity is provided
- Check entity ID exists

## 10. Support

For issues or questions:
1. Check deployment logs
2. Verify all environment variables
3. Test endpoints with curl
4. Contact LiveKit support for WebRTC issues

## API Documentation

### Generate Token

**POST** `/api/token`

Request:
```json
{
  "identity": "user@example.com",
  "roomName": "chat-room-1",
  "metadata": "{\"avatar\":\"url\"}"
}
```

Response:
```json
{
  "token": "eyJhbGc...",
  "url": "wss://your-instance.livekit.cloud",
  "roomName": "chat-room-1",
  "identity": "user@example.com"
}
```

### Process Chat

**POST** `/api/chat`

Request:
```json
{
  "message": "What are my active leases?",
  "roomName": "chat-room-1",
  "identity": "user@example.com"
}
```

Response:
```json
{
  "response": "You have 3 active leases...",
  "timestamp": 1699564800,
  "role": "assistant"
}
```

### Create Entity

**POST** `/api/entities`

Request:
```json
{
  "type": "workflow",
  "data": {
    "title": "Property Inspection",
    "assignedTo": "John Doe",
    "dueDate": "2024-12-31"
  },
  "roomName": "chat-room-1",
  "identity": "user@example.com"
}
```

Response:
```json
{
  "id": "workflow-1699564800-xyz",
  "type": "workflow",
  "data": {...},
  "createdAt": 1699564800,
  "updatedAt": 1699564800,
  "roomName": "chat-room-1",
  "createdBy": "user@example.com"
}
```
