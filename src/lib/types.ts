/**
 * Categorias de missão definidas para o ecossistema UrbeLudo.
 */
export type MissionCategory = 'Arte' | 'Motor' | 'Mente' | 'Zen';

/**
 * Níveis psicomotores suportados pelo motor de IA.
 */
export type MissionLevel = 1 | 2 | 3 | 4;

/**
 * Interface rigorosa para os desafios gerados pelo Gemini 2.0 Flash.
 */
export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: MissionCategory;
  level: MissionLevel;
  /**
   * Garantia técnica de exatamente 3 passos executáveis.
   */
  steps: [string, string, string];
  reward: {
    ludoCoins: number;
    xp: number;
  };
  safetyRules: string[];
}

/**
 * Configuração da Aura do usuário, utilizada no Canvas API e Framer Motion.
 */
export interface UserAura {
  color: string; // Hex ou HSL usado no trailCanvasRef
  intensity: number;
  unlockedAt: Date;
  active: boolean;
}

/**
 * Esquema de progresso do usuário persistido no Firestore.
 */
export interface UserProgress {
  uid: string;
  level: MissionLevel;
  ludoCoins: number;
  stats: {
    missionsCompleted: number;
    distanceTraveled?: number;
  };
  aura: UserAura;
  inventory: string[];
  lastActive: Date;
}
