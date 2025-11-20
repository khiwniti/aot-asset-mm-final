# AOT Assistant with LiveKit Cloud Agents

A production-ready, voice-to-voice AI code/asset management assistant using **LiveKit Cloud**, deployed to **Vercel** (frontend only) and **LiveKit Cloud Compute** (agent).

**Key Features:**
- ✅ **Voice-to-Voice**: Real-time speech recognition → LLM → synthesis
- ✅ **One-Time Deploy**: Deploy frontend once to Vercel; agent runs serverlessly
- ✅ **Minimal Maintenance**: No backend servers to manage
- ✅ **Multi-Provider**: Swap AI providers (Deepgram, OpenAI, ElevenLabs, etc.)
- ✅ **Cost-Controlled**: Pay only for what you use

---

## Quick Start (5 minutes)

### 1. Get API Keys
- **LiveKit Cloud**: https://cloud.livekit.io (free tier available)
- **OpenAI**: https://platform.openai.com/api-keys
- **Deepgram**: https://console.deepgram.com
- **ElevenLabs**: https://elevenlabs.io

### 2. Set Environment Variables
Create `.env`:
```bash
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
LIVEKIT_URL=wss://your-workspace.livekit.cloud
NEXT_PUBLIC_LIVEKIT_URL=wss://your-workspace.livekit.cloud
```

### 3. Run Frontend Locally
```bash
npm install
npm run dev
```

Open `http://localhost:3000` → Click microphone icon on "Ask AOT" page.

### 4. Deploy Agent to LiveKit
```bash
cd services
zip -r agent.zip livekit-agent-py.py livekit-agent-requirements.txt
# Upload ZIP to LiveKit Console → Compute → Agents
# Set env vars: OPENAI_API_KEY, DEEPGRAM_API_KEY, ELEVENLABS_API_KEY
```

Done! Voice agent is live.

---

## Architecture

```
User speaks
    ↓
[Browser] → WebRTC → [LiveKit Cloud]
                            ↓
                        [Agent Compute]
                            ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
              [Deepgram STT]      [OpenAI LLM]
                  (speech→text)    (text reasoning)
                                        ↓
                                  [ElevenLabs TTS]
                                   (text→speech)
                            ↓
[Browser] ← WebRTC ← [LiveKit] ← Audio response
User hears response
```

---

## File Structure

```
.
├── .env.example                    # Environment variables template
├── LIVEKIT_DEPLOYMENT.md          # Full deployment guide
├── LIVEKIT_README.md              # This file
├── App.tsx                        # Main React app (unchanged)
├── vite.config.ts                 # Updated with LiveKit env vars
├── package.json                   # Updated dependencies
│
├── components/
│   └── ChatInterface.tsx          # Voice button and UI (mostly unchanged)
│
├── context/
│   └── ChatContext.tsx            # UPDATED: LiveKit instead of Gemini
│
├── services/
│   ├── livekitTokenService.ts     # NEW: Token generation
│   ├── livekitChatService.ts      # NEW: Chat logic (fallback/mock)
│   ├── livekit-agent-py.py        # NEW: Python agent for Cloud
│   ├── livekit-agent-requirements.txt # NEW: Python dependencies
│   └── livekit-agent-ts.ts        # NEW: TypeScript agent template
│
└── pages/
    └── AskAOT.tsx                 # Voice assistant page (unchanged)
```

---

## Updated Components

### ChatContext (`context/ChatContext.tsx`)

**Before:** Used Gemini Live API with local audio processing
**After:** Uses LiveKit WebRTC connection

```typescript
// Old: Gemini Live connection
const client = new GoogleGenAI({ apiKey });
const session = await client.live.connect({ ... });

// New: LiveKit connection
const { token, url } = await generateLiveKitToken();
const room = await connect(url, token, { audio: true, video: false });
```

### LiveKit Token Service (`services/livekitTokenService.ts`)

Generates JWT tokens for browser connections:
```typescript
const at = new AccessToken(apiKey, apiSecret, { identity });
at.addGrant({ roomJoin: true, room: roomName });
```

### Chat Service (`services/livekitChatService.ts`)

Replaces `geminiService.ts` for text-based interactions (mock for now).
In production, integrate with your chosen LLM API.

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `LIVEKIT_API_KEY` | LiveKit API Key | `devkey` |
| `LIVEKIT_API_SECRET` | LiveKit API Secret | `secret` |
| `LIVEKIT_URL` | LiveKit Cloud URL (WebSocket) | `wss://your-domain.livekit.cloud` |
| `NEXT_PUBLIC_LIVEKIT_URL` | Exposed to frontend | Same as above |

**Agent environment** (set in LiveKit Console):
- `OPENAI_API_KEY`
- `DEEPGRAM_API_KEY`
- `ELEVENLABS_API_KEY`

