# Storybook Backend API Docs

## Base URL
http://YOUR_IP_ADDRESS:3000

---

## Endpoints

---

### 1. Health Check
**GET** `/api/status`

Check if the backend is running.

**Response:**
```json
{
  "status": "ok",
  "message": "Storybook backend is running",
  "endpoints": {
    "generate": "POST /api/generate-storybook",
    "regenerate": "POST /api/regenerate"
  },
  "timestamp": "2025-06-01T12:00:00.000Z"
}
```

---

### 2. Generate Storybook
**POST** `/api/generate-storybook`

Send trip info and photos. Get back a full AI-generated storybook.

**Request format:** `multipart/form-data`

**Fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| title | text | ✅ | Trip title |
| place | text | ✅ | Destination name |
| date | text | ❌ | e.g. 2025-06-01 |
| mood | text | ❌ | Romantic, Adventurous, Cozy, etc |
| description | text | ❌ | Short trip description |
| photos | file | ✅ | 1 to 5 image files |

**Success Response:**
```json
{
  "success": true,
  "storybook": {
    "coverTitle": "string",
    "coverSubtitle": "string",
    "introduction": "string",
    "chapters": [
      {
        "num": 1,
        "title": "string",
        "location": "string",
        "prose": "string",
        "photoIndex": 0,
        "caption": "string"
      }
    ],
    "highlights": [
      { "icon": "emoji", "label": "string", "value": "string" }
    ],
    "timeline": [
      { "label": "Day 1", "title": "string", "desc": "string" }
    ],
    "reflection": "string"
  }
}
```

**Error Response:**
```json
{
  "error": "string",
  "detail": "string"
}
```

---

### 3. Regenerate Storybook
**POST** `/api/regenerate`

Same as generate but rewrites with a fresh tone.
Send the same photos + trip info with a new style value.

**Request format:** `multipart/form-data`

Same fields as `/generate-storybook`.

**Response:** Same format as `/generate-storybook`.

---

## How to call this from React
```javascript
// Generate storybook
const generateStorybook = async (tripInfo, photoFiles) => {
  const formData = new FormData();

  // Add trip info
  formData.append('title', tripInfo.title);
  formData.append('place', tripInfo.place);
  formData.append('startDate', tripInfo.startDate);
  formData.append('endDate', tripInfo.endDate);
  formData.append('style', tripInfo.style);
  formData.append('mood', tripInfo.mood);
  formData.append('description', tripInfo.description);

  // Add photos
  photoFiles.forEach(file => {
    formData.append('photos', file);
  });

  const response = await fetch('http://YOUR_IP_ADDRESS:3000/api/generate-storybook', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return data.storybook;
};

// Regenerate storybook
const regenerateStorybook = async (tripInfo, photoFiles, newStyle) => {
  const formData = new FormData();

  formData.append('title', tripInfo.title);
  formData.append('place', tripInfo.place);
  formData.append('startDate', tripInfo.startDate);
  formData.append('endDate', tripInfo.endDate);
  formData.append('style', newStyle); // ← new style here
  formData.append('mood', tripInfo.mood);
  formData.append('description', tripInfo.description);

  photoFiles.forEach(file => {
    formData.append('photos', file);
  });

  const response = await fetch('http://YOUR_IP_ADDRESS:3000/api/generate-storybook', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return data.storybook;
};
```
```

---

### Step 3 — Your final folder structure

Make sure your project looks like this:
```
storybook-backend/
├── uploads/            ← temporary photo storage
├── .env                ← your secret API key
├── index.js            ← main server
├── gemini.js           ← Gemini AI connection
├── routes.js           ← all API endpoints
├── errorHandler.js     ← error handling
├── validator.js        ← input validation
├── API_DOCS.md         ← docs for your friend
└── package.json