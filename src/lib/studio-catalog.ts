import { StudioItem } from './types';

/**
 * Catálogo Central de Ativos da Studio Update.
 * Mapeia os arquivos PNG transparentes da pasta "studio update".
 */
export const STUDIO_CATALOG: StudioItem[] = [
  {
    id: 'cama-01',
    name: 'Cama de Descanso',
    category: 'Essencial',
    price: 100,
    description: 'Um lugar para o explorador recarregar as energias após as missões.',
    assetPath: '/assets/studio/studio update/cama_minimalista.png',
    dimensions: { width: 160, height: 120 },
    gridSize: { w: 2, h: 2 }
  },
  {
    id: 'tapete-01',
    name: 'Tapete de Movimento',
    category: 'Ativo',
    price: 150,
    description: 'Aumenta a precisão dos seus movimentos em missões domésticas.',
    assetPath: '/assets/studio/studio update/tapete_psicomotor.png',
    dimensions: { width: 120, height: 80 },
    gridSize: { w: 2, h: 1 }
  },
  {
    id: 'espaldar-01',
    name: 'Espaldar de Parede',
    category: 'Ativo',
    price: 300,
    description: 'Equipamento essencial para treinos de força e postura.',
    assetPath: '/assets/studio/studio update/espaldar_madeira.png',
    dimensions: { width: 80, height: 160 },
    gridSize: { w: 1, h: 1 }
  },
  {
    id: 'vaso-01',
    name: 'Vaso de Hortelã',
    category: 'Estético',
    price: 50,
    description: 'Um toque de natureza e frescor para o seu lar digital.',
    assetPath: '/assets/studio/studio update/vaso_hortela.png',
    dimensions: { width: 40, height: 60 },
    gridSize: { w: 1, h: 1 }
  }
];
