# iPickle

A pickleball & tennis club platform for iPickle — Southern California's pickleball club with dedicated courts across LA, Orange, and Riverside counties. Includes a public marketing site (locations, leagues, tournaments, socials, coaching) and an AI-powered score sheet scanner for tournament directors.

**Live demo:** [ipickledemo.vercel.app](https://ipickledemo.vercel.app)

## Features

- **Home** — club overview, upcoming events, program highlights
- **Locations** — all six clubs with embedded Google Maps, court counts, and contact info
- **Leagues** — open registration, upcoming registration windows, and league history
- **Tournaments** — upcoming tournaments with sign-up, address/time details, and a searchable archive of past events
- **Socials** — weekly open-play schedule by day and location
- **Coaching** — browse coaches by location and rate, and book an open time slot (demo booking flow)
- **Score Uploader** *(password-protected)* — upload a photo of a paper score sheet and use Gemini Vision to extract standings and court schedules into an editable table

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, lucide-react |
| Backend | FastAPI, Google Gemini (`google-genai`), Pillow |
| Hosting | Frontend on Vercel, backend on Render |

## Project Structure

```
.
├── main.py              # FastAPI backend (score sheet OCR via Gemini)
├── requirements.txt      # Backend dependencies
├── frontend/             # React + Vite single-page app
│   └── src/
│       ├── components/   # Navbar
│       ├── pages/        # Home, Locations, Leagues, Tournaments, Socials, Coaching, ScoreUploader
│       └── data/         # Static club/league/tournament content
└── ipickle_icon.png       # Club logo
```

## Getting Started

### Backend

```bash
pip install -r requirements.txt
```

Create a `.env` file in the project root:

```
GEMINI_API_KEY=your_gemini_api_key
```

Run the API:

```bash
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend calls the backend at `VITE_BACKEND_URL` (falls back to `http://localhost:8000` for local development). Set this environment variable in your Vercel project settings to point at your deployed backend.

## Score Uploader Access

The Score Uploader tab is gated by a simple client-side password prompt (not a server-side auth system — suitable for a demo, not for protecting sensitive data). The password is configured in `frontend/src/pages/ScoreUploader.jsx`.

## Deployment

- **Frontend**: deployed to Vercel from the `frontend/` directory (Root Directory setting: `frontend`). Requires the `VITE_BACKEND_URL` environment variable.
- **Backend**: deployed to Render as a FastAPI service. Requires the `GEMINI_API_KEY` environment variable, and its CORS `allow_origins` list must include the deployed frontend's origin.
