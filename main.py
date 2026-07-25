import json
import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

app = FastAPI()

# Enable CORS for local React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:3000", "http://localhost:5173", "https://ipickledemo.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.getenv("GEMINI_API_KEY") #https://aistudio.google.com/api-keys?projectFilter=gen-lang-client-0163356653
if not api_key:
    raise RuntimeError("GEMINI_API_KEY environment variable is missing.")

client = genai.Client(api_key=api_key)


@app.get("/health") # for the cron job to check if the backend is up and running # https://console.cron-job.org/jobs/8157029/history
async def health():
    return {"status": "ok"}


MAX_DIMENSION = 2048  # long edge cap; Gemini vision tiles images beyond this with no OCR benefit
JPEG_QUALITY = 92      # high enough to keep handwriting/small text legible


def prepare_image_for_ocr(contents: bytes) -> Image.Image:
    image = Image.open(io.BytesIO(contents))
    image = image.convert("RGB") if image.mode not in ("RGB", "L") else image

    width, height = image.size
    longest_edge = max(width, height)
    if longest_edge > MAX_DIMENSION:
        scale = MAX_DIMENSION / longest_edge
        new_size = (round(width * scale), round(height * scale))
        image = image.resize(new_size, Image.LANCZOS)

    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=JPEG_QUALITY, optimize=True)
    buffer.seek(0)
    return Image.open(buffer)


@app.post("/api/scan")
async def scan_scoresheet(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = prepare_image_for_ocr(contents)

        prompt = """
        You are an expert OCR parser for Pickleball tournament score sheets.
        Extract all table data from this round-robin sheet into a strict single JSON object.

        Ignore handwriting notes outside of tables or margins (such as podium notes or signature notes). Focus strictly on grid tables.

        The player score table always has 9 rounds (rd1 through rd9), even if some sheets only use fewer columns.
        If a round column has no score recorded for a team (blank/not played), use null for that round.

        Every team row must always include both "wins" and "losses" filled in with integers (never null/omitted).
        Read wins/losses directly from the W and L columns on the sheet if present. If those columns are not present
        or illegible, derive wins/losses by comparing each team's score to their opponent's score for that round
        (per the court schedule matchups) across all 9 rounds.

        Required JSON format:
        {
          "tournamentInfo": {
            "division": "Men's 3.5 Doubles (8+) Group A",
            "date": "2026-07-18",
            "scorekeeper": "Ashley"
          },
          "teams": [
            {
              "teamNumber": 1,
              "player1": "Nathaniel Ting",
              "player2": "John Yu",
              "rd1": 5, "rd2": 11, "rd3": 8, "rd4": 11, "rd5": 11, "rd6": 9, "rd7": 5, "rd8": 3, "rd9": 11,
              "wins": 5, "losses": 4
            }
          ],
          "schedule": [
            {
              "courtNumber": 49,
              "round1": "2 v 1",
              "round2": "3 v 4",
              "round3": "2 v 6",
              "round4": "5 v 7",
              "round5": "1 v 3",
              "round6": "4 v 5",
              "round7": "3 v 7",
              "round8": "1 v 8",
              "round9": "9 v 7"
            }
          ]
        }
        Do not wrap in a list. Return a single JSON object.
        """

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=[image, prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )

        parsed_json = json.loads(response.text)
        if isinstance(parsed_json, list) and len(parsed_json) > 0:
            parsed_json = parsed_json[0]

        return parsed_json

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


## RUN BACKEND python -m uvicorn main:app --reload --port 8000 IN cd "C:\Users\schoo\Downloads\Ipickle Project
## RUN cd frontend 
## RUN npm run dev