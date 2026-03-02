'use client';
/**
 * @fileOverview AuraHelper - Fluxo de Resposta Otimizado para APK.
 * Triagem de Borda (Determinístico) + Fallback Gemini 1.5 Flash.
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
 * Processa a pergunta do usuário. 
 * Implementa Filtro de Borda para latência zero e Gemini para complexidade.
 */
export async function askAuraHelper(input: AuraHelperInput): Promise<AuraHelperOutput> {
  const query = input.question.trim().toLowerCase();
  AuraLogger.info('AuraFlow', `Iniciando triagem: "${query}"`);
  
  // 1. FILTRO DE BORDA (RESPOSTAS ESTÁTICAS)
  for (const item of STATIC_AURA_RESPONSES) {
    if (item.keywords.some(kw => query.includes(kw))) {
      AuraLogger.info('AuraFlow', 'Resposta de Borda encontrada (Latência Zero).');
      return {
        answer: item.answer,
        suggestedAction: item.suggestedAction
      };
    }
  }

  // 2. VERIFICAÇÃO DE API KEY
  if (!genAI) {
    AuraLogger.warn('AuraFlow', 'NEXT_PUBLIC_GEMINI_API_KEY não configurada.');
    return {
      answer: "Ops! Minha conexão com o servidor de inteligência está em manutenção. Verifique as configurações da API Key no seu ambiente.",
      suggestedAction: "Configurar API"
    };
  }

  // 3. FALLBACK PARA GEMINI CLOUD (PARA COMPLEXIDADE)
  try {
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
      - Tom encorajador, amigável e focado em psicomotricidade.
      - Se o usuário parecer cansado ou com dificuldades no 'Elevador de Voz', sugira a 'Nuvem de Sopro'.
      
      Pergunta: "${query}"
      Contexto Atual: "${input.context || 'Exploração Livre'}"
      
      Retorne APENAS um JSON: {"answer": "...", "suggestedAction": "..."}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    
    return JSON.parse(text) as AuraHelperOutput;
    
  } catch (error: any) {
    AuraLogger.error('AuraFlow', 'Erro no fallback Gemini', error.message || error);
    
    return {
      answer: "Minha sincronia com a nuvem oscilou. Vamos focar no seu movimento agora? Tente me perguntar sobre 'como jogar' ou 'moedas'!",
      suggestedAction: "Ver Sugestões"
    };
  }
}
