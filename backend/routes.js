import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { modelWithSearch, imageToGeminiPart } from './gemini.js';
import { sortPlacesByDate, buildPlacesSummary } from './organizer.js';
import { validateTripInput } from './validator.js';

const router = express.Router();

// ── MULTER SETUP ──
// Uses memory-based field names like photos_0, photos_1, photos_2
// Each number matches the place index sent by the frontend
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

// Accept any field name dynamically (photos_0, photos_1, etc.)
const uploadAny = multer({ storage }).any();

// ── STATUS ──
router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Storybook backend is running',
    endpoints: {
      generate: 'POST /api/generate-storybook',
      regenerate: 'POST /api/regenerate',
    },
    timestamp: new Date().toISOString()
  });
});

// ── GENERATE STORYBOOK ──
router.post('/generate-storybook', uploadAny, validateTripInput, async (req, res) => {
  console.log('RAW BODY KEYS:', Object.keys(req.body));
  console.log('RAW BODY:', JSON.stringify(req.body, null, 2));
  const uploadedFiles = req.files || [];

  try {
    // Step 1 — Read trip-level info
    const { trip_title } = req.body;

    // Step 2 — Parse places from the request body
    // Frontend sends: places[0][name], places[0][date], places[1][name], etc.
    const placesMap = {};

    Object.keys(req.body).forEach(key => {
      const match = key.match(/^places\[(\d+)\]\[(\w+)\]$/);
      if (match) {
        const index = match[1];
        const field = match[2];
        if (!placesMap[index]) placesMap[index] = {};
        placesMap[index][field] = req.body[key];
      }
    });

    // Step 3 — Attach photos to their place
    // Frontend sends photos as: photos_0, photos_1, photos_2 etc.
    uploadedFiles.forEach(file => {
      const match = file.fieldname.match(/^photos_(\d+)$/);
      if (match) {
        const index = match[1];
        if (!placesMap[index]) placesMap[index] = {};
        if (!placesMap[index].photos) placesMap[index].photos = [];
        placesMap[index].photos.push(file);
      }
    });

    // Convert map to array
    const placesArray = Object.values(placesMap).filter(p => p.name);

    if (placesArray.length === 0) {
      return res.status(400).json({
        error: 'No places found',
        detail: 'Please add at least one place with photos'
      });
    }

    // Step 4 — Sort places by date
    const sortedPlaces = sortPlacesByDate(placesArray.map(p => ({
      ...p,
      photoCount: p.photos ? p.photos.length : 0
    })));

    // Step 5 — Build the places summary for the prompt
    const placesSummary = buildPlacesSummary(sortedPlaces);

    // Step 6 — Build image parts in order (place by place)
    const allImageParts = [];
    const imageMapping = []; // tracks which photo belongs to which place

    sortedPlaces.forEach((place, placeIndex) => {
      if (place.photos) {
        place.photos.forEach((file, photoIndex) => {
          allImageParts.push(imageToGeminiPart(file.path, file.mimetype));
          imageMapping.push({
            placeIndex,
            placeName: place.name,
            photoIndex,
            globalIndex: allImageParts.length - 1
          });
        });
      }
    });

    // Step 7 — Build the image reference guide for Gemini
    const imageGuide = imageMapping.map(item =>
      `Image ${item.globalIndex + 1}: from place "${item.placeName}" (Place ${item.placeIndex + 1})`
    ).join('\n');

    // Step 8 — Build the full prompt
    const prompt = `
You are an expert travel storyteller and photo analyst with access to Google Search.

A traveler just returned from a trip and wants a beautiful, literary storybook.

TRIP INFORMATION:
- Trip Title: ${trip_title}

PLACES VISITED (already sorted by date, earliest first):
${placesSummary}

IMPORTANT: Each place has its own mood and traveler notes listed above.
When writing each chapter, reflect that specific place's mood and incorporate
the traveler's notes for that place into the prose. Do not mix moods between places.
PHOTOS ATTACHED (${allImageParts.length} total):
${imageGuide}

YOUR INSTRUCTIONS:

STEP 1 — RESEARCH EACH PLACE
Use Google Search to find detailed information about each place:
- What is it? (park, shopping center, beach, neighborhood, museum, etc.)
- What is it famous for?
- Key features, landmarks, history
- What do visitors typically experience there?
This research will make your story rich and accurate.

STEP 2 — ANALYZE EACH PHOTO CAREFULLY
For every photo, identify:
- The exact scene (e.g. a beachfront pier, a rooftop cafe, a street mural, a palm-lined promenade)
- The atmosphere and time of day
- Any specific landmark or feature visible
- How it connects to the place it was taken in
Even if a photo shows a specific sub-location (like a pier inside a beach area), identify and name it specifically.

STEP 3 — WRITE THE STORYBOOK
- Write one chapter per place, in chronological order by date
- If the same place appears on multiple dates, treat each date as a separate chapter
- Each chapter title should be the specific place name
- The prose should weave together your research about the place AND what you see in the photos
- Photo captions should describe exactly what is visible in that specific photo
- The story should flow naturally from one place to the next, like a journey
- Each chapter must reflect the specific mood and notes of that place, not a general mood

Respond ONLY with valid JSON. No explanation, no markdown fences, no extra text. Just the raw JSON.

JSON format:
{
  "coverTitle": "string - creative title for the whole trip",
  "coverSubtitle": "string - one poetic line that captures the trip",
  "introduction": "string - 3 to 4 sentence opening that sets the scene of the entire trip",
  "chapters": [
    {
      "num": 1,
      "title": "string - the place name",
      "location": "string - city or district this place is in",
      "date": "string - the date of this visit",
      "timeLabel": "string - e.g. Day 1, Day 2 Morning, Final Evening",
      "researchSummary": "string - 1 sentence about what this place is famous for",
      "prose": "string - 4 to 6 sentences weaving together place research and photo observations",
      "photoIndices": [0, 1, 2],
      "captions": [
        "string - specific caption for photo at index 0",
        "string - specific caption for photo at index 1",
        "string - specific caption for photo at index 2"
      ]
    }
  ],
  "highlights": [
    { "icon": "emoji", "label": "string", "value": "string" }
  ],
  "timeline": [
    {
      "timeLabel": "string - e.g. Day 1 Morning",
      "place": "string - place name",
      "desc": "string - one vivid sentence about this stop"
    }
  ],
  "reflection": "string - 3 to 4 sentence closing reflection on the whole trip"
}

Rules:
- photoIndices are 0-based global indices matching the image list above
- Every photo must appear in exactly one chapter's photoIndices
- captions array must have one entry per photo in photoIndices
- highlights should cover: best moment, hidden gem, food/drink highlight, key vibe, most memorable scene
- Write beautifully. Be specific. Name exact things you see. Avoid generic travel clichés.
- Return ONLY the JSON object, nothing else.
    `;

    // Step 9 — Send everything to Gemini with Google Search enabled
    const result = await modelWithSearch.generateContent([prompt, ...allImageParts]);
    const rawText = result.response.text();

    // Step 10 — Clean and parse the JSON
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const storybook = JSON.parse(cleaned);

    // Step 11 — Clean up uploaded files
    uploadedFiles.forEach(file => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });

    // Step 12 — Send back to frontend
    res.json({ success: true, storybook });

  } catch (error) {
    // Clean up files even if something went wrong
    uploadedFiles.forEach(file => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });
    console.error('Error generating storybook:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ── REGENERATE ──
router.post('/regenerate', uploadAny, validateTripInput, async (req, res) => {
  const uploadedFiles = req.files || [];

  try {
    const { trip_title } = req.body;

    // Parse places (same logic as generate)
    const placesMap = {};
    Object.keys(req.body).forEach(key => {
      const match = key.match(/^places\[(\d+)\]\[(\w+)\]$/);
      if (match) {
        const index = match[1];
        const field = match[2];
        if (!placesMap[index]) placesMap[index] = {};
        placesMap[index][field] = req.body[key];
      }
    });

    uploadedFiles.forEach(file => {
      const match = file.fieldname.match(/^photos_(\d+)$/);
      if (match) {
        const index = match[1];
        if (!placesMap[index]) placesMap[index] = {};
        if (!placesMap[index].photos) placesMap[index].photos = [];
        placesMap[index].photos.push(file);
      }
    });

    const placesArray = Object.values(placesMap).filter(p => p.name);
    const sortedPlaces = sortPlacesByDate(placesArray.map(p => ({
      ...p,
      photoCount: p.photos ? p.photos.length : 0
    })));

    const placesSummary = buildPlacesSummary(sortedPlaces);

    const allImageParts = [];
    const imageMapping = [];

    sortedPlaces.forEach((place, placeIndex) => {
      if (place.photos) {
        place.photos.forEach((file, photoIndex) => {
          allImageParts.push(imageToGeminiPart(file.path, file.mimetype));
          imageMapping.push({
            placeIndex,
            placeName: place.name,
            photoIndex,
            globalIndex: allImageParts.length - 1
          });
        });
      }
    });

    const imageGuide = imageMapping.map(item =>
      `Image ${item.globalIndex + 1}: from place "${item.placeName}" (Place ${item.placeIndex + 1})`
    ).join('\n');

    const prompt = `
You are an expert travel storyteller. Rewrite this travel storybook with a completely fresh perspective.

TRIP INFORMATION:
- Trip Title: ${trip_title}
- Requested Style: ${new_style || 'cinematic'}

PLACES VISITED (sorted by date):
${placesSummary}

IMPORTANT: Each place has its own mood and traveler notes listed above.
When writing each chapter, reflect that specific place's mood and incorporate
the traveler's notes for that place into the prose. Do not mix moods between places.

PHOTOS ATTACHED (${allImageParts.length} total):
${imageGuide}

IMPORTANT: This is a REWRITE. Use a distinctly ${new_style || 'cinematic'} tone.
Do not repeat phrases or structure from any previous version.
Use Google Search to get accurate information about each place.
Analyze every photo carefully and name specific scenes and landmarks you see.

Same JSON format as before:
{
  "coverTitle": "string",
  "coverSubtitle": "string",
  "introduction": "string",
  "chapters": [
    {
      "num": 1,
      "title": "string",
      "location": "string",
      "date": "string",
      "timeLabel": "string",
      "researchSummary": "string",
      "prose": "string",
      "photoIndices": [0, 1],
      "captions": ["string", "string"]
    }
  ],
  "highlights": [{ "icon": "emoji", "label": "string", "value": "string" }],
  "timeline": [{ "timeLabel": "string", "place": "string", "desc": "string" }],
  "reflection": "string"
}

Return ONLY the JSON object, nothing else.
    `;

    const result = await modelWithSearch.generateContent([prompt, ...allImageParts]);
    const rawText = result.response.text();
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const storybook = JSON.parse(cleaned);

    uploadedFiles.forEach(file => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });

    res.json({ success: true, storybook });

  } catch (error) {
    uploadedFiles.forEach(file => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });
    console.error('Error regenerating storybook:', error.message);
    res.status(500).json({ error: error.message });
  }
});
export default router;