---

## Testing Checklist

### Frontend
- [ ] `npm install` succeeds
- [ ] `npm run dev` starts server on port 3000
- [ ] Navigate to "Ask AOT" page
- [ ] Microphone permission prompt appears
- [ ] Click microphone → status shows "Connecting"

### Agent
- [ ] Agent uploaded to LiveKit Console
- [ ] Environment variables set
- [ ] Agent shows "Ready" in Console
- [ ] Join room from browser
- [ ] Agent appears as participant
- [ ] Speak into microphone
- [ ] Check agent logs for transcription
- [ ] Hear response through speakers

### Integration
- [ ] User speaks → transcription appears in logs
- [ ] LLM processes and generates response
- [ ] TTS synthesizes audio
- [ ] Browser plays audio back

---

## Deployment (Production)

### Frontend → Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard
# → Settings → Environment Variables
# → Add: LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL, NEXT_PUBLIC_LIVEKIT_URL
```

### Agent → LiveKit Cloud

1. **Package agent:**
   ```bash
   cd services
   zip -r agent.zip livekit-agent-py.py livekit-agent-requirements.txt
   ```

2. **Upload to LiveKit Console:**
   - Go to **Compute** → **Agents**
   - Click **Add Agent**
   - Upload ZIP
   - Select **Python** runtime
   - Entry point: `agent.py::entrypoint`
   - Add environment variables
   - Click **Deploy**

3. **Verify:**
   - Agent shows "Ready"
   - Try from production frontend URL

---

## Cost Estimation

**Per 1 hour of usage** (all providers at standard rates):

| Service | Cost | Notes |
|---------|------|-------|
| Deepgram STT | ~$0.25 | 60 min @ $0.25/hr |
| OpenAI LLM | ~$0.15 | ~400 tokens @ $0.0004/1K |
| ElevenLabs TTS | ~$0.10 | ~3,000 chars @ $0.03/1M |
| LiveKit | $0.01 | Minimal egress |
| **Total** | **~$0.51/hr** | ~$12/month (24/7 use) |

**Cost reduction tips:**
- Use cheaper LLM model (gpt-3.5 vs gpt-4o)
- Reduce `max_tokens` in agent
- Enable VAD (skip silent periods)
- Cache common responses

---

## Customization

### Change Voice/Tone

Edit `livekit-agent-py.py` → `build_system_prompt()`:
```python
def build_system_prompt() -> str:
    return """You are AOT Assistant, specialized in real estate management.
    You are professional but friendly. Keep responses concise."""
```

### Add Custom Tools

Extend agent to call back-end APIs:
```python
async def get_property_data(property_id: str):
    response = await http_client.get(f"https://api.example.com/properties/{property_id}")
    return response.json()

# In system prompt:
"When asked about properties, retrieve data from the property database."
```

### Switch AI Providers

Replace plugins in `livekit-agent-py.py`:
```python
# STT: Deepgram → AssemblyAI
from livekit.plugins import assemblyai
stts_engine = assemblyai.STT.create(api_key="...")

# LLM: OpenAI → Anthropic
from livekit.plugins import anthropic
llm_engine = anthropic.LLM.create(model="claude-3-opus", api_key="...")

# TTS: ElevenLabs → Google Cloud
from livekit.plugins import gcp
tts_engine = gcp.TTS.create(...)
```

---

## Troubleshooting

**Q: Agent won't connect**
A: Check LiveKit Console logs, ensure API keys are set, verify agent status is "Ready"

**Q: No audio output**
A: Check browser microphone permissions, verify `LIVEKIT_URL` uses `wss://` not `ws://`

**Q: High latency**
A: Reduce LLM tokens, use faster model, enable agent pre-warming

**Q: Transcription errors**
A: Reduce background noise, check Deepgram API key, try different model

See full **LIVEKIT_DEPLOYMENT.md** for detailed troubleshooting.

---

## Next Steps

1. ✅ Set up .env with LiveKit credentials
2. ✅ Run `npm install && npm run dev`
3. ✅ Test voice on "Ask AOT" page
4. ✅ Package and upload agent to LiveKit
5. ✅ Deploy frontend to Vercel
6. ✅ Monitor costs and adjust limits

---

## Resources

- **LiveKit Docs**: https://docs.livekit.io
- **LiveKit Agents**: https://docs.livekit.io/agents
- **OpenAI API**: https://platform.openai.com/docs
- **Deepgram API**: https://developers.deepgram.com
- **ElevenLabs API**: https://elevenlabs.io/docs

---

## License

Same as main project (check LICENSE file)

## Support

For issues:
1. Check **LIVEKIT_DEPLOYMENT.md** troubleshooting section
2. Review agent logs in LiveKit Console
3. Check browser DevTools console (F12)
4. Verify all environment variables are set
