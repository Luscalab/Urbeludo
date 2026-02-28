
import { StudioItem } from './types';

/**
 * Catálogo Central de Ativos da Studio Update.
 * Todos os caminhos apontam para a pasta /public/assets/studio/
 * Os nomes dos arquivos devem ser exatamente os que estão na pasta.
 */
export const STUDIO_CATALOG: StudioItem[] = [
  {
    id: 'cama-01',
    name: 'Cama de Descanso',
    category: 'Essencial',
    price: 100,
    description: 'Um lugar para o explorador recarregar as energias após as missões.',
    assetPath: '/assets/studio/cama_minimalista.png',
    dimensions: { width: 160, height: 120 },
    gridSize: { w: 2, h: 2 }
  },
  {
    id: 'tapete-01',
    name: 'Tapete de Movimento',
    category: 'Ativo',
    price: 150,
    description: 'Aumenta a precisão dos seus movimentos em missões domésticas.',
    assetPath: '/assets/studio/tapete_psicomotor.png',
    dimensions: { width: 140, height: 100 },
    gridSize: { w: 2, h: 1 }
  },
  {
    id: 'espaldar-01',
    name: 'Espaldar de Parede',
    category: 'Ativo',
    price: 300,
    description: 'Equipamento essencial para treinos de força e postura.',
    assetPath: '/assets/studio/espaldar_madeira.png',
    dimensions: { width: 100, height: 180 },
    gridSize: { w: 1, h: 1 }
  },
  {
    id: 'vaso-01',
    name: 'Vaso de Hortelã',
    category: 'Estético',
    price: 50,
    description: 'Um toque de natureza e frescor para o seu lar digital.',
    assetPath: '/assets/studio/vaso_hortela.png',
    dimensions: { width: 60, height: 80 },
    gridSize: { w: 1, h: 1 }
  }
];
