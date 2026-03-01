/**
 * @fileOverview AuraWorker - Web Worker dedicado para processamento de IA de Borda.
 * Executa o Transformers.js em uma thread separada para evitar travamentos na UI.
 */

import { pipeline, env } from '@xenova/transformers';

// Configuração para carregamento LOCAL (Pasta public/models/)
// Essencial para funcionamento 100% Offline no APK
env.allowLocalModels = true;
env.remoteModels = false;
env.localModelPath = '/models/';

let extractor: any = null;

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
        self.postMessage({ type: 'ready' });
      } else {
        self.postMessage({ type: 'ready' });
      }
    }

    if (type === 'classify' && extractor) {
      // 1. Vetoriza a entrada do usuário
      const output = await extractor(text, { pooling: 'mean', normalize: true });
      const userVector = Array.from(output.data as Float32Array);

      // 2. Compara com as intenções âncoras (Similaridade de Cosseno)
      let bestMatch = { id: 'fallback', score: 0 };

      for (const intent of examples) {
        for (const exampleText of intent.examples) {
          const exOutput = await extractor(exampleText, { pooling: 'mean', normalize: true });
          const exVector = Array.from(exOutput.data as Float32Array);
          
          const score = cosineSimilarity(userVector, exVector);
          if (score > bestMatch.score) {
            bestMatch = { id: intent.id, score };
          }
        }
      }

      // Threshold ajustado para 0.4 para maior flexibilidade linguística
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
