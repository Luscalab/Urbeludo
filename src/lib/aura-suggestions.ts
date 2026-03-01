/**
 * @fileOverview Sugestões de interação para o AuraHelper.
 * Focado nos pilares de Psicomotricidade e suporte técnico.
 */

export interface AuraSuggestion {
  id: string;
  label: string;
  icon: string;
}

export const SUGESTOES_AURA: AuraSuggestion[] = [
  { id: 'jogar_elevador', label: 'Como jogar o Elevador?', icon: '🎮' },
  { id: 'clinico_psico', label: 'O que é Psicomotricidade?', icon: '🧠' },
  { id: 'zona_estabilidade', label: 'Zona de Estabilidade?', icon: '🟢' },
  { id: 'praxia_fina', label: 'O que é Praxia Fina?', icon: '✨' },
  { id: 'moedas', label: 'Para que servem as LudoCoins?', icon: '💰' },
  { id: 'tecnico_ajuda', label: 'Problemas técnicos?', icon: '🔧' },
  { id: 'esquema_corporal', label: 'O que é Esquema Corporal?', icon: '👤' }
];
