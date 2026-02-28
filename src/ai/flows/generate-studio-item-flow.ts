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
 * Utiliza o picsum.photos com sementes baseadas no prompt para "gerar" a imagem.
 */
export async function generateStudioItem(input: GenerateItemInput): Promise<GenerateItemOutput> {
  const promptLower = input.prompt.toLowerCase();
  
  // Identifica o estilo baseado no prompt usando lógica de "IA de Borda"
  let styleKey = 'padrão';
  if (promptLower.includes('neon') || promptLower.includes('luz') || promptLower.includes('brilhante')) styleKey = 'neon';
  else if (promptLower.includes('madeira') || promptLower.includes('tronco') || promptLower.includes('árvore')) styleKey = 'madeira';
  else if (promptLower.includes('vidro') || promptLower.includes('cristal') || promptLower.includes('transparente')) styleKey = 'vidro';
  else if (promptLower.includes('espaço') || promptLower.includes('estrela') || promptLower.includes('alien')) styleKey = 'espacial';

  const style = STYLE_VARIANTS[styleKey];
  // Gera uma semente determinística baseada na string do prompt
  const seed = input.prompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const randomId = Math.floor(Math.random() * 1000000);
  
  const generatedItem: StudioItem = {
    id: `ai-${Date.now()}-${randomId}`,
    name: `${style.prefix} ${input.prompt.split(' ')[0].toUpperCase()} ${style.suffix}`,
    description: `Uma criação única do Arquiteto Ludo baseada no seu desejo: "${input.prompt}"`,
    category: input.category,
    price: 0, // Itens gerados por IA são recompensas criativas
    assetPath: `https://picsum.photos/seed/${seed + randomId}/400/300`,
    dimensions: { width: 140, height: 120 },
    gridSize: { w: 2, h: 2 },
    isAiGenerated: true,
  };

  // Simula latência de "processamento neural" para imersão
  await new Promise(resolve => setTimeout(resolve, 1800));

  return { item: generatedItem };
}
