'use client';

/**
 * @fileOverview AuraBrain - Interface de comunicação com o Web Worker.
 * Centraliza a lógica de IA de Borda para manter a UI fluida.
 */

export interface IntentAnchor {
  id: string;
  examples: string[];
}

const INTENCOES: IntentAnchor[] = [
  { id: 'jogar_elevador', examples: ["Como jogar o Elevador?", "instruções do elevador", "como subir o baú", "ajuda no jogo de voz"] },
  { id: 'zona_estabilidade', examples: ["Zona de Estabilidade?", "o que é a área verde", "círculo verde na tela", "estabilizar voz"] },
  { id: 'clinico_psico', examples: ["O que é Psicomotricidade?", "como esse jogo ajuda meu corpo", "benefícios clínicos", "psicomotricidade e ludicidade"] },
  { id: 'tonicidade', examples: ["o que é tonicidade", "controle dos músculos", "tônus das pregas vocais", "firmeza muscular"] },
  { id: 'moedas', examples: ["Para que servem as LudoCoins?", "onde vejo minhas moedas", "como ganhar ludocoins"] },
  { id: 'tecnico_ajuda', examples: ["Microfone não funciona", "bug no som", "o elevador não sobe", "problemas técnicos"] },
  { id: 'praxia_fina', examples: ["O que é Praxia Fina?", "coordenação das mãos", "movimentos precisos", "caminho de luz ajuda o que"] },
  { id: 'esquema_corporal', examples: ["O que é Esquema Corporal?", "consciência do corpo", "meu avatar e progresso"] }
];

let worker: Worker | null = null;
let resolveClassification: ((id: string) => void) | null = null;

/**
 * Inicializa o Worker em segundo plano.
 */
export const initAuraBrain = (onProgress?: (p: number) => void) => {
  if (typeof window === 'undefined' || worker) return;

  worker = new Worker(new URL('./aura-worker.ts', import.meta.url), { type: 'module' });

  worker.onmessage = (event) => {
    const { type, progress, intentId, message } = event.data;

    switch (type) {
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
        console.error("❌ AuraBrain: Erro no Worker:", message);
        if (resolveClassification) resolveClassification('fallback');
        break;
    }
  };

  worker.postMessage({ type: 'init' });
};

/**
 * Classifica a intenção do usuário via Web Worker (Zero bloqueio de UI).
 */
export const classifyIntent = async (userText: string): Promise<string> => {
  if (!worker) {
    console.warn("⚠️ AuraBrain: Worker não inicializado.");
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
