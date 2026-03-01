import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Inicialização centralizada do Genkit para UrbeLudo.
 * Sincronizado com a chave de API NEXT_PUBLIC para garantir funcionamento no APK.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyCCwhUNlhnpxjDuZ8quod7MTnde1dZJj04"
    })
  ],
  model: 'googleai/gemini-2.5-flash',
});