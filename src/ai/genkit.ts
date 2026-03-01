
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Inicialização centralizada do Genkit para UrbeLudo.
 * Sincronizado com a chave de API do Google AI Studio fornecida pelo usuário.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY
    })
  ],
  model: 'googleai/gemini-2.5-flash',
});
