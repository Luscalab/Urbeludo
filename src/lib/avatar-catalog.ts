/**
 * Catálogo Central de Avatares do UrbeLudo.
 * Sincronizado com a pasta public/assets/avatars/
 */
export interface AvatarAsset {
  id: string;
  name: string;
  src: string;
}

export const AVATAR_CATALOG: AvatarAsset[] = [
  { id: "avatar-01", name: "Explorador 01", src: "/assets/avatars/1.png" },
  { id: "avatar-02", name: "Explorador 02", src: "/assets/avatars/2.png" },
  { id: "avatar-03", name: "Explorador 03", src: "/assets/avatars/3.png" },
  { id: "avatar-04", name: "Explorador 04", src: "/assets/avatars/4.png" },
  { id: "avatar-05", name: "Explorador 05", src: "/assets/avatars/5.png" },
  { id: "avatar-06", name: "Explorador 06", src: "/assets/avatars/6.png" },
  { id: "avatar-07", name: "Explorador 07", src: "/assets/avatars/7.png" },
  { id: "avatar-08", name: "Explorador 08", src: "/assets/avatars/8.png" },
  { id: "avatar-09", name: "Explorador 09", src: "/assets/avatars/9.png" },
  { id: "avatar-10", name: "Explorador 10", src: "/assets/avatars/10.png" },
];

export const getAvatarById = (id: string) => {
  return AVATAR_CATALOG.find(a => a.id === id) || AVATAR_CATALOG[0];
};
