'use client';
/**
 * @fileOverview AuraHelper - O guia de inteligência do UrbeLudo.
 * Implementa base de conhecimento clínica e técnica expandida para o projeto SPSP.
 * Versão com Matriz de Intencionalidade para respostas rápidas e precisas.
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

/**
 * Matriz de Conhecimento Determinística.
 * Permite que o bot responda instantaneamente a variações de perguntas comuns.
 */
const KNOWLEDGE_BASE = [
  {
    tags: ["jogar", "funciona", "instruções", "como faço", "brincar", "objetivo"],
    response: "Para começar, escolha um desafio no painel! O 'Elevador' treina sua voz, o 'Caminho de Luz' sua precisão e o 'Equilíbrio' sua postura. Siga as cores e os sons para vencer!",
    action: "Explore o Laboratório de Movimento!"
  },
  {
    tags: ["voz", "fala", "elevador", "ajuda minha voz", "ajuda voz", "benefício voz", "garganta", "maestro"],
    response: "O jogo do Elevador treina sua 'estabilidade fonatória'. Ele ajuda a manter sua voz firme e seu pulmão forte, o que melhora a clareza da fala e evita o cansaço ao conversar!",
    action: "Tente manter o som na Zona Verde!"
  },
  {
    tags: ["estabilidade", "zona verde", "área verde", "barra", "subir", "não sobe"],
    response: "A Zona de Estabilidade é a área verde na tela. Ela indica que sua pressão de ar está constante e saudável. Se o elevador não subir, tente falar um pouco mais alto ou ajuste a sensibilidade no Perfil.",
    action: "Verifique o ícone do microfone!"
  },
  {
    tags: ["sopro", "nuvem", "respiração", "ar", "pulmão", "expiração"],
    response: "Soprar de forma controlada treina seus músculos da face e do diafragma. Isso ajuda na respiração correta, na mastigação e até na regulação das suas emoções!",
    action: "Sopre suavemente no microfone."
  },
  {
    tags: ["precisão", "caminho", "luz", "mão", "dedo", "coordenação", "desenho"],
    response: "O Caminho de Luz treina sua 'Praxia Fina' e coordenação olho-mão. É como um GPS para seus dedos, ensinando eles a serem precisos para escrever, desenhar e usar talheres!",
    action: "Siga a trilha sem sair da linha!"
  },
  {
    tags: ["moedas", "ludocoins", "lc", "ganhar", "comprar", "loja", "dinheiro", "prêmio"],
    response: "As LudoCoins (LC) são suas moedas de mestre! Você as ganha completando desafios e pode usá-las na Loja para comprar móveis e decorações incríveis para o seu Estúdio.",
    action: "Visite a Loja no Painel!"
  },
  {
    tags: ["psicomotricidade", "corpo e mente", "ciência", "unicv", "spsp", "por que treinar"],
    response: "A psicomotricidade estuda como nossa mente comanda nosso corpo. No UrbeLudo, usamos jogos para que essa conexão seja forte, alegre e cheia de autonomia para você!",
    action: "O movimento consciente é a chave!"
  },
  {
    tags: ["tonicidade", "músculo", "tônus", "força", "firmeza"],
    response: "A tonicidade é o controle do seu tônus muscular. Quando você mantém o som estável ou o corpo equilibrado, está ensinando seus músculos a trabalharem com a força certa!",
    action: "Sinta a firmeza nos seus movimentos."
  },
  {
    tags: ["esquema corporal", "consciência", "percepção", "meu corpo"],
    response: "O esquema corporal é saber onde cada parte do seu corpo está. Ver seu progresso na tela ajuda seu cérebro a criar um 'mapa' melhor das suas capacidades físicas!",
    action: "Você está evoluindo sua percepção!"
  },
  {
    tags: ["não funciona", "erro", "problema", "bug", "travou", "ajuda técnica"],
    response: "Puxa, vamos resolver! Verifique se deu permissão de câmera e microfone ao app. No Android, confira se o volume está alto e se você está em um lugar bem iluminado.",
    action: "Reinicie o desafio se necessário."
  },
  {
    tags: ["quem é você", "aurahelper", "robô", "bot"],
    response: "Eu sou o AuraHelper, seu guia digital de saúde e movimento! Estou aqui para explicar como cada brincadeira ajuda seu corpo a ficar mais forte e inteligente.",
    action: "Pergunte-me sobre qualquer jogo!"
  }
];

export async function askAuraHelper(input: AuraHelperInput): Promise<AuraHelperOutput> {
  const query = input.question.toLowerCase();
  
  // MOTOR DE TRIAGEM (Intencionalidade)
  // Busca na base de conhecimento por qualquer tag que esteja presente na pergunta
  const foundEntry = KNOWLEDGE_BASE.find(entry => 
    entry.tags.some(tag => query.includes(tag))
  );

  if (foundEntry) {
    return {
      answer: foundEntry.response,
      suggestedAction: foundEntry.action
    };
  }

  // FALLBACK PARA IA (Perguntas complexas ou fora da base)
  if (!API_KEY) {
    return {
      answer: "Minha percepção sensorial oscilou, mas lembre-se: cada movimento seu é uma vitória! Tente perguntar sobre um jogo específico.",
      suggestedAction: "Verifique suas configurações de rede."
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Você é o AuraHelper, assistente especialista em Psicomotricidade e Fonoaudiologia do UrbeLudo.
    Sua missão é explicar os benefícios dos jogos usando conceitos como tonicidade, praxia fina, esquema corporal e pressão subglótica, mas de forma lúdica e acessível.

    REGRAS:
    - Seja encorajador e educativo.
    - Se a pergunta for sobre um jogo, explique o benefício para o corpo.
    - Máximo 3 frases.
    - Retorne APENAS um JSON: {"answer": "...", "suggestedAction": "..."}

    Pergunta do Usuário: ${input.question}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    
    return JSON.parse(text) as AuraHelperOutput;
  } catch (error) {
    console.error("Erro no AuraHelper (IA):", error);
    return {
      answer: "Minha conexão com a Grande Aura falhou, mas não pare de se mover! Como posso ajudar você a brilhar hoje?",
      suggestedAction: "Tente perguntar sobre o 'Elevador' ou 'Moedas'."
    };
  }
}
