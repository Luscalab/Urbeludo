
'use client';

import { useEffect, useState } from 'react';
import { LocalPersistence } from '@/lib/local-persistence';
import { Loader2 } from 'lucide-react';
import { FALLBACK_AVATAR } from '@/lib/avatar-catalog';

/**
 * Componente que garante a inicialização correta do estado do usuário.
 * Versão Standalone - Fix de Hidratação.
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const initLocalAuth = async () => {
      let uid = await LocalPersistence.getUserId();
      if (!uid) {
        uid = `URBE_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        await LocalPersistence.saveUserId(uid);
        const initialData = {
          id: uid,
          displayName: `Explorador_${uid.slice(-4)}`,
          ludoCoins: 50,
          psychomotorLevel: 1,
          totalChallengesCompleted: 0,
          currentStreak: 0,
          hasSeenTutorial: false,
          dominantColor: '#9333ea',
          avatar: { avatarId: FALLBACK_AVATAR.id },
          history: []
        };
        await LocalPersistence.saveProgress(initialData);
      }
      setIsReady(true);
    };
    initLocalAuth();
  }, []);

  // Loader consistente para evitar Hydration Mismatch
  if (!mounted || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase text-primary tracking-widest">Iniciando Espelho Mágico</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
