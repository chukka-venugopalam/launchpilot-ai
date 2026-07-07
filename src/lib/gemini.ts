import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { DEMO_REPORT } from "./demo";

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;
let currentKey: string | null = null;

export function getGeminiModel(apiKey?: string): GenerativeModel {
  const key = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!key) {
    throw new Error('Gemini API key is required. Set NEXT_PUBLIC_GEMINI_API_KEY in your .env file.');
  }
  if (!genAI || currentKey !== key) {
    genAI = new GoogleGenerativeAI(key);
    currentKey = key;
    // Reset model so it gets recreated with new key
    model = null;
  }
  if (!model) {
    model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });
  }
  return model;
}

export interface StreamCallbacks {
  onChunk?: (text: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

export async function generateStream(
  prompt: string,
  callbacks?: StreamCallbacks
): Promise<string> {
  try {
    const m = getGeminiModel();
    const result = await m.generateContentStream(prompt);
    let fullText = '';
    for await (const chunk of result.stream) {
      const text = chunk.text();
      fullText += text;
      callbacks?.onChunk?.(text);
    }
    callbacks?.onComplete?.(fullText);
    return fullText;
  } catch (error) {
    console.log("Gemini unavailable. Switching to Demo Mode.");
    console.log("Using Demo Mode");
    callbacks?.onChunk?.(DEMO_REPORT);
    callbacks?.onComplete?.(DEMO_REPORT);
return DEMO_REPORT;
  }
}

export async function generateContent(prompt: string): Promise<string> {
  try {
    const m = getGeminiModel();
    const result = await m.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.log("Using Demo Mode");
    return DEMO_REPORT;
  }
}
