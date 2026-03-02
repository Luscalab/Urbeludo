/**
 * @fileOverview AuraWorker - Motor Transformers.js otimizado.
 * Lida com fila de mensagens e carregamento assíncrono para não travar a UI.
 */

import { pipeline, env } from '@xenova/transformers';

// Configurações para ambiente mobile/APK
try {
  env.allowLocalModels = true;
  env.allowRemoteModels = true; 
  env.useBrowserCache = true;
} catch (e) {
  console.error("Erro ao configurar Transformers Env", e);
}

let extractor: any = null;
let intentCache: Array<{ id: string, vectors: number[][] }> = [];
let isInitializing = false;

self.onmessage = async (event) => {
  const { type, text, examples, requestId } = event.data;

  try {
    if (type === 'init') {
      if (isInitializing || extractor) return;
      isInitializing = true;

      self.postMessage({ type: 'log', level: 'info', message: 'Iniciando download do modelo de linguagem...' });
      
      // Carrega o modelo de extração de características (25MB aprox)
      extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        progress_callback: (data: any) => {
          if (data.status === 'progress') {
            self.postMessage({ type: 'progress', progress: Math.round(data.progress) });
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

      // Comparação de Cosseno entre o input e a base de conhecimento
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

      // Threshold de 0.4 para aceitar a intenção local
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
        message: `Análise: "${text.substring(0, 20)}..." | Intenção: ${finalIntentId} | Score: ${bestMatch.score.toFixed(4)}` 
      });
    }
  } catch (error: any) {
    self.postMessage({ type: 'error', requestId, message: error.message || "Falha no Kernel" });
  }
};
