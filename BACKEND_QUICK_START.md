# Backend Quick Start

Fast setup guide for the LiveKit backend.

## 1-Minute Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- LiveKit Cloud account
- OpenAI API key

### Start Backend Locally

```bash
cd /home/engine/project/backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Start server
npm run dev
```

Backend runs on: `http://localhost:3001`

### Test It

```bash
# Health check
curl http://localhost:3001/api/health

# Get token
curl -X POST http://localhost:3001/api/token \
  -H "Content-Type: application/json" \
  -d '{"identity":"user1","roomName":"test"}'
```

## 5-Minute Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd backend
vercel deploy --prod

# Set environment variables in Vercel dashboard:
# LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, OPENAI_API_KEY
```

Your API: `https://your-project.vercel.app/api`

## 5-Minute Railway Deployment (Agent)

1. Go to https://railway.app
2. Create new project from GitHub
3. Select this repository
4. Add Dockerfile service → `backend/Dockerfile`
5. Set environment variables
6. Deploy

Agent runs on Railway automatically on git push.

## Key Files

```
backend/
├── src/
│   ├── index.ts              # Main API server
│   ├── livekitService.ts     # Token generation
│   ├── chatService.ts        # Chat with OpenAI
│   └── entityService.ts      # Entity CRUD
├── agents/
│   ├── agent.py              # Voice agent
│   └── requirements.txt       # Python deps
├── api/
│   ├── token.ts              # Vercel serverless
│   └── health.ts
├── README.md                 # Full documentation
├── DEPLOYMENT_GUIDE.md       # Detailed setup
└── .env.example             # Environment template
```

## API Endpoints

### Health Check
```bash
GET /api/health
```

### Token Generation
```bash
POST /api/token
{
  "identity": "user123",
  "roomName": "test-room"
}
```

### Chat
```bash
POST /api/chat
{
  "message": "Hello",
  "roomName": "test-room",
  "identity": "user123"
}
```

### Entities

Create:
```bash
POST /api/entities
{
  "type": "task",
  "data": {"title": "..."},
  "roomName": "test-room",
  "identity": "user123"
}
```

Get by type:
```bash
GET /api/entities/type/task/test-room
```

Get all:
```bash
GET /api/entities/room/test-room
```

Update:
```bash
PATCH /api/entities/:id/test-room
{"data": {"status": "done"}}
```

Delete:
```bash
DELETE /api/entities/:id/test-room
```

## Environment Variables

```env
LIVEKIT_URL=wss://instance.livekit.cloud
LIVEKIT_API_KEY=APIkey...
LIVEKIT_API_SECRET=secret...
OPENAI_API_KEY=sk-proj-...
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Token generation fails | Check LIVEKIT_* env vars |
| Chat not working | Verify OPENAI_API_KEY |
| CORS errors | Set CORS_ORIGIN in Vercel |
| Agent won't start | Check Python 3.11+ installed |

## Get Help

- [Full Documentation](./backend/README.md)
- [Deployment Guide](./backend/DEPLOYMENT_GUIDE.md)
- [Setup Guide](./BACKEND_SETUP.md)
- [Integration Guide](./FRONTEND_BACKEND_INTEGRATION.md)

## Next Steps

1. ✅ Backend setup
2. ✅ Vercel deployment
3. ✅ Railway agent deployment
4. Update frontend `.env`
5. Test integration
6. Add database (optional)
