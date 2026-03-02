'use client';
/**
 * @fileOverview AuraBrain - Interface de comunicação robusta com o Web Worker.
 * Implementa sistema de ID de mensagem para evitar colisões e perdas de resposta.
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
const pendingRequests = new Map<string, (id: string) => void>();

export const initAuraBrain = (onProgress?: (p: number) => void) => {
  if (typeof window === 'undefined') return;
  if (worker) {
    onProgress?.(100);
    return;
  }

  try {
    worker = new Worker(new URL('./aura-worker.ts', import.meta.url), { type: 'module' });

    worker.onmessage = (event) => {
      const { type, requestId, progress, intentId, message, level, data } = event.data;

      switch (type) {
        case 'log':
          AuraLogger.log(level || 'info', 'AuraWorker', message, data);
          break;
        case 'progress':
          if (onProgress) onProgress(progress);
          break;
        case 'ready':
          AuraLogger.info('AuraBrain', 'Worker pronto para inferência.');
          if (onProgress) onProgress(100);
          break;
        case 'result':
          if (requestId && pendingRequests.has(requestId)) {
            const resolve = pendingRequests.get(requestId);
            if (resolve) resolve(intentId);
            pendingRequests.delete(requestId);
          }
          break;
        case 'error':
          AuraLogger.error('AuraBrain', `Erro no Worker: ${message}`);
          if (requestId && pendingRequests.has(requestId)) {
            const resolve = pendingRequests.get(requestId);
            if (resolve) resolve('fallback');
            pendingRequests.delete(requestId);
          }
          break;
      }
    };

    worker.postMessage({ type: 'init', examples: INTENCOES });
    AuraLogger.info('AuraBrain', 'Kernel de IA instanciado.');
  } catch (err) {
    AuraLogger.error('AuraBrain', 'Falha crítica ao carregar motor de IA', err);
    onProgress?.(0);
  }
};

export const classifyIntent = async (userText: string): Promise<string> => {
  if (!worker) {
    AuraLogger.warn('AuraBrain', 'Tentativa de classificação com motor offline.');
    return 'fallback';
  }

  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  return new Promise((resolve) => {
    // Timeout de segurança de 3 segundos para o Worker local
    const timeout = setTimeout(() => {
      if (pendingRequests.has(requestId)) {
        AuraLogger.warn('AuraBrain', `Timeout na classificação local para: "${userText}"`);
        pendingRequests.delete(requestId);
        resolve('fallback');
      }
    }, 3000);

    pendingRequests.set(requestId, (id) => {
      clearTimeout(timeout);
      resolve(id);
    });

    worker?.postMessage({ 
      type: 'classify', 
      requestId,
      text: userText
    });
  });
};
