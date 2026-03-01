'use client';
/**
 * @fileOverview AuraHelper - Motor de Triagem Híbrida para APK.
 * Prioriza respostas locais antes de acionar o Gemini Cloud.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { classifyIntent } from "@/lib/aura-brain";
import { AuraLogger } from "@/lib/logs/aura-logger";

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

const RESPOSTAS_FIXAS: Record<string, { response: string, action: string }> = {
  jogar_elevador: {
    response: "Use sua voz para subir! Mantenha um som constante e tente ficar dentro da Zona de Estabilidade para encher a barra até 100%.",
    action: "Foque no som firme!"
  },
  zona_estabilidade: {
    response: "A Zona de Estabilidade é a área verde (ou neon no alto contraste). Ela indica que sua voz está no controle, treinando sua musculatura vocal!",
    action: "Busque o Verde/Neon!"
  },
  clinico_psico: {
    response: "No UrbeLudo, unimos mente e corpo. Ao controlar sua voz ou equilíbrio, seu cérebro aprende a coordenar melhor seus movimentos urbanos.",
    action: "Movimento Consciente!"
  },
  moedas: {
    response: "As LudoCoins (LC) são prêmios pelo seu treino. Use-as na Loja para comprar novos itens e personalizar seu Estúdio.",
    action: "Visite a Loja!"
  },
  tecnico_ajuda: {
    response: "Confira se o microfone está ativo nas permissões do Android. Reduza o barulho ao redor para que a Aura ouça apenas sua voz.",
    action: "Calibrar Hardware"
  }
};

/**
 * Função de triagem que roda 100% no cliente (APK).
 */
export async function askAuraHelper(input: AuraHelperInput): Promise<AuraHelperOutput> {
  const query = input.question.toLowerCase();
  AuraLogger.info('AuraFlow', `Triagem para: "${query}"`);
  
  try {
    const intentId = await classifyIntent(query);

    if (intentId !== 'fallback' && RESPOSTAS_FIXAS[intentId]) {
      AuraLogger.info('AuraFlow', `Intenção Local Detectada: ${intentId}`);
      return {
        answer: RESPOSTAS_FIXAS[intentId].response,
        suggestedAction: RESPOSTAS_FIXAS[intentId].action
      };
    }
  } catch (err) {
    AuraLogger.error('AuraFlow', 'Falha na triagem local', err);
  }

  // Fallback para Cloud Gemini (Apenas se houver Internet e Chave)
  if (!API_KEY) {
    return {
      answer: "Minha conexão com a Grande Aura está offline. Tente perguntar sobre os jogos ou as moedas!",
      suggestedAction: "Tente 'Como jogar?'"
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Você é o AuraHelper, assistente de Psicomotricidade.
      Responda de forma lúdica em até 2 frases.
      Pergunta: ${query}
      Contexto: ${input.context || ''}
      Retorne APENAS um JSON: {"answer": "...", "suggestedAction": "..."}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    AuraLogger.info('AuraFlow', 'Resposta gerada via Gemini Cloud.');
    return JSON.parse(text) as AuraHelperOutput;
  } catch (error: any) {
    AuraLogger.error('AuraFlow', 'Erro no Fallback Cloud', error.message);
    return {
      answer: "Minha percepção sensorial oscilou. Vamos focar nos seus desafios atuais?",
      suggestedAction: "Ver Painel"
    };
  }
}
