
'use server';
/**
 * @fileOverview A Genkit flow for dynamically proposing psychomotor challenges
 * based on detected urban architectural elements and user profile (age and skill).
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
    .describe('The user\'s current skill level to tailor challenge difficulty.'),
  userAgeGroup: z
    .enum(['preschool', 'school_age', 'adolescent_adult'])
    .default('adolescent_adult')
    .describe('The user\'s age group for psychomotor pedagogical tailoring (preschool: 2-5y, school_age: 6-12y, adolescent_adult: 13y+).'),
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
  prompt: `You are an AI assistant for UrbeLudo, an app based on Psychomotricity studies (Wallon, Piaget, Gallahue).
Your task is to propose unique psychomotor challenges based on detected urban architectural elements.

PEDAGOGICAL GUIDELINES BASED ON AGE GROUP: {{{userAgeGroup}}}
1. Preschool (2-5y): Focus on global coordination, static/dynamic balance, and simple spatial notions (inside/outside, up/down). Use playful language.
2. School Age (6-12y): Focus on laterality refinement, rhythm, motor precision, and complex spatial structuring (sequences of movements).
3. Adolescent/Adult (13y+): Focus on muscle tone, functional balance, cardiovascular endurance, and motor refinement for health and well-being.

Consider user skill: {{{userSkillLevel}}}.
Avoid repetition: {{{previousChallenges}}}.

Detected elements:
{{#each detectedElements}}- {{{this}}}
{{/each}}

Propose ONE psychomotor challenge that respects the pedagogical needs of the user's age group.
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
