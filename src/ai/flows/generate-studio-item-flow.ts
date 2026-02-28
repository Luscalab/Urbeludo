'use server';
/**
 * @fileOverview Master Architect Flow - Geração avançada de itens de estúdio.
 * Utiliza Gemini 2.0 para expandir o prompt criativo e Imagen 4.0 para materialização visual.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { StudioItem } from '@/lib/types';

const GenerateItemInputSchema = z.object({
  prompt: z.string().describe("Descrição criativa do item (ex: 'Uma cama de nuvens neon')"),
  category: z.enum(['Essencial', 'Ativo', 'Estético', 'Especial']).default('Estético'),
});
export type GenerateItemInput = z.infer<typeof GenerateItemInputSchema>;

const GenerateItemOutputSchema = z.object({
  item: z.custom<StudioItem>(),
});
export type GenerateItemOutput = z.infer<typeof GenerateItemOutputSchema>;

/**
 * Prompt para o "Diretor de Arte" da IA que expande o pedido do usuário.
 */
const artDirectorPrompt = ai.definePrompt({
  name: 'artDirectorPrompt',
  input: { schema: GenerateItemInputSchema },
  output: {
    schema: z.object({
      name: z.string(),
      description: z.string(),
      technicalPrompt: z.string().describe("Prompt ultra-detalhado para o gerador de imagens"),
      price: z.number(),
      gridSize: z.object({ w: z.number(), h: z.number() }),
      rarity: z.enum(['Comum', 'Raro', 'Épico', 'Lendário']),
    })
  },
  prompt: `Você é o Arquiteto Chefe do UrbeLudo. 
Sua tarefa é transformar o pedido do usuário "{{prompt}}" em uma peça de design de alta fidelidade para um simulador estilo The Sims.

1. Crie um Nome e uma Descrição poética.
2. Escreva um 'technicalPrompt' em INGLÊS para o Imagen 4. Deve incluir termos como: 
   "High-quality 2D isometric sprite", "isolated on white background", "professional studio lighting", 
   "PBR textures", "4k detail", "consistent perspective".
3. Defina o tamanho no grid (1x1, 2x2, etc) e uma raridade baseada no conceito.`,
});

/**
 * Fluxo principal de geração avançada.
 */
export async function generateStudioItem(input: GenerateItemInput): Promise<GenerateItemOutput> {
  return generateStudioItemFlow(input);
}

const generateStudioItemFlow = ai.defineFlow(
  {
    name: 'generateStudioItemFlow',
    inputSchema: GenerateItemInputSchema,
    outputSchema: GenerateItemOutputSchema,
  },
  async (input) => {
    // 1. O Gemini atua como Diretor de Arte para refinar o conceito
    const { output: artDirection } = await artDirectorPrompt(input);
    if (!artDirection) throw new Error("O Diretor de Arte da IA falhou em conceber o item.");

    // 2. O Imagen 4.0 materializa a visão com o prompt técnico expandido
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: artDirection.technicalPrompt,
    });

    if (!media || !media.url) {
      throw new Error("Falha na materialização visual do item.");
    }

    // 3. Montar o StudioItem avançado
    const generatedItem: StudioItem = {
      id: `ai-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      name: artDirection.name,
      description: artDirection.description,
      category: input.category,
      price: artDirection.price || 500,
      assetPath: media.url,
      dimensions: { 
        width: artDirection.gridSize.w * 80, 
        height: artDirection.gridSize.h * 60 + 40 
      },
      gridSize: artDirection.gridSize,
      isAiGenerated: true,
    };

    return { item: generatedItem };
  }
);
