'use client';
/**
 * @fileOverview AuraHelper - Motor de Inteligência Semântica do UrbeLudo.
 * Implementa triagem via AuraBrain (Borda) e fallback para Gemini.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { classifyIntent } from "@/lib/aura-brain";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
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
 * Base de Respostas Fixas (Determinísticas) para o UrbeLudo.
 */
const RESPOSTAS_FIXAS: Record<string, { response: string, action: string }> = {
  jogar_elevador: {
    response: "Use sua voz para subir! Mantenha um som constante e tente ficar dentro da Zona de Estabilidade para encher a barra até 100%.",
    action: "Tente manter o som firme!"
  },
  zona_estabilidade: {
    response: "A Zona de Estabilidade é a área verde na tela. Ela indica que sua voz está firme e controlada, o que é fundamental para o seu treino fonatário!",
    action: "Foque no verde!"
  },
  clinico_psico: {
    response: "A psicomotricidade estuda como nossos pensamentos e movimentos trabalham juntos! No UrbeLudo, ajudamos seu corpo e mente a dançarem no mesmo ritmo.",
    action: "O movimento consciente é a chave!"
  },
  tonicidade: {
    response: "A tonicidade é o controle dos seus músculos. No Elevador de Voz, quando você mantém o som estável, treina o tônus das pregas vocais e do diafragma!",
    action: "Sinta a firmeza muscular."
  },
  moedas: {
    response: "As LudoCoins (LC) são suas moedas de mestre! Você as ganha completando desafios e pode usá-las na Loja para seu Estúdio.",
    action: "Visite a Loja no Painel!"
  },
  tecnico_ajuda: {
    response: "Verifique se o microfone está ativo e se deu permissão ao app. No Android, confira se o volume está alto e se o ambiente está silencioso.",
    action: "Calibrar Hardware"
  },
  praxia_fina: {
    response: "A praxia fina é a nossa capacidade de fazer movimentos pequenos e precisos. Seguir o Caminho de Luz treina seus dedos e olhos para agirem em harmonia!",
    action: "Precisão é poder!"
  },
  esquema_corporal: {
    response: "O esquema corporal é a consciência que você tem do seu corpo. Ver seu progresso ajuda seu cérebro a mapear melhor suas capacidades físicas!",
    action: "Evolua sua percepção."
  }
};

/**
 * Função principal que decide se usa a base fixa via IA de Borda ou o Gemini.
 */
export async function askAuraHelper(input: AuraHelperInput): Promise<AuraHelperOutput> {
  const query = input.question;
  
  // 1. TRIAGEM SEMÂNTICA (IA de Borda - Offline First)
  const intentId = await classifyIntent(query);

  if (intentId !== 'fallback' && RESPOSTAS_FIXAS[intentId]) {
    return {
      answer: RESPOSTAS_FIXAS[intentId].response,
      suggestedAction: RESPOSTAS_FIXAS[intentId].action
    };
  }

  // 2. FALLBACK PARA GEMINI (Perguntas complexas)
  if (!API_KEY) {
    return {
      answer: "Minha percepção sensorial oscilou, mas lembre-se: cada movimento seu é uma vitória! Tente perguntar sobre um jogo específico.",
      suggestedAction: "Verifique sua rede."
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Você é o AuraHelper, assistente especialista em Psicomotricidade do UrbeLudo.
    Explique os benefícios usando conceitos como tonicidade, praxia fina e esquema corporal de forma lúdica.
    Máximo 3 frases. Retorne APENAS um JSON: {"answer": "...", "suggestedAction": "..."}
    Pergunta: ${query}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    
    return JSON.parse(text) as AuraHelperOutput;
  } catch (error) {
    console.error("AuraHelper IA Fallback Error:", error);
    return {
      answer: "Minha conexão com a Grande Aura está instável, mas continue brilhando! Como posso te ajudar hoje?",
      suggestedAction: "Pergunte sobre 'Moedas' ou 'Voz'."
    };
  }
}
