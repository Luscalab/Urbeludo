'use client';
/**
 * @fileOverview AuraBrain - Gerenciador Singleton do Web Worker.
 * Centraliza a comunicação técnica e garante que o app não trave.
 */

import { AuraLogger } from "@/lib/logs/aura-logger";

export interface IntentAnchor {
  id: string;
  examples: string[];
}

const INTENCOES: IntentAnchor[] = [
  { id: 'jogar_elevador', examples: ["Como jogar o Elevador?", "instruções do elevador", "ajuda no jogo de voz", "quero brincar no elevador", "como subir"] },
  { id: 'zona_estabilidade', examples: ["Zona de Estabilidade?", "o que é a área verde", "estabilizar voz", "como ganhar pontos", "área de controle"] },
  { id: 'clinico_psico', examples: ["O que é Psicomotricidade?", "como esse jogo ajuda meu corpo", "benefícios clínicos", "ajuda no desenvolvimento", "pra que serve"] },
  { id: 'moedas', examples: ["Para que servem as LudoCoins?", "onde vejo minhas moedas", "como ganhar ludocoins", "onde fica a loja", "comprar itens"] },
  { id: 'tecnico_ajuda', examples: ["Microfone não funciona", "bug no som", "problemas técnicos", "o app travou", "ajuda técnica"] }
];

// Singleton do Worker
let worker: Worker | null = null;
const pendingRequests = new Map<string, (id: string) => void>();
let modelIsReady = false;

export const initAuraBrain = (onProgress?: (p: number) => void) => {
  if (typeof window === 'undefined') return;
  if (worker) {
    if (modelIsReady) onProgress?.(100);
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
          modelIsReady = true;
          AuraLogger.info('AuraBrain', 'Cérebro de Borda sincronizado e pronto.');
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
    AuraLogger.info('AuraBrain', 'Iniciando kernel de IA assíncrono.');
  } catch (err) {
    AuraLogger.error('AuraBrain', 'Falha ao instanciar Web Worker', err);
    onProgress?.(0);
  }
};

export const classifyIntent = async (userText: string): Promise<string> => {
  if (!worker || !modelIsReady) {
    AuraLogger.warn('AuraBrain', 'Modelo não carregado ou Worker ausente. Fallback Cloud.');
    return 'fallback';
  }

  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  return new Promise((resolve) => {
    // Timeout de segurança: 2.5 segundos para IA local em mobile
    const timeout = setTimeout(() => {
      if (pendingRequests.has(requestId)) {
        AuraLogger.warn('AuraBrain', `Timeout local para: "${userText}". Chaveando para Grande Aura.`);
        pendingRequests.delete(requestId);
        resolve('fallback');
      }
    }, 2500);

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
