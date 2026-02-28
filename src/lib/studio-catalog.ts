
import { StudioItem } from './types';

/**
 * Catálogo de Itens do Estúdio.
 * Atualizado para buscar os arquivos da pasta public/assets/studio/
 */
export const STUDIO_CATALOG: StudioItem[] = [
  {
    id: "cama-01",
    name: "Cama de Descanso",
    category: "Essencial",
    price: 100,
    description: "Recarregue suas energias.",
    assetPath: "/assets/studio/cama_minimalista.png",
    dimensions: { width: 160, height: 120 },
    gridSize: { w: 2, h: 2 } 
  },
  {
    id: "tapete-01",
    name: "Tapete de Movimento",
    category: "Ativo",
    price: 150,
    description: "Precisão nos seus movimentos.",
    assetPath: "/assets/studio/tapete_psicomotor.png",
    dimensions: { width: 140, height: 100 },
    gridSize: { w: 2, h: 1 }
  },
  {
    id: "espaldar-01",
    name: "Espaldar de Parede",
    category: "Ativo",
    price: 300,
    description: "Treino de postura e força.",
    assetPath: "/assets/studio/espaldar_madeira.png",
    dimensions: { width: 100, height: 180 },
    gridSize: { w: 1, h: 1 }
  },
  {
    id: "vaso-01",
    name: "Vaso de Hortelã",
    category: "Estético",
    price: 50,
    description: "Natureza digital.",
    assetPath: "/assets/studio/vaso_hortela.png",
    dimensions: { width: 60, height: 80 },
    gridSize: { w: 1, h: 1 }
  }
];
