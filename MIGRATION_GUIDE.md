# Migration Guide: Gemini → LiveKit Cloud Agents

This guide documents the changes made to migrate from Google Gemini to LiveKit Cloud Agents.

## Overview

| Aspect | Before (Gemini) | After (LiveKit) |
|--------|---|---|
| **Architecture** | Direct Gemini Live API connection | WebRTC via LiveKit Cloud |
| **Infrastructure** | Client-side only | Client + LiveKit Cloud + external AI providers |
| **Voice Flow** | Gemini handles entire pipeline | Deepgram (STT) + OpenAI (LLM) + ElevenLabs (TTS) |
| **Deployment** | Single Vite app | Vite frontend + Serverless agent |
| **API Key Location** | Vercel environment | LiveKit Console environment |
| **Latency** | ~200-500ms | ~500-1500ms (with optimization) |
| **Cost Model** | Gemini pricing | Per-service pricing (STT/LLM/TTS) |
| **Scalability** | Limited | Serverless, auto-scaling |

---

## Changed Files

### 1. **package.json**
```diff
- "@google/genai": "^1.30.0",
+ "livekit-client": "^0.9.0",
+ "@livekit/components-react": "^0.11.0",
+ "livekit-server-sdk": "^0.10.0",
```

### 2. **vite.config.ts**
```diff
- 'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
- 'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
+ 'process.env.LIVEKIT_API_KEY': JSON.stringify(env.LIVEKIT_API_KEY),
+ 'process.env.LIVEKIT_API_SECRET': JSON.stringify(env.LIVEKIT_API_SECRET),
+ 'process.env.LIVEKIT_URL': JSON.stringify(env.LIVEKIT_URL),
+ 'process.env.NEXT_PUBLIC_LIVEKIT_URL': JSON.stringify(env.LIVEKIT_URL)
```

### 3. **context/ChatContext.tsx** - MAJOR CHANGES

#### Imports
```typescript
// OLD
import { GoogleGenAI, Modality } from '@google/genai';
import { createPCM16Blob, decode, decodeAudioData } from '../services/audioUtils';

// NEW
import { generateLiveKitToken } from '../services/livekitTokenService';
import { Room, RemoteParticipant } from 'livekit-client';
```

#### Audio Refs
```typescript
// OLD: Manual audio context management
const audioContextRef = useRef<AudioContext | null>(null);
const inputAudioContextRef = useRef<AudioContext | null>(null);
const streamRef = useRef<MediaStream | null>(null);
const processorRef = useRef<ScriptProcessorNode | null>(null);
const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

// NEW: LiveKit handles audio
const roomRef = useRef<Room | null>(null);
const liveKitConnectPromiseRef = useRef<Promise<Room> | null>(null);
```

#### Voice Connection
```typescript
// OLD: Gemini Live API
const client = new GoogleGenAI({ apiKey });
const session = await client.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    config: { responseModalities: [Modality.AUDIO], ... },
    callbacks: { onopen, onmessage, onclose, onerror }
});

// NEW: LiveKit WebRTC
const { token, url } = await generateLiveKitToken();
const room = await connect(url, token, {
    autoSubscribe: true,
    audio: true,
    video: false,
    name: 'web-client',
});
```

#### Audio Processing
```typescript
// OLD: Manual PCM encoding/streaming
processor.onaudioprocess = (event) => {
    const inputData = event.inputBuffer.getChannelData(0);
    const pcmBlob = createPCM16Blob(inputData);
    session.sendRealtimeInput({ media: pcmBlob });
};

// NEW: LiveKit handles all audio automatically
// Audio is streamed via WebRTC (browser handles it)
```

---

## New Files Created

### 1. **services/livekitTokenService.ts**
Generates JWT tokens for LiveKit authentication:
```typescript
export async function generateLiveKitToken(): Promise<{ token: string; url: string }>
```

### 2. **services/livekitChatService.ts**
Replaces `geminiService.ts` for text-based interactions:
```typescript
export const generateAIResponse = async (...)
export const generateInsight = async (...)
export const analyzeDataMapping = async (...)
```

### 3. **services/livekit-agent-py.py** (NEW)
Production agent running on LiveKit Cloud Compute:
- Receives audio from WebRTC participants
- Transcribes with Deepgram
- Processes with OpenAI LLM
- Synthesizes with ElevenLabs TTS

### 4. **services/livekit-agent-requirements.txt** (NEW)
Python dependencies for agent

### 5. **services/livekit-agent-ts.ts** (NEW)
Alternative TypeScript agent template

### 6. **.env.example** (NEW)
Template for environment variables

### 7. **LIVEKIT_DEPLOYMENT.md** (NEW)
Complete deployment instructions

### 8. **LIVEKIT_README.md** (NEW)
Quick start and reference guide

---

## Removed Code

### 1. audioUtils.ts
**Status**: Deprecated but kept for reference
- `createPCM16Blob()` - No longer needed (LiveKit WebRTC handles encoding)
- `decode()` / `encode()` - No longer needed
- `decodeAudioData()` - No longer needed

### 2. geminiService.ts
**Status**: Replaced by livekitChatService.ts
- `generateAIResponse()` - Simplified to mock (agent handles real LLM)
- `generateInsight()` - Kept as mock
- `analyzeDataMapping()` - Kept as mock

---

## Environment Variable Mapping

### Old (Gemini)
```bash
GEMINI_API_KEY=your-gemini-key
```

