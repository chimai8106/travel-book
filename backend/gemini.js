import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Connect to Gemini using your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Load the model
export const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
});

// Helper: convert an image file to the format Gemini understands
export function imageToGeminiPart(filePath, mimeType) {
  const imageData = fs.readFileSync(filePath);
  return {
    inlineData: {
      data: imageData.toString('base64'),
      mimeType: mimeType,
    },
  };
}