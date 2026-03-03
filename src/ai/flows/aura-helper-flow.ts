
'use client';
/**
 * @fileOverview AuraHelper - Fluxo de Resposta 2026 (Seguro).
 * Modelo: gemini-1.5-flash (estável e recomendado).
 * API Key protegida no backend.
 */

import { AuraLogger } from "@/lib/logs/aura-logger";
import { callGeminiAPI } from "@/lib/gemini-client";
import { STATIC_AURA_RESPONSES } from "@/lib/static-responses";

export interface AuraHelperInput {
  question: string;
  context?: string;
}

export interface AuraHelperOutput {
  answer: string;
  suggestedAction?: string;
}

export async function askAuraHelper(input: AuraHelperInput): Promise<AuraHelperOutput> {
  const query = input.question.trim().toLowerCase();
  AuraLogger.info('AuraFlow', `Triagem 2026: "${query}"`);
  
  // 1. CAMADA DE BORDA (Dicionário Estático - Latência Zero)
  for (const item of STATIC_AURA_RESPONSES) {
    if (item.keywords.some(kw => query.includes(kw))) {
      AuraLogger.info('AuraFlow', 'Resposta de Borda (Offline) encontrada.');
      return {
        answer: item.answer,
        suggestedAction: item.suggestedAction
      };
    }
  }

  // 2. FALLBACK CLOUD (Gemini 1.5 Flash - via Backend Seguro)
  try {
    const prompt = `Você é o AuraHelper do UrbeLudo 2026.
      Responda sobre psicomotricidade, ludo-coins ou o app de forma lúdica.
      
      Pergunta: "${query}"
      Contexto: "${input.context || 'Exploração Livre'}"
      
      Retorne um JSON puro: {"answer": "...", "suggestedAction": "..."}`;

    const responseText = await callGeminiAPI(prompt, {
      responseMimeType: "application/json",
    });

    const text = responseText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text) as AuraHelperOutput;
    
    AuraLogger.info('AuraFlow', 'Resposta Gemini Cloud obtida.');
    return parsed;
    
  } catch (error: any) {
    AuraLogger.error('AuraFlow', 'Erro no fallback Gemini', error.message);
    return {
      answer: "O sinal de 2026 oscilou. Mas você está indo bem! Continue se movendo!",
      suggestedAction: "Continuar"
    };
  }
}
