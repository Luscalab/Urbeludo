'use client';
/**
 * @fileOverview Identificação Urbana 2026 - Gemini 3 Flash Preview.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { AuraLogger } from "@/lib/logs/aura-logger";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export interface IdentifyUrbanElementsOutput {
  elements: Array<{
    type: 'line' | 'step' | 'wall' | 'other';
    description: string;
    location: string;
  }>;
}

export async function identifyUrbanElements(input: { webcamFeedDataUri: string }): Promise<IdentifyUrbanElementsOutput> {
  if (!genAI) return { elements: [] };

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const [mimeType, base64Data] = input.webcamFeedDataUri.split(',');
    const pureMime = mimeType.match(/data:(.*?);/)?.[1] || "image/jpeg";

    const prompt = `Analista Urbano 2026: Identifique elementos arquitetônicos na imagem para psicomotricidade.
    Retorne um JSON puro: {"elements": [{"type": "...", "description": "...", "location": "..."}]}`;

    const result = await model.generateContent([prompt, { inlineData: { data: base64Data, mimeType: pureMime } }]);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text) as IdentifyUrbanElementsOutput;
  } catch (error) {
    AuraLogger.error("UrbanAI", "Erro na análise Gemini 3", error);
    return { elements: [] };
  }
}
