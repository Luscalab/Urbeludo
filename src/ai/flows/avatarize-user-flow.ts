
'use client';
/**
 * @fileOverview AvatarizeUser 2026 - Gemini 3 Flash Preview.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { AuraLogger } from "@/lib/logs/aura-logger";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export interface AvatarizeUserOutput {
  hair: { style: string; color: string; texture: string; };
  eyes: { shape: string; color: string; eyebrowShape: string; };
  face: { shape: string; tone: string; undertone: string; noseShape: string; mouthShape: string; };
  accessories: string[];
  dominantColor: string;
  accessoryType: string;
  avatarStyleDescription: string;
}

export async function avatarizeUser(input: { photoDataUri: string }): Promise<AvatarizeUserOutput> {
  const fallback: AvatarizeUserOutput = {
    hair: { style: 'curto', color: '#333333', texture: 'Liso' },
    eyes: { shape: 'Amendoado', color: '#33993D', eyebrowShape: 'Natural' },
    face: { shape: 'Oval', tone: '#e0ac69', undertone: 'Quente', noseShape: 'Natural', mouthShape: 'Natural' },
    accessories: [],
    dominantColor: "#9333ea",
    accessoryType: "Explorador Padrão",
    avatarStyleDescription: "Identidade Ludo Ativa"
  };

  if (!genAI) return fallback;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const [mimeType, base64Data] = input.photoDataUri.split(',');
    const pureMime = mimeType.match(/data:(.*?);/)?.[1] || "image/jpeg";

    const prompt = `Designer UrbeLudo 2026: Analise a foto e identifique traços faciais para criar um avatar futurista.
    Retorne apenas JSON puro: {"hair": {"style": "...", "color": "...", "texture": "..."}, "eyes": {"shape": "...", "color": "...", "eyebrowShape": "..."}, "face": {"shape": "...", "tone": "...", "undertone": "...", "noseShape": "...", "mouthShape": "..."}, "accessories": [], "dominantColor": "...", "accessoryType": "...", "avatarStyleDescription": "..."}`;

    const result = await model.generateContent([prompt, { inlineData: { data: base64Data, mimeType: pureMime } }]);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text) as AvatarizeUserOutput;
  } catch (error) {
    AuraLogger.error("AvatarFlow", "Erro na análise Gemini 3", error);
    return fallback;
  }
}
