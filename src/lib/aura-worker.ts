/**
 * @fileOverview AuraWorker - Motor Transformers.js otimizado para não travar a UI.
 * Implementa throttling de progresso para evitar inundar a thread principal.
 */

import { pipeline, env } from '@xenova/transformers';

try {
  env.allowLocalModels = true;
  env.allowRemoteModels = true; 
  env.useBrowserCache = true;
} catch (e) {
  console.error("Erro Transformers Env", e);
}

let extractor: any = null;
let intentCache: Array<{ id: string, vectors: number[][] }> = [];
let isInitializing = false;
let lastReportedProgress = -1;

self.onmessage = async (event) => {
  const { type, text, examples, requestId } = event.data;

  try {
    if (type === 'init') {
      if (isInitializing || extractor) return;
      isInitializing = true;

      self.postMessage({ type: 'log', level: 'info', message: 'Iniciando download do modelo de linguagem...' });
      
      extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        progress_callback: (data: any) => {
          if (data.status === 'progress') {
            const rounded = Math.floor(data.progress);
            // Throttle: Só envia mensagem se o progresso mudar em pelo menos 1% inteiro
            if (rounded > lastReportedProgress) {
              lastReportedProgress = rounded;
              self.postMessage({ type: 'progress', progress: rounded });
            }
          }
        }
      });

      if (examples) {
        self.postMessage({ type: 'log', level: 'info', message: 'Vetorizando base de conhecimento clínica...' });
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
      
      isInitializing = false;
      self.postMessage({ type: 'ready' });
      self.postMessage({ type: 'log', level: 'info', message: 'MOTOR SÍNCRONO ATIVO' });
    }

    if (type === 'classify') {
      if (!extractor) {
        self.postMessage({ type: 'result', requestId, intentId: 'fallback' });
        return;
      }

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

      const finalIntentId = bestMatch.score >= 0.4 ? bestMatch.id : 'fallback';

      self.postMessage({ 
        type: 'result', 
        requestId,
        intentId: finalIntentId, 
        score: bestMatch.score 
      });
      
      self.postMessage({ 
        type: 'log', 
        level: 'debug', 
        message: `Análise Local: Score ${bestMatch.score.toFixed(4)} para [${finalIntentId}]` 
      });
    }
  } catch (error: any) {
    self.postMessage({ type: 'error', requestId, message: error.message || "Falha no Kernel" });
  }
};
