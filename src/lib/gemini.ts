/**
 * @fileOverview Serviço de Inteligência Artificial AuraBot - 100% Client-Side para APK.
 * Gera relatórios biomecânicos e feedbacks lúdicos usando NEXT_PUBLIC.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { AuraLogger } from "@/lib/logs/aura-logger";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyCCwhUNlhnpxjDuZ8quod7MTnde1dZJj04";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface AuraBotReport {
  childFeedback: string;
  therapistFeedback: string;
}

/**
 * Gera um relatório automatizado baseado na performance captada pelos sensores.
 * Funciona exclusivamente no lado do cliente.
 */
export async function generateAuraBotReport(data: {
  avgVolume: number;
  sustainTime: number;
  attempts: number;
  levelName: string;
}): Promise<AuraBotReport> {
  AuraLogger.info('GeminiService', `Gerando relatório para nível: ${data.levelName}`);

  if (!API_KEY || API_KEY.length < 10) {
    const errorMsg = "NEXT_PUBLIC_GEMINI_API_KEY ausente ou inválida no cliente.";
    AuraLogger.error('GeminiService', errorMsg);
    return {
      childFeedback: "Incrível! Sua voz brilhou como uma estrela! O baú se abriu!",
      therapistFeedback: `Relatório Biomecânico: Volume médio de ${data.avgVolume}% sustentado por ${data.sustainTime}s.`
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Você é o AuraBot, assistente inteligente de fonoaudiologia do app UrbeLudo.
      Analise os dados desta sessão:
      - Nível: ${data.levelName}
      - Intensidade Média: ${data.avgVolume}%
      - Tempo de Sustentação Alvo: ${data.sustainTime}s
      - Tentativas: ${data.attempts}

      Retorne APENAS um JSON: {"childFeedback": "...", "therapistFeedback": "..."}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    AuraLogger.info('GeminiService', 'Relatório gerado com sucesso via Nuvem.');
    return JSON.parse(text) as AuraBotReport;
  } catch (error: any) {
    AuraLogger.error("GeminiService", "Falha na geração via Gemini", error.message || error);
    return {
      childFeedback: "Parabéns! Você conseguiu abrir o baú com sua voz mágica!",
      therapistFeedback: "Erro de conexão com a Grande Aura. Dados locais preservados."
    };
  }
}
