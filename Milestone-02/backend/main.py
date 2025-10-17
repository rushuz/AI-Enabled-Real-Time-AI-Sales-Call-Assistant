from typing import Literal, List, Dict, Any
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn
import logging

# ----- Models -----
class TranscriptIn(BaseModel):
    text: str = Field(..., min_length=1)
    speaker: Literal["user", "assistant"]
    timestamp: float = Field(..., description="Monotonic time from sender")
    room_id: str = Field(..., min_length=1)

class TranscriptStored(BaseModel):
    text: str
    speaker: Literal["user", "assistant"]
    sent_ts: float
    received_at: datetime
    room_id: str

class Ack(BaseModel):
    ok: bool
    room_id: str
    count_in_room: int

# ----- App -----
app = FastAPI(title="Prescription Voice Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory store: { room_id: [TranscriptStored, ...] }
STORE: Dict[str, List[TranscriptStored]] = {}


@app.post("/process-transcription", response_model=Ack)
async def process_transcription(payload: TranscriptIn):
    try:
        item = TranscriptStored(
            text=payload.text.strip(),
            speaker=payload.speaker,
            sent_ts=payload.timestamp,
            received_at=datetime.now(timezone.utc),
            room_id=payload.room_id,
        )
        print(item)
        room_list = STORE.setdefault(payload.room_id, [])
        room_list.append(item)
       
        return Ack(ok=True, room_id=payload.room_id, count_in_room=len(room_list))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
