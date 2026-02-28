'use server';
/**
 * @fileOverview Flow para transformar uma foto real em um estilo de avatar seguro e lúdico.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AvatarizeUserInputSchema = z.object({
  photoDataUri: z.string().describe("Foto do usuário para geração do avatar seguro."),
});
export type AvatarizeUserInput = z.infer<typeof AvatarizeUserInputSchema>;

const AvatarizeUserOutputSchema = z.object({
  avatarStyleDescription: z.string().describe("Descrição do estilo do avatar baseado nas características do usuário."),
  dominantColor: z.string().describe("Cor principal para o avatar."),
  accessoryType: z.string().describe("Tipo de acessório (ex: visor, boné, fone) sugerido."),
});
export type AvatarizeUserOutput = z.infer<typeof AvatarizeUserOutputSchema>;

export async function avatarizeUser(input: AvatarizeUserInput): Promise<AvatarizeUserOutput> {
  return avatarizeUserFlow(input);
}

const avatarizeUserPrompt = ai.definePrompt({
  name: 'avatarizeUserPrompt',
  input: {schema: AvatarizeUserInputSchema},
  output: {schema: AvatarizeUserOutputSchema},
  prompt: `Você é um Designer de Avatares do UrbeLudo. 
Analise a foto do usuário e descreva um avatar minimalista, futurista e lúdico que capture sua essência de forma SEGURA (sem revelar a identidade real).
O foco é transformar traços gerais (cor de cabelo, estilo) em elementos digitais do "Um Studio".

Foto: {{media url=photoDataUri}}

IMPORTANTE: O avatar deve ser uma representação artística digital, não uma cópia fiel.`,
});

const avatarizeUserFlow = ai.defineFlow(
  {
    name: 'avatarizeUserFlow',
    inputSchema: AvatarizeUserInputSchema,
    outputSchema: AvatarizeUserOutputSchema,
  },
  async input => {
    const {output} = await avatarizeUserPrompt(input);
    return output!;
  }
);
