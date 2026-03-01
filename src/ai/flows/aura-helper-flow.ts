
'use client';
/**
 * @fileOverview AuraHelper - O guia de inteligência do UrbeLudo.
 * Versão Client-Side direta via Google Generative AI SDK para compatibilidade com APK.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface AuraHelperInput {
  question: string;
  context?: string;
}

export interface AuraHelperOutput {
  answer: string;
  suggestedAction?: string;
}

export async function askAuraHelper(input: AuraHelperInput): Promise<AuraHelperOutput> {
  if (!API_KEY) {
    return {
      answer: "Minha conexão com a Grande Aura falhou (Chave ausente), mas lembre-se: o segredo está no movimento suave!",
      suggestedAction: "Verifique as configurações da sua Aura."
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Você é o AuraHelper, o guia robótico e amigável do UrbeLudo (Playground Urbano Digital 2026).
    Sua missão é ajudar crianças, pais e terapeutas a entenderem como o jogo funciona.

    CONHECIMENTO DO URBELUDO:
    - Objetivo: Transformar ambientes em playgrounds de psicomotricidade usando IA de Borda.
    - Jogos:
        1. Equilíbrio: Inclinar o celular para manter a bolha no centro (Sistema Vestibular).
        2. Ritmo: Mover o celular no tempo da música (Coordenação Rítmica).
        3. Caminho de Luz: Seguir trilhas com o dedo (Coordenação Visomotora).
        4. Nuvem de Sopro: Soprar no microfone para girar o moinho (Controle Respiratório).
        5. Elevador de Voz: Cantar ou emitir som constante para subir a torre (Controle Vocal/Fonoaudiologia).
    - Estúdio: Espaço 2.5D customizável. Itens custam LudoCoins.
    - LudoCoins: Moedas ganhas ao completar desafios.
    - Privacidade: 100% Offline. A imagem da câmera nunca sai do aparelho.
    - Avatar: Identidade digital que pode ser personalizada com fotos reais usando IA.

    REGRAS DE RESPOSTA:
    - Seja lúdico, use metáforas sobre "Aura", "Energia" e "Mestre do Movimento".
    - Respostas curtas e diretas (máximo 3 frases).
    - Se a pergunta for sobre algo que não existe no UrbeLudo, guie o usuário de volta para o movimento.
    - Retorne APENAS um JSON puro com os campos: "answer" e "suggestedAction".

    Contexto da Página: ${input.context || 'Geral'}
    Pergunta: ${input.question}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    
    return JSON.parse(text) as AuraHelperOutput;
  } catch (error) {
    console.error("Erro no AuraHelper:", error);
    return {
      answer: "Minha percepção sensorial está oscilando, mas continue se movendo!",
      suggestedAction: "Tente perguntar novamente em um momento de calma."
    };
  }
}
