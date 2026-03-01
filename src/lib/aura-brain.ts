'use client';

/**
 * @fileOverview AuraBrain - Interface Cliente para o Web Worker de IA.
 * Gerencia a comunicação com a thread de processamento.
 */

export interface IntentAnchor {
  id: string;
  examples: string[];
}

const INTENCOES: IntentAnchor[] = [
  { id: 'jogar_elevador', examples: ["Como jogar o Elevador?", "como jogar o elevador", "instruções do jogo de voz", "como subir o baú", "ajuda no elevador"] },
  { id: 'zona_estabilidade', examples: ["Zona de Estabilidade?", "o que é zona de estabilidade", "área verde na tela", "para que serve o círculo verde"] },
  { id: 'clinico_psico', examples: ["O que é Psicomotricidade?", "o que é psicomotricidade", "por que esse jogo ajuda", "relação com o corpo e mente", "como o elevador ajuda minha voz"] },
  { id: 'tonicidade', examples: ["o que é tonicidade", "controle dos músculos", "treino de pregas vocais", "tônus muscular", "firmeza na voz"] },
  { id: 'moedas', examples: ["Para que servem as LudoCoins?", "para que servem as ludocoins", "onde vejo minhas moedas", "como ganhar dinheiro no jogo"] },
  { id: 'tecnico_ajuda', examples: ["Problemas técnicos?", "não funciona", "bug no microfone", "sem som", "o elevador não sobe", "ajuda técnica"] },
  { id: 'praxia_fina', examples: ["O que é Praxia Fina?", "o que é praxia fina", "coordenação das mãos", "movimentos pequenos"] },
  { id: 'esquema_corporal', examples: ["O que é Esquema Corporal?", "esquema corporal", "consciência do corpo", "meu avatar e progresso"] }
];

let worker: Worker | null = null;
let isReady = false;
let onReadyCallback: (() => void) | null = null;
let onProgressCallback: ((p: number) => void) | null = null;
let resolveClassification: ((id: string) => void) | null = null;

export const initAuraBrain = (onProgress?: (p: number) => void) => {
  if (typeof window === 'undefined' || worker) return;

  onProgressCallback = onProgress || null;
  
  // Cria o Worker a partir do arquivo otimizado
  worker = new Worker(new URL('./aura-worker.ts', import.meta.url), { type: 'module' });

  worker.onmessage = (event) => {
    const { type, progress, intentId, score, message } = event.data;

    switch (type) {
      case 'progress':
        if (onProgressCallback) onProgressCallback(progress);
        break;
      case 'ready':
        isReady = true;
        if (onProgressCallback) onProgressCallback(100);
        if (onReadyCallback) onReadyCallback();
        break;
      case 'result':
        console.log(`[AuraWorker] Match: ${intentId} | Score: ${score.toFixed(4)}`);
        if (resolveClassification) resolveClassification(intentId);
        break;
      case 'error':
        console.error("❌ AuraWorker Error:", message);
        if (resolveClassification) resolveClassification('fallback');
        break;
    }
  };

  worker.postMessage({ type: 'init' });
};

export const classifyIntent = async (userText: string): Promise<string> => {
  if (!worker || !isReady) {
    console.warn("⚠️ AuraBrain: Worker não está pronto.");
    return 'fallback';
  }

  return new Promise((resolve) => {
    resolveClassification = resolve;
    worker?.postMessage({ 
      type: 'classify', 
      text: userText, 
      examples: INTENCOES 
    });
  });
};
