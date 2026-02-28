
'use server';
/**
 * @fileOverview Flow para proposição de desafios dinâmicos, seguros e lúdicos.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProposeDynamicChallengesInputSchema = z.object({
  detectedElements: z.array(z.string()).optional().default([]),
  userSkillLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  userAgeGroup: z.enum(['preschool', 'school_age', 'adolescent_adult']).default('adolescent_adult'),
  psychomotorLevel: z.number().min(1).max(4).default(1),
  missionType: z.enum(['home', 'street']).default('street'),
});
export type ProposeDynamicChallengesInput = z.infer<typeof ProposeDynamicChallengesInputSchema>;

const ProposeDynamicChallengesOutputSchema = z.object({
  challengeTitle: z.string(),
  challengeDescription: z.string(),
  challengeType: z.enum(['balance', 'jump', 'crawl', 'lateral_movement', 'spatial_awareness', 'strength', 'rhythm', 'creative']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  ludoCoinsReward: z.number(),
  isLudicDrawing: z.boolean().describe('Se o desafio envolve desenhar algo no chão ou criar arte urbana temporária.'),
  steps: z.array(z.string()).describe('Lista de 2 a 3 passos para garantir a execução da atividade.'),
});
export type ProposeDynamicChallengesOutput = z.infer<typeof ProposeDynamicChallengesOutputSchema>;

export async function proposeDynamicChallenges(input: ProposeDynamicChallengesInput): Promise<ProposeDynamicChallengesOutput> {
  return proposeDynamicChallengesFlow(input);
}

const proposeDynamicChallengesPrompt = ai.definePrompt({
  name: 'proposeDynamicChallengesPrompt',
  input: {schema: ProposeDynamicChallengesInputSchema},
  output: {schema: ProposeDynamicChallengesOutputSchema},
  prompt: `Você é o Mestre do Movimento e Designer de Segurança do UrbeLudo.

REGRA DE OURO DE SEGURANÇA:
- JAMAIS sugira atividades em avenidas, ruas movimentadas, locais com tráfego de carros ou áreas perigosas.
- O foco deve ser calçadas amplas, praças, parques ou espaços internos (Casa).
- Se os elementos detectados parecerem perigosos, sugira uma alternativa segura próxima (ex: "Procure um banco de praça calmo").

ESTRUTURA PSICOMOTORA:
- Level 1 (Alicerce): Equilíbrio estático, consciência corporal.
- Level 2 (Movimento): Locomoção simples, evitar obstáculos.
- Level 3 (Precisão): Saltos direcionados, controle motor fino.
- Level 4 (Ritmo): Sequências rítmicas.

MISSÕES LÚDICAS:
- Frequentemente inclua desafios criativos, como "Desenhe um círculo imaginário com giz ou galho e pule dentro dele".
- Peça para o usuário "criar uma pose de herói" ou "desenhar uma trilha no chão".

ENTREGA:
- Gere 2 ou 3 passos claros (steps).
- Atribua recompensas (10-50 LudoCoins).
- Se isLudicDrawing for true, o desafio deve envolver uma criação visual que possa ser fotografada.

Contexto Atual:
- Tipo: {{{missionType}}}
- Idade: {{{userAgeGroup}}}
- Nível: {{{psychomotorLevel}}}
- Elementos: {{#each detectedElements}}{{{this}}}, {{/each}}
`,
});

const proposeDynamicChallengesFlow = ai.defineFlow(
  {
    name: 'proposeDynamicChallengesFlow',
    inputSchema: ProposeDynamicChallengesInputSchema,
    outputSchema: ProposeDynamicChallengesOutputSchema,
  },
  async input => {
    const {output} = await proposeDynamicChallengesPrompt(input);
    return output!;
  }
);
