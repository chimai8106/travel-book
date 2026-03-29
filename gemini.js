import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model WITHOUT search — for simple tasks
export const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-preview-05-20',
});

// Model WITH Google Search enabled — for storybook generation
export const modelWithSearch = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-preview-05-20',
  tools: [{ googleSearch: {} }],
});

// Convert an image file to Gemini format
export function imageToGeminiPart(filePath, mimeType) {
  const imageData = fs.readFileSync(filePath);
  return {
    inlineData: {
      data: imageData.toString('base64'),
      mimeType: mimeType,
    },
  };
}