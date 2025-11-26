
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from dotenv import load_dotenv
import hashlib, os, json, logging
from datetime import datetime, timezone
from typing import Literal, List, Optional
from google import genai

# --- Setup ---
logging.basicConfig(level=logging.INFO)
load_dotenv()

# MongoDB URIs
MONGO_URI = os.getenv("MONGO_URI")
MONGO_URI_1 = os.getenv("MONGO_URI_1")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

LOGIN_DB = os.getenv("DB_NAME", "UserLogin")
LOGIN_COLLECTION = os.getenv("COLLECTION_NAME", "Login")

TRANSCRIPT_DB = os.getenv("TRANSCRIPT_DB_NAME", "Transcripts")
TRANSCRIPT_COLLECTION = os.getenv("TRANSCRIPT_COLLECTION", "UserAI")

if not MONGO_URI or not MONGO_URI_1:
    raise ValueError("MongoDB URIs missing in .env")

client_gen = genai.Client(api_key=GOOGLE_API_KEY)
client_login = MongoClient(MONGO_URI)
login_db = client_login[LOGIN_DB]
users_collection = login_db[LOGIN_COLLECTION]

client_transcript = MongoClient(MONGO_URI_1)
transcript_db = client_transcript[TRANSCRIPT_DB]
transcripts_collection = transcript_db[TRANSCRIPT_COLLECTION]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---
class User(BaseModel):
    username: str
    password: str

class TranscriptIn(BaseModel):
    text: str
    speaker: Literal["user", "assistant"]
    timestamp: float
    room_id: str

class SentimentAnalysis(BaseModel):
    sentiment: str
    confidence: float
    key_points: List[str]
    recommendation_to_salesperson: str

class TranscriptResponse(BaseModel):
    ok: bool
    room_id: str
    count_in_room: int
    analysis: Optional[SentimentAnalysis] = None
    latest_user_message: Optional[str] = None

# --- Utilities ---
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def analyze_with_gemini(user_text: str) -> dict:
    prompt = f"""
    Analyze this customer message for sentiment and key intent:
    "{user_text}"

    Return JSON only:
    {{
      "sentiment": "positive" | "neutral" | "negative",
      "confidence": number between 0 and 1,
      "key_points": ["key summary 1", "key summary 2"],
      "recommendation_to_salesperson": "short recommendation"
    }}
    """
    try:
        response = client_gen.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        text = response.text.strip("```json").strip("```").strip()
        parsed = json.loads(text)
        return {
            "sentiment": parsed.get("sentiment", "neutral"),
            "confidence": float(parsed.get("confidence", 0.0)),
            "key_points": parsed.get("key_points", []),
            "recommendation_to_salesperson": parsed.get(
                "recommendation_to_salesperson", "Continue the conversation."
            )
        }
    except Exception as e:
        logging.error(f"Gemini error: {e}")
        return {
            "sentiment": "neutral",
            "confidence": 0.0,
            "key_points": [],
            "recommendation_to_salesperson": "Unable to process."
        }

# --- Store transcripts and latest analysis temporarily ---
STORE = {}
LATEST_ANALYSIS = {}  # Store latest sentiment analysis per room_id

# --- Auth Routes ---
@app.post("/signup")
def signup(user: User):
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username exists")
    hashed_pw = hash_password(user.password)
    users_collection.insert_one({"username": user.username, "password": hashed_pw})
    return {"message": "User registered successfully"}

@app.post("/login")
def login(user: User):
    db_user = users_collection.find_one({"username": user.username})
    if not db_user or db_user["password"] != hash_password(user.password):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    return {"message": "Login successful", "username": user.username}

# --- Transcription Route ---
@app.post("/process-transcription", response_model=TranscriptResponse)
async def process_transcription(payload: TranscriptIn):
    try:
        record = {
            "text": payload.text.strip(),
            "speaker": payload.speaker,
            "timestamp": payload.timestamp,
            "received_at": datetime.now(timezone.utc).isoformat(),
            "room_id": payload.room_id,
        }

        analysis = None
        latest_user_message = None

        # If user message, analyze sentiment and add to record
        if payload.speaker == "user" and payload.text.strip():
            latest_user_message = payload.text.strip()
            analysis_result = analyze_with_gemini(payload.text)
            analysis = SentimentAnalysis(**analysis_result)

            # Store the analysis with the record
            record["analysis"] = {
                "sentiment": analysis.sentiment,
                "confidence": analysis.confidence,
                "key_points": analysis.key_points,
                "recommendation_to_salesperson": analysis.recommendation_to_salesperson
            }

            # Store latest analysis in memory for instant access
            LATEST_ANALYSIS[payload.room_id] = {
                "sentiment": analysis.sentiment,
                "confidence": analysis.confidence,
                "key_points": analysis.key_points,
                "recommendation_to_salesperson": analysis.recommendation_to_salesperson,
                "timestamp": payload.timestamp,
                "user_message": payload.text.strip()
            }
            logging.info(f"✅ Updated LATEST_ANALYSIS for room {payload.room_id}: {analysis.sentiment} ({analysis.confidence})")

        STORE.setdefault(payload.room_id, []).append(record)
        transcripts_collection.insert_one(record)

        return TranscriptResponse(
            ok=True,
            room_id=payload.room_id,
            count_in_room=len(STORE[payload.room_id]),
            analysis=analysis,
            latest_user_message=latest_user_message
        )

    except Exception as e:
        logging.exception("Processing error")
        raise HTTPException(status_code=500, detail=str(e))

# --- Get Latest Analysis Route ---
@app.get("/get-latest-analysis")
async def get_latest_analysis(room_id: str):
    try:
        # Check if we have analysis in memory for this room
        if room_id in LATEST_ANALYSIS:
            analysis = LATEST_ANALYSIS[room_id]
            logging.info(f"📊 Returning analysis for room {room_id}: {analysis['sentiment']} (confidence: {analysis['confidence']})")
            return {
                "ok": True,
                "room_id": room_id,
                "analysis": {
                    "sentiment": analysis["sentiment"],
                    "confidence": analysis["confidence"],
                    "key_points": analysis["key_points"],
                    "recommendation_to_salesperson": analysis["recommendation_to_salesperson"]
                }
            }

        # If not in memory, try MongoDB
        latest_user_transcript = transcripts_collection.find_one(
            {
                "room_id": room_id,
                "speaker": "user",
                "analysis": {"$exists": True}
            },
            sort=[("timestamp", -1)]
        )

        if latest_user_transcript and "analysis" in latest_user_transcript:
            analysis = latest_user_transcript["analysis"]
            # Cache it in memory
            LATEST_ANALYSIS[room_id] = analysis
            logging.info(f"📊 Found in DB and cached for room {room_id}: {analysis['sentiment']}")
            return {
                "ok": True,
                "room_id": room_id,
                "analysis": {
                    "sentiment": analysis.get("sentiment", "neutral"),
                    "confidence": analysis.get("confidence", 0.0),
                    "key_points": analysis.get("key_points", []),
                    "recommendation_to_salesperson": analysis.get("recommendation_to_salesperson", "Continue engaging.")
                }
            }

        # No analysis found yet
        logging.info(f"⏳ No analysis yet for room {room_id}")
        return {
            "ok": True,
            "room_id": room_id,
            "analysis": {
                "sentiment": "neutral",
                "confidence": 0.0,
                "key_points": ["Waiting for customer input..."],
                "recommendation_to_salesperson": "Start the conversation and engage with the customer."
            }
        }

    except Exception as e:
        logging.exception(f"Error fetching latest analysis for room {room_id}")
        raise HTTPException(status_code=500, detail=str(e))



