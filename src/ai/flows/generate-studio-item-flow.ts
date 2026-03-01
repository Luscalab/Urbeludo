
'use server';
/**
 * @fileOverview Motor de Arquitetura Ludo Online.
 * Utiliza o Gemini 2.0 Flash para estruturar o design e o Imagen 4.0 para materializar o item.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { StudioItem } from '@/lib/types';

const GenerateItemInputSchema = z.object({
  prompt: z.string().describe("Descrição criativa do item (ex: sofá de neon, piso de mármore)"),
  category: z.enum(['Essencial', 'Ativo', 'Estético', 'Especial']).default('Estético'),
});
export type GenerateItemInput = z.infer<typeof GenerateItemInputSchema>;

const GenerateItemOutputSchema = z.object({
  item: z.custom<StudioItem>(),
});
export type GenerateItemOutput = z.infer<typeof GenerateItemOutputSchema>;

/**
 * Gera um item de estúdio completo utilizando Inteligência Artificial de Borda.
 */
export async function generateStudioItem(input: GenerateItemInput): Promise<GenerateItemOutput> {
  // 1. O Gemini atua como "Diretor de Arte" para planejar os metadados
  const architectPrompt = ai.definePrompt({
    name: 'itemArchitect',
    input: { schema: GenerateItemInputSchema },
    output: {
      schema: z.object({
        name: z.string().describe("Nome futurista do item"),
        description: z.string().describe("Descrição poética do item"),
        technicalVisualPrompt: z.string().describe("Prompt detalhado em INGLÊS para geração de imagem"),
        suggestedWidth: z.number().describe("Largura sugerida em pixels (ex: 120-220)"),
        suggestedHeight: z.number().describe("Altura sugerida em pixels (ex: 100-240)"),
      })
    },
    prompt: `Você é o Arquiteto Master do UrbeLudo. 
O usuário deseja: "{{{prompt}}}". 
Crie um item para um jogo de simulação social isométrico estilo 2026.
O prompt visual deve especificar: "isometric 2.5D game furniture, clean white background, digital art style, high quality textures, cyberpunk aesthetic".`
  });

  const { output: meta } = await architectPrompt(input);
  if (!meta) throw new Error("Falha na arquitetura do item.");

  // 2. O Imagen materializa o asset visual
  const { media } = await ai.generate({
    model: 'googleai/imagen-3.0-generate-001',
    prompt: meta.technicalVisualPrompt,
  });

  // Fallback caso a geração de imagem falhe por safety ou cota
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
