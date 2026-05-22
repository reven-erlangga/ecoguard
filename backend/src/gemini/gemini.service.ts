import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      console.log('Gemini API initialized successfully.');
    } else {
      console.warn('GEMINI_API_KEY is not set in env variables. Gemini services will run in fallback mode.');
    }
  }

  /**
   * Translates Indonesian tweet to English
   */
  async translateToEnglish(text: string): Promise<string> {
    if (!this.genAI) {
      return text;
    }
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `Translate the following Indonesian text to clean English. Return only the translated text. Do not include quotes or any preamble.
Text: "${text}"`;
      const result = await model.generateContent(prompt);
      const translatedText = result.response.text().trim();
      return translatedText || text;
    } catch (e) {
      console.error('Failed to translate text using Gemini:', e.message);
      return text;
    }
  }

  /**
   * Verifies if OSM coordinates match the extracted address.
   * If not, logs a warning.
   */
  async verifyAddressWithOSM(extractedAddress: string, osmCoordinates: { name: string; lat: number; lon: number }[]): Promise<boolean> {
    if (!this.genAI || osmCoordinates.length === 0) {
      return true;
    }
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const coordinatesString = osmCoordinates.map(c => `Latitude: ${c.lat}, Longitude: ${c.lon}`).join('; ');
      
      const prompt = `You are a geographic data validator. Verify if the place/landmark "${extractedAddress}" (located in Indonesia) matches the coordinates: [${coordinatesString}].
Does this geographic coordinate roughly align with the correct region or city of "${extractedAddress}"?
Return exactly "true" if they match or are closely related, or exactly "false" if they are completely in a different city, country or unrelated. Return only "true" or "false" and nothing else.`;

      const result = await model.generateContent(prompt);
      const answer = result.response.text().trim().toLowerCase();
      
      const isMatch = answer === 'true';
      if (!isMatch) {
        console.log(`⚠️ [Gemini Verification Alert] The extracted address "${extractedAddress}" does NOT seem to match OpenStreetMap coordinates! Coordinates:`, osmCoordinates);
      } else {
        console.log(`✅ [Gemini Verification Success] The extracted address "${extractedAddress}" matches OpenStreetMap coordinates.`);
      }
      return isMatch;
    } catch (e) {
      console.error('Failed to verify location with Gemini:', e.message);
      return true;
    }
  }

  /**
   * Automatically extracts and generates a category name and category ID based on the tweet content
   */
  async extractCategory(text: string): Promise<{ id: string; name: string } | null> {
    if (!this.genAI) {
      return null;
    }
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `Analyze the following issue report text. Automatically determine and generate a formal, high-level English category name (e.g. "Road Infrastructure", "Environment & Sanitation", "Public Facilities", "Security & Order", "Traffic Management", "Water Issues") and a corresponding ID in UPPERCASE_SNAKE_CASE (e.g. "ROAD_INFRASTRUCTURE", "ENVIRONMENT_AND_SANITATION", "PUBLIC_FACILITIES", "SECURITY_AND_ORDER", "TRAFFIC_MANAGEMENT", "WATER_ISSUES").
      
Return ONLY a valid JSON object in this exact format:
{
  "id": "CATEGORY_ID",
  "name": "Category Name"
}
Do not include any markdown fences, backticks, preamble, or comments.

Text: "${text}"`;

      const result = await model.generateContent(prompt);
      const cleanJson = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed && parsed.id && parsed.name) {
        return {
          id: parsed.id.toUpperCase().replace(/[^A-Z0-9_]/g, '_'),
          name: parsed.name
        };
      }
      return null;
    } catch (e) {
      console.error('Failed to extract dynamic category using Gemini:', e.message);
      return null;
    }
  }
}
