
import { StudioItem } from './types';

/**
 * Catálogo de Itens do Estúdio (The Sims Engine).
 * Diversidade de itens para testar o grid e o depth sorting.
 */
export const STUDIO_CATALOG: StudioItem[] = [
  {
    id: "cama-01",
    name: "Cama Pulse",
    category: "Essencial",
    price: 500,
    description: "Sono profundo em 2.5D.",
    assetPath: "/assets/studio/cama_minimalista.png",
    dimensions: { width: 200, height: 160 },
    gridSize: { w: 3, h: 2 } 
  },
  {
    id: "tapete-01",
    name: "Tapete Grid",
    category: "Ativo",
    price: 150,
    description: "Sincronia perfeita para seus passos.",
    assetPath: "/assets/studio/tapete_psicomotor.png",
    dimensions: { width: 160, height: 120 },
    gridSize: { w: 2, h: 1 }
  },
  {
    id: "espaldar-01",
    name: "Torre de Força",
    category: "Ativo",
    price: 850,
    description: "Alcança novas alturas psicomotoras.",
    assetPath: "/assets/studio/espaldar_madeira.png",
    dimensions: { width: 120, height: 240 },
    gridSize: { w: 1, h: 1 }
  },
  {
    id: "vaso-01",
    name: "Hortelã Digital",
    category: "Estético",
    price: 80,
    description: "Oxigênio visual para o estúdio.",
    assetPath: "/assets/studio/vaso_hortela.png",
    dimensions: { width: 80, height: 100 },
    gridSize: { w: 1, h: 1 }
  },
  {
    id: "sofa-01",
    name: "Sofá Neon Chill",
    category: "Estético",
    price: 1200,
    description: "O ápice do conforto futurista.",
    assetPath: "https://picsum.photos/seed/sofa/400/300",
    dimensions: { width: 220, height: 140 },
    gridSize: { w: 3, h: 2 }
  },
  {
    id: "mesa-01",
    name: "Mesa de Vidro",
    category: "Essencial",
    price: 650,
    description: "Transparência total nos seus negócios.",
    assetPath: "https://picsum.photos/seed/table/400/300",
    dimensions: { width: 140, height: 120 },
    gridSize: { w: 2, h: 2 }
  }
];
