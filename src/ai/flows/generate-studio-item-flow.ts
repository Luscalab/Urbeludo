
'use client';
/**
 * @fileOverview Gerador de Itens 2026 - Gemini 3 Flash Preview.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { StudioItem } from '@/lib/types';
import { AuraLogger } from "@/lib/logs/aura-logger";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export async function generateStudioItem(input: { prompt: string; category: any }): Promise<{ item: StudioItem }> {
  if (!genAI) throw new Error("API Key ausente");

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const architectPrompt = `Arquiteto Ludo 2026: Crie um item para estúdio baseado em: "${input.prompt}".
    Retorne JSON puro: {"name": "...", "description": "...", "suggestedWidth": 160, "suggestedHeight": 140}`;

    const result = await model.generateContent(architectPrompt);
    const meta = JSON.parse(result.response.text().replace(/```json|```/g, "").trim());

    const item: StudioItem = {
      id: `ai-item-${Date.now()}`,
      name: meta.name || "Item Futurista",
      description: meta.description || "Gerado pela IA 2026",
      category: input.category,
      price: 0,
      assetPath: `https://picsum.photos/seed/${Date.now()}/400/300`,
      dimensions: { width: meta.suggestedWidth || 160, height: meta.suggestedHeight || 140 },
      gridSize: { w: 2, h: 2 },
      isAiGenerated: true,
    };

    return { item };
  } catch (error) {
    AuraLogger.error("StudioAI", "Falha na materialização Gemini 3", error);
    throw error;
  }
}
