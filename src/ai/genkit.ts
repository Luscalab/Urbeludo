import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Inicialização centralizada do Genkit.
 * Nota: Certifique-se de configurar a GEMINI_API_KEY no seu ambiente do Firebase App Hosting.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
    })
  ],
  model: 'googleai/gemini-2.5-flash',
});
