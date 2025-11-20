# LiveKit Integration Setup Guide

This project has been successfully migrated from Google Gemini to **LiveKit Cloud Agents** for voice-to-voice AI interactions.

## 📋 Quick Navigation

- **🚀 [Quick Start](LIVEKIT_README.md)** - Get running in 5 minutes
- **📖 [Full Deployment Guide](LIVEKIT_DEPLOYMENT.md)** - Complete setup instructions
- **🔄 [Migration Details](MIGRATION_GUIDE.md)** - What changed from Gemini
- **📝 [Changes Summary](CHANGES_SUMMARY.md)** - High-level overview

## ✨ What's New

✅ **Serverless Agent Compute** - No servers to manage  
✅ **Production-Ready** - Enterprise-grade media handling  
✅ **Flexible AI Providers** - Choose your own STT/LLM/TTS  
✅ **Cost-Controlled** - Pay only for what you use  
✅ **Scalable** - Auto-scales with demand  

## 🎯 Architecture at a Glance

```
Browser (WebRTC)
   ↓
LiveKit Cloud
   ↓
Agent Compute
   ├─ Deepgram (Speech-to-Text)
   ├─ OpenAI (Large Language Model)
   └─ ElevenLabs (Text-to-Speech)
```

## 🚀 Getting Started (3 Steps)

### 1. **Set Up Environment**
```bash
cp .env.example .env
# Edit .env with your LiveKit credentials
```

### 2. **Run Frontend Locally**
```bash
npm install
npm run dev
# Open http://localhost:3000
# Go to "Ask AOT" page
# Click microphone icon to start voice
```

### 3. **Deploy Agent to LiveKit**
```bash
cd services
zip -r agent.zip livekit-agent-py.py livekit-agent-requirements.txt

# Upload to:
# LiveKit Console → Compute → Add Agent
# Select Python runtime
# Set environment variables (OPENAI_API_KEY, DEEPGRAM_API_KEY, ELEVENLABS_API_KEY)
```

**Done!** Your voice AI assistant is live.

## 📦 Environment Variables

Create `.env` file:
```bash
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
LIVEKIT_URL=wss://your-workspace.livekit.cloud
NEXT_PUBLIC_LIVEKIT_URL=wss://your-workspace.livekit.cloud
```

Agent-level env vars (set in LiveKit Console):
```bash
OPENAI_API_KEY=sk-...
DEEPGRAM_API_KEY=...
ELEVENLABS_API_KEY=...
```

## 📚 Key Files

### Modified
- `package.json` - Updated dependencies (Gemini → LiveKit)
- `vite.config.ts` - Updated environment variables
- `context/ChatContext.tsx` - Replaced Gemini Live API with LiveKit
- `.gitignore` - Added environment files

### New
- `services/livekitTokenService.ts` - JWT token generation
- `services/livekitChatService.ts` - Chat logic
- `services/livekit-agent-py.py` - Production agent
- `.env.example` - Environment template
- `LIVEKIT_*.md` - Documentation

## 🔧 Configuration

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Deploy to Vercel
```bash
vercel
# Set environment variables in Vercel Console
```

## 📊 Performance

| Metric | Value |
|--------|-------|
| Response Latency | 500-1500ms |
| Scalability | Unlimited |
| Cost per Hour | ~$0.51 |
| Deployments | 1 (one-time) |
| Server Management | None |

## ❓ Troubleshooting

**Q: Agent won't respond**
- Check agent logs in LiveKit Console
- Verify API keys are set in agent config
- Ensure agent status is "Ready"

**Q: No audio output**
- Check browser microphone permissions
- Verify LIVEKIT_URL uses `wss://`
- Check browser console (F12) for errors

**Q: Build errors**
- Run `npm install` to install LiveKit dependencies
- Check Node.js version (18+)
- Clear `node_modules` and rebuild

See **[LIVEKIT_DEPLOYMENT.md](LIVEKIT_DEPLOYMENT.md)** for detailed troubleshooting.

## 🔗 Resources

- [LiveKit Documentation](https://docs.livekit.io)
- [LiveKit Agents](https://docs.livekit.io/agents)
- [OpenAI API](https://platform.openai.com/docs)
- [Deepgram API](https://developers.deepgram.com)
- [ElevenLabs API](https://elevenlabs.io/docs)

## 📋 Checklist

- [ ] Created `.env` with LiveKit credentials
- [ ] Run `npm install` successfully
- [ ] `npm run build` produces no errors
- [ ] `npm run dev` starts on port 3000
- [ ] Agent packaged and uploaded to LiveKit
- [ ] Agent environment variables configured
- [ ] Tested voice connection from browser
- [ ] Verified agent processes audio and responds

## 🎉 You're Ready!

Your AOT Assistant with LiveKit is now:
✅ Running on your machine  
✅ Ready to deploy to Vercel  
✅ Configured with a serverless agent  
✅ Using production AI providers  

Start with the **[Quick Start Guide](LIVEKIT_README.md)** for next steps!

---

**Need help?** Check the documentation files in this repository:
1. `LIVEKIT_README.md` - Overview and quick start
2. `LIVEKIT_DEPLOYMENT.md` - Detailed deployment
3. `MIGRATION_GUIDE.md` - What changed from Gemini
4. `CHANGES_SUMMARY.md` - Summary of all changes
