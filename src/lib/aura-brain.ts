
'use client';

/**
 * @fileOverview AuraBrain - Motor de Inteligência de Borda para Classificação de Intenções.
 * Versão ultra-resiliente com threshold ajustado para 0.4 e logs de debug.
 */

export interface IntentAnchor {
  id: string;
  examples: string[];
}

const INTENCOES: IntentAnchor[] = [
  { 
    id: 'jogar_elevador', 
    examples: [
      "Como jogar o Elevador?", 
      "como jogar o elevador", 
      "instruções do jogo de voz", 
      "como subir o baú", 
      "ajuda no elevador", 
      "como funciona o jogo"
    ] 
  },
  { 
    id: 'zona_estabilidade', 
    examples: [
      "Zona de Estabilidade?", 
      "o que é zona de estabilidade", 
      "área verde na tela", 
      "para que serve o círculo verde", 
      "manter som constante"
    ] 
  },
  { 
    id: 'clinico_psico', 
    examples: [
      "O que é Psicomotricidade?", 
      "o que é psicomotricidade", 
      "por que esse jogo ajuda", 
      "relação com o corpo e mente", 
      "base cientifica", 
      "como o elevador ajuda minha voz", 
      "benefícios do exercício"
    ] 
  },
  { 
    id: 'tonicidade', 
    examples: [
      "o que é tonicidade", 
      "controle dos músculos", 
      "treino de pregas vocais", 
      "tônus muscular", 
      "firmeza na voz"
    ] 
  },
  { 
    id: 'moedas', 
    examples: [
      "Para que servem as LudoCoins?", 
      "para que servem as ludocoins", 
      "onde vejo minhas moedas", 
      "como ganhar dinheiro no jogo", 
      "recompensas"
    ] 
  },
  { 
    id: 'tecnico_ajuda', 
    examples: [
      "Problemas técnicos?", 
      "não funciona", 
      "bug no microfone", 
      "sem som", 
      "o elevador não sobe", 
      "ajuda técnica", 
      "permissão de áudio"
    ] 
  },
  { 
    id: 'praxia_fina', 
    examples: [
      "O que é Praxia Fina?", 
      "o que é praxia fina", 
      "coordenação das mãos", 
      "seguindo o caminho de luz", 
      "movimentos pequenos"
    ] 
  },
  { 
    id: 'esquema_corporal', 
    examples: [
      "O que é Esquema Corporal?", 
      "esquema corporal", 
      "consciência do corpo", 
      "meu avatar e progresso", 
      "percepção de si"
    ] 
  }
];

let extractor: any = null;
let anchorEmbeddings: Record<string, number[][]> = {};

export const initAuraBrain = async (onProgress?: (p: number) => void) => {
  if (typeof window === 'undefined') return;
  
  if (!extractor) {
    try {
      const transformers = await import('@xenova/transformers');
      
      if (transformers.env) {
        transformers.env.allowLocalModels = false;
        transformers.env.useBrowserCache = true;
      }

      extractor = await transformers.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        progress_callback: (data: any) => {
          if (data.status === 'progress' && onProgress) {
            onProgress(Math.round(data.progress));
          }
          if (data.status === 'ready' && onProgress) {
            onProgress(100);
          }
        }
      });
      
      // Pré-calcula os vetores das âncoras
      for (const item of INTENCOES) {
        const embeddings = [];
        for (const example of item.examples) {
          const output = await extractor(example, { pooling: 'mean', normalize: true });
          embeddings.push(Array.from(output.data as Float32Array));
        }
        anchorEmbeddings[item.id] = embeddings;
      }
      console.log("✅ AuraBrain: Âncoras semânticas preparadas.");
    } catch (err) {
      console.error("❌ AuraBrain: Erro crítico na inicialização:", err);
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
    if (!extractor) {
      console.warn("⚠️ AuraBrain: Extrator não inicializado. Tentando agora...");
      await initAuraBrain();
    }
    if (!extractor) return 'fallback';

    const output = await extractor(userText, { pooling: 'mean', normalize: true });
    const userVector = Array.from(output.data as Float32Array);

    let bestMatch = { id: 'fallback', score: 0, example: '' };

    for (const [id, embeddings] of Object.entries(anchorEmbeddings)) {
      const intentObj = INTENCOES.find(i => i.id === id);
      embeddings.forEach((anchorVec, idx) => {
        const score = cosineSimilarity(userVector, anchorVec);
        if (score > bestMatch.score) {
          bestMatch = { id, score, example: intentObj?.examples[idx] || '' };
        }
      });
    }

    console.log(`[AuraBrain] Input: "${userText}" | Melhor Match: ${bestMatch.id} (${bestMatch.score.toFixed(4)}) via "${bestMatch.example}"`);

    // Threshold reduzido para 0.4 para maior flexibilidade
    return bestMatch.score >= 0.4 ? bestMatch.id : 'fallback';
  } catch (error) {
    console.error("❌ AuraBrain: Erro na classificação:", error);
    return 'fallback';
  }
};
