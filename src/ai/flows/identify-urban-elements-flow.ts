/**
 * @fileOverview Identificação de elementos urbanos.
 * Refatorado para execução Client-Side (Offline Sovereignty).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UrbanElementSchema = z.object({
  type: z.enum(['line', 'step', 'wall', 'other']),
  description: z.string(),
  location: z.string()
});

const IdentifyUrbanElementsInputSchema = z.object({
  webcamFeedDataUri: z.string()
});
export type IdentifyUrbanElementsInput = z.infer<typeof IdentifyUrbanElementsInputSchema>;

const IdentifyUrbanElementsOutputSchema = z.object({
  elements: z.array(UrbanElementSchema)
});
export type IdentifyUrbanElementsOutput = z.infer<typeof IdentifyUrbanElementsOutputSchema>;

export async function identifyUrbanElements(input: IdentifyUrbanElementsInput): Promise<IdentifyUrbanElementsOutput> {
  const identifyUrbanElementsPrompt = ai.definePrompt({
    name: 'identifyUrbanElementsPrompt',
    input: {schema: IdentifyUrbanElementsInputSchema},
    output: {schema: IdentifyUrbanElementsOutputSchema},
    prompt: `Analise a imagem da webcam e identifique elementos arquitetônicos (linhas, degraus, muros).
    
    Imagem: {{media url=webcamFeedDataUri}}`
  });

  const {output} = await identifyUrbanElementsPrompt(input);
  return output!;
}
