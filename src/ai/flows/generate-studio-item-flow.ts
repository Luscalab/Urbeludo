'use server';
/**
 * @fileOverview Motor de Arquitetura Ludo Online.
 * Utiliza Gemini para planejar o item e Imagen para gerar o asset visual.
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

/**
 * Gera um item de estúdio completo usando IA Online.
 */
export async function generateStudioItem(input: GenerateItemInput): Promise<GenerateItemOutput> {
  // 1. Usar Gemini para "arquitetar" os metadados do item
  const architectPrompt = ai.definePrompt({
    name: 'itemArchitect',
    input: { schema: GenerateItemInputSchema },
    output: {
      schema: z.object({
        name: z.string(),
        description: z.string(),
        suggestedVisualPrompt: z.string(),
      })
    },
    prompt: `Você é o Arquiteto Chefe do UrbeLudo. 
Com base no desejo do usuário: "{{{prompt}}}", crie um nome futurista e uma descrição poética.
Também crie um prompt técnico em INGLÊS para um gerador de imagens focado em "isometric 2.5D game furniture, clean white background, high quality digital art, cyberpunk aesthetic".`
  });

  const { output: meta } = await architectPrompt(input);
  if (!meta) throw new Error("Falha na arquitetura do item.");

  // 2. Usar Imagen para gerar o asset visual
  const { media } = await ai.generate({
    model: 'googleai/imagen-3.0-generate-001',
    prompt: meta.suggestedVisualPrompt,
  });

  const assetPath = media?.url || `https://picsum.photos/seed/${Date.now()}/400/300`;

  const generatedItem: StudioItem = {
    id: `ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: meta.name,
    description: meta.description,
    category: input.category,
    price: 0,
    assetPath: assetPath,
    dimensions: { width: 140, height: 120 },
    gridSize: { w: 2, h: 2 },
    isAiGenerated: true,
  };

  return { item: generatedItem };
}
