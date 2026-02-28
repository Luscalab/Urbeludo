
import { ProposeDynamicChallengesOutput } from '@/ai/flows/propose-dynamic-challenges';

/**
 * Banco de Dados Estático de Desafios Psicomotores.
 * Substitui a necessidade de IA em tempo real para o modo Standalone.
 */
export const OFFLINE_CHALLENGE_DB: Record<string, ProposeDynamicChallengesOutput[]> = {
  'Motor': [
    {
      challengeTitle: "Caminho do Equilibrista",
      challengeDescription: "Siga uma linha imaginária no chão com passos precisos.",
      challengeType: "balance",
      difficulty: "easy",
      ludoCoinsReward: 25,
      isLudicDrawing: false,
      steps: ["Encontre uma linha reta no chão", "Caminhe pé ante pé por 10 passos", "Mantenha os braços abertos para equilíbrio"]
    },
    {
      challengeTitle: "Salto do Canguru",
      challengeDescription: "Pule obstáculos baixos usando os dois pés juntos.",
      challengeType: "jump",
      difficulty: "medium",
      ludoCoinsReward: 35,
      isLudicDrawing: false,
      steps: ["Marque 3 pontos no chão com fita ou objetos", "Pule sobre eles com os pés unidos", "Aterrise suavemente flexionando os joelhos"]
    },
    {
      challengeTitle: "Circuito Lateral",
      challengeDescription: "Desloque-se lateralmente entre dois pontos rapidamente.",
      challengeType: "lateral_movement",
      difficulty: "medium",
      ludoCoinsReward: 30,
      isLudicDrawing: false,
      steps: ["Marque dois pontos a 3 metros de distância", "Toque um e corra de lado até o outro", "Repita o movimento 5 vezes sem cruzar os pés"]
    }
  ],
  'Arte': [
    {
      challengeTitle: "Grafite de Neon",
      challengeDescription: "Desenhe uma estrela gigante usando seus braços no visor.",
      challengeType: "creative",
      difficulty: "medium",
      ludoCoinsReward: 40,
      isLudicDrawing: true,
      steps: ["Posicione-se em um local com espaço", "Mova os braços em 5 direções para formar a estrela", "Observe o rastro rosa se formar no visor"]
    },
    {
      challengeTitle: "Círculo Perfeito",
      challengeDescription: "Gire seu corpo para criar um portal circular digital.",
      challengeType: "creative",
      difficulty: "easy",
      ludoCoinsReward: 20,
      isLudicDrawing: true,
      steps: ["Estenda o braço dominante", "Gire 360 graus lentamente", "Feche o círculo no ponto inicial"]
    }
  ],
  'Zen': [
    {
      challengeTitle: "Estátua Urbana",
      challengeDescription: "Fique imóvel em uma postura desafiadora.",
      challengeType: "breathing",
      difficulty: "easy",
      ludoCoinsReward: 20,
      isLudicDrawing: false,
      steps: ["Escolha uma pose de 'super-herói'", "Mantenha-se estático por 15 segundos", "Respire profundamente pelo nariz"]
    },
    {
      challengeTitle: "Respiração Quadrada",
      challengeDescription: "Sincronize sua respiração com movimentos leves de braço.",
      challengeType: "breathing",
      difficulty: "easy",
      ludoCoinsReward: 15,
      isLudicDrawing: false,
      steps: ["Inspire subindo os braços", "Segure o ar no topo", "Expire descendo os braços lentamente"]
    }
  ],
  'Mente': [
    {
      challengeTitle: "Sequência de Cores",
      challengeDescription: "Toque em objetos de cores específicas ao seu redor.",
      challengeType: "memory_game",
      difficulty: "medium",
      ludoCoinsReward: 30,
      isLudicDrawing: false,
      steps: ["Encontre algo Verde, depois algo Branco", "Toque neles nessa ordem exata", "Volte para a posição inicial com um pulo"]
    },
    {
      challengeTitle: "Mestre dos Pontos",
      challengeDescription: "Lembre-se da posição de 3 objetos e toque neles de olhos fechados.",
      challengeType: "memory_game",
      difficulty: "hard",
      ludoCoinsReward: 50,
      isLudicDrawing: false,
      steps: ["Aponte para 3 móveis/objetos", "Feche os olhos", "Tente tocar em cada um deles sem abrir os olhos"]
    }
  ]
};
