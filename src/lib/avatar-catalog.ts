
/**
 * Utilitário de Catálogo de Avatares Universal.
 * Mapeia IDs para imagens do Picsum para evitar erros 404 no MVP Standalone.
 */

export interface AvatarAsset {
  id: string;
  name: string;
  src: string;
}

// IDs dos avatares disponíveis
export const STATIC_AVATAR_LIST = [
  "explorer-1",
  "explorer-2",
  "explorer-3",
  "explorer-default"
];

/**
 * Resolve o caminho da imagem usando Picsum para garantir que sempre haja uma imagem.
 */
export const getAvatarById = (id: string | null | undefined): AvatarAsset => {
  if (!id || id === '') {
    return {
      id: 'placeholder',
      name: 'Explorador',
      src: "https://picsum.photos/seed/urbeludo-guest/400/600"
    };
  }

  // Se for uma URL externa ou gerada por IA
  if (id.startsWith('http') || id.startsWith('data:')) {
    return {
      id: id,
      name: 'Identidade Especial',
      src: id
    };
  }

  // Usamos picsum com seed baseado no ID para consistência visual sem depender de arquivos locais no APK
  return {
    id: id,
    name: id.replace(/[-_]/g, ' '),
    src: `https://picsum.photos/seed/${id}/400/600`
  };
};
