# from dotenv import load_dotenv

# from livekit import agents
# from livekit.agents import AgentSession, Agent, RoomInputOptions

# # Make sure the following are installed:
# # pip install "livekit-agents[deepgram,google,silero]~=1.2"
# # pip install livekit-plugins-noise-cancellation
# # pip install livekit-plugins-turn-detector

# from livekit.plugins import deepgram, silero, noise_cancellation
# from livekit.plugins.google import LLM
# from livekit.plugins.turn_detector.multilingual import MultilingualModel

# # Load environment variables (API keys must be in .env)
# load_dotenv(".env")


# class Assistant(Agent):
#     def __init__(self) -> None:
#         super().__init__(instructions="You are a helpful voice AI assistant.")


# async def entrypoint(ctx: agents.JobContext):
#     session = AgentSession(
#         # Deepgram Speech-to-Text
#         stt=deepgram.STT(model="nova-3", language="multi"),

#         # Google Gemini LLM
#         llm=LLM(model="gemini-2.0-flash"),

#         # Deepgram Text-to-Speech
#         tts=deepgram.TTS(model="aura-asteria-en"),

#         # Silero Voice Activity Detection
#         vad=silero.VAD.load(),

#         # Turn detection model
#         turn_detection=MultilingualModel(),
#     )

#     await session.start(
#         room=ctx.room,
#         agent=Assistant(),
#         room_input_options=RoomInputOptions(
#             # Noise cancellation plugin
#             noise_cancellation=noise_cancellation.BVC(),
#         ),
#     )

#     # Initial greeting
#     await session.generate_reply(
#         instructions="Greet the user and offer your assistance."
#     )


# if __name__ == "__main__":
#     agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))

from dotenv import load_dotenv

from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions

# Plugins (Deepgram for STT/TTS, Google Gemini for LLM)
from livekit.plugins import deepgram, noise_cancellation
from livekit.plugins.google import LLM

# Load environment variables
load_dotenv(".env")


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions="You are a helpful voice AI assistant.")


async def entrypoint(ctx: agents.JobContext):
    session = AgentSession(
        # Speech-to-Text
        stt=deepgram.STT(model="nova-3", language="multi"),

        # Google Gemini LLM
        llm=LLM(model="gemini-2.0-flash"),

        # Text-to-Speech
        tts=deepgram.TTS(model="aura-asteria-en"),

        # Note: VAD and turn detection removed for now
        # vad=None,
        # turn_detection=None,
    )

    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_input_options=RoomInputOptions(
            # Noise cancellation
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    # Initial greeting
    await session.generate_reply(
        instructions="Greet the user and offer your assistance."
    )


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
