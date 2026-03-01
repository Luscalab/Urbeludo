
/**
 * @fileOverview Serviço de Inteligência Artificial AuraBot - 100% Client-Side.
 * Gera relatórios biomecânicos e feedbacks lúdicos para fonoaudiologia.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface AuraBotReport {
  childFeedback: string;
  therapistFeedback: string;
}

/**
 * Gera um relatório automatizado baseado na performance captada pelos sensores.
 */
export async function generateAuraBotReport(data: {
  avgVolume: number;
  sustainTime: number;
  attempts: number;
  levelName: string;
}): Promise<AuraBotReport> {
  if (!API_KEY) {
    console.warn("AuraBot: Chave de API ausente (NEXT_PUBLIC_GEMINI_API_KEY). Usando fallback biomecânico.");
    return {
      childFeedback: "Incrível! Sua voz brilhou como uma estrela! O baú se abriu!",
      therapistFeedback: `Performance estável no nível ${data.levelName}. Volume médio de ${data.avgVolume}% sustentado por ${data.sustainTime}s em ${data.attempts} tentativas.`
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Você é o AuraBot, assistente inteligente de fonoaudiologia do app UrbeLudo.
      Analise os dados desta sessão de exercício vocal:
      
      - Nível: ${data.levelName}
      - Intensidade Média: ${data.avgVolume}%
      - Tempo de Sustentação Alvo: ${data.sustainTime} segundos
      - Tentativas Realizadas: ${data.attempts}

      Gere dois feedbacks curtos:
      1. Para a Criança (childFeedback): Use tom lúdico, encorajador, sobre 'Aura Vocal' e 'Energia'. Máximo 2 frases.
      2. Para o Terapeuta (therapistFeedback): Seja técnico, descreva o controle de intensidade, estabilidade e resiliência (tentativas). Máximo 2 frases.

      Retorne APENAS um JSON puro (sem markdown) com as chaves: "childFeedback" e "therapistFeedback".
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text) as AuraBotReport;
  } catch (error) {
    console.error("Erro na geração de relatório IA:", error);
    return {
      childFeedback: "Parabéns! Você conseguiu abrir o baú com sua voz mágica!",
      therapistFeedback: "Erro no processamento da IA. Dados brutos: Volume " + data.avgVolume + "%, Tempo " + data.sustainTime + "s."
    };
  }
}
