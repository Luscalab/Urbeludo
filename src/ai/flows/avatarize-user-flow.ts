/**
 * @fileOverview Flow para transformar uma foto real em um estilo de avatar seguro e lúdico.
 * Refatorado para execução Client-Side (Offline Sovereignty).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AvatarizeUserInputSchema = z.object({
  photoDataUri: z.string().describe("Foto do usuário para geração do avatar seguro."),
});
export type AvatarizeUserInput = z.infer<typeof AvatarizeUserInputSchema>;

const AvatarTraitsSchema = z.object({
  hair: z.object({
    style: z.enum(['liso', 'ondulado', 'cacheado', 'crespo', 'careca', 'curto', 'longo']),
    color: z.string().describe("Cor do cabelo em formato HEX"),
    texture: z.string().describe("Textura identificada"),
  }),
  eyes: z.object({
    shape: z.string().describe("Formato dos olhos"),
    color: z.string().describe("Cor dos olhos em formato HEX"),
    eyebrowShape: z.string().describe("Formato da sobrancelha"),
  }),
  face: z.object({
    shape: z.string().describe("Formato do rosto"),
    tone: z.string().describe("Tom de pele em formato HEX"),
    undertone: z.string().describe("Subtom"),
    noseShape: z.string().describe("Formato do nariz"),
    mouthShape: z.string().describe("Formato da boca"),
  }),
  accessories: z.array(z.string()).describe("Lista de acessórios"),
  dominantColor: z.string().describe("Cor principal sugerida para a aura"),
  accessoryType: z.string().describe("Tipo de acessório futurista sugerido"),
  avatarStyleDescription: z.string().describe("Resumo poético do estilo"),
});

export type AvatarizeUserOutput = z.infer<typeof AvatarTraitsSchema>;

export async function avatarizeUser(input: AvatarizeUserInput): Promise<AvatarizeUserOutput> {
  const avatarizeUserPrompt = ai.definePrompt({
    name: 'avatarizeUserPrompt',
    input: {schema: AvatarizeUserInputSchema},
    output: {schema: AvatarTraitsSchema},
    config: {
      safetySettings: [
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
      ],
    },
    prompt: `Você é o Designer de Identidades do UrbeLudo. 
Analise a foto fornecida e identifique detalhadamente as características faciais para criar um avatar artístico e futurista.
Cabelo, olhos, tom de pele (HEX), acessórios e estilo.

Foto: {{media url=photoDataUri}}`,
  });

  try {
    const {output} = await avatarizeUserPrompt(input);
    if (!output) throw new Error("IA não gerou resposta");
    return output;
  } catch (error) {
    console.error("Erro na Avatarização Offline:", error);
    return {
      hair: { style: 'curto', color: '#333333', texture: 'Liso' },
      eyes: { shape: 'Amendoado', color: '#33993D', eyebrowShape: 'Natural' },
      face: { shape: 'Oval', tone: '#e0ac69', undertone: 'Quente', noseShape: 'Natural', mouthShape: 'Natural' },
      accessories: [],
      dominantColor: "#33993D",
      accessoryType: "Visor de Neon Pulse",
      avatarStyleDescription: "Explorador Padrão do UrbeLudo"
    };
  }
}
