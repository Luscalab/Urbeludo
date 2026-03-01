/**
 * @fileOverview Serviço de Integração Gemini 1.5 Flash - 100% Client-Side.
 * Responsável por gerar relatórios de biofeedback para fonoaudiologia.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface AuraBotReport {
  childFeedback: string;
  therapistFeedback: string;
}

/**
 * Gera um relatório lúdico e técnico baseado na performance vocal.
 */
export async function generateAuraBotReport(data: {
  avgVolume: number;
  sustainTime: number;
  attempts: number;
  levelName: string;
}): Promise<AuraBotReport> {
  // Se não houver chave, retorna um fallback amigável
  if (!API_KEY) {
    return {
      childFeedback: "Sua voz brilhou como uma nebulosa! Continue explorando os sons!",
      therapistFeedback: "Configuração de IA ausente. Volume médio e sustentação registrados no histórico local."
    };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Aja como o AuraBot, o assistente robótico de fonoaudiologia do UrbeLudo.
    Gere um relatório de progresso para esta sessão de treino vocal:
    - Nível do Elevador: ${data.levelName}
    - Intensidade Média: ${data.avgVolume}%
    - Tempo de Sustentação Glótica: ${data.sustainTime} segundos
    - Persistência (Tentativas): ${data.attempts}

    O relatório deve ter dois destinatários:
    1. A Criança (childFeedback): Use uma linguagem espacial, encorajadora e lúdica. Refira-se à "Aura Vocal" dela. Seja breve (2 frases).
    2. O Terapeuta (therapistFeedback): Descreva o desempenho em termos de controle de intensidade, estabilidade respiratória e engajamento. Seja técnico e objetivo (2 frases).

    IMPORTANTE: Retorne APENAS um objeto JSON puro com os campos "childFeedback" e "therapistFeedback". Não use blocos de código Markdown.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Limpeza de possíveis formatações markdown do modelo
    const jsonString = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonString) as AuraBotReport;
  } catch (error) {
    console.error("Falha na Aura-IA:", error);
    return {
      childFeedback: "Incrível! Sua Aura sonora está cada vez mais forte!",
      therapistFeedback: "Erro na geração do relatório via IA. Dados brutos salvos no log local."
    };
  }
}
