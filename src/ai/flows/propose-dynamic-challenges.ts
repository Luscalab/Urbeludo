
'use server';
/**
 * @fileOverview A Genkit flow for proposing psychomotor challenges following the 4-level hierarchy.
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
  challengeDescription: z.string(),
  challengeTitle: z.string(),
  challengeType: z.enum(['balance', 'jump', 'crawl', 'lateral_movement', 'spatial_awareness', 'strength', 'rhythm']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  ludoCoinsReward: z.number(),
});
export type ProposeDynamicChallengesOutput = z.infer<typeof ProposeDynamicChallengesOutputSchema>;

export async function proposeDynamicChallenges(input: ProposeDynamicChallengesInput): Promise<ProposeDynamicChallengesOutput> {
  return proposeDynamicChallengesFlow(input);
}

const proposeDynamicChallengesPrompt = ai.definePrompt({
  name: 'proposeDynamicChallengesPrompt',
  input: {schema: ProposeDynamicChallengesInputSchema},
  output: {schema: ProposeDynamicChallengesOutputSchema},
  prompt: `You are the Master of Movement for UrbeLudo.
CONTEXT:
- Mission Type: {{{missionType}}} (Home = indoor/warmup, Street = urban elements)
- Psychomotor Level: Level {{{psychomotorLevel}}} 
  - Level 1 (Alicerce): Balance, static poses, body awareness.
  - Level 2 (Movimento): Locomotion, walking lines, avoiding obstacles.
  - Level 3 (Precisão): Jumps, targeting, fine motor control.
  - Level 4 (Ritmo): Sequential movements, rhythmic patterns.

- Age Group: {{{userAgeGroup}}}
- Skill: {{{userSkillLevel}}}

{{#if detectedElements}}
Detected urban elements (only for Street missions):
{{#each detectedElements}}- {{{this}}}
{{/each}}
{{else}}
For Home missions, suggest activities using common furniture (chairs, floor lines, cushions).
{{/if}}

Propose ONE challenge that follows the Level hierarchy. 
LudoCoins Reward should be between 10-50 based on difficulty.
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
