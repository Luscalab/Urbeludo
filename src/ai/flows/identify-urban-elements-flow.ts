'use server';
/**
 * @fileOverview A Genkit flow that identifies urban architectural elements from a webcam feed.
 *
 * - identifyUrbanElements - A function that handles the urban element identification process.
 * - IdentifyUrbanElementsInput - The input type for the identifyUrbanElements function.
 * - IdentifyUrbanElementsOutput - The return type for the identifyUrbanElements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UrbanElementSchema = z.object({
  type: z.enum(['line', 'step', 'wall', 'other']).describe('The type of urban architectural element identified.'),
  description: z.string().describe('A brief description of the identified element, including its visual characteristics.'),
  location: z.string().describe('A textual description of the element\'s location within the image (e.g., "left side", "center-bottom", "across the foreground").')
});

const IdentifyUrbanElementsInputSchema = z.object({
  webcamFeedDataUri: z
    .string()
    .describe(
      "A photo from a live webcam feed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    )
});
export type IdentifyUrbanElementsInput = z.infer<typeof IdentifyUrbanElementsInputSchema>;

const IdentifyUrbanElementsOutputSchema = z.object({
  elements: z.array(UrbanElementSchema).describe('An array of identified urban architectural elements.')
});
export type IdentifyUrbanElementsOutput = z.infer<typeof IdentifyUrbanElementsOutputSchema>;

export async function identifyUrbanElements(input: IdentifyUrbanElementsInput): Promise<IdentifyUrbanElementsOutput> {
  return identifyUrbanElementsFlow(input);
}

const identifyUrbanElementsPrompt = ai.definePrompt({
  name: 'identifyUrbanElementsPrompt',
  input: {schema: IdentifyUrbanElementsInputSchema},
  output: {schema: IdentifyUrbanElementsOutputSchema},
  prompt: `You are an expert urban environment analyst. Your task is to identify key architectural elements in the provided image from a live webcam feed.
Focus on identifying lines, steps, and walls. For each identified element, provide its type, a brief description, and its relative location within the image.

Image: {{media url=webcamFeedDataUri}}

Please output the identified elements in a JSON array format as described by the output schema.`
});

const identifyUrbanElementsFlow = ai.defineFlow(
  {
    name: 'identifyUrbanElementsFlow',
    inputSchema: IdentifyUrbanElementsInputSchema,
    outputSchema: IdentifyUrbanElementsOutputSchema
  },
  async input => {
    const {output} = await identifyUrbanElementsPrompt(input);
    return output!;
  }
);
