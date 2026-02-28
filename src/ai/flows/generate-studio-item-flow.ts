'use server';
/**
 * @fileOverview Motor de Arquitetura Ludo (Offline).
 * Gera itens de estúdio de forma determinística baseada em palavras-chave, 
 * simulando o comportamento de uma IA sem exigir chaves de API.
 */

import { z } from 'zod';
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

// Banco de dados de estilos visuais para a "IA" offline
const STYLE_VARIANTS: Record<string, { prefix: string, suffix: string, color: string, imgId: string }> = {
  'neon': { prefix: 'Neon', suffix: 'Fluorescente', color: '#ff00ff', imgId: '1' },
  'madeira': { prefix: 'Rústico', suffix: 'de Carvalho', color: '#8B4513', imgId: '2' },
  'vidro': { prefix: 'Cristal', suffix: 'Líquido', color: '#00ffff', imgId: '3' },
  'espacial': { prefix: 'Galáctico', suffix: 'Sideral', color: '#000033', imgId: '4' },
  'padrão': { prefix: 'Moderno', suffix: 'UrbeLudo', color: '#9333ea', imgId: '5' }
};

/**
 * Simula a geração de um item através de análise de palavras-chave.
 */
export async function generateStudioItem(input: GenerateItemInput): Promise<GenerateItemOutput> {
  const promptLower = input.prompt.toLowerCase();
  
  // Identifica o estilo baseado no prompt
  let styleKey = 'padrão';
  if (promptLower.includes('neon') || promptLower.includes('luz')) styleKey = 'neon';
  else if (promptLower.includes('madeira') || promptLower.includes('tronco')) styleKey = 'madeira';
  else if (promptLower.includes('vidro') || promptLower.includes('transparente')) styleKey = 'vidro';
  else if (promptLower.includes('espaço') || promptLower.includes('alien')) styleKey = 'espacial';

  const style = STYLE_VARIANTS[styleKey];
  const randomSeed = Math.floor(Math.random() * 1000);
  
  const generatedItem: StudioItem = {
    id: `ai-${Date.now()}-${randomSeed}`,
    name: `${style.prefix} ${input.prompt.split(' ')[0]} ${style.suffix}`,
    description: `Uma criação única do Arquiteto Ludo baseada no seu desejo: "${input.prompt}"`,
    category: input.category,
    price: 0, // Itens de IA são recompensas criativas
    assetPath: `https://picsum.photos/seed/${randomSeed}/400/300`,
    dimensions: { width: 140, height: 120 },
    gridSize: { w: 2, h: 2 },
    isAiGenerated: true,
  };

  // Simula latência de processamento da "IA"
  await new Promise(resolve => setTimeout(resolve, 1500));

  return { item: generatedItem };
}
