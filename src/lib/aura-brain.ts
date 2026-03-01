'use client';

/**
 * @fileOverview AuraBrain - Motor de Inteligência de Borda para Classificação de Intenções.
 * Implementa carregamento dinâmico e tracking de progresso para o APK.
 */

export interface IntentAnchor {
  id: string;
  examples: string[];
}

const INTENCOES: IntentAnchor[] = [
  { id: 'jogar_elevador', examples: ["como jogar o elevador", "instruções do jogo de voz", "como subir o baú", "ajuda no elevador"] },
  { id: 'zona_estabilidade', examples: ["o que é zona de estabilidade", "área verde na tela", "para que serve o círculo verde"] },
  { id: 'clinico_psico', examples: ["o que é psicomotricidade", "por que esse jogo ajuda", "relação com o corpo e mente", "base cientifica"] },
  { id: 'tonicidade', examples: ["o que é tonicidade", "controle dos músculos", "treino de pregas vocais", "tônus muscular"] },
  { id: 'moedas', examples: ["para que servem as ludocoins", "onde vejo minhas moedas", "como ganhar dinheiro no jogo"] },
  { id: 'tecnico_ajuda', examples: ["não funciona", "bug no microfone", "sem som", "o elevador não sobe", "ajuda técnica"] },
  { id: 'praxia_fina', examples: ["o que é praxia fina", "coordenação das mãos", "seguindo o caminho de luz"] },
  { id: 'esquema_corporal', examples: ["esquema corporal", "consciência do corpo", "meu avatar e progresso"] }
];

let extractor: any = null;
let anchorEmbeddings: Record<string, number[][]> = {};

/**
 * Inicializa o modelo de extração de características com callback de progresso.
 */
export const initAuraBrain = async (onProgress?: (p: number) => void) => {
  if (typeof window === 'undefined') return;
  
  if (!extractor) {
    try {
      const { pipeline, env } = await import('@xenova/transformers');
      
      env.allowLocalModels = false;
      env.useBrowserCache = true;

      extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        progress_callback: (data: any) => {
          if (data.status === 'progress' && onProgress) {
            onProgress(Math.round(data.progress));
          }
          if (data.status === 'ready' && onProgress) {
            onProgress(100);
          }
        }
      });
      
      // Pré-calcula os vetores das âncoras para respostas instantâneas
      for (const item of INTENCOES) {
        const embeddings = [];
        for (const example of item.examples) {
          const output = await extractor(example, { pooling: 'mean', normalize: true });
          embeddings.push(Array.from(output.data as Float32Array));
        }
        anchorEmbeddings[item.id] = embeddings;
      }
    } catch (err) {
      console.error("Erro na inicialização semântica:", err);
    }
  }
};

function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }
  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

export const classifyIntent = async (userText: string): Promise<string> => {
  try {
    if (!extractor) await initAuraBrain();
    if (!extractor) return 'fallback';

    const output = await extractor(userText, { pooling: 'mean', normalize: true });
    const userVector = Array.from(output.data as Float32Array);

    let bestMatch = { id: 'fallback', score: 0 };

    for (const [id, embeddings] of Object.entries(anchorEmbeddings)) {
      for (const anchorVec of embeddings) {
        const score = cosineSimilarity(userVector, anchorVec);
        if (score > bestMatch.score) {
          bestMatch = { id, score };
        }
      }
    }

    return bestMatch.score > 0.7 ? bestMatch.id : 'fallback';
  } catch (error) {
    console.error("Erro na classificação de borda:", error);
    return 'fallback';
  }
};
