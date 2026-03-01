
'use client';
/**
 * @fileOverview Identificação de elementos urbanos via Gemini 1.5 Flash.
 * Versão Client-Side.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface IdentifyUrbanElementsOutput {
  elements: Array<{
    type: 'line' | 'step' | 'wall' | 'other';
    description: string;
    location: string;
  }>;
}

export async function identifyUrbanElements(input: { webcamFeedDataUri: string }): Promise<IdentifyUrbanElementsOutput> {
  if (!API_KEY) return { elements: [] };

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const [mimeType, base64Data] = input.webcamFeedDataUri.split(',');
    const pureMime = mimeType.match(/data:(.*?);/)?.[1] || "image/jpeg";

    const prompt = `Analise a imagem da webcam e identifique elementos arquitetônicos úteis para exercícios de psicomotricidade (linhas, degraus, muros).
    Retorne um JSON puro com um array de objetos "elements" contendo: type, description, location.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: pureMime
        }
      }
    ]);

    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text) as IdentifyUrbanElementsOutput;
  } catch (error) {
    console.error("Erro na identificação urbana:", error);
    return { elements: [] };
  }
}
