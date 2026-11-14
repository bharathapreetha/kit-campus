
import os
from dotenv import load_dotenv
from fastapi import FastAPI,UploadFile, File, HTTPException
from google import genai
import httpx
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
from fastapi.responses import Response

load_dotenv()

app = FastAPI()

#Pydantic input validation
class ChatRequest(BaseModel):
    transcript: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key)


@app.get("/")
def home():
    return {"message": "College Voice Assistant Backend is running!"}

#KIT College courses details
@app.get("/college-courses")
async def get_college_courses():

    base_url = os.getenv("COLLEGE_API_BASE_URL")
    participant_key = os.getenv("PARTICIPANT_KEY")

    if not base_url or not participant_key:
        raise HTTPException(
            status_code=500,
            detail="College API configuration missing"
        )

    headers = {
        "X-Participant-Key": participant_key
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(
              f"{base_url.rstrip('/')}/v1/courses",
                headers=headers
            )

        response.raise_for_status()
        return response.json()

    except httpx.HTTPStatusError as e:
       
        print("College API status:", e.response.status_code)
        print("College API response:", e.response.text)

        raise HTTPException(
            status_code=502,
            detail=f"College API returned {e.response.status_code}"
        )
    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="Unable to connect to College API"
        )
        
#Voice assistant
@app.post("/ask")
async def ask_college_assistant(request: ChatRequest):

    if not request.transcript.strip():
        raise HTTPException(status_code=400, detail="Question is empty")

    # Get live college course information
    courses = await get_college_courses()

    prompt = f"""
    You are a friendly college admission assistant.

    Answer the user's question using ONLY the college
    information provided below.

    If the information is unavailable, say that you
    don't have that information and suggest contacting
    the college admission office.

    Keep answers simple, conversational and short.

    COLLEGE COURSE INFORMATION:
    {json.dumps(courses, indent=2)}

    USER QUESTION:
    {request.transcript}
    """

    try:
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt
        )

        return {
            "question": request.transcript,
            "answer": response.text
        }

    except Exception as e:
        print("Gemini error:", str(e))
        raise HTTPException(
            status_code=500,
            detail="Unable to generate an answer"
        )
        
@app.post("/speak")
async def speak_text(request: ChatRequest):

    api_key = os.getenv("DEEPGRAM_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="Deepgram API key is missing"
        )

    url = "https://api.deepgram.com/v1/speak?model=aura-2-thalia-en"

    headers = {
        "Authorization": f"Token {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "text": request.transcript
    }

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                url,
                headers=headers,
                json=payload
            )

        response.raise_for_status()

        return Response(
            content=response.content,
            media_type="audio/mpeg"
        )

    except httpx.HTTPStatusError as e:
        print("Deepgram TTS error:", e.response.text)
        raise HTTPException(
            status_code=502,
            detail="Text-to-speech generation failed"
        )
        

@app.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):

    api_key = os.getenv("DEEPGRAM_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="Deepgram API key is missing"
        )

    audio_data = await audio.read()

    if not audio_data:
        raise HTTPException(
            status_code=400,
            detail="No audio received"
        )

    headers = {
        "Authorization": f"Token {api_key}",
        "Content-Type": audio.content_type or "audio/webm"
    }

    url = (
        "https://api.deepgram.com/v1/listen"
        "?model=nova-3&smart_format=true"
    )

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                url,
                headers=headers,
                content=audio_data
            )

        response.raise_for_status()
        result = response.json()

        transcript = (
            result["results"]["channels"][0]
            ["alternatives"][0]["transcript"]
        )

        return {"transcript": transcript}

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail="Deepgram transcription failed"
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to process audio"
        )



@app.get("/test-gemini")
def test_gemini():
    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents="Introduce yourself as a friendly college admission assistant in one sentence."
    )

    return {"response": response.text}
