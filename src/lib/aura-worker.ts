/**
 * @fileOverview AuraWorker - Web Worker otimizado para o UrbeLudo.
 * Gerencia o Transformers.js em uma thread isolada para manter 60 FPS na UI.
 */

import { pipeline, env } from '@xenova/transformers';

// Configuração defensiva do ambiente
try {
  if (env) {
    env.allowLocalModels = true;
    env.allowRemoteModels = true; 
    env.localModelPath = '/models/';
  }
} catch (e) {
  // Envia log de erro para o main thread via postMessage
  self.postMessage({ type: 'log', level: 'error', message: 'Falha ao configurar Transformers env', data: e });
}

let extractor: any = null;
let intentCache: Array<{ id: string, vectors: number[][] }> = [];

self.onmessage = async (event) => {
  const { type, text, examples } = event.data;

  try {
    if (type === 'init') {
      if (!extractor) {
        self.postMessage({ type: 'log', level: 'info', message: 'Iniciando pipeline Transformers.js...' });
        
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
          progress_callback: (data: any) => {
            if (data.status === 'progress') {
              self.postMessage({ type: 'progress', progress: Math.round(data.progress) });
            }
          }
        });

        if (examples && Array.isArray(examples)) {
          self.postMessage({ type: 'log', level: 'info', message: 'Gerando embeddings para intenções locais...' });
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
        self.postMessage({ type: 'log', level: 'info', message: 'AuraWorker pronto e cacheado.' });
      } else {
        self.postMessage({ type: 'ready' });
      }
    }

    if (type === 'classify' && extractor) {
      if (!text) return;

      self.postMessage({ type: 'log', level: 'debug', message: `Classificando: "${text}"` });
      const output = await extractor(text, { pooling: 'mean', normalize: true });
      const userVector = Array.from(output.data as Float32Array);

      let bestMatch = { id: 'fallback', score: 0 };

      for (const intent of intentCache) {
        for (const exVector of intent.vectors) {
          let dotProduct = 0;
          for (let i = 0; i < userVector.length; i++) {
            dotProduct += userVector[i] * exVector[i];
          }
          
          if (dotProduct > bestMatch.score) {
            bestMatch = { id: intent.id, score: dotProduct };
          }
        }
      }

      self.postMessage({ 
        type: 'result', 
        intentId: bestMatch.score >= 0.4 ? bestMatch.id : 'fallback', 
        score: bestMatch.score 
      });
      
      self.postMessage({ 
        type: 'log', 
        level: 'info', 
        message: `Resultado: ${bestMatch.id} (Score: ${bestMatch.score.toFixed(4)})` 
      });
    }
  } catch (error: any) {
    self.postMessage({ type: 'error', message: error.message || "Erro no Worker" });
    self.postMessage({ type: 'log', level: 'error', message: 'Erro fatal no Worker', data: error });
  }
};
