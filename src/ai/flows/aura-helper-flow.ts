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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Você é o AuraHelper, assistente do app de psicomotricidade UrbeLudo.
      Responda de forma muito curta (máximo 2 frases), lúdica e acolhedora.
      Use termos como "Explorador", "Aura" e "Movimento".
      
      Pergunta do Usuário: "${query}"
      Contexto Atual: "${input.context || 'Exploração'}"
      
      Retorne OBRIGATORIAMENTE apenas um JSON puro, sem markdown, com os campos: 
      {"answer": "sua resposta aqui", "suggestedAction": "uma ação curta"}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Limpeza de possíveis marcações de markdown do modelo
    const jsonString = responseText.replace(/```json|```/g, "").trim();
    const data = JSON.parse(jsonString) as AuraHelperOutput;
    
    AuraLogger.info('AuraFlow', 'Resposta do Gemini processada com sucesso.');
    return data;
  } catch (error: any) {
    AuraLogger.error('AuraFlow', 'Falha no fallback Gemini', error.message);
    return {
      answer: "Minha sincronia com a rede lúdica oscilou um pouco. Que tal tentar uma das missões sugeridas abaixo?",
      suggestedAction: "Ver Missões"
    };
  }
}
