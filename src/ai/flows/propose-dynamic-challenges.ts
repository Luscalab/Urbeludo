
'use server';
/**
 * @fileOverview Flow para proposição de desafios dinâmicos com fallback offline para APK.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProposeDynamicChallengesInputSchema = z.object({
  detectedElements: z.array(z.string()).optional().default([]),
  userSkillLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  userAgeGroup: z.enum(['preschool', 'school_age', 'adolescent_adult']).default('adolescent_adult'),
  psychomotorLevel: z.number().min(1).max(4).default(1),
  missionType: z.enum(['home', 'street']).default('street'),
  category: z.enum(['Arte', 'Motor', 'Mente', 'Zen']).default('Motor'),
});
export type ProposeDynamicChallengesInput = z.infer<typeof ProposeDynamicChallengesInputSchema>;

const ProposeDynamicChallengesOutputSchema = z.object({
  challengeTitle: z.string(),
  challengeDescription: z.string(),
  challengeType: z.enum(['balance', 'jump', 'crawl', 'lateral_movement', 'spatial_awareness', 'strength', 'rhythm', 'creative', 'memory_game', 'breathing']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  ludoCoinsReward: z.number(),
  isLudicDrawing: z.boolean().describe('Se o desafio envolve desenhar algo no chão.'),
  steps: z.tuple([z.string(), z.string(), z.string()]).describe('Exatamente 3 passos.'),
});
export type ProposeDynamicChallengesOutput = z.infer<typeof ProposeDynamicChallengesOutputSchema>;

/**
 * Catálogo de desafios estáticos para o "Modo de Emergência Pedagógico" (Offline).
 */
const OFFLINE_CHALLENGES: Record<string, ProposeDynamicChallengesOutput[]> = {
  'Motor': [
    {
      challengeTitle: "Equilíbrio na Fita",
      challengeDescription: "Crie uma linha reta no chão e caminhe sobre ela.",
      challengeType: "balance",
      difficulty: "easy",
      ludoCoinsReward: 20,
      isLudicDrawing: false,
      steps: ["Encontre uma linha ou use fita crepe", "Caminhe pé ante pé", "Mantenha os braços abertos"]
    }
  ],
  'Arte': [
    {
      challengeTitle: "Grafite Espacial",
      challengeDescription: "Desenhe um círculo perfeito com o seu corpo.",
      challengeType: "creative",
      difficulty: "medium",
      ludoCoinsReward: 30,
      isLudicDrawing: true,
      steps: ["Estique os braços para os lados", "Gire lentamente no mesmo lugar", "Visualize o rastro roxo no visor"]
    }
  ],
  'Zen': [
    {
      challengeTitle: "Postura da Árvore",
      challengeDescription: "Mantenha o equilíbrio estático por 10 segundos.",
      challengeType: "breathing",
      difficulty: "easy",
      ludoCoinsReward: 15,
      isLudicDrawing: false,
      steps: ["Fique em um pé só", "Junte as mãos no peito", "Respire fundo três vezes"]
    }
  ],
  'Mente': [
    {
      challengeTitle: "Sequência de Toques",
      challengeDescription: "Toque em três objetos de cores diferentes.",
      challengeType: "memory_game",
      difficulty: "easy",
      ludoCoinsReward: 25,
      isLudicDrawing: false,
      steps: ["Identifique algo Azul, Verde e Vermelho", "Toque neles nessa ordem", "Volte para a base dando um pulo"]
    }
  ]
};

export async function proposeDynamicChallenges(input: ProposeDynamicChallengesInput): Promise<ProposeDynamicChallengesOutput> {
  try {
    const {output} = await proposeDynamicChallengesPrompt(input);
    return output!;
  } catch (error) {
    // Modo de Emergência Pedagógico: Retorna desafio estático se a IA falhar (Offline)
    const categoryChallenges = OFFLINE_CHALLENGES[input.category] || OFFLINE_CHALLENGES['Motor'];
    return categoryChallenges[Math.floor(Math.random() * categoryChallenges.length)];
  }
}

const proposeDynamicChallengesPrompt = ai.definePrompt({
  name: 'proposeDynamicChallengesPrompt',
  input: {schema: ProposeDynamicChallengesInputSchema},
  output: {schema: ProposeDynamicChallengesOutputSchema},
  prompt: `Você é o Mestre do Movimento do UrbeLudo. Crie um desafio psicomotores lúdico e seguro.
Categoria: {{{category}}}
Level: {{{psychomotorLevel}}}
Contexto: {{{missionType}}} na faixa {{{userAgeGroup}}}.
Retorne 3 passos claros e criativos.`,
});
