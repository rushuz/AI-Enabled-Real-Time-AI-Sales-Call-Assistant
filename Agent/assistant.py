
from dotenv import load_dotenv
import os
import asyncio
import logging
import httpx
import time
from livekit.agents import (
    AgentSession,
    Agent,
    RoomInputOptions,
    UserInputTranscribedEvent,
    JobContext,
    WorkerOptions,
    cli,
)
from livekit.plugins import deepgram, silero, google

# ------------------------------------------------------
# Setup
# ------------------------------------------------------
logging.basicConfig(level=logging.INFO)
load_dotenv(".env")


# ------------------------------------------------------
# Assistant Definition
# ------------------------------------------------------
class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions="""You are Alex, a professional and friendly sales representative from TechPro Solutions, a leading electronics and computer retailer. You are calling potential customers who have shown interest in our products.

Your goal is to:
- Build rapport and engage in natural conversation
- Understand the customer's needs (laptops, desktops, tablets, accessories, software)
- Provide helpful product recommendations based on their requirements
- Answer questions about features, pricing, warranties, and delivery
- Address concerns professionally
- Close the sale or schedule a follow-up if appropriate

Be conversational, listen actively, and adapt to the customer's tone. If they seem busy, be brief. If they're interested, provide detailed information. Always be helpful and customer-focused.""")
        self.fastapi_url = "http://localhost:8000"  # FastAPI backend

    async def send_transcript_to_fastapi(self, text: str, room_id: str, speaker: str):
        """Send transcript data (user or assistant) to FastAPI."""
        if not text.strip():
            return
        payload = {
            "text": text.strip(),
            "speaker": speaker,
            "timestamp": time.time(),
            "room_id": room_id,
        }
        try:
            logging.info(f"📤 Sending {speaker} transcript to FastAPI")
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(f"{self.fastapi_url}/process-transcription", json=payload)
                if response.status_code != 200:
                    logging.warning(f"⚠️ FastAPI error: {response.text}")
        except Exception as e:
            logging.exception("Error sending to FastAPI")



# ------------------------------------------------------
# Entrypoint for LiveKit Agent
# ------------------------------------------------------
async def entrypoint(ctx: JobContext):
    assistant = Assistant()

    session = AgentSession(
        stt=deepgram.STT(
            model="nova-3",
            language="en",
            api_key=os.getenv("DEEPGRAM_API_KEY"),
        ),
        tts=deepgram.TTS(
            model="aura-asteria-en",
            api_key=os.getenv("DEEPGRAM_API_KEY"),
        ),
        llm=google.LLM(
            model="gemini-2.0-flash",
            api_key=os.getenv("GOOGLE_API_KEY"),
        ),
        vad=silero.VAD.load(),
        turn_detection=None,  # removed for compatibility
    )

    # ------------------------------------------------------
    # Capture user input (speech → transcript)
    # ------------------------------------------------------
    @session.on("user_input_transcribed")
    def on_user_input_transcribed(event: UserInputTranscribedEvent):
        if event.is_final and event.transcript.strip():
            logging.info(f"🗣️ Final user transcript: {event.transcript}")
            asyncio.create_task(
                assistant.send_transcript_to_fastapi(event.transcript, ctx.room.name, "user")
            )

    # ------------------------------------------------------
    # Capture assistant messages (AI replies)
    # ------------------------------------------------------
    @session.on("conversation_item_added")
    def on_conversation_item_added(event):
        if hasattr(event.item, "role") and event.item.role == "assistant":
            text = getattr(event.item, "text_content", "").strip()
            if text:
                logging.info(f"🤖 Assistant message: {text}")
                asyncio.create_task(
                    assistant.send_transcript_to_fastapi(text, ctx.room.name, "assistant")
                )

    # ------------------------------------------------------
    # Start the session
    # ------------------------------------------------------
    await session.start(
        room=ctx.room,
        agent=assistant,
        room_input_options=RoomInputOptions(
            noise_cancellation=None,
            close_on_disconnect=False,
        ),
    )

    await ctx.connect()

    # Initial spoken greeting
    await session.say("Hello! This is Alex calling from TechPro Solutions. I hope I'm not catching you at a bad time. I see you recently showed interest in our laptop collection. I'd love to help you find the perfect device for your needs. Do you have a few minutes to chat?")

    # # ------------------------------------------------------
    # # Main loop — listen & respond
    # # ------------------------------------------------------
    # while True:
    #     user_input = await session.listen()
    #     if not user_input or not user_input.text.strip():
    #         continue

    #     # Store user transcript
    #     await assistant.send_transcript_to_fastapi(user_input.text, ctx.room.name, "user")

    #     # Generate AI reply
    #     ai_reply = await session.generate_reply(instructions=user_input.text)

    #     # Speak reply
    #     await session.say(ai_reply)

    #     # Store assistant reply
    #     await assistant.send_transcript_to_fastapi(ai_reply, ctx.room.name, "assistant")


# ------------------------------------------------------
# Run worker
# ------------------------------------------------------
if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            api_key=os.getenv("LIVEKIT_API_KEY"),
            api_secret=os.getenv("LIVEKIT_API_SECRET"),
            ws_url=os.getenv("LIVEKIT_WS_URL"),
        )
    )

