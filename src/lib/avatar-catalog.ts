
/**
 * Catálogo de Avatares do UrbeLudo.
 * Mapeado com base nos nomes reais de arquivos identificados na pasta public/assets/avatars/
 */
export interface AvatarAsset {
  id: string;
  name: string;
  src: string;
}

export const AVATAR_CATALOG: AvatarAsset[] = [
  { id: "avatar-01", name: "Explorador 1", src: "/assets/avatars/1.png" },
  { id: "avatar-02", name: "Explorador 3", src: "/assets/avatars/3.png" },
  { id: "avatar-03", name: "Ninja Urbano", src: "/assets/avatars/file_00000000ace071f5acedf77d11765104.png" },
  { id: "avatar-04", name: "Mestre do Asfalto", src: "/assets/avatars/file_00000000b78c720ea96841c6ab04c995.png" },
  { id: "avatar-05", name: "Acrobata Neon", src: "/assets/avatars/file_00000000b62471f5a18eb09b47f63104.png" },
  { id: "avatar-06", name: "Skatista Pro", src: "/assets/avatars/file_00000000b210720e874e74d8b066c995.png" },
  { id: "avatar-07", name: "Guardiã Digital", src: "/assets/avatars/file_00000000cb18720e58f581097726c995.png" },
  { id: "avatar-08", name: "Veloz 2026", src: "/assets/avatars/file_00000000d2cc720e8a44a22014cc995.png" },
  { id: "avatar-09", name: "Zenitista", src: "/assets/avatars/file_00000000d5b4720e949b3dd88b33104.png" },
  { id: "avatar-10", name: "Explorador de Altura", src: "/assets/avatars/file_00000000df80720e860903b29216c995.png" },
];

export const getAvatarById = (id: string) => {
  return AVATAR_CATALOG.find(a => a.id === id) || AVATAR_CATALOG[0];
};
