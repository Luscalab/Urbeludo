
/**
 * Utilitário para o catálogo de avatares dinâmico do UrbeLudo.
 */

export interface AvatarAsset {
  id: string;
  name: string;
  src: string;
}

// Placeholder caso a pasta esteja vazia ou o arquivo suma
export const FALLBACK_AVATAR_SRC = "https://picsum.photos/seed/ludo/400/400";

/**
 * Mapeia um nome de arquivo para um objeto de asset completo.
 * Aceita qualquer nome de arquivo que esteja na pasta /assets/avatars/
 */
export const getAvatarById = (filename: string | null | undefined): AvatarAsset => {
  if (!filename) {
    return {
      id: 'placeholder',
      name: 'Explorador',
      src: FALLBACK_AVATAR_SRC
    };
  }

  return {
    id: filename,
    name: filename.split('.')[0].replace(/[-_]/g, ' '),
    src: `/assets/avatars/${filename}`
  };
};
