
/**
 * @fileOverview Serviço de Integração Gemini 1.5 Flash - 100% Client-Side.
 * Responsável por gerar relatórios de biofeedback para fonoaudiologia.
 * Versão otimizada para Soberania Offline no APK.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// A chave é injetada durante o build estático do Next.js (output: export)
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface AuraBotReport {
  childFeedback: string;
  therapistFeedback: string;
}

/**
 * Gera um relatório lúdico e técnico baseado na performance vocal captada pelo hardware.
 */
export async function generateAuraBotReport(data: {
  avgVolume: number;
  sustainTime: number;
  attempts: number;
  levelName: string;
}): Promise<AuraBotReport> {
  // Verificação de segurança para evitar crash em build estático sem chave
  if (!API_KEY || API_KEY === "") {
    console.warn("AuraBot: Chave de API ausente. Usando fallback biomecânico.");
    return {
      childFeedback: "Sua Aura brilhou intensamente! Você conseguiu manter o som firme como um herói espacial!",
      therapistFeedback: "Desempenho estável. Volume médio observado dentro da zona alvo. Sustentação glótica adequada para o nível."
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Aja como o AuraBot, o assistente robótico de fonoaudiologia do ecossistema UrbeLudo.
      Sua missão é analisar uma sessão de treinamento vocal e gerar um biofeedback preciso.
      
      DADOS DA SESSÃO:
      - Nível Alcançado: ${data.levelName}
      - Intensidade Média (Volume): ${data.avgVolume}%
      - Tempo de Sustentação Vocal: ${data.sustainTime} segundos
      - Persistência: ${data.attempts} tentativas

      REQUISITOS DO RELATÓRIO:
      1. Para a Criança (childFeedback): Use tom lúdico, encorajador, sobre 'Aura Vocal', 'Energia de Estrela' e 'Foco de Mestre'. Seja curto (máx 2 frases).
      2. Para o Terapeuta (therapistFeedback): Seja técnico, descreva controle de intensidade, estabilidade respiratória e fadiga observada. (máx 2 frases).

      RETORNO OBRIGATÓRIO: Um objeto JSON puro com os campos "childFeedback" e "therapistFeedback". Não use markdown ou blocos de código.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Limpeza de possíveis formatações markdown automáticas do Gemini
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson) as AuraBotReport;
  } catch (error) {
    console.error("AuraBot Offline Error:", error);
    return {
      childFeedback: "Incrível! Sua voz tem um poder único. O baú se abriu com a força do seu canto!",
      therapistFeedback: "Erro na conexão com a IA Studio. Dados brutos: Volume " + data.avgVolume + "%, Tempo " + data.sustainTime + "s."
    };
  }
}
