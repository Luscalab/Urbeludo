'use client';
/**
 * @fileOverview AuraHelper - Fluxo de Resposta Otimizado para APK 2026.
 * Implementa Triagem de Borda (Determinístico) + Fallback Gemini 1.5 Flash.
 * 100% Client-Side para compatibilidade com build estático.
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

/**
 * Processa a pergunta do usuário com prioridade para Borda (Latência Zero).
 */
export async function askAuraHelper(input: AuraHelperInput): Promise<AuraHelperOutput> {
  const query = input.question.trim().toLowerCase();
  AuraLogger.info('AuraFlow', `Iniciando triagem determinística: "${query}"`);
  
  // 1. CAMADA DE BORDA (Dicionário de Palavras-Chave)
  for (const item of STATIC_AURA_RESPONSES) {
    if (item.keywords.some(kw => query.includes(kw))) {
      AuraLogger.info('AuraFlow', 'Resposta de Borda encontrada (Offline).');
      return {
        answer: item.answer,
        suggestedAction: item.suggestedAction
      };
    }
  }

  // 2. VERIFICAÇÃO DE SEGURANÇA (API KEY)
  if (!genAI) {
    AuraLogger.warn('AuraFlow', 'NEXT_PUBLIC_GEMINI_API_KEY ausente.');
    return {
      answer: "Ops! Minha sincronia com a nuvem de inteligência está desligada. Verifique as configurações de rede ou a chave de API.",
      suggestedAction: "Configurar API"
    };
  }

  // 3. FALLBACK CLOUD (Gemini 1.5 Flash)
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });
    
    const prompt = `Você é o AuraHelper, o guia de inteligência do aplicativo UrbeLudo 2026.
      Responda sobre movimento, psicomotricidade ou o app UrbeLudo.
      
      Diretrizes:
      - Resposta em Português (Brasil).
      - Tom encorajador, amigável e focado em psicomotricidade.
      - Se o usuário parecer cansado ou com dificuldades no 'Elevador de Voz', sugira a 'Nuvem de Sopro'.
      
      Pergunta: "${query}"
      Contexto Atual: "${input.context || 'Exploração Livre'}"
      
      Retorne APENAS um JSON: {"answer": "...", "suggestedAction": "..."}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    
    AuraLogger.info('AuraFlow', 'Resposta gerada via Gemini Cloud.');
    return JSON.parse(text) as AuraHelperOutput;
    
  } catch (error: any) {
    AuraLogger.error('AuraFlow', 'Erro no fallback Gemini', error.message || error);
    
    return {
      answer: "Minha conexão com a nuvem oscilou, mas minha energia local diz: você está indo muito bem! Tente me perguntar sobre 'moedas' ou 'como jogar'.",
      suggestedAction: "Ver Sugestões"
    };
  }
}
