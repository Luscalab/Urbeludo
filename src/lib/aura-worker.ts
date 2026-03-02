/**
 * @fileOverview AuraWorker - Motor Transformers.js otimizado para não travar a UI.
 * Implementa cache local via IndexedDB e throttling de progresso.
 */

import { pipeline, env } from '@xenova/transformers';

// Configuração de ambiente para cache agressivo no APK/Navegador
try {
  env.allowLocalModels = false; // Força uso do repositório remoto ou cache
  env.useBrowserCache = true;   // Vital para armazenar o modelo no IndexedDB
} catch (e) {
  console.error("Erro na configuração do ambiente Transformers", e);
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

      self.postMessage({ type: 'log', level: 'info', message: 'Sincronizando modelo de linguagem semantic-mini...' });
      
      // Carrega o modelo all-MiniLM-L6-v2 (leve e eficiente para mobile)
      extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        progress_callback: (data: any) => {
          if (data.status === 'progress') {
            const rounded = Math.floor(data.progress);
            // Evita inundar a UI com mensagens redundantes
            if (rounded > lastReportedProgress) {
              lastReportedProgress = rounded;
              self.postMessage({ type: 'progress', progress: rounded });
            }
          }
        }
      });

      if (examples) {
        self.postMessage({ type: 'log', level: 'info', message: 'Vetorizando base de conhecimento clínica local...' });
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
      self.postMessage({ type: 'log', level: 'info', message: 'KERNEL DE IA LOCAL OPERACIONAL' });
    }

    if (type === 'classify') {
      if (!extractor) {
        self.postMessage({ type: 'result', requestId, intentId: 'fallback' });
        return;
      }

      // Converte entrada do usuário em vetor numérico
      const output = await extractor(text, { pooling: 'mean', normalize: true });
      const userVector = Array.from(output.data as Float32Array);

      let bestMatch = { id: 'fallback', score: 0 };

      // Compara com as intenções clínicas salvas (Similaridade de Cosseno)
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

      // Threshold de confiança clínica: 0.45
      const finalIntentId = bestMatch.score >= 0.45 ? bestMatch.id : 'fallback';

      self.postMessage({ 
        type: 'result', 
        requestId,
        intentId: finalIntentId, 
        score: bestMatch.score 
      });
      
      self.postMessage({ 
        type: 'log', 
        level: 'debug', 
        message: `Classificação Local: Score ${bestMatch.score.toFixed(4)} -> [${finalIntentId}]` 
      });
    }
  } catch (error: any) {
    self.postMessage({ type: 'error', requestId, message: error.message || "Falha no motor Transformers" });
  }
};
