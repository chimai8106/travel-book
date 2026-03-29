import express from 'express';
import multer from 'multer';
import fs from 'fs';
import qs from 'qs';
import { modelWithSearch, imageToGeminiPart } from './gemini.js';
import { sortPlacesByDate, buildPlacesSummary } from './organizer.js';
import { validateTripInput } from './validator.js';
import { buildNarrationScript, generateNarration } from './narration.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const uploadAny = multer({ storage }).any();

router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Storybook backend is running',
    endpoints: {
      generate: 'POST /api/generate-storybook',
      regenerate: 'POST /api/regenerate',
      narrate: 'POST /api/narrate',
    },
    timestamp: new Date().toISOString()
  });
});

function parsePlaces(body, files) {
  let placesMap;

  if (body.places && typeof body.places === 'object') {
    placesMap = body.places;
  } else {
    const encoded = Object.entries(body)
      .filter(([, v]) => typeof v === 'string')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    const parsed = qs.parse(encoded);
    placesMap = parsed.places || {};
  }

  (files || []).forEach(file => {
    const match = file.fieldname.match(/^photos_(\d+)$/);
    if (match) {
      const index = match[1];
      if (!placesMap[index]) placesMap[index] = {};
      if (!placesMap[index].photos) placesMap[index].photos = [];
      placesMap[index].photos.push(file);
    }
  });

  const placesArray = Object.values(placesMap).filter(p => p.name && p.name.trim() !== '');

  console.log('Final places:', placesArray.map(p => ({
    name: p.name,
    date: p.date,
    photoCount: p.photos ? p.photos.length : 0
  })));

  return placesArray;
}

