import { StudioItem } from './types';

/**
 * Catálogo Central de Ativos do Estúdio - Versão Produção.
 * Mapeia os arquivos PNG transparentes da pasta /public/assets/studio/
 * integrando dimensões de grid para o estilo "The Sims".
 */
export const STUDIO_CATALOG: StudioItem[] = [
  {
    id: 'cama-minimalista',
    name: 'Cama de Descanso',
    category: 'Essencial',
    price: 100,
    description: 'Um lugar para o explorador recarregar as energias após as missões.',
    assetPath: '/assets/studio/cama_iso.png',
    dimensions: { width: 160, height: 120 },
    gridSize: { w: 4, h: 3 }
  },
  {
    id: 'tapete-psicomotor',
    name: 'Tapete de Movimento',
    category: 'Ativo',
    price: 150,
    description: 'Aumenta a precisão dos seus movimentos em missões domésticas.',
    assetPath: '/assets/studio/tapete_psico_iso.png',
    dimensions: { width: 120, height: 80 },
    gridSize: { w: 3, h: 2 }
  },
  {
    id: 'espaldar-madeira',
    name: 'Espaldar de Parede',
    category: 'Ativo',
    price: 300,
    description: 'Equipamento essencial para treinos de força e postura.',
    assetPath: '/assets/studio/espaldar_iso.png',
    dimensions: { width: 80, height: 160 },
    gridSize: { w: 2, h: 4 }
  },
  {
    id: 'bola-pilates',
    name: 'Bola de Equilíbrio',
    category: 'Ativo',
    price: 200,
    description: 'Desenvolve estabilidade central e consciência corporal.',
    assetPath: '/assets/studio/bola_pilates_iso.png',
    dimensions: { width: 60, height: 60 },
    gridSize: { w: 1, h: 1 }
  },
  {
    id: 'vaso-hortela',
    name: 'Vaso de Hortelã',
    category: 'Estético',
    price: 50,
    description: 'Um toque de natureza e frescor para o seu lar digital.',
    assetPath: '/assets/studio/vaso_hortela_iso.png',
    dimensions: { width: 40, height: 60 },
    gridSize: { w: 1, h: 1 }
  },
  {
    id: 'rhythm-box',
    name: 'Vitrola Rítmica',
    price: 500,
    category: 'Especial',
    description: 'Desbloqueia novas frequências sonoras no Eco Urbano.',
    assetPath: '/assets/studio/vitrola_iso.png',
    dimensions: { width: 60, height: 60 },
    gridSize: { w: 1, h: 1 }
  },
  {
    id: 'aura-lamp',
    name: 'Lâmpada de Aura',
    price: 300,
    category: 'Estético',
    description: 'Ilumina o ambiente com a cor da sua identidade digital.',
    assetPath: '/assets/studio/lampada_iso.png',
    dimensions: { width: 40, height: 80 },
    gridSize: { w: 1, h: 1 }
  },
  {
    id: 'poster-neon',
    name: 'Pôster de Neon',
    price: 120,
    category: 'Estético',
    description: 'Arte futurista para decorar as paredes do seu estúdio.',
    assetPath: '/assets/studio/poster_neon_iso.png',
    dimensions: { width: 60, height: 80 },
    gridSize: { w: 1, h: 2 }
  }
];
