/**
 * @fileOverview AuraWorker - Web Worker otimizado para o UrbeLudo.
 * Gerencia o Transformers.js em uma thread isolada para manter 60 FPS na UI.
 */

import { pipeline, env } from '@xenova/transformers';

// Configuração defensiva do ambiente
try {
  if (env) {
    env.allowLocalModels = true;
    env.allowRemoteModels = true; // Fallback para não travar se os arquivos locais faltarem
    env.localModelPath = '/models/';
  }
} catch (e) {
  console.warn("AuraWorker: Falha ao configurar env de Transformers:", e);
}

let extractor: any = null;
let intentCache: Array<{ id: string, vectors: number[][] }> = [];

self.onmessage = async (event) => {
  const { type, text, examples } = event.data;

  try {
    if (type === 'init') {
      if (!extractor) {
        console.log("🤖 AuraWorker: Inicializando pipeline semantic...");
        
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
          progress_callback: (data: any) => {
            if (data.status === 'progress') {
              self.postMessage({ type: 'progress', progress: Math.round(data.progress) });
            }
          }
        });

        // PRÉ-PROCESSAMENTO: Cache de vetores para todas as intenções (Knowledge Base)
        if (examples && Array.isArray(examples)) {
          console.log("🧠 AuraWorker: Gerando cache de embeddings para intenções...");
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
        
        console.log("✅ AuraWorker: Motor de IA pronto!");
        self.postMessage({ type: 'ready' });
      } else {
        self.postMessage({ type: 'ready' });
      }
    }

    if (type === 'classify' && extractor) {
      if (!text) return;

      // 1. Vetoriza a entrada do usuário
      const output = await extractor(text, { pooling: 'mean', normalize: true });
      const userVector = Array.from(output.data as Float32Array);

      // 2. Compara com o Cache usando Similaridade de Cosseno (Dot Product)
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

      console.log(`[AuraBrain] Input: "${text}" | Best Match: ${bestMatch.id} | Score: ${bestMatch.score.toFixed(4)}`);

      // Threshold Clínico: 0.4 (Ajustado para maior sensibilidade)
      const finalId = bestMatch.score >= 0.4 ? bestMatch.id : 'fallback';
      
      self.postMessage({ 
        type: 'result', 
        intentId: finalId, 
        score: bestMatch.score 
      });
    }
  } catch (error: any) {
    console.error("❌ AuraWorker: Erro fatal:", error);
    self.postMessage({ type: 'error', message: error.message || "Erro desconhecido no Worker" });
  }
};
