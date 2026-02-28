
'use server';
/**
 * @fileOverview Flow para proposição de desafios dinâmicos, seguros e lúdicos, agora categorizados.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProposeDynamicChallengesInputSchema = z.object({
  detectedElements: z.array(z.string()).optional().default([]),
  userSkillLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  userAgeGroup: z.enum(['preschool', 'school_age', 'adolescent_adult']).default('adolescent_adult'),
  psychomotorLevel: z.number().min(1).max(4).default(1),
  missionType: z.enum(['home', 'street']).default('street'),
  category: z.enum(['artistic', 'motor', 'memory', 'relaxation']).default('motor'),
});
export type ProposeDynamicChallengesInput = z.infer<typeof ProposeDynamicChallengesInputSchema>;

const ProposeDynamicChallengesOutputSchema = z.object({
  challengeTitle: z.string(),
  challengeDescription: z.string(),
  challengeType: z.enum(['balance', 'jump', 'crawl', 'lateral_movement', 'spatial_awareness', 'strength', 'rhythm', 'creative', 'memory_game', 'breathing']),
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
  prompt: `Você é o Mestre do Movimento do UrbeLudo. Seu objetivo é criar desafios psicomotores lúdicos, seguros e categorizados.

CATEGORIA DA MISSÃO: {{{category}}}
- artistic: Foco em desenho lúdico, formas e cores no ambiente.
- motor: Foco em equilíbrio, saltos, locomoção e força.
- memory: Desafios de memorização espacial (ex: toque em 3 elementos na ordem X).
- relaxation: Alongamentos, respiração consciente e posturas estáticas.

REGRA DE OURO DE SEGURANÇA:
- JAMAIS sugira atividades em locais com tráfego de carros, avenidas ou calçadas estreitas.
- O foco deve ser espaços seguros e controlados: Calçadas amplas, praças, parques ou o interior da Casa do usuário.

ESTRUTURA PSICOMOTORA (Level {{{psychomotorLevel}}}):
- Level 1: Equilíbrio estático e consciência corporal.
- Level 2: Locomoção e desvio de obstáculos.
- Level 3: Saltos e precisão.
- Level 4: Sequências rítmicas.

CONTEXTO:
- Tipo: {{{missionType}}}
- Idade: {{{userAgeGroup}}}
- Habilidade: {{{userSkillLevel}}}
- Elementos Detectados: {{#each detectedElements}}{{{this}}}, {{/each}}

Gere um desafio criativo alinhado à categoria selecionada com passos claros. Atribua uma recompensa de 10 a 50 LudoCoins.`,
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
      return {
        challengeTitle: "Respiro de Bronze",
        challengeDescription: "Feche os olhos e respire fundo 3 vezes.",
        challengeType: "breathing",
        difficulty: "easy",
        ludoCoinsReward: 15,
        isLudicDrawing: false,
        steps: [
          "Encontre um lugar calmo e seguro",
          "Respire pelo nariz por 4 segundos",
          "Solte o ar pela boca lentamente"
        ]
      };
    }
  }
);
