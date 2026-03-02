/**
 * @fileOverview Serviço de Inteligência Artificial AuraBot - 100% Client-Side para APK.
 * Gera relatórios biomecânicos e feedbacks lúdicos.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { AuraLogger } from "@/lib/logs/aura-logger";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

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
  AuraLogger.info('GeminiService', `Gerando relatório para: ${data.levelName}`);

  if (!genAI) {
    AuraLogger.warn('GeminiService', 'API Key ausente. Usando resposta padrão.');
    return {
      childFeedback: "Incrível! Sua voz brilhou como uma estrela! Você abriu o baú!",
      therapistFeedback: `Relatório Biomecânico (Offline): Volume médio de ${data.avgVolume}% sustentado por ${data.sustainTime}s.`
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Você é o AuraBot, assistente inteligente de fonoaudiologia do app UrbeLudo.
      Analise os dados desta sessão de psicomotricidade vocal:
      - Nível: ${data.levelName}
      - Intensidade Média: ${data.avgVolume}%
      - Tempo de Sustentação: ${data.sustainTime}s
      - Tentativas: ${data.attempts}

      Diretrizes:
      - childFeedback: Tom lúdico, encorajador e focado em conquistas mágicas.
      - therapistFeedback: Tom clínico, preciso e focado na biomecânica vocal.
      
      Retorne APENAS um JSON: {"childFeedback": "...", "therapistFeedback": "..."}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text) as AuraBotReport;
  } catch (error: any) {
    AuraLogger.error("GeminiService", "Falha na geração Cloud", error.message || error);
    return {
      childFeedback: "Parabéns! Sua Aura vocal está ficando cada vez mais forte!",
      therapistFeedback: "Conexão com a nuvem instável. Dados de biomecânica preservados localmente."
    };
  }
}
