/**
 * Categorias de missão definidas para o ecossistema UrbeLudo.
 */
export type MissionCategory = 'Arte' | 'Motor' | 'Mente' | 'Zen';

/**
 * Representação de um registro de atividade psicomotora.
 */
export interface ChallengeActivity {
  id: string;
  timestamp: string;
  score: number;
  earnedCoins: number;
  type: string;
}

/**
 * Esquema de progresso do usuário persistido localmente no APK.
 */
export interface UserProgress {
  id: string;
  displayName: string;
  ludoCoins: number;
  psychomotorLevel: number;
  totalChallengesCompleted: number;
  currentStreak: number;
  dominantColor: string;
  hasSeenTutorial: boolean;
  avatar: {
    avatarId: string;
  };
  history: ChallengeActivity[];
}
