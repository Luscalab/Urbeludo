
'use client';
/**
 * @fileOverview Motor de Arquitetura Ludo.
 * Versão simplificada para evitar dependências Node.js.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { StudioItem } from '@/lib/types';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface GenerateItemInput {
  prompt: string;
  category: 'Essencial' | 'Ativo' | 'Estético' | 'Especial';
}

export async function generateStudioItem(input: GenerateItemInput): Promise<{ item: StudioItem }> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const architectPrompt = `Você é o Arquiteto Master do UrbeLudo. 
    Crie um item para um jogo isométrico futurista baseado em: "${input.prompt}".
    Retorne um JSON puro com: name, description, suggestedWidth, suggestedHeight.`;

    const result = await model.generateContent(architectPrompt);
    const meta = JSON.parse(result.response.text().replace(/```json|```/g, "").trim());

    const generatedItem: StudioItem = {
      id: `ai-item-${Date.now()}`,
      name: meta.name || "Item Futurista",
      description: meta.description || "Gerado pela IA do Estúdio",
      category: input.category,
      price: 0,
      assetPath: `https://picsum.photos/seed/${Date.now()}/400/300`, // Fallback para imagens
      dimensions: { 
        width: meta.suggestedWidth || 160, 
        height: meta.suggestedHeight || 140 
      },
      gridSize: { w: 2, h: 2 },
      isAiGenerated: true,
    };

    return { item: generatedItem };
  } catch (error) {
    console.error("Erro na geração de item:", error);
    throw error;
  }
}
