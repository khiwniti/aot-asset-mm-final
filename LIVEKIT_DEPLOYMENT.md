# LiveKit Agent Deployment Guide

This guide explains how to deploy the AOT (Asset Optimization Tool) with LiveKit Cloud Agents for voice-to-voice AI conversations.

## Architecture Overview

```
┌─────────────────┐
│  Your Browser   │
│  (WebRTC)       │
└────────┬────────┘
         │
         ├─ Microphone Audio
         │
    ┌────v─────────────────┐
    │  LiveKit Cloud       │
    │  ┌──────────────────┐│
    │  │ Agent Compute    ││
    │  │ (STT→LLM→TTS)   ││
    │  └──────────────────┘│
    │                      │
    │ • Deepgram STT       │
    │ • OpenAI LLM         │
    │ • ElevenLabs TTS     │
    └─────────────────────┘
```

## Prerequisites

1. **LiveKit Cloud Account** - Sign up at https://cloud.livekit.io
   - Ensure Agent Compute is enabled for your workspace
   
2. **Frontend Deployment** (Optional - Vercel recommended)
   - For production, deploy the Next.js app to Vercel
   - Development: `npm run dev` locally

3. **AI Provider API Keys**
   - OpenAI: https://platform.openai.com/api-keys
   - Deepgram: https://console.deepgram.com
   - ElevenLabs: https://elevenlabs.io

## Setup Steps

### Step 1: Configure Environment Variables

Create a `.env` file in your project root:

```bash
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
LIVEKIT_URL=wss://your-workspace.livekit.cloud
NEXT_PUBLIC_LIVEKIT_URL=wss://your-workspace.livekit.cloud
```

Get these from your LiveKit Console:
- Navigate to **Settings** → **Keys & Credentials**
- Copy API Key and Secret
- Your URL is shown in the workspace dashboard

### Step 2: Deploy Frontend

#### Option A: Local Development
```bash
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

#### Option B: Deploy to Vercel (Production)
```bash
npm run build
# Deploy to Vercel via CLI or GitHub integration
```

### Step 3: Prepare and Upload Agent

#### Option A: Use Python Agent (Recommended)

1. **Create a directory for the agent:**
```bash
mkdir livekit-agent
cd livekit-agent
```

2. **Copy the agent files:**
```bash
cp ../services/livekit-agent-py.py ./agent.py
cp ../services/livekit-agent-requirements.txt ./requirements.txt
```

3. **Create a `.env` file for the agent** (optional, for local testing):
```bash
OPENAI_API_KEY=your-openai-key
DEEPGRAM_API_KEY=your-deepgram-key
ELEVENLABS_API_KEY=your-elevenlabs-key
```

4. **Package as ZIP:**
```bash
zip -r agent.zip agent.py requirements.txt
```

5. **Upload to LiveKit Console:**
   - Go to **Compute** → **Agents**
   - Click **Add Agent**
   - Upload the `agent.zip` file
   - Select **Python** runtime
   - Set entry point: `agent.py` → `entrypoint`
   - Click **Next**

6. **Configure Environment Variables:**
   - Add the following in the agent configuration:
     ```
     OPENAI_API_KEY=sk-...
     DEEPGRAM_API_KEY=...
     ELEVENLABS_API_KEY=...
     ```
   - Click **Save**

7. **Deploy:**
   - LiveKit will build and validate the agent
   - Once ready, it will auto-start when needed

#### Option B: Use TypeScript Agent

1. **Create TypeScript agent:**
```bash
mkdir livekit-agent-ts
cd livekit-agent-ts
npm init -y
npm install @livekit/agents @livekit/agents-plugin-openai @livekit/agents-plugin-deepgram @livekit/agents-plugin-elevenlabs
```

2. **Compile and upload similar to Python version**

### Step 4: Test Voice Connection

1. **Open the application:**
   - Local: `http://localhost:3000`
   - Production: Your Vercel URL

2. **Navigate to "Ask AOT" page or find the voice button**

3. **Click the microphone icon** to start voice session

4. **Speak to the agent:**
   - "What properties do I have?"
   - "Show me revenue trends"
   - "What maintenance is overdue?"

