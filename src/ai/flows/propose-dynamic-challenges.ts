'use server';
/**
 * @fileOverview A Genkit flow for dynamically proposing psychomotor challenges
 * based on detected urban architectural elements.
 *
 * - proposeDynamicChallenges - A function that generates a psychomotor challenge.
 * - ProposeDynamicChallengesInput - The input type for the proposeDynamicChallenges function.
 * - ProposeDynamicChallengesOutput - The return type for the proposeDynamicChallenges function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProposeDynamicChallengesInputSchema = z.object({
  detectedElements: z
    .array(z.string())
    .describe(
      'An array of detected urban architectural elements (e.g., "curb", "steps", "low wall", "bench").'
    ),
  previousChallenges: z
    .array(z.string())
    .optional()
    .describe('A list of challenges recently proposed to avoid repetition.'),
  userSkillLevel: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .default('intermediate')
    .describe('The user's current skill level to tailor challenge difficulty.'),
});
export type ProposeDynamicChallengesInput = z.infer<
  typeof ProposeDynamicChallengesInputSchema
>;

const ProposeDynamicChallengesOutputSchema = z.object({
  challengeDescription: z
    .string()
    .describe('A clear and concise description of the psychomotor challenge.'),
  challengeType: z
    .enum([
      'balance',
      'jump',
      'crawl',
      'lateral_movement',
      'spatial_awareness',
      'strength',
    ])
    .describe('The primary psychomotor skill targeted by the challenge.'),
  targetElement: z
    .string()
    .describe('The specific detected urban element the challenge focuses on.'),
  difficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The estimated difficulty level of the proposed challenge.'),
  estimatedDurationSeconds: z
    .number()
    .optional()
    .describe('An optional estimated duration in seconds for the challenge.'),
});
export type ProposeDynamicChallengesOutput = z.infer<
  typeof ProposeDynamicChallengesOutputSchema
>;

export async function proposeDynamicChallenges(
  input: ProposeDynamicChallengesInput
): Promise<ProposeDynamicChallengesOutput> {
  return proposeDynamicChallengesFlow(input);
}

const proposeDynamicChallengesPrompt = ai.definePrompt({
  name: 'proposeDynamicChallengesPrompt',
  input: {schema: ProposeDynamicChallengesInputSchema},
  output: {schema: ProposeDynamicChallengesOutputSchema},
  prompt: `You are an AI assistant for UrbeLudo, an app that turns urban spaces into a psychomotor playground.
Your task is to propose unique, engaging psychomotor challenges based on detected urban architectural elements.
The challenges should stimulate balance, muscle tone, laterality, and spatial structuring.

Consider the user's skill level: {{{userSkillLevel}}}.
Avoid proposing challenges similar to these recent ones: {{{previousChallenges}}}.

Detected urban elements available:
{{#each detectedElements}}- {{{this}}}
{{/each}}

Based on these elements, propose ONE psychomotor challenge. Focus on creativity and physical engagement.
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
