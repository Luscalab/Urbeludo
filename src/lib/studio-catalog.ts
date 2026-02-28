import { StudioItem } from './types';

/**
 * Catálogo Central de Ativos do Estúdio.
 * Todos os caminhos de assets apontam para a pasta /public/assets/studio/
 * garantindo que o APK funcione 100% offline com imagens PNG transparentes.
 */
export const STUDIO_CATALOG: StudioItem[] = [
  {
    id: 'cama-minimalista',
    name: 'Cama de Descanso',
    category: 'Essencial',
    price: 100,
    description: 'Um lugar para o explorador recarregar as energias.',
    assetPath: '/assets/studio/cama_iso.png',
    dimensions: { width: 160, height: 120 },
    gridSize: { w: 4, h: 3 }
  },
  {
    id: 'tapete-psicomotor',
    name: 'Tapete de Movimento',
    category: 'Ativo',
    price: 150,
    description: 'Aumenta a precisão dos desafios domésticos.',
    assetPath: '/assets/studio/tapete_psico_iso.png',
    dimensions: { width: 120, height: 80 },
    gridSize: { w: 3, h: 2 }
  },
  {
    id: 'espaldar-madeira',
    name: 'Espaldar de Parede',
    category: 'Ativo',
    price: 300,
    description: 'Equipamento clássico para treinos de força e postura.',
    assetPath: '/assets/studio/espaldar_iso.png',
    dimensions: { width: 80, height: 160 },
    gridSize: { w: 2, h: 4 }
  },
  {
    id: 'vaso-hortela',
    name: 'Vaso de Hortelã',
    category: 'Estético',
    price: 50,
    description: 'Um toque de natureza e frescor para o ambiente.',
    assetPath: '/assets/studio/vaso_hortela_iso.png',
    dimensions: { width: 40, height: 60 },
    gridSize: { w: 1, h: 1 }
  },
  {
    id: 'rhythm-box',
    name: 'Vitrola Rítmica',
    price: 500,
    category: 'Especial',
    description: 'Desbloqueia novas frequências sonoras no Playground.',
    assetPath: '/assets/studio/vitrola_iso.png',
    dimensions: { width: 60, height: 60 },
    gridSize: { w: 1, h: 1 }
  },
  {
    id: 'aura-lamp',
    name: 'Lâmpada de Aura',
    price: 300,
    category: 'Estético',
    description: 'Ilumina o estúdio com a cor da sua identidade digital.',
    assetPath: '/assets/studio/lampada_iso.png',
    dimensions: { width: 40, height: 80 },
    gridSize: { w: 1, h: 1 }
  }
];