5. **Check LiveKit Console logs:**
   - **Agents** → Your agent → **Logs**
   - Should see transcript and LLM responses

## Troubleshooting

### Agent Won't Start
- ✅ Check agent logs in LiveKit Console
- ✅ Verify API keys are correct
- ✅ Ensure `requirements.txt` has correct versions
- ✅ Check that entry point matches your code: `agent.py` → `entrypoint`

### No Audio Input/Output
- ✅ Verify microphone permissions in browser
- ✅ Check browser console for errors (F12)
- ✅ Ensure LIVEKIT_URL is correct (wss:// not ws://)
- ✅ Test on the same network if using localhost

### High Latency (> 2 seconds)
- ✅ Reduce LLM `max_tokens` in agent (currently 300)
- ✅ Use cheaper/faster model (gpt-4o instead of gpt-4-turbo)
- ✅ Enable agent pre-warming in LiveKit Console
- ✅ Check network latency to LiveKit server

### Transcription Issues
- ✅ Check audio quality (reduce background noise)
- ✅ Try different Deepgram model (nova vs nova-2)
- ✅ Verify DEEPGRAM_API_KEY is correct
- ✅ Check logs for STT errors

## Production Checklist

- [ ] API keys stored securely (LiveKit Console environment, not in code)
- [ ] Frontend deployed to Vercel with environment variables
- [ ] Agent deployed and tested in LiveKit Console
- [ ] Monitored cost limits:
  - OpenAI token limits
  - Deepgram transcription minutes
  - ElevenLabs character limits
- [ ] Error handling and fallback UI implemented
- [ ] User privacy policy updated (audio processing)
- [ ] Logging and monitoring configured
- [ ] Rate limiting configured in LiveKit Console

## Cost Optimization Tips

1. **Reduce LLM token usage:**
   - Lower `max_tokens` in agent (default 300)
   - Use prompt caching for repeated questions

2. **Optimize STT/TTS:**
   - Use Silero VAD (Voice Activity Detection) - included
   - Only transcribe when user is speaking
   - Batch TTS requests when possible

3. **Agent scaling:**
   - Set appropriate concurrency limits
   - Use agent pre-warming sparingly

4. **Monitor usage:**
   - LiveKit Dashboard → Billing
   - OpenAI Dashboard → Usage
   - Deepgram Console → Usage

## Example Prompts to Test

```
"Generate a monthly performance report"
"What properties have occupancy below 70%?"
"Show me maintenance tasks due this month"
"Forecast revenue for next quarter"
"Analyze tenant payment trends"
"Identify cost-saving opportunities"
```

## API Integration Notes

### Adding Custom Tools to Agent

Extend the agent to call back-end APIs:

```python
async def query_property_database(property_id: str):
    # Call your backend API
    response = await http_client.get(f"https://api.yourbackend.com/properties/{property_id}")
    return response.json()

# In agent system prompt:
"You have access to property data. When asked about specific properties, query the database."
```

### Handling Real-Time Updates

For dashboard synchronization:

```python
async def handle_user_request(user_message: str):
    # Parse intent from message
    intent = await llm.extract_intent(user_message)
    
    if intent == "navigate":
        # Send navigation command back through room's data channel
        await ctx.send_data_message({"action": "navigate", "path": "/properties"})
    
    # Regular LLM response for voice
    return await llm.generate(user_message)
```

## Support & Resources

- **LiveKit Docs:** https://docs.livekit.io
- **Agents Plugin:** https://docs.livekit.io/agents/overview
- **LiveKit Console:** https://cloud.livekit.io

## Migration Notes

This deployment replaces the previous Gemini integration with:
- ✅ LiveKit Cloud for real-time media handling
- ✅ Deepgram for speech-to-text (industry standard)
- ✅ OpenAI GPT-4o for LLM (production-ready)
- ✅ ElevenLabs for text-to-speech (natural voices)

Benefits:
- Scalable serverless agent compute
- One-time deployment (no ongoing server management)
- Better latency and reliability
- Flexible provider choice
- Easy cost management
