'use client';
/**
 * @fileOverview AuraHelper - O guia de inteligência do UrbeLudo.
 * Implementa base de conhecimento clínica e técnica para o projeto SPSP (Psicomotricidade/UNICV).
 * Versão 100% Client-Side para exportação APK.
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
  // --- CONCEITOS PSICOMOTORES (UNICV / PROJETO SPSP) ---
  "psicomotricidade": "É o estudo de como nossos pensamentos, sentimentos e movimentos trabalham juntos! No UrbeLudo, ajudamos seu corpo e mente a dançarem no mesmo ritmo para você ganhar mais autonomia.",
  "corpo e mente": "A psicomotricidade ajuda você a entender e dominar seus movimentos. Aqui no UrbeLudo, cada jogo é um exercício para sua mente comandar seu corpo com alegria!",
  "por que treinar": "Cada desafio trabalha uma 'engrenagem' sua. O Caminho de Luz foca na sua precisão motora, enquanto o Elevador foca no controle do seu fôlego.",
  "relacao corpo": "Treinar no UrbeLudo ajusta seu tônus muscular e melhora sua percepção espacial. É a ciência do movimento transformada em brincadeira!",

  // --- ANÁLISE TERAPÊUTICA POR JOGO ---
  "voz": "A voz é puro movimento! No Elevador, você treina a 'estabilidade fonatória', deixando sua voz firme e seu pulmão forte para falar sem cansar.",
  "fala": "O jogo do Elevador ajuda no controle da pressão do ar nos pulmões, o que melhora a clareza da sua fala e a projeção da sua voz.",
  "precisao": "O Caminho de Luz treina sua coordenação visomotora. É como um GPS para suas mãos, ensinando elas a serem precisas e ágeis para escrever ou desenhar!",
  "mão": "Seguir a trilha de luz exige foco e controle de pequenos movimentos (motricidade fina), o que é vital para sua autonomia no dia a dia.",
  "sopro": "Controlar o ar na Nuvem de Sopro ajuda na musculatura da face, o que é importante para a mastigação e para falar as palavras corretamente.",
  "respiração": "Soprar de forma controlada ensina seu cérebro a regular a força do ar, promovendo relaxamento e domínio sobre o seu próprio fôlego.",

  // --- JOGOS E MECÂNICA ---
  "jogar": "Para jogar, escolha um dos desafios no painel e siga as instruções de voz ou movimento!",
  "elevador": "No Elevador de Voz, mantenha o som constante na área verde (Zona de Estabilidade) para subir até o baú de recompensas!",
  "estabilidade": "A Zona de Estabilidade é a área verde na tela. Ela indica que sua voz está firme, o que ajuda a fortalecer sua musculatura vocal!",
  "caminho": "No Caminho de Luz, o foco é a Precisão. Siga a trilha luminosa com o dedo sem sair da linha para vencer!",
  "moedas": "As LudoCoins (LC) são suas moedas de conquista! Você as ganha ao completar as fases e pode usá-las para mobiliar seu Estúdio.",
  "lc": "As LudoCoins (LC) representam sua evolução! Use-as na Loja para deixar seu espaço de treino com a sua cara.",
  
  // --- SUPORTE TÉCNICO ---
  "não sobe": "Verifique se o ícone do microfone está ativo. Tente falar um pouco mais alto ou ajuste a sensibilidade no seu Painel de Perfil.",
  "sem som": "Confira se o volume do celular está alto. O UrbeLudo usa feedbacks sonoros para ajudar você a manter o ritmo do exercício!",
  "calibro": "Vá ao menu Painel e procure por Sensibilidade. Lá você ajusta o quanto de voz ou movimento o sensor precisa captar para o jogo reagir.",
  
  // --- PROGRESSO ---
  "sem internet": "O UrbeLudo é Offline-First! Seus treinos ficam salvos no aparelho e eu sincronizo tudo com a sua planilha assim que você conectar!",
  "relatório": "O relatório clínico é gerado por mim ao final de cada sessão, ajudando você e seu terapeuta a acompanharem sua evolução biomecânica."
};

export async function askAuraHelper(input: AuraHelperInput): Promise<AuraHelperOutput> {
  const query = input.question.toLowerCase();
  
  // Triagem de Respostas Prontas (Latência Zero e Foco Clínico)
  const key = Object.keys(RESPOSTAS_FIXAS).find(k => query.includes(k));
  if (key) {
    return {
      answer: RESPOSTAS_FIXAS[key],
      suggestedAction: "Continue sua jornada psicomotora!"
    };
  }

  if (!API_KEY) {
    return {
      answer: "Minha conexão com a Grande Aura falhou, mas lembre-se: o movimento consciente é a chave para o sucesso!",
      suggestedAction: "Verifique suas configurações de rede."
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Você é o AuraHelper, assistente especialista em Psicomotricidade e Fonoaudiologia do UrbeLudo.
    Sua missão é explicar os benefícios dos jogos usando os conceitos de estabilidade fonatória, coordenação visomotora e tônus muscular, mas de forma lúdica.

    CONHECIMENTO TÉCNICO:
    - Psicomotricidade: Integração corpo-mente.
    - Elevador de Voz: Treina pressão subglótica e estabilidade vocal.
    - Caminho de Luz: Treina motricidade fina e percepção espacial.
    - Nuvem de Sopro: Treina praxias bucofaciais.

    REGRAS:
    - Seja encorajador e educativo.
    - Máximo 3 frases.
    - Retorne APENAS um JSON: {"answer": "...", "suggestedAction": "..."}

    Pergunta: ${input.question}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    
    return JSON.parse(text) as AuraHelperOutput;
  } catch (error) {
    console.error("Erro no AuraHelper:", error);
    return {
      answer: "Minha percepção sensorial oscilou, mas não pare de se mover! Como posso ajudar?",
      suggestedAction: "Tente perguntar sobre um jogo específico."
    };
  }
}
