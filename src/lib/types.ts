
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
 * Item colocado no estúdio com posição e propriedades.
 */
export interface PlacedItem {
  instanceId: string;
  itemId: string;
  position: { x: number; y: number };
  zIndex: number;
}

/**
 * Item do catálogo de estúdio.
 */
export interface StudioItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  assetPath: string;
  dimensions: { width: number; height: number };
  gridSize: { w: number; h: number };
  isAiGenerated?: boolean;
}

/**
 * Estado completo do estúdio do usuário.
 */
export interface StudioState {
  unlockedItemIds: string[];
  placedItems: PlacedItem[];
  wallpaperId: string;
  floorId: string;
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
 * Esquema de progresso do usuário persistido localmente no APK.
 */
export interface UserProgress {
  id: string;
  displayName: string;
  email?: string;
  ludoCoins: number;
  psychomotorLevel: number;
  totalChallengesCompleted: number;
  currentStreak: number;
  dominantColor: string;
  hasSeenTutorial: boolean;
  avatar: {
    avatarId: string;
    energy?: number;
    unlockedItems?: string[];
    equippedItems?: string[];
    accessoryType?: string;
    traits?: {
      hair?: string;
      hairColor?: string;
      eyeColor?: string;
      skinTone?: string;
    };
  };
  history: ChallengeActivity[];
  studioState?: StudioState;
  isPublic?: boolean;
}
