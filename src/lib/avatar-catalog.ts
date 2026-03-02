/**
 * Utilitário de Catálogo de Avatares Universal.
 * Mapeia nomes de arquivos para caminhos acessíveis pelo navegador com fallback robusto.
 */

export interface AvatarAsset {
  id: string;
  name: string;
  src: string;
}

// Lista estática de avatares disponíveis
export const STATIC_AVATAR_LIST = [
  "avatar1.png",
  "avatar2.png",
  "avatar3.png",
  "hero_default.png"
];

export const FALLBACK_AVATAR_SRC = "https://picsum.photos/seed/urbeludo/400/400";

/**
 * Resolve o caminho da imagem baseando-se no diretório /assets/avatars/
 * Caso a imagem não exista (404), o componente deve lidar com o onError
 * ou usar o fallback definido aqui.
 */
export const getAvatarById = (filename: string | null | undefined): AvatarAsset => {
  if (!filename || filename === '') {
    return {
      id: 'placeholder',
      name: 'Explorador',
      src: FALLBACK_AVATAR_SRC
    };
  }

  // Se for uma URL externa ou gerada por IA
  if (filename.startsWith('http') || filename.startsWith('data:')) {
    return {
      id: filename,
      name: 'Identidade Especial',
      src: filename
    };
  }

  // Caminho padrão para ativos locais no APK.
  // IMPORTANTE: Adicionamos um seed baseado no nome para que o fallback seja consistente
  const fallback = `https://picsum.photos/seed/${filename}/400/400`;

  return {
    id: filename,
    name: filename.split('.')[0].replace(/[-_]/g, ' '),
    src: `/assets/avatars/${filename}`,
    // @ts-ignore - Propriedade extra para facilitar o uso de fallbacks em componentes
    fallbackSrc: fallback
  };
};
