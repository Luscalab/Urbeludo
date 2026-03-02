'use client';
/**
 * @fileOverview Serviço de IA AuraBot 2026 - SPSP.
 * Focado em relatórios clínicos e feedbacks lúdicos.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { AuraLogger } from "@/lib/logs/aura-logger";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export interface AuraBotReport {
  childFeedback: string;
  therapistFeedback: string;
}

export async function generateAuraBotReport(data: {
  avgVolume: number;
  sustainTime: number;
  attempts: number;
  levelName: string;
}): Promise<AuraBotReport> {
  if (!genAI) {
    return {
      childFeedback: "Incrível! Sua voz brilhou como uma estrela!",
      therapistFeedback: `Relatório Offline: Volume ${data.avgVolume}%, Sustentação ${data.sustainTime}s.`
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const prompt = `Analise biomecanicamente (Tom Clínico para Terapeuta) e de forma lúdica (Tom para Criança) estes dados:
      Nível: ${data.levelName}, Volume: ${data.avgVolume}%, Tempo: ${data.sustainTime}s.
      Retorne um JSON puro: {"childFeedback": "...", "therapistFeedback": "..."}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text) as AuraBotReport;
  } catch (error: any) {
    AuraLogger.error("GeminiService", "Erro na geração do relatório 2026", error.message);
    return {
      childFeedback: "Muito bem! Sua aura vocal está cada vez mais forte!",
      therapistFeedback: "Erro de conexão Cloud. Dados preservados localmente."
    };
  }
}
