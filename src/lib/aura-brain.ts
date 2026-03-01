
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
  { id: 'jogar_elevador', examples: ["Como jogar o Elevador?", "🎮 Como jogar o Elevador?", "instruções do elevador", "como subir o baú", "ajuda no jogo de voz"] },
  { id: 'zona_estabilidade', examples: ["Zona de Estabilidade?", "🟢 Zona de Estabilidade?", "o que é a área verde", "círculo verde na tela", "estabilizar voz"] },
  { id: 'clinico_psico', examples: ["O que é Psicomotricidade?", "🧠 O que é Psicomotricidade?", "como esse jogo ajuda meu corpo", "benefícios clínicos", "psicomotricidade e ludicidade"] },
  { id: 'tonicidade', examples: ["o que é tonicidade", "controle dos músculos", "tônus das pregas vocais", "firmeza muscular"] },
  { id: 'moedas', examples: ["Para que servem as LudoCoins?", "💰 Para que servem as LudoCoins?", "onde vejo minhas moedas", "como ganhar ludocoins"] },
  { id: 'tecnico_ajuda', examples: ["Microfone não funciona", "🔧 Problemas técnicos?", "bug no som", "o elevador não sobe", "problemas técnicos"] },
  { id: 'praxia_fina', examples: ["O que é Praxia Fina?", "✨ O que é Praxia Fina?", "coordenação das mãos", "movimentos precisos", "caminho de luz ajuda o que"] },
  { id: 'esquema_corporal', examples: ["O que é Esquema Corporal?", "👤 O que é Esquema Corporal?", "consciência do corpo", "meu avatar e progresso"] }
];

let worker: Worker | null = null;
let resolveClassification: ((id: string) => void) | null = null;

export const initAuraBrain = (onProgress?: (p: number) => void) => {
  if (typeof window === 'undefined') return;
  if (worker) {
    onProgress?.(100);
    return;
  }

  AuraLogger.info('AuraBrain', 'Iniciando sincronização da thread de IA local...');

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
          AuraLogger.info('AuraBrain', 'Motor de IA pronto para requisições locais.');
          if (onProgress) onProgress(100);
          break;
        case 'result':
          AuraLogger.debug('AuraBrain', `Score final detectado: ${score?.toFixed(4)} para intenção ${intentId}`);
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
  if (!worker) {
    AuraLogger.warn('AuraBrain', 'AuraBrain ainda não inicializada.');
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
