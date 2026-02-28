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
  steps: [string, string, string];
  reward: {
    ludoCoins: number;
    xp: number;
  };
  safetyRules: string[];
}

/**
 * Configuração de móveis para o Estúdio.
 */
export interface StudioFurniture {
  id: string;
  itemId: string; // Referência ao ID do catálogo
  x: number;
  y: number;
  rotation: number;
}

export interface CatalogItem {
  id: string;
  name: string;
  price: number;
  category: 'decoracao' | 'ativo' | 'sonoro' | 'aura';
  description: string;
  icon: string;
}

/**
 * Esquema de progresso do usuário persistido no Firestore/Local.
 */
export interface UserProgress {
  id: string;
  displayName: string;
  ludoCoins: number;
  psychomotorLevel: number;
  totalChallengesCompleted: number;
  currentStreak: number;
  ageGroup: string;
  dominantColor: string;
  avatar: {
    energy: number;
    unlockedItems: string[];
    equippedItems: string[];
    studioLevel: number;
  };
  studioFurniture: StudioFurniture[];
  dailyCycle: {
    homeMissionCompleted: boolean;
    streetMissionCompleted: boolean;
    lastResetDate: string;
  };
}
