/**
 * Categorias de missão definidas para o ecossistema UrbeLudo.
 */
export type MissionCategory = 'Arte' | 'Motor' | 'Mente' | 'Zen';

/**
 * Níveis psicomotores suportados pelo motor de IA.
 */
export type MissionLevel = 1 | 2 | 3 | 4;

/**
 * Interface rigorosa para os desafios.
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
 * Definição de categorias para organização da loja e do inventário.
 */
export type ItemCategory = 'Essencial' | 'Ativo' | 'Estético' | 'Especial';

/**
 * Representação de um item disponível no catálogo estático do APK.
 */
export interface StudioItem {
  id: string;
  name: string;
  category: ItemCategory;
  price: number;
  description: string;
  assetPath: string; // Emoji ou Caminho para SVG
  dimensions: {
    width: number;
    height: number;
  };
}

/**
 * Instância de um item já posicionado no estúdio pelo usuário.
 */
export interface PlacedItem {
  instanceId: string;
  itemId: string;
  position: {
    x: number;
    y: number;
  };
  zIndex: number;
  rotation: 0 | 90 | 180 | 270;
}

/**
 * Estado completo do Estúdio para persistência no banco de dados local.
 */
export interface StudioState {
  unlockedItemIds: string[];
  placedItems: PlacedItem[];
  backgroundId: string;
  worldConfig: {
    width: number;
    height: number;
    theme: string;
  };
  avatar: {
    lastPosition: { x: number; y: number };
  };
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
  hasSeenTutorial: boolean;
  avatar: {
    energy: number;
    unlockedItems: string[];
    equippedItems: string[];
    studioLevel: number;
  };
  studioState: StudioState;
  dailyCycle: {
    homeMissionCompleted: boolean;
    streetMissionCompleted: boolean;
    lastResetDate: string;
  };
}
