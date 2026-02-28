/**
 * Utilitário para o catálogo de avatares.
 * Como o app agora é dinâmico, este arquivo fornece o avatar inicial e utilitários de mapeamento.
 */

export interface AvatarAsset {
  id: string;
  name: string;
  src: string;
}

// Único ponto de verdade para o avatar de segurança e inicialização
export const FALLBACK_AVATAR = {
  id: '1.png',
  name: 'Explorador Padrão',
  src: '/assets/avatars/1.png'
};

export const getAvatarById = (filename: string) => {
  if (!filename) return FALLBACK_AVATAR;
  return {
    id: filename,
    name: `Explorador ${filename.split('.')[0]}`,
    src: `/assets/avatars/${filename}`
  };
};
