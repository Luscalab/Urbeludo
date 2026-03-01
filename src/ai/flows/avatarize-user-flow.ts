
'use client';
/**
 * @fileOverview AvatarizeUser - Transforma foto real em estilo de avatar seguro.
 * Versão Client-Side direta via Google Generative AI SDK.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface AvatarizeUserInput {
  photoDataUri: string;
}

export interface AvatarizeUserOutput {
  hair: {
    style: string;
    color: string;
    texture: string;
  };
  eyes: {
    shape: string;
    color: string;
    eyebrowShape: string;
  };
  face: {
    shape: string;
    tone: string;
    undertone: string;
    noseShape: string;
    mouthShape: string;
  };
  accessories: string[];
  dominantColor: string;
  accessoryType: string;
  avatarStyleDescription: string;
}

export async function avatarizeUser(input: AvatarizeUserInput): Promise<AvatarizeUserOutput> {
  const fallback: AvatarizeUserOutput = {
    hair: { style: 'curto', color: '#333333', texture: 'Liso' },
    eyes: { shape: 'Amendoado', color: '#33993D', eyebrowShape: 'Natural' },
    face: { shape: 'Oval', tone: '#e0ac69', undertone: 'Quente', noseShape: 'Natural', mouthShape: 'Natural' },
    accessories: [],
    dominantColor: "#9333ea",
    accessoryType: "Visor de Neon Pulse",
    avatarStyleDescription: "Explorador Padrão do UrbeLudo"
  };

  if (!API_KEY) return fallback;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const [mimeType, base64Data] = input.photoDataUri.split(',');
    const pureMime = mimeType.match(/data:(.*?);/)?.[1] || "image/jpeg";

    const prompt = `Você é o Designer de Identidades do UrbeLudo. 
    Analise a foto fornecida e identifique detalhadamente as características faciais para criar um avatar artístico e futurista.
    Retorne um JSON puro com os campos: hair (style, color hex, texture), eyes (shape, color hex, eyebrowShape), face (shape, tone hex, undertone, noseShape, mouthShape), accessories (array), dominantColor (hex), accessoryType, avatarStyleDescription.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: pureMime
        }
      }
    ]);

    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text) as AvatarizeUserOutput;
  } catch (error) {
    console.error("Erro na Avatarização:", error);
    return fallback;
  }
}
