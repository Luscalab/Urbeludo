'use client';
/**
 * @fileOverview AuraHelper - Motor de Inteligência Semântica do UrbeLudo.
 * Implementa triagem de intenções para respostas instantâneas e fallback para Gemini.
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
 * Matriz de Conhecimento Semântica.
 * Cada entrada possui um conjunto de "tokens" de intenção para matching flexível.
 */
const KNOWLEDGE_BASE = [
  // --- JOGABILIDADE & INSTRUÇÕES ---
  {
    intent: "instruções_gerais",
    tags: ["jogar", "funciona", "instruções", "como faço", "brincar", "objetivo", "começar", "ajuda"],
    response: "Para começar, escolha um desafio no painel! O 'Elevador' treina sua voz, o 'Caminho de Luz' sua precisão e o 'Equilíbrio' sua postura. Siga as cores e os sons para vencer!",
    action: "Explore o Laboratório de Movimento!"
  },
  {
    intent: "elevador_voz",
    tags: ["voz", "fala", "elevador", "ajuda minha voz", "garganta", "maestro", "cantar", "som", "subir", "instrução elevador"],
    response: "O jogo do Elevador treina sua 'estabilidade fonatória'. Ele ajuda a manter sua voz firme e seu pulmão forte, o que melhora a clareza da fala e evita o cansaço ao conversar!",
    action: "Tente manter o som na Zona Verde!"
  },
  {
    intent: "caminho_luz",
    tags: ["precisão", "caminho", "luz", "mão", "dedo", "coordenação", "desenho", "trilha", "seguir", "instrução caminho"],
    response: "O Caminho de Luz treina sua 'Praxia Fina' e coordenação olho-mão. É como um GPS para seus dedos, ensinando eles a serem precisos para escrever e desenhar!",
    action: "Siga a trilha sem sair da linha!"
  },
  {
    intent: "nuvem_sopro",
    tags: ["sopro", "nuvem", "respiração", "ar", "pulmão", "expiração", "assoprar", "moinho", "instrução sopro"],
    response: "Soprar de forma controlada treina seus músculos da face e do diafragma. Isso ajuda na respiração correta, na dicção e até na regulação das suas emoções!",
    action: "Sopre suavemente no microfone."
  },

  // --- CIÊNCIA & PSICOMOTRICIDADE (SPSP/UNICV) ---
  {
    intent: "psicomotricidade",
    tags: ["psicomotricidade", "corpo e mente", "ciência", "unicv", "spsp", "por que treinar", "benefício", "ajuda o corpo"],
    response: "A psicomotricidade estuda como nossa mente comanda nosso corpo. No UrbeLudo, cada jogo é um exercício para que sua mente comande seu corpo com alegria e autonomia!",
    action: "O movimento consciente é a chave!"
  },
  {
    intent: "tonicidade",
    tags: ["tonicidade", "músculo", "tônus", "força", "firmeza", "musculatura"],
    response: "A tonicidade é o controle do seu tônus muscular. Quando você mantém o som estável ou o corpo equilibrado, está ensinando seus músculos a trabalharem com a força certa!",
    action: "Sinta a firmeza nos seus movimentos."
  },
  {
    intent: "esquema_corporal",
    tags: ["esquema corporal", "consciência", "percepção", "meu corpo", "imagem", "avatar"],
    response: "O esquema corporal é saber onde cada parte do seu corpo está. Ver seu progresso e seu avatar na tela ajuda seu cérebro a criar um 'mapa' melhor das suas capacidades!",
    action: "Você está evoluindo sua percepção!"
  },
  {
    intent: "pressao_subglotica",
    tags: ["pressão", "pulmão", "ar", "força voz", "estabilidade", "zona verde"],
    response: "A Zona de Estabilidade indica que sua pressão de ar está constante e saudável. Ter esse controle é fundamental para uma fala clara e para o fôlego do dia a dia!",
    action: "Mantenha o ar fluindo devagar."
  },

  // --- RECOMPENSAS & ECONOMIA ---
  {
    intent: "moedas",
    tags: ["moedas", "ludocoins", "lc", "ganhar", "comprar", "loja", "dinheiro", "prêmio", "bau", "tesouro"],
    response: "As LudoCoins (LC) são suas moedas de mestre! Você as ganha completando desafios e pode usá-las na Loja para comprar itens incríveis para o seu Estúdio.",
    action: "Visite a Loja no Painel!"
  },

  // --- SUPORTE TÉCNICO ---
  {
    intent: "tecnico_hardware",
    tags: ["não funciona", "erro", "problema", "bug", "travou", "ajuda técnica", "microfone", "camera", "som", "calibrar"],
    response: "Puxa, vamos resolver! Verifique se deu permissão de câmera e microfone ao app. No Android, confira se o volume está alto e se você está em um lugar bem iluminado.",
    action: "Reinicie o desafio se necessário."
  },
  {
    intent: "quem_sou_eu",
    tags: ["quem é você", "aurahelper", "robô", "bot", "aura", "ajudante"],
    response: "Eu sou o AuraHelper, seu guia digital de saúde e movimento! Estou aqui para explicar como cada brincadeira ajuda seu corpo a ficar mais forte e inteligente.",
    action: "Pergunte-me sobre qualquer jogo!"
  }
];

/**
 * Função principal que decide se usa a base fixa ou o Gemini.
 */
export async function askAuraHelper(input: AuraHelperInput): Promise<AuraHelperOutput> {
  const query = input.question.toLowerCase();
  
  // MOTOR DE TRIAGEM SEMÂNTICA (Scoring system)
  let bestMatch = null;
  let highestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let currentScore = 0;
    for (const tag of entry.tags) {
      if (query.includes(tag)) {
        // Atribui peso maior para frases mais completas
        currentScore += tag.split(' ').length;
      }
    }

    if (currentScore > highestScore) {
      highestScore = currentScore;
      bestMatch = entry;
    }
  }

  // Se encontramos um match sólido (score > 0), retornamos instantaneamente
  if (bestMatch && highestScore > 0) {
    return {
      answer: bestMatch.response,
      suggestedAction: bestMatch.action
    };
  }

  // FALLBACK PARA IA (Perguntas únicas ou complexas)
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
    - Seja encorajador, educativo e tecnológico.
    - Máximo 3 frases.
    - Se for sobre progresso, fale de LudoCoins.
    - Retorne APENAS um JSON: {"answer": "...", "suggestedAction": "..."}

    Pergunta do Usuário: ${input.question}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    
    return JSON.parse(text) as AuraHelperOutput;
  } catch (error) {
    console.error("Erro no AuraHelper (IA):", error);
    return {
      answer: "Minha conexão com a Grande Aura está instável, mas continue se movendo! Como posso te ajudar a brilhar hoje?",
      suggestedAction: "Tente perguntar sobre o 'Elevador' ou 'Moedas'."
    };
  }
}
