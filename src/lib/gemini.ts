
'use client';
/**
 * @fileOverview Serviço de IA AuraBot 2026 - SPSP (Seguro).
 * Modelo: gemini-1.5-flash (estável e recomendado).
 * API Key nunca é exposta ao cliente.
 */

import { AuraLogger } from "@/lib/logs/aura-logger";
import { callGeminiAPI } from "@/lib/gemini-client";

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
  try {
    const prompt = `Analise biomecanicamente (Tom Clínico para Terapeuta) e de forma lúdica (Tom para Criança) estes dados:
      Nível: ${data.levelName}, Volume: ${data.avgVolume}%, Tempo: ${data.sustainTime}s.
      Retorne um JSON puro: {"childFeedback": "...", "therapistFeedback": "..."}`;

    const responseText = await callGeminiAPI(prompt, {
      responseMimeType: "application/json",
    });

    const text = responseText.replace(/```json|```/g, "").trim();
    return JSON.parse(text) as AuraBotReport;
  } catch (error: any) {
    AuraLogger.error("GeminiService", "Erro na geração do relatório 2026", error.message);
    return {
      childFeedback: "Muito bem! Sua aura vocal está cada vez mais forte!",
      therapistFeedback: "Erro de conexão Cloud. Dados preservados localmente."
    };
  }
}
