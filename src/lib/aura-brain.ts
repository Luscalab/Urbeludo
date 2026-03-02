'use client';
/**
 * @fileOverview AuraBrain - Interface de comunicação robusta com o Web Worker.
 * Gerencia o ciclo de vida da IA de Borda e garante que as mensagens não colidam.
 */

import { AuraLogger } from "@/lib/logs/aura-logger";

export interface IntentAnchor {
  id: string;
  examples: string[];
}

const INTENCOES: IntentAnchor[] = [
  { id: 'jogar_elevador', examples: ["Como jogar o Elevador?", "instruções do elevador", "ajuda no jogo de voz", "quero brincar no elevador"] },
  { id: 'zona_estabilidade', examples: ["Zona de Estabilidade?", "o que é a área verde", "estabilizar voz", "como ganhar pontos"] },
  { id: 'clinico_psico', examples: ["O que é Psicomotricidade?", "como esse jogo ajuda meu corpo", "benefícios clínicos", "ajuda no desenvolvimento"] },
  { id: 'moedas', examples: ["Para que servem as LudoCoins?", "onde vejo minhas moedas", "como ganhar ludocoins", "onde fica a loja"] },
  { id: 'tecnico_ajuda', examples: ["Microfone não funciona", "bug no som", "problemas técnicos", "o app travou"] }
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
          AuraLogger.info('AuraBrain', 'Motor de Borda sincronizado.');
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
          AuraLogger.error('AuraBrain', `Erro técnico no Worker: ${message}`);
          if (requestId && pendingRequests.has(requestId)) {
            const resolve = pendingRequests.get(requestId);
            if (resolve) resolve('fallback');
            pendingRequests.delete(requestId);
          }
          break;
      }
    };

    worker.postMessage({ type: 'init', examples: INTENCOES });
    AuraLogger.info('AuraBrain', 'Kernel de IA instanciado no sistema.');
  } catch (err) {
    AuraLogger.error('AuraBrain', 'Falha crítica ao carregar motor de IA', err);
    onProgress?.(0);
  }
};

export const classifyIntent = async (userText: string): Promise<string> => {
  if (!worker) {
    AuraLogger.warn('AuraBrain', 'Motor offline. Chaveando para fallback direto.');
    return 'fallback';
  }

  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  return new Promise((resolve) => {
    // Timeout de 3 segundos para evitar que o chat engasgue se o Worker estiver lento
    const timeout = setTimeout(() => {
      if (pendingRequests.has(requestId)) {
        AuraLogger.warn('AuraBrain', `Timeout local para: "${userText}". Chaveando para Nuvem.`);
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
