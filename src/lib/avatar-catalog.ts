
/**
 * Utilitário de Catálogo de Avatares Dinâmico.
 * Converte qualquer nome de arquivo em um caminho de imagem válido no navegador.
 */

export interface AvatarAsset {
  id: string;
  name: string;
  src: string;
}

export const FALLBACK_AVATAR_SRC = "https://picsum.photos/seed/urbeludo/400/400";

/**
 * Resolve o caminho da imagem baseando-se no nome do arquivo dentro de public/assets/avatars/
 */
export const getAvatarById = (filename: string | null | undefined): AvatarAsset => {
  if (!filename || filename === '') {
    return {
      id: 'placeholder',
      name: 'Explorador',
      src: FALLBACK_AVATAR_SRC
    };
  }

  // Se o id já for uma URL (caso de IA ou externas), mantém
  if (filename.startsWith('http') || filename.startsWith('data:')) {
    return {
      id: filename,
      name: 'Avatar Especial',
      src: filename
    };
  }

  // O Next.js serve a pasta public na raiz do servidor web
  return {
    id: filename,
    name: filename.split('.')[0].replace(/[-_]/g, ' '),
    src: `/assets/avatars/${filename}`
  };
};
