'use client';
/**
 * @fileOverview AuraHelper - O guia de inteligência do UrbeLudo.
 * Implementa triagem de respostas fixas para economia de tokens e latência zero.
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

const RESPOSTAS_FIXAS: Record<string, string> = {
  "jogar": "Para jogar, escolha um dos desafios no painel e siga as instruções de voz ou movimento!",
  "elevador": "No Elevador de Voz, use sua voz para subir! Mantenha um som constante e tente ficar dentro da Zona de Estabilidade (a área verde) para encher a barra até 100%.",
  "estabilidade": "A Zona de Estabilidade é a área verde na tela. Ela indica que sua voz está firme e controlada, o que é ótimo para o seu treino de fonoaudiologia!",
  "caminho": "No Caminho de Luz, o foco é a Precisão. Você deve seguir a trilha luminosa com o movimento para ganhar!",
  "sopro": "Na Nuvem de Sopro, trabalhamos o Controle Respiratório. Você deve usar o sopro suave para guiar a nuvem ou girar o moinho!",
  "moedas": "As LudoCoins (LC) são suas moedas de conquista! Você as ganha ao completar as fases e abrir os baús de recompensa.",
  "lc": "As LudoCoins (LC) são suas moedas de conquista! Você as ganha ao completar as fases e abrir os baús de recompensa.",
  "100%": "Ao chegar em 100%, você completa o andar, ganha LudoCoins e o AuraBot gera um relatório especial sobre o seu progresso!",
  "relatório": "O relatório é gerado automaticamente pelo AuraBot ao final de cada sessão, ajudando você e seu terapeuta a acompanhar sua evolução.",
  "quem é você": "Eu sou o AuraHelper, seu assistente de saúde e diversão aqui no UrbeLudo! Estou aqui para guiar sua Aura do Movimento.",
  "aura": "A Aura é a energia do seu movimento! No UrbeLudo, transformamos seus gestos em rastros de luz e som para treinar seu corpo."
};

export async function askAuraHelper(input: AuraHelperInput): Promise<AuraHelperOutput> {
  const query = input.question.toLowerCase();
  
  // Triagem de Respostas Prontas (Latência Zero)
  const key = Object.keys(RESPOSTAS_FIXAS).find(k => query.includes(k));
  if (key) {
    return {
      answer: RESPOSTAS_FIXAS[key],
      suggestedAction: "Continue explorando os laboratórios!"
    };
  }

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
        1. Equilíbrio: Inclinar o celular para manter a bolha no centro.
        2. Ritmo: Mover o celular no tempo da música.
        3. Caminho de Luz: Seguir trilhas com o dedo.
        4. Nuvem de Sopro: Soprar no microfone para girar o moinho.
        5. Elevador de Voz: Cantar constante para subir a torre (Fonoaudiologia).
    - LudoCoins: Moedas ganhas ao completar desafios.
    - Privacidade: 100% Offline. A imagem da câmera nunca sai do aparelho.

    REGRAS DE RESPOSTA:
    - Seja lúdico, use metáforas sobre "Aura", "Energia" e "Mestre do Movimento".
    - Respostas curtas (máximo 3 frases).
    - Retorne APENAS um JSON puro com: "answer" e "suggestedAction".

    Pergunta: ${input.question}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    
    return JSON.parse(text) as AuraHelperOutput;
  } catch (error) {
    console.error("Erro no AuraHelper:", error);
    return {
      answer: "Minha percepção sensorial está oscilando, mas continue se movendo!",
      suggestedAction: "Tente perguntar novamente."
    };
  }
}