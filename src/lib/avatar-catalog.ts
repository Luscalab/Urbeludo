
/**
 * Utilitário para o catálogo de avatares do UrbeLudo.
 * Centraliza o caminho dos assets localizados em public/studio/avatares.
 */

export interface AvatarAsset {
  id: string;
  name: string;
  src: string;
}

// Ponto de verdade para o avatar inicial (fallback)
export const FALLBACK_AVATAR = {
  id: '1.png',
  name: 'Explorador Alfa',
  src: '/studio/avatares/1.png'
};

/**
 * Mapeia um ID de arquivo para um objeto de asset completo.
 * @param filename Nome do arquivo na pasta public/studio/avatares
 */
export const getAvatarById = (filename: string) => {
  if (!filename) return FALLBACK_AVATAR;
  return {
    id: filename,
    name: `Herói ${filename.split('.')[0]}`,
    src: `/studio/avatares/${filename}`
  };
};
