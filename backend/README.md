# LiveKit Backend for AOT Asset Management

Backend API server for LiveKit voice agent integration with real-time entity management.

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌────────────────┐
│  Frontend       │  HTTP   │  Vercel API      │  gRPC   │  LiveKit Cloud │
│  (React)        │────────▶│  (Node.js)       │────────▶│  (WebRTC)      │
└─────────────────┘         └──────────────────┘         └────────────────┘
                                     │                            │
                                     │ Fire & Forget             │ Agent
                                     └───────────────────────────┼──────────┐
                                                                  │          │
                                                                  │    ┌─────▼─────────┐
                                                                  └────│  Python Agent  │
                                                                       │  (Railway)     │
                                                                       └────────────────┘
```

## Features

- **Token Generation**: Secure JWT tokens for WebRTC connections
- **Chat API**: Non-voice interactions with GPT-4
- **Entity Management**: CRUD operations for workflows, tasks, leases, maintenance requests
- **Real-time Sync**: Cross-browser entity synchronization
- **Health Monitoring**: System health checks
- **Production Ready**: Deployable to Vercel, Railway, Docker

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+ (for agent)
- LiveKit Cloud account
- OpenAI API key

### Installation

```bash
cd backend

# Backend API
npm install

# Agent (optional for local dev)
cd agents
pip install -r requirements.txt
```

### Environment Setup

```bash
# Backend
cp .env.example .env
# Edit .env with your credentials

# Agent
cd agents
cp .env.example .env
# Edit .env with your credentials
```

### Local Development

**Terminal 1: API Server**
```bash
npm run dev
# http://localhost:3001
```

**Terminal 2: Python Agent**
```bash
cd agents
python -m venv venv
source venv/bin/activate
python agent.py start
```

## API Reference

### Health Check
```bash
GET /api/health
```

### Token Generation
```bash
POST /api/token
Content-Type: application/json

{
  "identity": "user123",
  "roomName": "meeting-1"
}
```

### Chat
```bash
POST /api/chat
Content-Type: application/json

{
  "message": "What are my active leases?",
  "roomName": "meeting-1",
  "identity": "user123"
}
```

### Entities

**Create**
```bash
POST /api/entities
{
  "type": "workflow",
  "data": {"title": "..."},
  "roomName": "meeting-1",
  "identity": "user123"
}
```

**Get**
```bash
GET /api/entities/:id/:roomName
```

**Update**
```bash
PATCH /api/entities/:id/:roomName
{
  "data": {"status": "completed"}
}
```

**Delete**
```bash
DELETE /api/entities/:id/:roomName
```

**List by Type**
```bash
GET /api/entities/type/:type/:roomName
```

## Deployment

### Vercel (API Server)

```bash
npm install -g vercel
vercel deploy --prod
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed setup.

### Railway (Python Agent)

1. Connect GitHub repository
2. Create new Dockerfile service
3. Set environment variables
4. Deploy

## Project Structure

```
backend/
├── src/
│   ├── index.ts           # Main Express server
│   ├── types.ts           # TypeScript types
│   ├── livekitService.ts  # LiveKit token generation
│   ├── chatService.ts     # Chat processing with OpenAI
│   ├── entityService.ts   # Entity CRUD operations
│   └── routes.ts          # API routes
├── api/
│   ├── token.ts           # Vercel serverless token endpoint
│   └── health.ts          # Vercel health check
├── agents/
│   ├── agent.py           # Main LiveKit agent
│   ├── requirements.txt    # Python dependencies
│   └── .env.example       # Environment template
├── package.json           # Node dependencies
├── tsconfig.json          # TypeScript config
├── vercel.json            # Vercel configuration
├── Dockerfile             # Docker image definition
├── Procfile               # Heroku/Railway deployment
└── DEPLOYMENT_GUIDE.md    # Complete deployment guide
```

## Configuration

### Environment Variables

```env
# LiveKit
LIVEKIT_URL=wss://your-instance.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Server
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-app.vercel.app
```

## Development

### Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build TypeScript
npm run start     # Run production build
npm run deploy    # Deploy to Vercel
npm run dev:local # Preview locally with Vercel
```

## Entity Types

- **Workflow**: Multi-step processes with status tracking
- **Task**: Individual work items on Kanban board
- **Lease**: Property lease agreements with renewal tracking
- **MaintenanceRequest**: Work orders with cost tracking

## Voice Agent

The Python agent provides real-time voice interaction:

- Speech-to-text (OpenAI STT)
- Natural language processing (GPT-4)
- Text-to-speech (OpenAI TTS)
- Entity management via voice commands

Thai language support for healthcare scenarios:
- OPD pre-screening
- Patient symptom collection
- Triage level assignment
- Queue ticket generation

## Production Considerations

### Persistence
- Replace in-memory stores with database (PostgreSQL/MongoDB)
- Use Redis for session management

### Scalability
- API auto-scales on Vercel
- Agent requires load balancing for multiple workers
- Implement message queues for heavy operations

### Security
- Enable API rate limiting
- Implement request signing
- Add audit logging
- Use HTTPS/WSS only

### Monitoring
- Connect to error tracking (Sentry)
- Setup performance monitoring
- Configure log aggregation
- Create alerting rules

## Testing

```bash
# Health check
curl http://localhost:3001/api/health

# Token generation
curl -X POST http://localhost:3001/api/token \
  -H "Content-Type: application/json" \
  -d '{"identity":"user1","roomName":"test"}'

# Chat
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","roomName":"test","identity":"user1"}'
```

## Troubleshooting

**Token generation fails**: Check LIVEKIT_* variables  
**Chat not working**: Verify OPENAI_API_KEY  
**Agent not connecting**: Check LiveKit credentials  
**CORS errors**: Update CORS_ORIGIN variable  

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for comprehensive troubleshooting.

## License

See [LICENSE](../LICENSE)

## Support

For issues or questions:
1. Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. Review logs: `vercel logs` or Railway dashboard
3. Test endpoints with provided curl examples
4. Contact LiveKit support for WebRTC issues
