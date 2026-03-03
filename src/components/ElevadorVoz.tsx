'use client';

import { ElevatorGame } from '@/components/elevator-game';

interface ElevadorVozProps {
  onWin?: (points: number, achievement: string) => void;
  userName?: string;
  onSuggestBreath?: () => void;
}

/**
 * ElevadorVoz - Wrapper compatível com legado do novo componente ElevatorGame 2026.
 * Props legadas são opcionais e mantidas para compatibilidade.
 */
export function ElevadorVoz(props: ElevadorVozProps) {
  // O novo ElevatorGame gerencia seu próprio estado e lógica
  // As props legadas são aceitas para compatibilidade com código existente
  // mas não são necessárias para o funcionamento do novo componente
  return <ElevatorGame />;
}
