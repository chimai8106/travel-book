import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import dotenv from 'dotenv';

dotenv.config();

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// Takes the full storybook JSON and builds a clean narration script
export function buildNarrationScript(storybook) {
  const parts = [];

  // Opening
  parts.push(storybook.coverTitle);
  parts.push(storybook.coverSubtitle);
  parts.push(storybook.introduction);

  // Each chapter
  storybook.chapters.forEach(chapter => {
    parts.push(`Chapter ${chapter.num}. ${chapter.title}.`);
    if (chapter.researchSummary) parts.push(chapter.researchSummary);
    parts.push(chapter.prose);

    // Read captions (new multi-photo format)
    const captions = chapter.captions ?? (chapter.caption ? [chapter.caption] : []);
    captions.forEach(caption => {
      if (caption) parts.push(caption);
    });
  });

  // Highlights
  if (storybook.highlights && storybook.highlights.length > 0) {
    parts.push('Trip Highlights.');
    storybook.highlights.forEach(h => {
      parts.push(`${h.label}: ${h.value}.`);
    });
  }

  // Closing reflection
  parts.push('Final Reflection.');
  parts.push(storybook.reflection);

  return parts
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Sends the script to ElevenLabs and returns audio buffer
export async function generateNarration(script) {
  // Rachel — a warm, natural voice perfect for storytelling
  const voiceId = '21m00Tcm4TlvDq8ikWAM';

  const audioStream = await client.textToSpeech.convert(voiceId, {
    text: script,
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.3,
      use_speaker_boost: true,
    },
  });

  // Convert stream to buffer
  const chunks = [];
  for await (const chunk of audioStream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}