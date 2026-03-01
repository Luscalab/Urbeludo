
'use client';
/**
 * @fileOverview AuraHelper - Orquestrador de Inteligência Híbrida instrumentado.
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
    response: "As LudoCoins (LC) são suas moedas de conquista! Você as ganha completando desafios e pode usá-las na Loja para personalizar seu Estúdio.",
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

export async function askAuraHelper(input: AuraHelperInput): Promise<AuraHelperOutput> {
  const query = input.question;
  AuraLogger.info('AuraFlow', `Nova consulta: "${query}"`);
  
  try {
    const intentId = await classifyIntent(query);
    AuraLogger.debug('AuraFlow', `Intenção detectada localmente: ${intentId}`);

    if (intentId !== 'fallback' && RESPOSTAS_FIXAS[intentId]) {
      AuraLogger.info('AuraFlow', 'Respondendo via base de dados local (Offline).');
      return {
        answer: RESPOSTAS_FIXAS[intentId].response,
        suggestedAction: RESPOSTAS_FIXAS[intentId].action
      };
    }
  } catch (err) {
    AuraLogger.error('AuraFlow', 'Erro na classificação local', err);
  }

  // Fallback para nuvem
  AuraLogger.warn('AuraFlow', 'Iniciando fallback para Gemini Cloud...');
  
  if (!API_KEY || API_KEY.length < 10) {
    AuraLogger.error('AuraFlow', 'Chave de API inválida ou ausente para o Gemini.');
    return {
      answer: "Minha percepção sensorial oscilou (Chave Ausente). Verifique sua conexão para perguntas complexas!",
      suggestedAction: "Conectar à Nuvem"
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Você é o AuraHelper, assistente especialista em Psicomotricidade do UrbeLudo.
    Explique os benefícios usando conceitos como tonicidade, praxia fina e esquema corporal de forma lúdica.
    Máximo 3 frases. Retorne APENAS um JSON: {"answer": "...", "suggestedAction": "..."}
    Contexto: ${input.context || ''}
    Pergunta: ${query}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    
    AuraLogger.info('AuraFlow', 'Resposta Gemini gerada com sucesso.');
    return JSON.parse(text) as AuraHelperOutput;
  } catch (error: any) {
    AuraLogger.error('AuraFlow', 'Erro técnico no Gemini', error.message || error);
    return {
      answer: "Minha conexão com a Grande Aura está instável, mas continue brilhando! Tente perguntar algo sobre os jogos.",
      suggestedAction: "Tente 'Voz'."
    };
  }
}
