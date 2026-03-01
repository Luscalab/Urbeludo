/**
 * @fileOverview Motor de Arquitetura Ludo Online.
 * Refatorado para execução Client-Side (Offline Sovereignty).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { StudioItem } from '@/lib/types';

const GenerateItemInputSchema = z.object({
  prompt: z.string().describe("Descrição criativa do item"),
  category: z.enum(['Essencial', 'Ativo', 'Estético', 'Especial']).default('Estético'),
});
export type GenerateItemInput = z.infer<typeof GenerateItemInputSchema>;

const GenerateItemOutputSchema = z.object({
  item: z.custom<StudioItem>(),
});
export type GenerateItemOutput = z.infer<typeof GenerateItemOutputSchema>;

export async function generateStudioItem(input: GenerateItemInput): Promise<GenerateItemOutput> {
  const architectPrompt = ai.definePrompt({
    name: 'itemArchitect',
    input: { schema: GenerateItemInputSchema },
    output: {
      schema: z.object({
        name: z.string().describe("Nome futurista do item"),
        description: z.string().describe("Descrição poética do item"),
        technicalVisualPrompt: z.string().describe("Prompt detalhado para imagem"),
        suggestedWidth: z.number(),
        suggestedHeight: z.number(),
      })
    },
    prompt: `Você é o Arquiteto Master do UrbeLudo. 
Crie um item para um jogo isométrica futurista baseado em: "{{{prompt}}}".`
  });

  const { output: meta } = await architectPrompt(input);
  if (!meta) throw new Error("Falha na arquitetura.");

  const { media } = await ai.generate({
    model: 'googleai/imagen-3.0-generate-001',
    prompt: meta.technicalVisualPrompt,
  });

  const assetPath = media?.url || `https://picsum.photos/seed/${Date.now()}/400/300`;

  const generatedItem: StudioItem = {
    id: `ai-item-${Date.now()}`,
    name: meta.name,
    description: meta.description,
    category: input.category,
    price: 0,
    assetPath: assetPath,
    dimensions: { 
      width: meta.suggestedWidth || 160, 
      height: meta.suggestedHeight || 140 
    },
    gridSize: { w: 2, h: 2 },
    isAiGenerated: true,
  };

  return { item: generatedItem };
}
