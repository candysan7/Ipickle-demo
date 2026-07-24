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
    allow_origins=["http://localhost:5174", "http://localhost:3000","http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY environment variable is missing.")

client = genai.Client(api_key=api_key)

@app.post("/api/scan")
async def scan_scoresheet(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        prompt = """
        You are an expert OCR parser for Pickleball tournament score sheets.
        Extract all table data from this round-robin sheet into a strict single JSON object.
        
        Ignore handwriting notes outside of tables or margins (such as podium notes or signature notes). Focus strictly on grid tables.

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
              "playerNames": "Nathaniel Ting / John Yu",
              "rd1": 5, "rd2": 11, "rd3": 8, "rd4": 11, "rd5": 11, "rd6": 9, "rd7": 5,
              "wins": 3
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
              "round7": "3 v 7"
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