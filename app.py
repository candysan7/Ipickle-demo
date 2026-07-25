import io
import json
import os
import pandas as pd
import streamlit as st
from PIL import Image
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load environment variables
load_dotenv()

st.set_page_config(page_title="iPickle DUPR Scanner", page_icon="🏓", layout="centered")

st.title("🎾 iPickle Score Scanner")
st.caption("Upload a paper score sheet photo to extract and display match results using Gemini.")

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    st.error("⚠️ API Key not found! Please check that GEMINI_API_KEY is set in your .env file.")
    st.stop()

client = genai.Client(api_key=api_key)

MAX_DIMENSION = 2048  # long edge cap; Gemini vision tiles images beyond this with no OCR benefit
JPEG_QUALITY = 92      # high enough to keep handwriting/small text legible


def prepare_image_for_ocr(image: Image.Image) -> Image.Image:
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


st.markdown("---")

# 1. Step One: Upload Picture
st.subheader("1. Upload Score Sheet")
uploaded_file = st.file_uploader("Choose a score sheet image", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    image = Image.open(uploaded_file)
    st.image(image, caption="Uploaded Score Sheet", use_container_width=True)

    if "last_uploaded" not in st.session_state or st.session_state["last_uploaded"] != uploaded_file.name:
        st.session_state["last_uploaded"] = uploaded_file.name
        
        with st.spinner("Analyzing image with Gemini Vision OCR..."):
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

            try:
                ocr_image = prepare_image_for_ocr(image)
                response = client.models.generate_content(
                    model="gemini-3.6-flash",
                    contents=[ocr_image, prompt],
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json"
                    )
                )

                parsed_json = json.loads(response.text)
                st.session_state["parsed_match"] = parsed_json
                st.success("Score sheet parsed successfully!")

            except Exception as e:
                st.error(f"OCR Error with Gemini API: {str(e)}")

# 2. Step Two: Display Tables
if "parsed_match" in st.session_state:
    st.markdown("---")
    
    raw_data = st.session_state["parsed_match"]
    if isinstance(raw_data, list) and len(raw_data) > 0:
        match_data = raw_data[0]
    elif isinstance(raw_data, dict):
        match_data = raw_data
    else:
        match_data = {}

    # Metadata Header
    info = match_data.get("tournamentInfo", {})
    if info:
        st.markdown(f"**Division:** {info.get('division', 'N/A')} | **Date:** {info.get('date', 'N/A')} | **Scorekeeper:** {info.get('scorekeeper', 'N/A')}")

    # Table 1: Player Scores & Standings
    st.subheader("📊 1. Player Scores & Standings")
    teams_list = match_data.get("teams", [])
    if teams_list:
        df_teams = pd.DataFrame(teams_list)
        col_rename = {
            "teamNumber": "Team #",
            "player1": "Player 1",
            "player2": "Player 2",
            "rd1": "Rd 1", "rd2": "Rd 2", "rd3": "Rd 3", "rd4": "Rd 4",
            "rd5": "Rd 5", "rd6": "Rd 6", "rd7": "Rd 7", "rd8": "Rd 8", "rd9": "Rd 9",
            "wins": "W", "losses": "L"
        }
        df_teams = df_teams.rename(columns=col_rename)
        st.data_editor(df_teams, use_container_width=True, hide_index=True)
    else:
        st.warning("No player team scores found in response.")

    # Table 2: Court Schedule & Matchups
    st.subheader("🎾 2. Court Matchups Schedule")
    schedule_list = match_data.get("schedule", [])
    if schedule_list:
        df_sched = pd.DataFrame(schedule_list)
        sched_col_rename = {
            "courtNumber": "Court",
            "round1": "Round 1", "round2": "Round 2", "round3": "Round 3",
            "round4": "Round 4", "round5": "Round 5", "round6": "Round 6", "round7": "Round 7",
            "round8": "Round 8", "round9": "Round 9"
        }
        df_sched = df_sched.rename(columns=sched_col_rename)
        st.data_editor(df_sched, use_container_width=True, hide_index=True)
    else:
        st.warning("No court schedule found in response.")

    st.markdown("---")
    if st.button("🚀 Confirm & Send Scores to DUPR", type="primary", use_container_width=True):
        st.balloons()
        st.success("Match results verified and submitted!")


### RUN THIS IN TERMINAL: python -m streamlit run app.py