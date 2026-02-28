
/**
 * Catálogo Central de Avatares do UrbeLudo.
 * Sincronizado com os arquivos identificados na pasta public/assets/avatars/
 */
export interface AvatarAsset {
  id: string;
  name: string;
  src: string;
}

export const AVATAR_CATALOG: AvatarAsset[] = [
  { id: "av-01", name: "Explorador 1", src: "/assets/avatars/1.png" },
  { id: "av-02", name: "Explorador 2", src: "/assets/avatars/2.png" },
  { id: "av-03", name: "Explorador 3", src: "/assets/avatars/3.png" },
  { id: "av-04", name: "Explorador 4", src: "/assets/avatars/4.png" },
  { id: "av-05", name: "Explorador 5", src: "/assets/avatars/5.png" },
  { id: "av-06", name: "Explorador 6", src: "/assets/avatars/6.png" },
  { id: "av-07", name: "Explorador 7", src: "/assets/avatars/7.png" },
  { id: "av-08", name: "Explorador 8", src: "/assets/avatars/8.png" },
  { id: "av-09", name: "Explorador 9", src: "/assets/avatars/9.png" },
  { id: "av-10", name: "Explorador 10", src: "/assets/avatars/10.png" },
];

export const getAvatarById = (id: string) => {
  return AVATAR_CATALOG.find(a => a.id === id) || AVATAR_CATALOG[0];
};
