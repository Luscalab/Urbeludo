'use client';
/**
 * @fileOverview AuraHelper - Fluxo de Resposta Direta e Simplificada.
 * Prioriza performance no APK removendo IA de borda pesada.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { AuraLogger } from "@/lib/logs/aura-logger";

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

const RESPOSTAS_FIXAS: Record<string, { response: string, action: string, keywords: string[] }> = {
  jogar_elevador: {
    response: "Para subir o Elevador, mantenha um som vocal constante! Fique dentro da área verde para ganhar LudoCoins.",
    action: "Foque na voz!",
    keywords: ["elevador", "jogar", "como subir", "voz", "cantar"]
  },
  moedas: {
    response: "LudoCoins são recompensas! Use-as na Lo_ja para comprar móveis e decorar seu Estúdio.",
    action: "Visite a Loja!",
    keywords: ["moedas", "ludocoins", "dinheiro", "comprar", "loja"]
  },
  psicomotricidade: {
    response: "No UrbeLudo, treinamos a consciência corporal e o controle motor através de desafios lúdicos.",
    action: "Movimento Consciente!",
    keywords: ["psicomotricidade", "corpo", "ajuda", "exercício", "benefício"]
  },
  ajuda_tecnica: {
    response: "Se o som não funcionar, verifique a permissão de microfone nas configurações do seu celular.",
    action: "Verificar Permissões",
    keywords: ["bug", "travou", "microfone", "erro", "não funciona"]
  }
};

export async function askAuraHelper(input: AuraHelperInput): Promise<AuraHelperOutput> {
  const query = input.question.trim().toLowerCase();
  AuraLogger.info('AuraFlow', `Processando: "${query}"`);
  
  // 1. TRIAGEM DETERMINÍSTICA (BORDA ULTRA-RÁPIDA)
  for (const key in RESPOSTAS_FIXAS) {
    const item = RESPOSTAS_FIXAS[key];
    if (item.keywords.some(kw => query.includes(kw))) {
      AuraLogger.info('AuraFlow', `Resposta determinística encontrada: ${key}`);
      return {
        answer: item.response,
        suggestedAction: item.action
      };
    }
  }

  // 2. FALLBACK DIRETO PARA CLOUD GEMINI
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Você é o AuraHelper, assistente do app de psicomotricidade UrbeLudo.
      Responda de forma curta (máximo 2 frases), lúdica e acolhedora.
      Pergunta: ${query}
      Contexto: ${input.context || 'Exploração'}
      Retorne APENAS um JSON: {"answer": "...", "suggestedAction": "..."}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text) as AuraHelperOutput;
  } catch (error: any) {
    AuraLogger.error('AuraFlow', 'Erro na API Gemini', error.message);
    return {
      answer: "Minha conexão com a rede lúdica oscilou. Que tal tentarmos novamente?",
      suggestedAction: "Ver Missões"
    };
  }
}
