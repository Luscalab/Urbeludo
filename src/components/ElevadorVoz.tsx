'use client';

import { ElevatorGame } from '@/components/elevator-game';
import { useCallback, useRef } from 'react';

export interface ElevadorVozProps {
  onWin?: (points: number, achievement: string) => void;
  userName?: string;
  onSuggestBreath?: () => void;
}

/**
 * ElevadorVoz - Wrapper que conecta props legadas a ElevatorGame.
 * Mantém compatibilidade com código antigo enquanto usa a nova implementação.
 */
export function ElevadorVoz(props: ElevadorVozProps) {
  // Usa ref para manter a callback estável entre re-renders
  const onWinRef = useRef(props.onWin);
  
  // Atualiza ref quando prop muda
  onWinRef.current = props.onWin;

  // Cria wrapper que passa props corretas
  const handleWinWrapper = useCallback((points: number, achievement: string) => {
    if (onWinRef.current) {
      onWinRef.current(points, achievement);
    }
  }, []);

  return (
    <ElevatorGame 
      onWin={handleWinWrapper}
      userName={props.userName}
      onSuggestBreath={props.onSuggestBreath}
    />
  );
}
