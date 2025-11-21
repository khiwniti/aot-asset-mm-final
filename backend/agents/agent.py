#!/usr/bin/env python3
"""
LiveKit Agent for Real Estate/Healthcare AI Assistant

This agent:
1. Listens for audio from connected participants
2. Transcribes speech to text (OpenAI STT)
3. Processes text through LLM (OpenAI GPT-4)
4. Synthesizes response back to speech (OpenAI TTS)

Environment Variables (set in LiveKit Cloud Console or .env):
- LIVEKIT_URL: WebSocket URL of your LiveKit instance
- LIVEKIT_API_KEY: Your LiveKit API key
- LIVEKIT_API_SECRET: Your LiveKit API secret
- OPENAI_API_KEY: Your OpenAI API key

Installation:
pip install -r requirements.txt

Usage:
python agent.py start
"""

import logging
import os
import json
from typing import Optional
from dotenv import load_dotenv

from livekit import agents, rtc
from livekit.agents import (
    JobContext,
    WorkerOptions,
    llm,
    transcription,
    tts,
    VoiceAssistantOptions,
    AutoSubscribe,
)
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import openai, silero

load_dotenv()

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def build_system_prompt() -> str:
    """Build the system prompt for the AI assistant."""
    return """You are 'Naree', the AI Kiosk Assistant at Rajavej Chiang Mai Hospital.

PRONUNCIATION:
- Pronounce 'Rajavej' as 'Raad-Cha-Vate'

TASK:
Perform a brief OPD pre-screening for an existing patient.

INTERACTION FLOW:
1. Greet politely in Thai (Sawasdee ka)
2. Ask about their main symptom (Chief Complaint)
3. Ask about duration and severity
4. Ask if they have taken any medication
5. Confirm their medical history (Hypertension/Dyslipidemia) briefly
6. When finished, thank them and let them know a ticket will be generated

BEHAVIOR:
- Speak Thai primarily
- Ask only ONE question at a time
- Keep responses short (1-2 sentences)
- Be warm and professional
- Use simple, clear Thai language

RESPONSE FORMAT:
Keep responses concise for voice interaction. When screening is complete, indicate that a queue ticket will be generated."""


class QueueTicketTool(llm.FunctionContext):
    """Tool for generating queue tickets during screening."""

    def __init__(self, ctx: JobContext):
        super().__init__()
        self._ctx = ctx

    @llm.ai_callable(
        description="Generate a queue ticket when screening is complete"
    )
    async def generate_queue_ticket(
        self, department: str, urgency: str, summary: str
    ):
        """
        Call this function when you have collected enough information from the patient.

        Args:
            department: Medical department (e.g., 'General Medicine', 'Cardiology')
            urgency: Triage level ('Routine', 'Urgent', 'Emergency')
            summary: Brief medical summary of patient's complaint
        """
        logger.info(f"Generating ticket: {department} - {urgency}")

        # Create payload for frontend
        payload = json.dumps(
            {"department": department, "urgency": urgency, "summary": summary}
        )

        # Publish to room
        await self._ctx.room.local_participant.publish_data(
            payload=payload, topic="queue_ticket", reliable=True
        )

        return "Ticket generated successfully."


def prewarm(proc: JobContext):
    """Prewarm agent resources."""
    logger.info("Prewarming VAD...")
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext):
    """Main entrypoint for the LiveKit Agent."""
    logger.info(f"Starting agent for room: {ctx.room.name}")

    # Build system prompt
    system_prompt = build_system_prompt()

    # Initialize context with system message
    initial_ctx = llm.ChatContext().append(role="system", text=system_prompt)

    logger.info(f"Connecting to room {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Wait for participant
    participant = await ctx.wait_for_participant()
    logger.info(f"Participant joined: {participant.identity}")

    # Create voice pipeline agent
    agent = VoicePipelineAgent(
        vad=ctx.proc.userdata.get("vad") or silero.VAD.load(),
        stt=openai.STT(language="th"),
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=openai.TTS(voice="alloy"),
        chat_ctx=initial_ctx,
        fnc_ctx=QueueTicketTool(ctx),
    )

    agent.start(ctx.room, participant)

    # Send initial greeting
    await agent.say(
        "สวัสดีค่ะ ยินดีต้อนรับสู่โรงพยาบาลราชเวช เชียงใหม่ค่ะ มีอาการอะไรมาคะวันนี้?",
        allow_interruptions=True,
    )


if __name__ == "__main__":
    worker = WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm)
    agents.run_app(worker)
