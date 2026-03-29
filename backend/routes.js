import express from 'express';
import multer from 'multer';
import fs from 'fs';
import qs from 'qs';
import { modelWithSearch, imageToGeminiPart } from './gemini.js';
import { sortPlacesByDate, buildPlacesSummary } from './organizer.js';
import { validateTripInput } from './validator.js';

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
    endpoints: { generate: 'POST /api/generate-storybook', regenerate: 'POST /api/regenerate' },
    timestamp: new Date().toISOString()
  });
});

function parsePlaces(body, files) {
  // multer may give us `places` as an already-nested object (when the client
  // sends bracket-notation keys like places[0][name]) OR as flat bracket-string
  // keys scattered across the body. Handle both.
  let placesMap;

  if (body.places && typeof body.places === 'object') {
    // Already parsed into a nested object by multer — use it directly
    placesMap = body.places;
  } else {
    // Flat bracket-notation strings — re-encode and parse with qs
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
You are a fun, relatable travel blogger writing a personal trip journal. Think the kind of blog people actually want to read — honest, specific, a little funny, genuinely excited about the small details. Not a travel brochure. Not a poem. Just a real person sharing what it was actually like to be there.

${styleNote}

TRIP INFORMATION:
- Trip Title: ${trip_title}

PLACES VISITED (sorted by date, earliest first):
${placesSummary}

PHOTOS ATTACHED (${allImageParts.length} total):
${imageGuide}

YOUR INSTRUCTIONS:

STEP 1 — RESEARCH EACH PLACE
Use Google Search to look up each place — what kind of spot it is, what it's known for, what the vibe is like.

STEP 2 — LOOK AT EVERY PHOTO CAREFULLY
For each photo, figure out what's actually in it, the mood and light, and any specific detail worth calling out.

STEP 3 — WRITE THE JOURNAL
One chapter per place. Each chapter is broken into SCENES — one scene per photo.

TONE GUIDE (most important):
- Write like you're telling a friend about the trip over drinks. Conversational, warm, a bit cheeky.
- Use "we" or "I" naturally. Short sentences are fine. Incomplete ones too.
- Mention real specific things — the name of the dish, what the guy said, what the light looked like.
- It's okay to be funny or self-deprecating. Okay to say something was "touristy but we loved it anyway."
- AVOID: flowery language, dramatic metaphors, words like "enveloped", "tapestry", "poignant", "embodied", "palpable", "visceral", "testament". Just say what you mean.
- Each scene = a punchy mini blog paragraph.

SCENE RULES:
- One scene = one photo. Never combine two photos into one scene.
- A chapter with 4 photos gets exactly 4 scenes.
- sceneTitle: casual and specific, like a blog subheading. E.g. "That coconut stall guy", "The mural we almost walked past"
- prose: 3-5 sentences. Conversational. Describe what's in the photo and what it felt like.
- caption: one short Instagram-style line
- photoIndex: 0-based global index of the photo this scene describes

Mood rule: reflect each place's mood in that chapter's scenes only.

Respond ONLY with valid JSON. No markdown. No extra text.

{
  "coverTitle": "fun specific title",
  "coverSubtitle": "one casual line capturing the vibe",
  "introduction": "3-4 sentence blog-style opener",
  "chapters": [
    {
      "num": 1,
      "title": "place name",
      "location": "city or area",
      "date": "date of visit",
      "timeLabel": "e.g. Day 1",
      "researchSummary": "one casual sentence about what this place is",
      "scenes": [
        {
          "sceneTitle": "casual specific subheading",
          "prose": "3-5 conversational sentences about this specific photo",
          "photoIndex": 0,
          "caption": "short Instagram-style caption"
        }
      ]
    }
  ],
  "highlights": [{ "icon": "emoji", "label": "string", "value": "string" }],
  "timeline": [{ "timeLabel": "string", "place": "string", "desc": "one punchy sentence" }],
  "reflection": "3-4 honest, warm sentences. What will you actually remember?"
}

- Every photo must appear in exactly one scene.
- highlights: best meal, funniest moment, hidden gem, overall vibe, most surprising thing.
- Return ONLY the JSON object.
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

export default router;