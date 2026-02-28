
'use client';
/**
 * @fileOverview Motor de Desafios Offline para arquitetura Standalone.
 * Seleciona desafios do banco de dados estático.
 */

import { OFFLINE_CHALLENGE_DB } from '@/lib/challenge-db';
import { z } from 'zod';

const ProposeDynamicChallengesInputSchema = z.object({
  category: z.enum(['Arte', 'Motor', 'Mente', 'Zen']).default('Motor'),
  psychomotorLevel: z.number().min(1).max(4).default(1),
});

export type ProposeDynamicChallengesInput = z.infer<typeof ProposeDynamicChallengesInputSchema>;

export interface ProposeDynamicChallengesOutput {
  challengeTitle: string;
  challengeDescription: string;
  challengeType: string;
  difficulty: 'easy' | 'medium' | 'hard';
  ludoCoinsReward: number;
  isLudicDrawing: boolean;
  steps: [string, string, string];
}

/**
 * Seleciona um desafio do banco de dados local de forma inteligente.
 */
export async function proposeDynamicChallenges(input: ProposeDynamicChallengesInput): Promise<ProposeDynamicChallengesOutput> {
  const categoryChallenges = OFFLINE_CHALLENGE_DB[input.category] || OFFLINE_CHALLENGE_DB['Motor'];
  
  // Filtra por nível se necessário, ou apenas sorteia para o MVP
  const randomIndex = Math.floor(Math.random() * categoryChallenges.length);
  return categoryChallenges[randomIndex];
}
