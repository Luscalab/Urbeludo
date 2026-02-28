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
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      }
    ],
  },
  prompt: `Você é um Designer de Avatares do UrbeLudo. 
Analise a foto do usuário e descreva um avatar minimalista, futurista e lúdico que capture sua essência de forma SEGURA (sem revelar a identidade real).
O foco é transformar traços gerais (cor de cabelo, estilo) em elementos digitais do "Um Studio".

Foto: {{media url=photoDataUri}}

IMPORTANTE: O avatar deve ser uma representação artística digital, não uma cópia fiel. Se a imagem estiver escura ou difícil de ver, crie um estilo baseado em "Explorador da Noite".`,
});

const avatarizeUserFlow = ai.defineFlow(
  {
    name: 'avatarizeUserFlow',
    inputSchema: AvatarizeUserInputSchema,
    outputSchema: AvatarizeUserOutputSchema,
  },
  async input => {
    try {
      const {output} = await avatarizeUserPrompt(input);
      if (!output) throw new Error("IA não gerou resposta");
      return output;
    } catch (error) {
      console.error("Erro no Flow de Avatarização:", error);
      // Fallback robusto para garantir que o usuário não trave no scan
      return {
        avatarStyleDescription: "Explorador Cibernético Minimalista",
        dominantColor: "#33993D",
        accessoryType: "Visor de Neon Pulse"
      };
    }
  }
);
