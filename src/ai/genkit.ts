
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Inicialização Genkit 2026 - UrbeLudo.
 * Modelo: gemini-3-flash-preview para máxima performance.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
    })
  ],
  model: 'googleai/gemini-3-flash-preview',
});
