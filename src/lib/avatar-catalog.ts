/**
 * Catálogo Central de Avatares do UrbeLudo.
 * Sincronizado com a pasta public/assets/avatars/
 */
export interface AvatarAsset {
  id: string;
  name: string;
  src: string;
  fileName: string;
}

export const AVATAR_CATALOG: AvatarAsset[] = [
  { id: "av-1", name: "Explorador Alpha", src: "/assets/avatars/1.png", fileName: "1.png" },
  { id: "av-2", name: "Explorador Beta", src: "/assets/avatars/2.png", fileName: "2.png" },
  { id: "av-3", name: "Explorador Gamma", src: "/assets/avatars/3.png", fileName: "3.png" },
  { id: "av-4", name: "Explorador Delta", src: "/assets/avatars/4.png", fileName: "4.png" },
  { id: "av-5", name: "Explorador Epsilon", src: "/assets/avatars/5.png", fileName: "5.png" },
  { id: "av-6", name: "Explorador Zeta", src: "/assets/avatars/6.png", fileName: "6.png" },
  { id: "av-7", name: "Explorador Eta", src: "/assets/avatars/7.png", fileName: "7.png" },
  { id: "av-8", name: "Explorador Theta", src: "/assets/avatars/8.png", fileName: "8.png" },
  { id: "av-9", name: "Explorador Iota", src: "/assets/avatars/9.png", fileName: "9.png" },
  { id: "av-10", name: "Explorador Kappa", src: "/assets/avatars/10.png", fileName: "10.png" },
];

export const getAvatarById = (id: string) => {
  return AVATAR_CATALOG.find(a => a.id === id) || AVATAR_CATALOG[0];
};
