
import { ProposeDynamicChallengesOutput } from '@/ai/flows/propose-dynamic-challenges';

/**
 * Banco de Dados de Desafios Sensoriais "O Traço Vivo".
 * Foco em Psicomotricidade e Ludicidade Corporal.
 */
export const OFFLINE_CHALLENGE_DB: Record<string, ProposeDynamicChallengesOutput[]> = {
  'Arte': [
    {
      challengeTitle: "Pincel de Luz",
      challengeDescription: "Pinte toda a tela com movimentos circulares e amplos.",
      challengeType: "sensory_art",
      difficulty: "easy",
      ludoCoinsReward: 30,
      isLudicDrawing: true,
      steps: ["Estique os braços para os lados", "Faça grandes círculos no ar", "Preencha os cantos da tela com sua Aura"]
    },
    {
      challengeTitle: "Desenho Rítmico",
      challengeDescription: "Crie linhas retas seguindo a batida sonora.",
      challengeType: "sensory_art",
      difficulty: "medium",
      ludoCoinsReward: 40,
      isLudicDrawing: true,
      steps: ["Mova-se rápido para sons agudos", "Mova-se devagar para sons graves", "Tente desenhar um triângulo gigante"]
    }
  ],
  'Motor': [
    {
      challengeTitle: "Limpador de Vidro",
      challengeDescription: "Apague as formas geométricas que surgirem na tela.",
      challengeType: "visuomotor",
      difficulty: "medium",
      ludoCoinsReward: 35,
      isLudicDrawing: false,
      steps: ["Encontre a forma roxa na tela", "Passe sua mão virtual sobre ela", "Repita até a tela estar limpa"]
    },
    {
      challengeTitle: "Equilíbrio Fluido",
      challengeDescription: "Mantenha o rastro de tinta estável no centro por 10 segundos.",
      challengeType: "balance",
      difficulty: "hard",
      ludoCoinsReward: 50,
      isLudicDrawing: false,
      steps: ["Fique no centro da câmera", "Mantenha uma postura imóvel", "Não deixe a Aura 'vazar' para os lados"]
    }
  ],
  'Zen': [
    {
      challengeTitle: "Nuvem de Respiração",
      challengeDescription: "Mova-se lentamente para criar uma névoa suave.",
      challengeType: "breathing",
      difficulty: "easy",
      ludoCoinsReward: 20,
      isLudicDrawing: true,
      steps: ["Inspire levantando os braços devagar", "Expire descendo os braços", "Observe a névoa se formar suavemente"]
    }
  ],
  'Mente': [
    {
      challengeTitle: "Simão Sensorial",
      challengeDescription: "Repita a sequência de posições que a Aura mostrar.",
      challengeType: "memory",
      difficulty: "medium",
      ludoCoinsReward: 40,
      isLudicDrawing: false,
      steps: ["Observe onde a luz pisca", "Leve sua mão até esse ponto", "Repita a sequência de 3 pontos"]
    }
  ]
};
