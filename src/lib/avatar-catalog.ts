/**
 * Catálogo Central de Avatares do UrbeLudo.
 * Sincronizado com os nomes de arquivos simplificados (1.png a 32.png).
 */
export interface AvatarAsset {
  id: string;
  name: string;
  src: string;
}

// Gerando 32 entradas para cobrir todas as fotos da pasta
export const AVATAR_CATALOG: AvatarAsset[] = Array.from({ length: 32 }, (_, i) => ({
  id: `av-${(i + 1).toString().padStart(2, '0')}`,
  name: `Explorador ${i + 1}`,
  src: `/assets/avatars/${i + 1}.png`
}));

export const getAvatarById = (id: string) => {
  return AVATAR_CATALOG.find(a => a.id === id) || AVATAR_CATALOG[0];
};
