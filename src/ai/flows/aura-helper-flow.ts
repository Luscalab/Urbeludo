'use client';
/**
 * @fileOverview AuraHelper - Fluxo de Resposta com Filtro Semântico de Borda.
 * Removido Transformers.js para priorizar performance máxima no APK.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { AuraLogger } from "@/lib/logs/aura-logger";
import { STATIC_AURA_RESPONSES } from "@/lib/static-responses";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyCCwhUNlhnpxjDuZ8quod7MTnde1dZJj04";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface AuraHelperInput {
  question: string;
  context?: string;
}

export interface AuraHelperOutput {
  answer: string;
  suggestedAction?: string;
}

/**
 * Processa a pergunta do usuário. 
 * Tenta primeiro o Filtro Semântico de Borda e depois o Gemini 1.5 Flash.
 */
export async function askAuraHelper(input: AuraHelperInput): Promise<AuraHelperOutput> {
  const query = input.question.trim().toLowerCase();
  AuraLogger.info('AuraFlow', `Triagem Semântica: "${query}"`);
  
  // 1. FILTRO SEMÂNTICO DE BORDA (DETERMINÍSTICO)
  for (const item of STATIC_AURA_RESPONSES) {
    if (item.keywords.some(kw => query.includes(kw))) {
      AuraLogger.info('AuraFlow', 'Resposta de Borda encontrada.');
      return {
        answer: item.answer,
        suggestedAction: item.suggestedAction
      };
    }
  }

  // 2. FALLBACK PARA GEMINI (QUANDO É COMPLEXO)
  try {
    AuraLogger.info('AuraFlow', 'Consultando Gemini Cloud...');
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });
    
    const prompt = `Você é o AuraHelper, o guia de inteligência do aplicativo UrbeLudo.
      Responda sobre movimento, psicomotricidade ou o app UrbeLudo.
      
      Diretrizes:
      - Resposta em Português (Brasil).
      - Máximo 2 frases curtas.
      - Tom encorajador e amigável.
      
      Pergunta: "${query}"
      Contexto: "${input.context || 'Exploração'}"
      
      Retorne APENAS um JSON: {"answer": "...", "suggestedAction": "..."}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Limpeza de segurança para o JSON
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson) as AuraHelperOutput;
    
  } catch (error: any) {
    AuraLogger.error('AuraFlow', 'Falha no fallback Cloud', error.message);
    return {
      answer: "Minha conexão com a Grande Aura oscilou. Vamos focar no seu movimento agora?",
      suggestedAction: "Ir para Treino"
    };
  }
}
