from dotenv import load_dotenv
import httpx
import asyncio
from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions, UserInputTranscribedEvent
from livekit.plugins import (
    openai,
    deepgram,
    noise_cancellation,
    silero,
)
import os
load_dotenv()
azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
azure_deployment = os.getenv("DEPLOYMENT_NAME")
api_key = os.getenv("AZURE_OPENAI_API_KEY")
api_version = os.getenv("OPENAI_API_VERSION")

class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions="""
You are a strict, professional, and voice-based prescription assistant for doctors. Your sole role is to **accurately record prescription details** spoken by the doctor. You **must ensure all mandatory fields are collected** before confirming the prescription.

 Required fields:
1. Patient Full Name
2. Patient ID
3. Medicine/Prescription Name
4. Dosage Details
5. Pharmacy Name

 Do NOT assume or guess missing details.  
 Do NOT proceed without all fields.  
 If a detail is missing or unclear, ask **immediately** and **politely**, but with a firm tone to ensure completeness.

---  
🎯 **Example Scenarios:**

**Scenario 1 – Missing Dosage**  
Doctor: “John Doe, Patient ID 2345, Amoxicillin.”  
Assistant: “Thank you. Could you please provide the dosage for Amoxicillin?”

**Scenario 2 – Missing Pharmacy Name**  
Doctor: “Patient Mary Fernandes, ID 8734, Paracetamol 500mg, take twice a day.”  
Assistant: “Understood. Please let me know the pharmacy name for this prescription.”

**Scenario 3 – All details present**  
Doctor: “Patient Arjun Mehta, ID 1102, Ciprofloxacin 250mg, twice daily for 5 days, from Apollo Pharmacy.”  
Assistant: “Noted. Ciprofloxacin 250mg twice daily for 5 days, for Patient Arjun Mehta (ID 1102), to be collected from Apollo Pharmacy. Shall I proceed to save the prescription?”

---  
Behavior Guidelines:
- Always validate that all five required fields are present.
- Use a calm, clear, and firm tone.
- Do not repeat the entire prescription unless confirming.
- Your primary goal is **data accuracy and structure**.

""")
        # self.fastapi_url = os.getenv("FASTAPI_URL", "http://backend-service:8000")
        self.fastapi_url = "http://localhost:8000"

        self.http_client = httpx.AsyncClient()

    async def send_transcript_to_fastapi(self, text: str, room_id: str, speaker: str = "user"):
        """Send transcript (user or assistant) to FastAPI backend for processing"""
        try:
            payload = {
                "text": text,
                "speaker": speaker,
                "timestamp": asyncio.get_event_loop().time(),
                "room_id": room_id
            }
            print(f"Sending to FastAPI: {payload}")
            response = await self.http_client.post(
                f"{self.fastapi_url}/process-transcription",
                json=payload
            )
            if response.status_code == 200:
                result = response.json()
            else:
                print(f"FastAPI error: {response.status_code}")
        except Exception as e:
            print(f"Error sending to FastAPI: {e}")


async def entrypoint(ctx: agents.JobContext):
    assistant = Assistant()

    session = AgentSession(
        stt=deepgram.STT(model="nova-3-medical", language="en"),
        llm=openai.LLM.with_azure(
        azure_deployment=azure_deployment,
        azure_endpoint=azure_endpoint,
        api_key=api_key,
        api_version=api_version,
    ),
        tts=deepgram.TTS(model="aura-asteria-en"),
        vad=silero.VAD.load(),
    )

    # Handle user speech (final transcript)
    @session.on("user_input_transcribed")
    def on_user_input_transcribed(event: UserInputTranscribedEvent):
        if event.is_final:
            print(f"Final user transcript: {event.transcript}")
            asyncio.create_task(
                assistant.send_transcript_to_fastapi(event.transcript, ctx.room.name, speaker="user")
            )
        else:
            print(f"Interim transcript: {event.transcript}")

    # Handle agent (assistant) messages
    @session.on("conversation_item_added")
    def on_conversation_item_added(event):
        # event.item.role is typically "user" or "assistant"
        if hasattr(event.item, "role") and event.item.role == "assistant":
            print(f"Agent message: {event.item.text_content}")
            asyncio.create_task(
                assistant.send_transcript_to_fastapi(event.item.text_content, ctx.room.name, speaker="assistant")
            )
        # Optionally, you could also process user messages here if you want

    await session.start(
        room=ctx.room,
        agent=assistant,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    await ctx.connect()

    await session.generate_reply(
        instructions="Greet the user and offer your assistance."
    )

if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(
        agent_name="web-agent",
        entrypoint_fnc=entrypoint))
