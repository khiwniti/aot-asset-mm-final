# Backend Setup Guide

Complete guide for setting up the LiveKit backend for Vercel serverless deployment.

## Table of Contents

1. [Overview](#overview)
2. [Local Development](#local-development)
3. [Vercel Deployment](#vercel-deployment)
4. [Railway Deployment](#railway-deployment)
5. [Configuration](#configuration)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

## Overview

The backend consists of:

- **API Server** (Node.js on Vercel): Token generation, chat, entity management
- **Voice Agent** (Python on Railway): Real-time voice processing with OpenAI

```
Frontend (React)
     ↓
API Server (Vercel)  ← Token, Chat, Entities
     ↓
LiveKit Cloud  ← WebRTC Connection
     ↓
Agent (Railway)  ← Voice Processing
```

## Local Development

### Prerequisites

```bash
# Node.js 18+ and npm
node --version
npm --version

# Python 3.11+
python --version
pip --version
```

### 1. Clone Repository

```bash
git clone <repository-url>
cd /home/engine/project
git checkout feat-livekit-vercel-backend
```

### 2. Backend Setup

```bash
cd backend

# Install Node dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

Update `.env`:
```env
LIVEKIT_URL=wss://your-instance.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
OPENAI_API_KEY=sk-proj-...
NODE_ENV=development
PORT=3001
```

### 3. Start API Server

```bash
cd backend
npm run dev
```

Output:
```
🚀 LiveKit Backend running on port 3001
📝 Environment: development
🎤 LiveKit URL: wss://your-instance.livekit.cloud
```

### 4. Agent Setup (Optional)

```bash
cd backend/agents

# Create Python virtual environment
python -m venv venv

# Activate it
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Copy environment
cp .env.example .env
nano .env

# Start agent
python agent.py start
```

### 5. Test API

In a new terminal:

```bash
# Health check
curl http://localhost:3001/api/health

# Generate token
curl -X POST http://localhost:3001/api/token \
  -H "Content-Type: application/json" \
  -d '{
    "identity": "user123",
    "roomName": "test-room"
  }'

# Chat
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, what can you help with?",
    "roomName": "test-room",
    "identity": "user123"
  }'
```

## Vercel Deployment

### Prerequisites

- Vercel account (free tier available)
- GitHub repository
- Domain name (optional)

### Step 1: Create Vercel Project

```bash
npm install -g vercel

cd backend

# Link to Vercel (follow prompts)
vercel link

# Verify project
vercel project list
```

### Step 2: Set Environment Variables

**Option A: Via CLI**

```bash
vercel env add LIVEKIT_URL
vercel env add LIVEKIT_API_KEY
vercel env add LIVEKIT_API_SECRET
vercel env add OPENAI_API_KEY
```

**Option B: Via Dashboard**

1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add each variable for "Production" and "Preview"

### Step 3: Build and Test Locally

```bash
cd backend

# Install dependencies
npm ci

# Build
npm run build

# Preview locally
vercel dev

# Visit http://localhost:3000
```

### Step 4: Deploy to Production

```bash
vercel deploy --prod

# Output includes URL like: https://your-project.vercel.app
```

### Step 5: Verify Deployment

```bash
# Replace with your Vercel URL
API_URL="https://your-project.vercel.app/api"

# Health check
curl $API_URL/health

# Token
curl -X POST $API_URL/token \
  -H "Content-Type: application/json" \
  -d '{
    "identity": "user1",
    "roomName": "production"
  }'
```

### View Logs

```bash
vercel logs <project-name>
```

## Railway Deployment

### Prerequisites

- Railway account (free tier available)
- GitHub repository linked
- Docker installed locally

### Step 1: Create Railway Project

1. Go to https://railway.app
2. Create new project
3. Select "Deploy from GitHub"
4. Choose this repository

### Step 2: Add Service

In Railway Dashboard:
1. New → Dockerfile
2. Select `backend/Dockerfile` path
3. Deploy

### Step 3: Set Environment Variables

In Railway Dashboard → Services → Settings:

```
LIVEKIT_URL=wss://your-instance.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
OPENAI_API_KEY=sk-proj-...
```

### Step 4: Configure Start Command

In Railway Dashboard → Variables:

```
Dockerfile path: backend/Dockerfile
Start command: cd agents && python agent.py start
```

### Step 5: Deploy

Railway automatically deploys on git push. Monitor via dashboard.

### View Logs

In Railway Dashboard → Deployments → Logs

## Configuration

### Environment Variables Reference

| Variable | Service | Required | Example |
|----------|---------|----------|---------|
| LIVEKIT_URL | Both | Yes | wss://instance.livekit.cloud |
| LIVEKIT_API_KEY | Both | Yes | APICsTFD3VC8EET |
| LIVEKIT_API_SECRET | Both | Yes | 2xzwfXvcTuv1C0... |
| OPENAI_API_KEY | Both | Yes | sk-proj-... |
| NODE_ENV | API | No | production |
| PORT | API | No | 3001 |
| CORS_ORIGIN | API | No | https://app.vercel.app |

### LiveKit Configuration

Get from https://livekit.io/dashboard:

1. Create workspace
2. Go to Keys → API Key
3. Copy credentials

Format:
- URL: `wss://xxxx.livekit.cloud`
- API Key: `APIsomething...`
- API Secret: `longsecretkey...`

### OpenAI Configuration

1. Go to https://platform.openai.com/account/api-keys
2. Create new API key
3. Copy key: `sk-proj-...`

## Testing

### Test Suite

API endpoints to test:

```bash
API_URL="http://localhost:3001/api"

# 1. Health check
curl $API_URL/health

# 2. Generate token
TOKEN_RESPONSE=$(curl -s -X POST $API_URL/token \
  -H "Content-Type: application/json" \
  -d '{"identity":"user1","roomName":"test"}')
echo $TOKEN_RESPONSE | jq .

# 3. Chat
curl -X POST $API_URL/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "roomName": "test",
    "identity": "user1"
  }' | jq .

# 4. Create entity
curl -X POST $API_URL/entities \
  -H "Content-Type: application/json" \
  -d '{
    "type": "task",
    "data": {"title": "Test Task", "status": "todo"},
    "roomName": "test",
    "identity": "user1"
  }' | jq .

# 5. Get entity by type
curl $API_URL/entities/type/task/test | jq .

# 6. Get all room entities
curl $API_URL/entities/room/test | jq .
```

### Python Agent Test

```bash
cd backend/agents

# Activate venv
source venv/bin/activate

# Start agent
python agent.py start

# In another terminal, create room with:
# - Same LIVEKIT credentials
# - Same room name
# Agent should connect and listen
```

## Troubleshooting

### Common Issues

#### 1. Token Generation Fails

**Error**: `Failed to generate token`

**Check**:
```bash
# Verify environment variables are set
echo $LIVEKIT_API_KEY
echo $LIVEKIT_API_SECRET

# Test LiveKit connectivity
curl -v $LIVEKIT_URL

# Verify API key format
# Should be: APIsomething or similar
```

**Fix**:
- Verify exact credentials from LiveKit dashboard
- Check no extra spaces in .env
- Recreate API key in LiveKit

#### 2. Chat Not Working

**Error**: `OPENAI_API_KEY not configured`

**Check**:
```bash
# Verify OpenAI key is set
echo $OPENAI_API_KEY

# Test OpenAI API
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

**Fix**:
- Get new API key from OpenAI platform
- Check key is active (not revoked)
- Verify account has credits
- Check key is `sk-proj-...` format

#### 3. Agent Not Connecting

**Error**: `Failed to connect to room`

**Check**:
```bash
# Verify LiveKit URL
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print(os.getenv('LIVEKIT_URL'))"

# Check logs
python agent.py start 2>&1 | tail -20
```

**Fix**:
- Verify URL includes `wss://` prefix
- Check room name format (alphanumeric only)
- Verify port 443 is accessible
- Check WebSocket support enabled

#### 4. CORS Errors on Frontend

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Check**:
```bash
# Current CORS_ORIGIN setting
echo $CORS_ORIGIN
```

**Fix**:
- Set CORS_ORIGIN to frontend URL
- Vercel: `https://your-project.vercel.app`
- Local: `http://localhost:3000`

#### 5. Vercel Deployment Fails

**Error**: `Deployment failed`

**Check**:
- Verify `npm run build` works locally
- Check all environment variables in Vercel dashboard
- Review build logs in Vercel dashboard

**Fix**:
```bash
# Test locally
cd backend
npm run build

# If error, check TypeScript
npx tsc --noEmit
```

#### 6. Railway Deployment Issues

**Error**: `Docker build failed`

**Check**:
- Verify Dockerfile path: `backend/Dockerfile`
- Check Python dependencies: `requirements.txt`

**Fix**:
```bash
# Test locally
docker build -f backend/Dockerfile -t test .
docker run -e LIVEKIT_URL=wss://... test
```

### Debug Mode

Enable verbose logging:

```bash
# API
NODE_DEBUG=* npm run dev

# Agent
LIVEKIT_DEBUG=1 python agent.py start
```

### Getting Help

1. Check deployment logs:
   - Vercel: Dashboard → Deployments → Logs
   - Railway: Dashboard → Deployments → Logs

2. Verify credentials:
   - Copy-paste from original source (not typed)
   - No extra spaces or newlines

3. Test components separately:
   ```bash
   # Just LiveKit
   # Just OpenAI
   # Just database (if used)
   ```

4. Review documentation:
   - [DEPLOYMENT_GUIDE.md](./backend/DEPLOYMENT_GUIDE.md)
   - [backend/README.md](./backend/README.md)

## Next Steps

1. **Frontend Integration**: Update React app to use backend URL
2. **Database**: Add PostgreSQL for production persistence
3. **Caching**: Add Redis for session management
4. **Monitoring**: Setup Sentry for error tracking
5. **Security**: Add API key authentication

See [DEPLOYMENT_GUIDE.md](./backend/DEPLOYMENT_GUIDE.md) for production setup.
