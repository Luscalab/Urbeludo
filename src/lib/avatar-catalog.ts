
/**
 * Utilitário para o catálogo de avatares dinâmico do UrbeLudo.
 * Localização física: public/assets/avatars
 */

export interface AvatarAsset {
  id: string;
  name: string;
  src: string;
}

// Fallback visual caso o arquivo falhe ou a pasta esteja vazia
export const FALLBACK_AVATAR_SRC = "https://picsum.photos/seed/ludo/400/400";

/**
 * Constrói o objeto de asset para qualquer imagem dentro de /assets/avatars/
 * @param filename O nome do arquivo (ex: "meu_heroi.png")
 */
export const getAvatarById = (filename: string | null | undefined): AvatarAsset => {
  if (!filename || filename === 'placeholder.png') {
    return {
      id: 'placeholder',
      name: 'Explorador',
      src: FALLBACK_AVATAR_SRC
    };
  }

  // O Next.js serve arquivos de 'public' na raiz do servidor
  return {
    id: filename,
    name: filename.split('.')[0].replace(/[-_]/g, ' '),
    src: `/assets/avatars/${filename}`
  };
};
