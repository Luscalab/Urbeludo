'use client';
/**
 * @fileOverview AuraHelper - Fluxo de Resposta Híbrido (Borda + Cloud).
 * Ajustado para garantir funcionamento do Gemini quando não há resposta local.
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
    keywords: ["elevador", "jogar", "como subir", "voz", "cantar", "brincar"]
  },
  moedas: {
    response: "LudoCoins são recompensas! Use-as na Loja para comprar móveis e decorar seu Estúdio.",
    action: "Visite a Loja!",
    keywords: ["moedas", "ludocoins", "dinheiro", "comprar", "loja", "preço"]
  },
  psicomotricidade: {
    response: "No UrbeLudo, treinamos a consciência corporal e o controle motor através de desafios lúdicos.",
    action: "Movimento Consciente!",
    keywords: ["psicomotricidade", "corpo", "ajuda", "exercício", "benefício", "saúde"]
  },
  ajuda_tecnica: {
    response: "Se o som não funcionar, verifique a permissão de microfone nas configurações do seu celular.",
    action: "Verificar Permissões",
    keywords: ["bug", "travou", "microfone", "erro", "não funciona", "problema"]
  }
};

/**
 * Processa a pergunta do usuário. 
 * Tenta primeiro a base local (Borda) e depois o Gemini 1.5 Flash.
 */
export async function askAuraHelper(input: AuraHelperInput): Promise<AuraHelperOutput> {
  const query = input.question.trim().toLowerCase();
  AuraLogger.info('AuraFlow', `Processando: "${query}"`);
  
  // 1. TRIAGEM DETERMINÍSTICA (RESPOSTA INSTANTÂNEA)
  for (const key in RESPOSTAS_FIXAS) {
    const item = RESPOSTAS_FIXAS[key];
    if (item.keywords.some(kw => query.includes(kw))) {
      AuraLogger.info('AuraFlow', `Resposta local encontrada: ${key}`);
      return {
        answer: item.response,
        suggestedAction: item.action
      };
    }
  }

  // 2. FALLBACK PARA GEMINI (QUANDO NÃO HÁ RESPOSTA PRONTA)
  try {
    AuraLogger.info('AuraFlow', 'Consultando Gemini para resposta complexa...');
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });
    
    const prompt = `Você é o AuraHelper, o guia de inteligência do aplicativo de psicomotricidade UrbeLudo.
      Sua missão é responder perguntas sobre movimento, saúde, o app ou qualquer dúvida do usuário de forma lúdica.
      
      Diretrizes:
      - Responda em Português (Brasil).
      - Seja muito curto (máximo 2 frases).
      - Use um tom encorajador e amigável.
      - Se a pergunta for totalmente fora de contexto, responda de forma criativa ligando ao tema de "exploração" ou "energia".
      
      Pergunta do Usuário: "${query}"
      Contexto Atual: "${input.context || 'Exploração Livre'}"
      
      Retorne OBRIGATORIAMENTE apenas um JSON puro com este formato: 
      {"answer": "sua resposta aqui", "suggestedAction": "uma ação curta de 2-3 palavras"}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Limpeza de segurança para garantir que o JSON seja parseado
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleanJson) as AuraHelperOutput;
    
    AuraLogger.info('AuraFlow', 'Resposta do Gemini processada com sucesso.');
    return data;
  } catch (error: any) {
    AuraLogger.error('AuraFlow', 'Falha no fallback Gemini', error.message);
    
    // Fallback amigável em caso de erro real de API/Rede
    return {
      answer: "Minha conexão com a rede de dados oscilou. Que tal tentarmos um dos desafios de movimento agora?",
      suggestedAction: "Ir para Missões"
    };
  }
}