function buildPrompt({ trip_title, placesSummary, allImageParts, imageGuide, isRewrite, style }) {
  const styleNote = isRewrite
    ? `This is a REWRITE — fresh angle, ${style || 'laid-back'} vibe, no repeated phrasing from before.`
    : '';

  return `
You are an expert travel storyteller and photo analyst with access to Google Search. Think the kind of blog people actually want to read — honest, specific, a little funny, 
genuinely excited about the small details. Not a travel brochure. Not a poem. Just a real person sharing what it was actually like to be there.
A traveler just returned from a trip and wants a beautiful, literary storybook.

${styleNote}

TRIP INFORMATION:
- Trip Title: ${trip_title}

PLACES VISITED (sorted by date, earliest first):
${placesSummary}
IMPORTANT: Each place has its own mood and traveler notes listed above.
When writing each chapter, reflect that specific place's mood and incorporate
the traveler's notes for that place into the prose. Do not mix moods between places.

PHOTOS ATTACHED (${allImageParts.length} total):
${imageGuide}

### STYLE GUIDE (MANDATORY)
- **Tone**: Observant, calm, and grounded. Write like a person who is looking closely at a scene, not a marketing brochure. 
- **Language**: Use "Plain English" but with precise vocabulary. Avoid flowery adjectives.
- **Negative Constraints**: DO NOT use these words: "nestled," "tapestry," "vibrant," "breathtaking," "haven," "unforgettable," "hidden gem," "stunning," "bustling," or "heart of." 
- **Focus**: Prioritize specific physical details (the color of a door, the shape of a shadow, the specific name of a street) over generic emotions.
- Use "we" or "I" naturally. Write short sentences or long sentences as neeeded. Incomplete sentences are fine too, when needed. 
- It's okay to be funny or self-deprecating. Okay to say something was "touristy but we loved it anyway."

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
- Identify specific objects: A certain brand of coffee, a specific street sign, the texture of the pavement.
- Note the light: Is it harsh midday sun, or the soft blue of dusk? Mention this in the prose.
- How it connects to the place it was taken in
Even if a photo shows a specific sub-location (like a pier inside a beach area), identify and name it specifically.

STEP 3 — WRITE THE STORYBOOK
- Write one chapter per place with as many sentences as needed  to perfectly journal the place, in chronological order by date
- If the same place appears on multiple dates, treat each date as a separate chapter
- Each chapter title should be the specific place name
- SCENE RULES:
  One scene = one photo. Never combine two photos into one scene. A chapter with 4 photos gets exactly 4 scenes.
  sceneTitle: casual and specific, like a blog subheading. E.g. "That coconut stall guy", "The mural we almost walked past". 
- The prose should weave together your research about the place AND what you see in the photos
- Photo captions should describe exactly what is visible in that specific photo
- The story should flow naturally from one place to the next, like a journey
- Each chapter must reflect the specific mood and notes of that place, not a general mood
- Mention real specific things: the name of the dish, what the guy said, what the light looked like.


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
}

router.post('/generate-storybook', uploadAny, async (req, res) => {
  const uploadedFiles = req.files || [];
  try {
    const { trip_title } = req.body;
    const placesArray = parsePlaces(req.body, uploadedFiles);

    if (placesArray.length === 0) {
      return res.status(400).json({ error: 'No places found', detail: 'Add at least one place with a name and photos' });
    }

    const sortedPlaces = sortPlacesByDate(placesArray.map(p => ({ ...p, photoCount: p.photos ? p.photos.length : 0 })));
    const placesSummary = buildPlacesSummary(sortedPlaces);
    const allImageParts = [];
    const imageMapping = [];

    sortedPlaces.forEach((place, placeIndex) => {
      (place.photos || []).forEach((file, photoIndex) => {
        allImageParts.push(imageToGeminiPart(file.path, file.mimetype));
        imageMapping.push({ placeIndex, placeName: place.name, photoIndex, globalIndex: allImageParts.length - 1 });
      });
    });

    const imageGuide = imageMapping.map(m =>
      `Image ${m.globalIndex + 1} (global index ${m.globalIndex}): from place "${m.placeName}" (Place ${m.placeIndex + 1})`
    ).join('\n');

    const prompt = buildPrompt({ trip_title, placesSummary, allImageParts, imageGuide, isRewrite: false });
    const result = await modelWithSearch.generateContent([prompt, ...allImageParts]);
    const cleaned = result.response.text().replace(/```json|```/g, '').trim();
    const storybook = JSON.parse(cleaned);

    uploadedFiles.forEach(file => { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); });
    res.json({ success: true, storybook });
  } catch (error) {
    uploadedFiles.forEach(file => { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); });
    console.error('Error generating storybook:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post('/regenerate', uploadAny, validateTripInput, async (req, res) => {
  const uploadedFiles = req.files || [];
  try {
    const { trip_title, new_style } = req.body;
    const placesArray = parsePlaces(req.body, uploadedFiles);
    const sortedPlaces = sortPlacesByDate(placesArray.map(p => ({ ...p, photoCount: p.photos ? p.photos.length : 0 })));
    const placesSummary = buildPlacesSummary(sortedPlaces);
    const allImageParts = [];
    const imageMapping = [];

    sortedPlaces.forEach((place, placeIndex) => {
      (place.photos || []).forEach((file, photoIndex) => {
        allImageParts.push(imageToGeminiPart(file.path, file.mimetype));
        imageMapping.push({ placeIndex, placeName: place.name, photoIndex, globalIndex: allImageParts.length - 1 });
      });
    });

    const imageGuide = imageMapping.map(m =>
      `Image ${m.globalIndex + 1} (global index ${m.globalIndex}): from place "${m.placeName}" (Place ${m.placeIndex + 1})`
    ).join('\n');

    const prompt = buildPrompt({ trip_title, placesSummary, allImageParts, imageGuide, isRewrite: true, style: new_style });
    const result = await modelWithSearch.generateContent([prompt, ...allImageParts]);
    const cleaned = result.response.text().replace(/```json|```/g, '').trim();
    const storybook = JSON.parse(cleaned);

    uploadedFiles.forEach(file => { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); });
    res.json({ success: true, storybook });
  } catch (error) {
    uploadedFiles.forEach(file => { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); });
    console.error('Error regenerating storybook:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ── Narration endpoint ──────────────────────────────────────────────────────
// POST /api/narrate
// Body (JSON): { storybook: <storybook object> }
// Returns: audio/mpeg stream (the MP3 buffer from ElevenLabs)
router.post('/narrate', express.json({ limit: '2mb' }), async (req, res) => {
  try {
    const { storybook } = req.body;

    if (!storybook) {
      return res.status(400).json({ error: 'Missing storybook in request body' });
    }

    const script = buildNarrationScript(storybook);
    console.log(`Narration script length: ${script.length} chars`);

    const audioBuffer = await generateNarration(script);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Content-Disposition': 'inline; filename="narration.mp3"',
      'Cache-Control': 'no-cache',
    });

    res.send(audioBuffer);
  } catch (error) {
    console.error('Error generating narration:', error.message);

    // Surface ElevenLabs quota errors clearly
    if (error.message?.includes('quota') || error.message?.includes('ElevenLabs')) {
      return res.status(429).json({ error: 'ElevenLabs quota exceeded', detail: error.message });
    }

    res.status(500).json({ error: error.message });
  }
});

export default router;