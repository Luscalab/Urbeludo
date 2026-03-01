/**
 * @fileOverview AuraWorker - Web Worker otimizado para o UrbeLudo.
 * Implementa cache de embeddings para performance de 60 FPS e carregamento local.
 */

import { pipeline, env } from '@xenova/transformers';

// Configuração para carregamento LOCAL (Pasta public/models/)
env.allowLocalModels = true;
env.remoteModels = false;
env.localModelPath = '/models/';

let extractor: any = null;
let intentCache: Array<{ id: string, vectors: number[][] }> = [];

self.onmessage = async (event) => {
  const { type, text, examples } = event.data;

  try {
    if (type === 'init') {
      if (!extractor) {
        extractor = await pipeline('feature-extraction', 'all-MiniLM-L6-v2', {
          progress_callback: (data: any) => {
            if (data.status === 'progress') {
              self.postMessage({ type: 'progress', progress: Math.round(data.progress) });
            }
          }
        });

        // PRÉ-PROCESSAMENTO: Cache de vetores para todas as intenções
        if (examples) {
          intentCache = [];
          for (const intent of examples) {
            const vectors: number[][] = [];
            for (const exampleText of intent.examples) {
              const output = await extractor(exampleText, { pooling: 'mean', normalize: true });
              vectors.push(Array.from(output.data as Float32Array));
            }
            intentCache.push({ id: intent.id, vectors });
          }
        }
        
        self.postMessage({ type: 'ready' });
      } else {
        self.postMessage({ type: 'ready' });
      }
    }

    if (type === 'classify' && extractor) {
      // 1. Vetoriza a entrada do usuário
      const output = await extractor(text, { pooling: 'mean', normalize: true });
      const userVector = Array.from(output.data as Float32Array);

      // 2. Compara com o Cache (Alta Velocidade)
      let bestMatch = { id: 'fallback', score: 0 };

      for (const intent of intentCache) {
        for (const exVector of intent.vectors) {
          const score = cosineSimilarity(userVector, exVector);
          if (score > bestMatch.score) {
            bestMatch = { id: intent.id, score };
          }
        }
      }

      // Threshold Clínico: 0.4
      const finalId = bestMatch.score >= 0.4 ? bestMatch.id : 'fallback';
      
      self.postMessage({ 
        type: 'result', 
        intentId: finalId, 
        score: bestMatch.score 
      });
    }
  } catch (error: any) {
    self.postMessage({ type: 'error', message: error.message });
  }
};

function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  // Como normalize: true foi usado no extractor, os vetores já são unitários.
  // O dot product de vetores unitários é igual à similaridade de cosseno.
  return dotProduct;
}
