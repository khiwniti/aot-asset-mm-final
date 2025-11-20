#!/usr/bin/env python3
"""
LiveKit Agent for Real Estate Asset Management AI Assistant

This agent:
1. Listens for audio from connected participants
2. Transcribes speech to text (Deepgram STT)
3. Processes text through LLM (OpenAI GPT-4)
4. Synthesizes response back to speech (ElevenLabs TTS)

Environment Variables (set in LiveKit Cloud Console):
- OPENAI_API_KEY: Your OpenAI API key
- DEEPGRAM_API_KEY: Your Deepgram API key
- ELEVENLABS_API_KEY: Your ElevenLabs API key

Installation:
pip install -r requirements.txt

Requirements (add to requirements.txt):
livekit
livekit-agents
livekit-agents-plugin-openai
livekit-agents-plugin-deepgram
livekit-agents-plugin-elevenlabs
livekit-plugins-silero
python-dotenv
"""

import logging
import os
from typing import Optional
from dotenv import load_dotenv

from livekit import agents
from livekit.agents import (
    JobContext,
    WorkerOptions,
    llm,
    transcription,
    tts,
    VoiceAssistantOptions,
)
from livekit.agents.pipeline import VoiceAssistant
from livekit.plugins import deepgram, openai, elevenlabs, silero

load_dotenv()

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def build_system_prompt() -> str:
    """Build the system prompt for the AI assistant."""
    return """You are AOT Assistant, an AI expert in real estate asset management.

Your characteristics:
- Helpful, concise, and knowledgeable about property management
- Bilingual capabilities (English and Thai)
- Focus on practical advice for portfolio optimization
- Provide specific insights on financial analysis and maintenance

Response guidelines:
- Keep responses under 150 words for real-time voice interaction
- Use clear, professional language
- When appropriate, suggest accessing the dashboard for visual analytics
- Include actionable recommendations

Context:
You assist users with:
- Portfolio analysis and reporting
- Financial management and NOI calculations
- Tenant and lease management
- Maintenance scheduling and cost tracking
- Market insights and growth opportunities

Always maintain a professional but friendly tone."""


class RealEstateAssistant(VoiceAssistant):
    """Voice Assistant for Real Estate Asset Management"""

    def __init__(self):
        super().__init__()

    async def on_message_received(self, message: llm.ChatMessage) -> None:
        """Handle incoming messages from the LLM."""
        logger.info(f"Assistant message: {message.content}")


async def prewarm(proc: JobContext):
    """Prewarm the agent resources on startup."""
    logger.info("Prewarming agent resources...")
    await proc.asr.warmup()
    logger.info("Prewarm complete")


async def entrypoint(ctx: JobContext):
    """Main entrypoint for the LiveKit Agent."""
    logger.info(f"Starting agent for room: {ctx.room.name}")

    # Initialize the voice assistant with configured plugins
    initial_ctx = ctx

    # Build system prompt
    system_prompt = build_system_prompt()

    # Create the voice assistant pipeline
    assistant = VoiceAssistantOptions(
        transcription=transcription.STT(
            engine=deepgram.STT.create(
                api_key=os.getenv("DEEPGRAM_API_KEY"),
                model="nova-2",
                language="en",
            ),
            min_silence_duration=0.3,
        ),
        llm=llm.LLM.with_chat(
            model=openai.LLM.create(
                model="gpt-4o-realtime-preview",
                api_key=os.getenv("OPENAI_API_KEY"),
                system_prompt=system_prompt,
            ),
        ),
        tts=tts.TTS.create(
            engine=elevenlabs.TTS.create(
                api_key=os.getenv("ELEVENLABS_API_KEY"),
                voice="alloy",
            ),
        ),
        will_synthesize_assistant_reply=True,
        before_llm_cb=lambda messages: logger.info(
            f"Sending {len(messages)} messages to LLM"
        ),
        after_llm_cb=lambda response: logger.info(
            f"LLM response: {response.content[:100]}..."
        ),
    )

    # Run the voice assistant
    await VoiceAssistant(
        vad=silero.VAD.create(),
        ctx=ctx,
        opts=assistant,
    ).run()


if __name__ == "__main__":
    # Run the agent
    worker = WorkerOptions(
        prewarm_duration=5,
    )
    agents.run_app([entrypoint], prewarm_fnc=prewarm)
