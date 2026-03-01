'use client';

/**
 * @fileOverview AuraBrain - Interface de comunicação com o Web Worker instrumentada com AuraLogger.
 */

import { AuraLogger } from "@/lib/logs/aura-logger";

export interface IntentAnchor {
  id: string;
  examples: string[];
}

const INTENCOES: IntentAnchor[] = [
  { id: 'jogar_elevador', examples: ["Como jogar o Elevador?", "instruções do elevador", "como subir o baú", "ajuda no jogo de voz", "como funciona o jogo", "🎮 Como jogar o Elevador?"] },
  { id: 'zona_estabilidade', examples: ["Zona de Estabilidade?", "o que é a área verde", "círculo verde na tela", "estabilizar voz", "por que o círculo verde", "🟢 Zona de Estabilidade?"] },
  { id: 'clinico_psico', examples: ["O que é Psicomotricidade?", "como esse jogo ajuda meu corpo", "benefícios clínicos", "psicomotricidade e ludicidade", "como o elevador ajuda minha voz", "🧠 O que é Psicomotricidade?"] },
  { id: 'tonicidade', examples: ["o que é tonicidade", "controle dos músculos", "tônus das pregas vocais", "firmeza muscular", "ajuda nos musculos"] },
  { id: 'moedas', examples: ["Para que servem as LudoCoins?", "onde vejo minhas moedas", "como ganhar ludocoins", "moedas ludo", "💰 Para que servem as LudoCoins?"] },
  { id: 'tecnico_ajuda', examples: ["Microfone não funciona", "bug no som", "o elevador não sobe", "problemas técnicos", "sem som", "🔧 Problemas técnicos?"] },
  { id: 'praxia_fina', examples: ["O que é Praxia Fina?", "coordenação das mãos", "movimentos precisos", "caminho de luz ajuda o que", "precisão dos dedos", "✨ O que é Praxia Fina?"] },
  { id: 'esquema_corporal', examples: ["O que é Esquema Corporal?", "consciência do corpo", "meu avatar e progresso", "conhecer o corpo", "👤 O que é Esquema Corporal?"] }
];

let worker: Worker | null = null;
let resolveClassification: ((id: string) => void) | null = null;

export const initAuraBrain = (onProgress?: (p: number) => void) => {
  if (typeof window === 'undefined') return;
  if (worker) {
    onProgress?.(100);
    return;
  }

  AuraLogger.info('AuraBrain', 'Inicializando Web Worker...');

  try {
    worker = new Worker(new URL('./aura-worker.ts', import.meta.url), { type: 'module' });

    worker.onmessage = (event) => {
      const { type, progress, intentId, message, level, data } = event.data;

      switch (type) {
        case 'log':
          // Redireciona logs do Worker para o AuraLogger principal
          AuraLogger.log(level || 'info', 'AuraWorker', message, data);
          break;
        case 'progress':
          if (onProgress) onProgress(progress);
          break;
        case 'ready':
          AuraLogger.info('AuraBrain', 'Worker reportou estado READY.');
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
    AuraLogger.error('AuraBrain', 'Falha fatal ao instanciar Worker', err);
    onProgress?.(0);
  }
};

export const classifyIntent = async (userText: string): Promise<string> => {
  if (!worker) {
    AuraLogger.warn('AuraBrain', 'Tentativa de classificação sem Worker ativo.');
    return 'fallback';
  }

  return new Promise((resolve) => {
    resolveClassification = resolve;
    worker?.postMessage({ 
      type: 'classify', 
      text: userText
    });
  });
};
