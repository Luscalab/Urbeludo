
'use server';
/**
 * @fileOverview Flow para transformar uma foto real em um estilo de avatar seguro e lúdico com base de dados detalhada.
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
    color: z.string().describe("Ex: #333333, #FFD700, #Rosa"),
    texture: z.string().describe("Ex: Fino, Grosso, Arroz cacheado"),
  }),
  eyes: z.object({
    shape: z.string().describe("Ex: Amendoado, Redondo, Puxado"),
    color: z.string().describe("Ex: #00FFFF, #8B4513, #00FF00"),
    eyebrowShape: z.string().describe("Ex: Arqueada, Reta, Grossa"),
  }),
  face: z.object({
    shape: z.string().describe("Ex: Oval, Quadrado, Coração"),
    tone: z.string().describe("Tom de pele identificado"),
    undertone: z.string().describe("Subtom de pele (frio, quente, neutro)"),
    noseShape: z.string().describe("Ex: Fino, Largo, Adunco"),
    mouthShape: z.string().describe("Ex: Labios cheios, Finos, Arco de cupido"),
  }),
  accessories: z.array(z.string()).describe("Lista de acessórios detectados (ex: óculos, piercings)"),
  dominantColor: z.string().describe("Cor principal sugerida para a aura do avatar em formato HEX"),
  accessoryType: z.string().describe("Tipo de acessório futurista sugerido (ex: Visor Pulse, Fone Gravitacional)"),
  avatarStyleDescription: z.string().describe("Resumo poético do estilo do avatar para o usuário."),
});

export type AvatarizeUserOutput = z.infer<typeof AvatarTraitsSchema>;

export async function avatarizeUser(input: AvatarizeUserInput): Promise<AvatarizeUserOutput> {
  return avatarizeUserFlow(input);
}

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
Sua análise deve ser PRECISA mas focada em transformar traços reais em elementos de DESIGN DIGITAL SEGURO.

Características a identificar:
1. Cabelo: Tipo (liso, ondulado, cacheado, crespo), cor (retorne em formato HEX ou cor legível) e textura.
2. Olhos: Formato, cor e sobrancelhas.
3. Rosto: Formato geral, tom de pele e subtons (frio/quente).
4. Boca e Nariz: Formatos predominantes.
5. Acessórios: Óculos, chapéus ou brincos.

IMPORTANTE: O avatar final NÃO deve ser uma foto, mas uma representação artística baseada nesses traços.

Foto: {{media url=photoDataUri}}`,
});

const avatarizeUserFlow = ai.defineFlow(
  {
    name: 'avatarizeUserFlow',
    inputSchema: AvatarizeUserInputSchema,
    outputSchema: AvatarTraitsSchema,
  },
  async input => {
    try {
      const {output} = await avatarizeUserPrompt(input);
      if (!output) throw new Error("IA não gerou resposta");
      return output;
    } catch (error) {
      console.error("Erro no Flow de Avatarização:", error);
      return {
        hair: { style: 'curto', color: '#333333', texture: 'Liso' },
        eyes: { shape: 'Amendoado', color: '#33993D', eyebrowShape: 'Natural' },
        face: { shape: 'Oval', tone: 'Médio', undertone: 'Quente', noseShape: 'Natural', mouthShape: 'Natural' },
        accessories: [],
        dominantColor: "#33993D",
        accessoryType: "Visor de Neon Pulse",
        avatarStyleDescription: "Explorador Padrão do UrbeLudo"
      };
    }
  }
);
