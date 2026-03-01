'use client';
/**
 * @fileOverview AuraBrain - Interface de comunicação com o Web Worker instrumentada.
 */

import { AuraLogger } from "@/lib/logs/aura-logger";

export interface IntentAnchor {
  id: string;
  examples: string[];
}

const INTENCOES: IntentAnchor[] = [
  { id: 'jogar_elevador', examples: ["Como jogar o Elevador?", "instruções do elevador", "ajuda no jogo de voz"] },
  { id: 'zona_estabilidade', examples: ["Zona de Estabilidade?", "o que é a área verde", "estabilizar voz"] },
  { id: 'clinico_psico', examples: ["O que é Psicomotricidade?", "como esse jogo ajuda meu corpo", "benefícios clínicos"] },
  { id: 'moedas', examples: ["Para que servem as LudoCoins?", "onde vejo minhas moedas", "como ganhar ludocoins"] },
  { id: 'tecnico_ajuda', examples: ["Microfone não funciona", "bug no som", "problemas técnicos"] }
];

let worker: Worker | null = null;
let resolveClassification: ((id: string) => void) | null = null;

export const initAuraBrain = (onProgress?: (p: number) => void) => {
  if (typeof window === 'undefined') return;
  if (worker) {
    onProgress?.(100);
    return;
  }

  try {
    worker = new Worker(new URL('./aura-worker.ts', import.meta.url), { type: 'module' });

    worker.onmessage = (event) => {
      const { type, progress, intentId, message, level, data, score } = event.data;

      switch (type) {
        case 'log':
          AuraLogger.log(level || 'info', 'AuraWorker', message, data);
          break;
        case 'progress':
          if (onProgress) onProgress(progress);
          break;
        case 'ready':
          if (onProgress) onProgress(100);
          break;
        case 'result':
          if (resolveClassification) resolveClassification(intentId);
          break;
        case 'error':
          AuraLogger.error('AuraBrain', `Erro no Worker: ${message}`);
          if (resolveClassification) resolveClassification('fallback');
          break;
      }
    };

    worker.postMessage({ type: 'init', examples: INTENCOES });
  } catch (err) {
    AuraLogger.error('AuraBrain', 'Falha ao instanciar Web Worker', err);
    onProgress?.(0);
  }
};

export const classifyIntent = async (userText: string): Promise<string> => {
  if (!worker) return 'fallback';

  return new Promise((resolve) => {
    resolveClassification = resolve;
    worker?.postMessage({ 
      type: 'classify', 
      text: userText
    });
  });
};
