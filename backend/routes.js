import { validateTripInput } from './validator.js';
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { model, imageToGeminiPart } from './gemini.js';

const router = express.Router();

// GET /api/status
// Your friend's frontend can call this to check if your backend is alive
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



// Multer setup — saves uploaded photos to the /uploads folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// POST /generate-storybook
router.post('/generate-storybook', upload.array('photos', 5), validateTripInput, async (req, res) => {
  try {
    // Step 1 — Read trip info sent by the frontend
    const { title, place, date, mood, description } = req.body;

    // Step 2 — Make sure photos were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No photos uploaded.' });
    }

    // Step 3 — Convert each photo to Gemini format
    const imageParts = req.files.map(file =>
      imageToGeminiPart(file.path, file.mimetype)
    );

    // Step 4 — Build the prompt
    const prompt = `
You are a literary travel storyteller. A user just returned from a trip and uploaded their photos.

Trip Details:
- Title: ${title}
- Destination: ${place}
- Date: ${date || 'not specified'}
- Mood: ${mood || 'not specified'}
- Description: ${description || 'none'}

There are ${req.files.length} photos attached. Analyze each one carefully.

Your job is to create a beautiful, emotional travel storybook based on these photos and trip details.

Respond ONLY with valid JSON. No explanation, no markdown, no extra text. Just the raw JSON object.

JSON format:
{
  "coverTitle": "string",
  "coverSubtitle": "string - a poetic subtitle",
  "introduction": "string - 2 to 3 sentence opening paragraph",
  "chapters": [
    {
      "num": 1,
      "title": "string",
      "location": "string - short place descriptor",
      "prose": "string - 3 to 5 sentence narrative paragraph",
      "photoIndex": 0,
      "caption": "string - one sentence caption for this photo"
    }
  ],
  "highlights": [
    { "icon": "emoji", "label": "string", "value": "string" }
  ],
  "timeline": [
    { "label": "Day 1", "title": "string", "desc": "string" }
  ],
  "reflection": "string - 2 to 3 sentence closing reflection"
}

Rules:
- Create one chapter per photo (max 5 chapters)
- photoIndex is the 0-based index of the photo for that chapter
- Highlights should include best moment, hidden gem, must-try food, key vibe
- Write beautifully. Be literary. Avoid clichés.
- Return ONLY the JSON object, nothing else
`;

    // Step 5 — Send photos + prompt to Gemini
    const result = await model.generateContent([prompt, ...imageParts]);
    const rawText = result.response.text();

    // Step 6 — Clean and parse the JSON response
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const storybook = JSON.parse(cleaned);

    // Step 7 — Delete uploaded photos from server after processing
    req.files.forEach(file => fs.unlinkSync(file.path));

    // Step 8 — Send storybook back to frontend
    res.json({ success: true, storybook });

  } catch (error) {
    // Clean up photos even if something went wrong
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }
    console.error('Error generating storybook:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /regenerate
router.post('/regenerate', upload.array('photos', 5), validateTripInput, async (req, res) => {
  try {
    // Read trip info + the new style the user picked
    const { title, place, date, mood, description } = req.body;

    // Make sure photos were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No photos uploaded.' });
    }

    // Convert photos to Gemini format
    const imageParts = req.files.map(file =>
      imageToGeminiPart(file.path, file.mimetype)
    );

    // Build the regenerate prompt — notice we emphasize the new style
    const prompt = `
You are a literary travel storyteller. A user just returned from a trip and uploaded their photos.

Trip Details:
- Title: ${title}
- Destination: ${place}
- Date: ${date || 'not specified'}
- Mood: ${mood || 'not specified'}
- Description: ${description || 'none'}

There are ${req.files.length} photos attached. Analyze each one carefully.

Your job is to create a beautiful, emotional travel storybook based on these photos and trip details.

Respond ONLY with valid JSON. No explanation, no markdown, no extra text. Just the raw JSON object.

JSON format:
{
  "coverTitle": "string",
  "coverSubtitle": "string - a poetic subtitle",
  "introduction": "string - 2 to 3 sentence opening paragraph",
  "chapters": [
    {
      "num": 1,
      "title": "string",
      "location": "string - short place descriptor",
      "prose": "string - 3 to 5 sentence narrative paragraph",
      "photoIndex": 0,
      "caption": "string - one sentence caption for this photo"
    }
  ],
  "highlights": [
    { "icon": "emoji", "label": "string", "value": "string" }
  ],
  "timeline": [
    { "label": "Day 1", "title": "string", "desc": "string" }
  ],
  "reflection": "string - 2 to 3 sentence closing reflection"
}

Rules:
- Create one chapter per photo (max 5 chapters)
- photoIndex is the 0-based index of the photo for that chapter
- Highlights should include best moment, hidden gem, must-try food, key vibe
- Write beautifully. Be literary. Avoid clichés.
- Return ONLY the JSON object, nothing else
`;

    // Send to Gemini
    const result = await model.generateContent([prompt, ...imageParts]);
    const rawText = result.response.text();

    // Clean and parse
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const storybook = JSON.parse(cleaned);

    // Delete uploaded photos
    req.files.forEach(file => fs.unlinkSync(file.path));

    // Send back to frontend
    res.json({ success: true, storybook });

  } catch (error) {
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }
    console.error('Error regenerating storybook:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;