### New (LiveKit)
```bash
LIVEKIT_API_KEY=your-livekit-key
LIVEKIT_API_SECRET=your-livekit-secret
LIVEKIT_URL=wss://your-workspace.livekit.cloud
NEXT_PUBLIC_LIVEKIT_URL=wss://your-workspace.livekit.cloud
```

### Agent Environment (LiveKit Console)
```bash
OPENAI_API_KEY=sk-...
DEEPGRAM_API_KEY=...
ELEVENLABS_API_KEY=...
```

---

## Migration Steps (For Reference)

If you're doing this manually, here's what was changed:

### 1. Update Dependencies
```bash
npm uninstall @google/genai
npm install livekit-client @livekit/components-react livekit-server-sdk
```

### 2. Replace Environment Variables
```bash
# .env
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
LIVEKIT_URL=...
```

### 3. Update Vite Config
Change from `GEMINI_API_KEY` to `LIVEKIT_*` variables

### 4. Update ChatContext
Replace Gemini Live connection logic with LiveKit connection

### 5. Create Token Service
New `livekitTokenService.ts` for JWT generation

### 6. Create Agent
New Python agent in `services/livekit-agent-py.py`

### 7. Deploy
- Frontend to Vercel
- Agent to LiveKit Cloud Console

---

## Behavioral Changes

### Before (Gemini)
1. User clicks microphone
2. Browser connects directly to Gemini Live API
3. Microphone audio streamed to Gemini
4. Gemini processes (STT + LLM + TTS)
5. Audio response played back

### After (LiveKit)
1. User clicks microphone
2. Browser gets JWT token from `livekitTokenService`
3. Browser connects to LiveKit via WebRTC
4. User audio automatically streamed to agent via WebRTC
5. Agent processes (Deepgram STT + OpenAI LLM + ElevenLabs TTS)
6. Agent streams response audio back via WebRTC
7. Browser plays response audio

**Key Difference**: Audio now goes through WebRTC (peer-to-peer equivalent), not directly to the AI provider.

---

## Performance Comparison

### Latency
- **Gemini**: 200-500ms (direct API)
- **LiveKit**: 500-1500ms (WebRTC + services)
  - 100-200ms: WebRTC roundtrip
  - 100-300ms: Deepgram STT
  - 100-400ms: OpenAI LLM
  - 50-200ms: ElevenLabs TTS
  - 50-200ms: Network + buffer

*Can be optimized with pre-warming, caching, faster models*

### Cost
- **Gemini**: All-in-one pricing
- **LiveKit**: À la carte
  - Deepgram: ~$0.25/hour speaking
  - OpenAI GPT-4o: ~$0.0004 per 1K tokens
  - ElevenLabs: ~$0.03 per 1M characters
  - LiveKit: $0.01-0.05 per GB egress

---

## Troubleshooting Common Issues

### Issue: "Failed to generate LiveKit token"
**Solution**: 
- Verify `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` are set
- Check that keys are valid in LiveKit Console

### Issue: "WebRTC connection failed"
**Solution**:
- Ensure `LIVEKIT_URL` uses `wss://` (secure WebSocket)
- Check network connectivity to LiveKit server
- Verify firewall allows WebRTC (UDP ports)

### Issue: "Agent not responding"
**Solution**:
- Check agent logs in LiveKit Console
- Verify agent environment variables (OPENAI_API_KEY, etc.)
- Ensure agent is in "Ready" status

### Issue: "Audio not streaming"
**Solution**:
- Check browser microphone permissions
- Verify audio device settings
- Check browser console for JavaScript errors
- Try different browser

---

## Rollback Path

If you need to rollback to Gemini:

```bash
# Revert package.json
npm uninstall livekit-client @livekit/components-react livekit-server-sdk
npm install @google/genai@^1.30.0

# Revert environment variables
export GEMINI_API_KEY=...

# Revert vite.config.ts
# (change LIVEKIT_* back to GEMINI_API_KEY)

# Revert ChatContext.tsx
# (restore Gemini Live API connection code)

npm run dev
```

---

## Testing After Migration

### Functionality Tests
- [ ] Microphone button appears on "Ask AOT" page
- [ ] Clicking button shows "Connecting" status
- [ ] Speak: "Hello" - should connect to agent
- [ ] Agent responds with audio
- [ ] Status changes to "Connected"
- [ ] Clicking again disconnects

### Integration Tests
- [ ] Text chat still works
- [ ] Chat widgets work on other pages
- [ ] Insights still generate
- [ ] Data import functionality works
- [ ] Navigation/routes unchanged

### Agent Tests (in LiveKit Console logs)
- [ ] Transcription appears after user speaks
- [ ] LLM response generated
- [ ] TTS audio synthesized
- [ ] Response plays back to user

---

## Future Improvements

1. **Add Caching**: Cache common responses to reduce LLM calls
2. **Push-to-Talk**: Replace always-listening with button-activation
3. **Intent Detection**: Add wake-word detection ("Hey AOT")
4. **Multi-turn**: Track conversation state across messages
5. **Analytics**: Log usage for optimization
6. **Custom Models**: Support different LLM/TTS models per user
7. **Fallback**: Text-based chat fallback if voice fails

---

## Support Resources

- **LiveKit Documentation**: https://docs.livekit.io
- **Agents Plugin**: https://docs.livekit.io/agents
- **This Repository**: See LIVEKIT_*.md files
- **Original Gemini Docs**: https://ai.google.dev/

---

**Migration completed on**: [Today's date]
**Branch**: `replace-gemini-with-livekit-agent`
