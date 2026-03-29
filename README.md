# ✈️ AI Travel Storybook & Memory Engine

> Turn your travel photos into a story worth keeping.

AI Travel Storybook is a full-stack web application that transforms a user's travel photos and place visits into a beautiful, literary storybook — powered by **Google Gemini 2.5 Flash** with Google Search grounding and **ElevenLabs** text-to-speech narration.

---

## 🌍 What It Does

Users create a trip, add the places they visited, upload photos per place, and receive a fully AI-generated storybook in minutes.

For each place, Gemini:
- **Searches Google** for real information — history, landmarks, what the place is famous for
- **Analyzes every photo** to identify the exact scene — a beachfront pier, a street mural, a rooftop cafe
- **Weaves everything** into one connected narrative ordered chronologically by date
- **Reflects each place's individual mood** as described by the traveler

The final storybook includes:
- A creative cover title and poetic subtitle
- A literary opening introduction
- One chapter per place with narrative prose and specific photo captions
- A Trip Highlights section
- A Memory Timeline
- A closing reflection
- An audio narration via ElevenLabs

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| AI — Story Generation | Google Gemini 2.5 Flash |
| AI — Google Search Grounding | Gemini built-in Google Search tool |
| AI — Audio Narration | ElevenLabs Text-to-Speech |
| File Uploads | Multer |
| Environment Variables | dotenv |

---

## 📁 Project Structure

```
travel-book/
├── backend/
│   ├── uploads/          ← temporary photo storage (auto-cleared)
│   ├── index.js          ← Express server entry point
│   ├── gemini.js         ← Gemini AI client setup
│   ├── routes.js         ← all API endpoints
│   ├── narration.js      ← ElevenLabs narration logic
│   ├── organizer.js      ← place sorting and metadata
│   ├── validator.js      ← input validation middleware
│   ├── errorHandler.js   ← centralized error handling
│   ├── API_DOCS.md       ← full API documentation
│   └── package.json
├── frontend/
│   ├── src/              ← React components
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- A Google Gemini API key → [Get one here](https://aistudio.google.com/app/apikey)
- An ElevenLabs API key → [Get one here](https://elevenlabs.io)

---

### Backend Setup

**1. Navigate to the backend folder**

```bash
cd backend
```

**2. Install dependencies**

```bash
npm install
```

**3. Create your `.env` file**

```bash
touch .env
```

Add the following to `.env`:

```
GEMINI_API_KEY=your_gemini_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
PORT=3000
```

**4. Start the server**

```bash
node index.js
```

You should see:

```
Server is running on http://localhost:3000
```

---

### Frontend Setup

**1. Navigate to the frontend folder**

```bash
cd frontend
```

**2. Install dependencies**

```bash
npm install
```

**3. Create your `.env` file**

```bash
touch .env
```

Add the following:

```
VITE_API_URL=http://localhost:3000
```

**4. Start the development server**

```bash
npm run dev
```

---

## 📡 API Endpoints

### Health Check
```
GET /api/status
```
Returns server status and available endpoints.

---

### Generate Storybook
```
POST /api/generate-storybook
```

**Request format:** `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `trip_title` | text | ✅ | Overall trip name e.g. Miami 2025 |
| `places[0][name]` | text | ✅ | Name of place |
| `places[0][date]` | text | ❌ | Date visited e.g. 2025-03-10 |
| `places[0][mood]` | text | ❌ | Mood at this place e.g. Relaxed |
| `places[0][description]` | text | ❌ | Traveler's personal notes |
| `photos_0` | file | ✅ | 1 to 5 photos for place 0 |
| `places[1][name]` | text | ❌ | Second place name |
| `photos_1` | file | ❌ | Photos for place 1 |

**Success Response:**
```json
{
  "success": true,
  "storybook": {
    "coverTitle": "string",
    "coverSubtitle": "string",
    "introduction": "string",
    "chapters": [...],
    "highlights": [...],
    "timeline": [...],
    "reflection": "string"
  }
}
```

---

### Regenerate Storybook
```
POST /api/regenerate
```
Same request format as `/generate-storybook`. Add `new_style` field to request a different writing tone.

| Extra Field | Type | Description |
|---|---|---|
| `new_style` | text | cinematic, poetic, journal, documentary, minimalist |

---

### Narrate Storybook
```
POST /api/narrate
```

**Request format:** `application/json`

```json
{
  "storybook": { ...storybook object... }
}
```

**Response:** MP3 audio file (audio/mpeg)

---

## 🔒 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `ELEVENLABS_API_KEY` | ✅ | ElevenLabs API key |
| `PORT` | ❌ | Server port (default: 3000) |

> ⚠️ Never commit your `.env` file. It is listed in `.gitignore` and should only exist on your local machine or deployment platform.

---

## 🧠 How the AI Works

### Story Generation Flow

```
User submits trip + places + photos
          ↓
Backend sorts places by date (earliest first)
          ↓
All photos converted to base64 for Gemini
          ↓
Gemini searches Google for each place
          ↓
Gemini analyzes every photo individually
          ↓
Gemini writes one chapter per place
          ↓
Chapters woven into one connected narrative
          ↓
Structured JSON storybook returned to frontend
```

### Narration Flow

```
Frontend sends storybook JSON to /api/narrate
          ↓
Backend builds narration script from all chapters
          ↓
Script sent to ElevenLabs (Rachel voice)
          ↓
MP3 audio returned to frontend
          ↓
Frontend plays audio inline
```

---

## ⚠️ Known Limits

| Service | Free Tier Limit |
|---|---|
| Gemini 2.5 Flash | 15 requests per minute |
| ElevenLabs | 10,000 characters per month |
| Photos per place | Max 5 |

---

## 👥 Team

| Role | Name |
|---|---|
| Backend & AI Integration | Anika |
| Frontend & UI | Chi Mai |

---

## 🏆 Built For

This project was built for a hackathon under the Google Gemini track.

---

## 📄 License

MIT License — free to use, modify, and distribute.
