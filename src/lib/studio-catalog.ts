import { StudioItem } from './types';

/**
 * Catálogo Central de Ativos do Estúdio.
 * Todos os caminhos de assets apontam para a pasta /public do Next.js.
 */
export const STUDIO_CATALOG: StudioItem[] = [
  {
    id: 'cama-minimalista',
    name: 'Cama de Descanso',
    category: 'Essencial',
    price: 100,
    description: 'Um lugar para o explorador recarregar as energias.',
    assetPath: '🛏️', // Futuramente: '/assets/studio/cama_iso.svg'
    dimensions: { width: 120, height: 160 },
    gridSize: { w: 3, h: 4 }
  },
  {
    id: 'tapete-psicomotor',
    name: 'Tapete de Movimento',
    category: 'Ativo',
    price: 150,
    description: 'Aumenta a precisão dos desafios domésticos em 10%.',
    assetPath: '🧘',
    dimensions: { width: 100, height: 100 },
    gridSize: { w: 2, h: 2 }
  },
  {
    id: 'espaldar-madeira',
    name: 'Espaldar de Parede',
    category: 'Ativo',
    price: 300,
    description: 'Item clássico de psicomotricidade para treinos de força.',
    assetPath: '🪜',
    dimensions: { width: 80, height: 120 },
    gridSize: { w: 2, h: 3 }
  },
  {
    id: 'vaso-hortela',
    name: 'Vaso de Hortelã',
    category: 'Estético',
    price: 50,
    description: 'Um toque de natureza e frescor para o ambiente.',
    assetPath: '🌿',
    dimensions: { width: 40, height: 40 },
    gridSize: { w: 1, h: 1 }
  },
  {
    id: 'rhythm-box',
    name: 'Vitrola Rítmica 2026',
    price: 500,
    category: 'Especial',
    description: 'Desbloqueia novas frequências sonoras no Playground.',
    assetPath: '📻',
    dimensions: { width: 60, height: 60 },
    gridSize: { w: 1, h: 1 }
  },
  {
    id: 'aura-lamp',
    name: 'Lâmpada de Aura Digital',
    price: 300,
    category: 'Estético',
    description: 'Ilumina o estúdio com a cor da sua identidade.',
    assetPath: '💡',
    dimensions: { width: 40, height: 40 },
    gridSize: { w: 1, h: 1 }
  }
];
