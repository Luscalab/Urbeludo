
'use server';
/**
 * @fileOverview Flow para gerar itens de estúdio (móveis/decoração) usando IA.
 * Utiliza Gemini para metadados e Imagen para o visual.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { StudioItem } from '@/lib/types';

const GenerateItemInputSchema = z.object({
  prompt: z.string().describe("Descrição do item a ser gerado (ex: 'Uma poltrona de neon azul futurista')"),
  category: z.enum(['Essencial', 'Ativo', 'Estético', 'Especial']).default('Estético'),
});
export type GenerateItemInput = z.infer<typeof GenerateItemInputSchema>;

const GenerateItemOutputSchema = z.object({
  item: z.custom<StudioItem>(),
});
export type GenerateItemOutput = z.infer<typeof GenerateItemOutputSchema>;

/**
 * Gera um item completo para o Studio usando Genkit.
 */
export async function generateStudioItem(input: GenerateItemInput): Promise<GenerateItemOutput> {
  return generateStudioItemFlow(input);
}

const itemMetadataPrompt = ai.definePrompt({
  name: 'itemMetadataPrompt',
  input: { schema: GenerateItemInputSchema },
  output: {
    schema: z.object({
      name: z.string(),
      description: z.string(),
      price: z.number(),
      dimensions: z.object({
        width: z.number(),
        height: z.number(),
      }),
      gridSize: z.object({
        w: z.number(),
        h: z.number(),
      }),
    })
  },
  prompt: `Você é o Designer Chefe do UrbeLudo. Crie os metadados para um novo item de estúdio baseado na descrição: "{{prompt}}".
O item pertence à categoria "{{category}}".
Defina um nome criativo, uma descrição curta e poética, e dimensões realistas para um grid isométrico (múltiplos de 20px).
Grid size deve ser pequeno (ex: 1x1, 2x1, 2x2).`,
});

const generateStudioItemFlow = ai.defineFlow(
  {
    name: 'generateStudioItemFlow',
    inputSchema: GenerateItemInputSchema,
    outputSchema: GenerateItemOutputSchema,
  },
  async (input) => {
    // 1. Gerar metadados com Gemini
    const { output: metadata } = await itemMetadataPrompt(input);
    if (!metadata) throw new Error("Falha ao gerar metadados do item");

    // 2. Gerar visual com Imagen
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `A high-quality 2D isometric sprite of ${input.prompt}. 
      Minimalist digital art style, clean lines, white background, suitable for a professional architectural simulation game like The Sims. 
      Professional lighting, high detail.`,
    });

    if (!media || !media.url) {
      throw new Error("Falha ao gerar visual do item");
    }

    // 3. Montar o objeto StudioItem
    const generatedItem: StudioItem = {
      id: `gen-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      name: metadata.name,
      description: metadata.description,
      category: input.category,
      price: metadata.price || 200,
      assetPath: media.url, // O Imagen retorna dataURI (base64)
      dimensions: metadata.dimensions,
      gridSize: metadata.gridSize,
      isAiGenerated: true,
    };

    return { item: generatedItem };
  }
);
