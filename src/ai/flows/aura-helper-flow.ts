'use client';
/**
 * @fileOverview AuraHelper - Fluxo de Resposta 2026 (SPSP).
 * Prioriza Borda Determinística + Gemini 3 Flash Preview.
 * 100% Client-Side para compatibilidade com build estático APK.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { AuraLogger } from "@/lib/logs/aura-logger";
import { STATIC_AURA_RESPONSES } from "@/lib/static-responses";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

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

  // 2. SEGURANÇA DE API
  if (!genAI) {
    AuraLogger.warn('AuraFlow', 'API Key ausente. Usando modo de segurança.');
    return {
      answer: "Minha conexão com a nuvem de 2026 está desativada. Tente perguntar sobre 'moedas' ou 'como jogar'.",
      suggestedAction: "Configurar API"
    };
  }

  // 3. FALLBACK CLOUD (Gemini 3 Flash Preview)
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });
    
    const prompt = `Você é o AuraHelper do UrbeLudo 2026.
      Responda sobre psicomotricidade, ludo-coins ou o app.
      
      Pergunta: "${query}"
      Contexto: "${input.context || 'Exploração Livre'}"
      
      Retorne um JSON puro: {"answer": "...", "suggestedAction": "..."}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    
    AuraLogger.info('AuraFlow', 'Resposta Gemini 3 Cloud obtida.');
    return JSON.parse(text) as AuraHelperOutput;
    
  } catch (error: any) {
    AuraLogger.error('AuraFlow', 'Erro no fallback Gemini 3', error.message);
    return {
      answer: "O sinal de 2026 oscilou. Mas você está indo bem! Continue se movendo!",
      suggestedAction: "Continuar"
    };
  }
}
