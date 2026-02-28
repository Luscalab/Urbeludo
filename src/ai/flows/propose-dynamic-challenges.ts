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
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      }
    ],
  },
  prompt: `Você é o Mestre do Movimento do UrbeLudo. Seu objetivo é criar desafios psicomotores lúdicos e seguros.

REGRA DE OURO DE SEGURANÇA:
- JAMAIS sugira atividades em locais com tráfego de carros.
- O foco deve ser espaços seguros: Calçadas amplas, praças ou o interior da Casa do usuário.

OBJETIVO DA MISSÃO:
Tipo: {{{missionType}}} (Se for 'home', foque em objetos domésticos como cadeiras, tapetes ou linhas no piso. Se for 'street', use os elementos detectados).

ESTRUTURA PSICOMOTORA (Level {{{psychomotorLevel}}}):
- Level 1: Equilíbrio estático e consciência corporal.
- Level 2: Locomoção e desvio de obstáculos.
- Level 3: Saltos e precisão.
- Level 4: Sequências rítmicas.

CONTEXTO DO USUÁRIO:
- Idade: {{{userAgeGroup}}}
- Habilidade: {{{userSkillLevel}}}
- Elementos Detectados: {{#each detectedElements}}{{{this}}}, {{/each}}

INSTRUÇÕES DE SAÍDA:
Gere um desafio criativo com um título empolgante, uma descrição curta e 2 a 3 passos claros de execução. Atribua uma recompensa de 10 a 50 LudoCoins.`,
});

const proposeDynamicChallengesFlow = ai.defineFlow(
  {
    name: 'proposeDynamicChallengesFlow',
    inputSchema: ProposeDynamicChallengesInputSchema,
    outputSchema: ProposeDynamicChallengesOutputSchema,
  },
  async input => {
    try {
      const {output} = await proposeDynamicChallengesPrompt(input);
      if (!output) throw new Error("IA não gerou resposta");
      return output;
    } catch (error) {
      console.error("Erro no Flow de Desafios:", error);
      // Fallback para garantir que o usuário não fique travado
      return {
        challengeTitle: "Equilíbrio de Bronze",
        challengeDescription: "Fique em um pé só por 10 segundos para despertar seu corpo.",
        challengeType: "balance",
        difficulty: "easy",
        ludoCoinsReward: 15,
        isLudicDrawing: false,
        steps: [
          "Encontre um espaço livre no chão",
          "Levante o pé direito e conte até 10",
          "Troque de pé e repita"
        ]
      };
    }
  }
);
