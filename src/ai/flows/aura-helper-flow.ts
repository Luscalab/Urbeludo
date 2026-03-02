'use client';
/**
 * @fileOverview AuraHelper - Fluxo de Triagem Híbrida.
 * Prioriza a memória local (Borda) antes de gastar tokens no Gemini.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { classifyIntent } from "@/lib/aura-brain";
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

const RESPOSTAS_LOCAIS: Record<string, { response: string, action: string }> = {
  jogar_elevador: {
    response: "Para subir o Elevador, você deve manter um som vocal constante! Tente ficar dentro da Zona de Estabilidade (a área destacada) para encher a barra de progresso.",
    action: "Foque na sustentação vocal!"
  },
  zona_estabilidade: {
    response: "A Zona de Estabilidade é a área de controle ideal. Ela treina seu equilíbrio respiratório e vocal. Se você mantiver o som lá, ganhará mais LudoCoins!",
    action: "Busque o equilíbrio!"
  },
  clinico_psico: {
    response: "No UrbeLudo, usamos o jogo para treinar a consciência corporal e o controle motor. Ao dominar o elevador ou o equilíbrio, seu cérebro aprende a coordenar melhor os movimentos.",
    action: "Movimento Consciente!"
  },
  moedas: {
    response: "LudoCoins são recompensas pelo seu esforço! Você pode usá-las na Loja para comprar itens incríveis e decorar seu Estúdio no Painel.",
    action: "Visite a Loja!"
  },
  tecnico_ajuda: {
    response: "Se algo não estiver funcionando, verifique se deu permissão de microfone ao app. Tente também ir para um lugar mais silencioso para uma detecção melhor.",
    action: "Verificar Hardware"
  }
};

export async function askAuraHelper(input: AuraHelperInput): Promise<AuraHelperOutput> {
  const query = input.question.trim().toLowerCase();
  AuraLogger.info('AuraFlow', `Triagem Híbrida para: "${query}"`);
  
  try {
    // 1. TENTA CLASSIFICAÇÃO LOCAL (WEB WORKER)
    const intentId = await classifyIntent(query);

    if (intentId !== 'fallback' && RESPOSTAS_LOCAIS[intentId]) {
      AuraLogger.info('AuraFlow', `Intenção Local Detectada: ${intentId}`);
      return {
        answer: RESPOSTAS_LOCAIS[intentId].response,
        suggestedAction: RESPOSTAS_LOCAIS[intentId].action
      };
    }
  } catch (err) {
    AuraLogger.error('AuraFlow', 'Erro na triagem local, tentando nuvem...', err);
  }

  // 2. FALLBACK PARA CLOUD GEMINI (PROCESSO ASSÍNCRONO)
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Você é o AuraHelper, assistente de Psicomotricidade e suporte do app UrbeLudo.
      Responda de forma curta (máximo 2 frases), lúdica e acolhedora.
      Pergunta do Aluno: ${query}
      Contexto Atual: ${input.context || 'Exploração Livre'}
      Retorne APENAS um JSON: {"answer": "...", "suggestedAction": "..."}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    AuraLogger.info('AuraFlow', 'Resposta obtida via Grande Aura (Cloud).');
    return JSON.parse(text) as AuraHelperOutput;
  } catch (error: any) {
    AuraLogger.error('AuraFlow', 'Falha total na resposta', error.message);
    return {
      answer: "Minha conexão com a rede lúdica oscilou um pouco. Que tal tentarmos focar no seu desafio atual?",
      suggestedAction: "Ver Missão"
    };
  }
}
