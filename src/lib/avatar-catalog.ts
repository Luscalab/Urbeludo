
/**
 * Utilitário de Catálogo de Avatares Universal.
 * Mapeia nomes de arquivos para caminhos acessíveis pelo navegador.
 * Versão Estática: Lista os avatares disponíveis sem depender de API.
 */

export interface AvatarAsset {
  id: string;
  name: string;
  src: string;
}

// Lista estática de avatares disponíveis na pasta public/assets/avatars/
// Adicione novos arquivos aqui conforme necessário para o APK.
export const STATIC_AVATAR_LIST = [
  "avatar1.png",
  "avatar2.png",
  "avatar3.png",
  "hero_default.png"
];

export const FALLBACK_AVATAR_SRC = "https://picsum.photos/seed/urbeludo/400/400";

/**
 * Resolve o caminho da imagem baseando-se no diretório /assets/avatars/
 */
export const getAvatarById = (filename: string | null | undefined): AvatarAsset => {
  if (!filename || filename === '') {
    return {
      id: 'placeholder',
      name: 'Explorador',
      src: FALLBACK_AVATAR_SRC
    };
  }

  // Se já for uma URL (externa ou IA), mantém
  if (filename.startsWith('http') || filename.startsWith('data:')) {
    return {
      id: filename,
      name: 'Identidade Especial',
      src: filename
    };
  }

  // No Next.js, a pasta public é servida na raiz /
  return {
    id: filename,
    name: filename.split('.')[0].replace(/[-_]/g, ' '),
    src: `/assets/avatars/${filename}`
  };
};
