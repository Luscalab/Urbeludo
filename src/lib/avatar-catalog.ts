/**
 * Utilitário para o catálogo de avatares dinâmico do UrbeLudo.
 * Aceita qualquer arquivo presente em public/assets/avatars.
 */

export interface AvatarAsset {
  id: string;
  name: string;
  src: string;
}

// Fallback visual absoluto caso nenhum arquivo seja encontrado
export const FALLBACK_AVATAR_SRC = "https://picsum.photos/seed/urbeludo/400/400";

/**
 * Constrói o objeto de asset para qualquer arquivo dentro de public/assets/avatars/
 * No navegador, o caminho começa em /assets/avatars/
 * @param filename O nome real do arquivo (ex: 'heroi.png', 'minha_foto.jpg')
 */
export const getAvatarById = (filename: string | null | undefined): AvatarAsset => {
  if (!filename || filename === '') {
    return {
      id: 'placeholder',
      name: 'Explorador',
      src: FALLBACK_AVATAR_SRC
    };
  }

  // O Next.js serve arquivos da pasta 'public' na raiz do servidor web
  return {
    id: filename,
    name: filename.split('.')[0].replace(/[-_]/g, ' '),
    src: `/assets/avatars/${filename}`
  };
};
