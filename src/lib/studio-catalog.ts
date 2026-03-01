import { StudioItem } from './types';

/**
 * Catálogo expandido com assets de alta fidelidade visual.
 */
export const STUDIO_CATALOG: StudioItem[] = [
  // --- MÓVEIS (ESSENCIAL) ---
  {
    id: "bed-01",
    name: "Cama Neon-Pod",
    category: "Essencial",
    price: 1200,
    description: "Conforto orbital para sonhos lúcidos.",
    assetPath: "https://picsum.photos/seed/bed1/400/300",
    dimensions: { width: 220, height: 180 },
    gridSize: { w: 3, h: 2 }
  },
  {
    id: "table-01",
    name: "Mesa Digital-Oak",
    category: "Essencial",
    price: 850,
    description: "Madeira real com interfaces holográficas.",
    assetPath: "https://picsum.photos/seed/table1/400/300",
    dimensions: { width: 160, height: 140 },
    gridSize: { w: 2, h: 2 }
  },
  {
    id: "sofa-01",
    name: "Sofá Cloud-9",
    category: "Essencial",
    price: 1500,
    description: "Sinta-se flutuando no seu próprio lounge.",
    assetPath: "https://picsum.photos/seed/sofa1/400/300",
    dimensions: { width: 240, height: 140 },
    gridSize: { w: 3, h: 2 }
  },

  // --- ATIVOS (PSICOMOTOR) ---
  {
    id: "mat-01",
    name: "Tapete de Fluxo",
    category: "Ativo",
    price: 300,
    description: "Detecta seus passos milimetricamente.",
    assetPath: "https://picsum.photos/seed/mat1/400/300",
    dimensions: { width: 180, height: 140 },
    gridSize: { w: 2, h: 2 }
  },
  {
    id: "ladder-01",
    name: "Escada de Agilidade",
    category: "Ativo",
    price: 450,
    description: "Treine seus reflexos urbanos.",
    assetPath: "https://picsum.photos/seed/ladder/400/300",
    dimensions: { width: 120, height: 260 },
    gridSize: { w: 1, h: 3 }
  },

  // --- ESTÉTICO ---
  {
    id: "plant-01",
    name: "Monstera Digitalis",
    category: "Estético",
    price: 250,
    description: "Beleza verde que nunca precisa de água.",
    assetPath: "https://picsum.photos/seed/plant1/400/300",
    dimensions: { width: 100, height: 140 },
    gridSize: { w: 1, h: 1 }
  },
  {
    id: "lamp-01",
    name: "Lâmpada de Plasma",
    category: "Estético",
    price: 400,
    description: "Iluminação ambiente em tons de violeta.",
    assetPath: "https://picsum.photos/seed/lamp1/400/300",
    dimensions: { width: 80, height: 180 },
    gridSize: { w: 1, h: 1 }
  },

  // --- PAPÉIS DE PAREDE ---
  {
    id: "wall-01",
    name: "Tijolo Industrial",
    category: "Papel de Parede",
    price: 200,
    description: "Estilo loft nova-iorquino.",
    assetPath: "https://picsum.photos/seed/wall1/200/200",
    dimensions: { width: 0, height: 0 }
  },
  {
    id: "wall-02",
    name: "Neon Grid",
    category: "Papel de Parede",
    price: 350,
    description: "Paredes que pulsam com a rede.",
    assetPath: "https://picsum.photos/seed/wall2/200/200",
    dimensions: { width: 0, height: 0 }
  },

  // --- PISOS ---
  {
    id: "floor-01",
    name: "Parquet de Madeira",
    category: "Piso",
    price: 150,
    description: "Clássico e acolhedor.",
    assetPath: "https://picsum.photos/seed/floor1/200/200",
    dimensions: { width: 0, height: 0 }
  },
  {
    id: "floor-02",
    name: "Cimento Queimado",
    category: "Piso",
    price: 250,
    description: "Moderno e minimalista.",
    assetPath: "https://picsum.photos/seed/floor2/200/200",
    dimensions: { width: 0, height: 0 }
  }
];
