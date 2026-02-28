
/**
 * Utilitário para o catálogo de avatares.
 * Como o app agora é dinâmico, este arquivo serve como utilitário de mapeamento e fallback.
 */

export interface AvatarAsset {
  id: string;
  name: string;
  src: string;
}

// Fallback estático caso a API falhe ou a pasta esteja vazia
export const FALLBACK_AVATAR = {
  id: '1.png',
  name: 'Explorador Padrão',
  src: '/assets/avatars/1.png'
};

export const getAvatarById = (filename: string) => {
  return {
    id: filename,
    name: `Explorador ${filename.split('.')[0]}`,
    src: `/assets/avatars/${filename}`
  };
};
