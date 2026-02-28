
/**
 * Catálogo de Avatares do UrbeLudo.
 * Mapeia todos os personagens disponíveis na pasta public/assets/avatars/
 */
export interface AvatarAsset {
  id: string;
  name: string;
  src: string;
}

export const AVATAR_CATALOG: AvatarAsset[] = [
  { id: "avatar-01", name: "Explorador Urbano", src: "/assets/avatars/avatar_01.png" },
  { id: "avatar-02", name: "Mestre da Capoeira", src: "/assets/avatars/avatar_02.png" },
  { id: "avatar-03", name: "Menina Skatista", src: "/assets/avatars/avatar_03.png" },
  { id: "avatar-04", name: "Ninja das Calçadas", src: "/assets/avatars/avatar_04.png" },
  { id: "avatar-05", name: "Acrobata da Luz", src: "/assets/avatars/avatar_05.png" },
  { id: "avatar-06", name: "Guardião do Asfalto", src: "/assets/avatars/avatar_06.png" },
  { id: "avatar-07", name: "Dançarina de Neon", src: "/assets/avatars/avatar_07.png" },
  { id: "avatar-08", name: "Veloz Urbano", src: "/assets/avatars/avatar_08.png" },
  { id: "avatar-09", name: "Zenitista", src: "/assets/avatars/avatar_09.png" },
  { id: "avatar-10", name: "Exploradora de Alturas", src: "/assets/avatars/avatar_10.png" },
];

export const getAvatarById = (id: string) => {
  return AVATAR_CATALOG.find(a => a.id === id) || AVATAR_CATALOG[0];
};
