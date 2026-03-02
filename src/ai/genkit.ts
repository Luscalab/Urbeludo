import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Inicialização Genkit 2026 - UrbeLudo.
 * Atualizado para gemini-3-flash-preview.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
    })
  ],
  model: 'googleai/gemini-3-flash-preview',
});
