'use client';

import { useEffect, useState, useRef } from 'react';
import { LocalPersistence } from '@/lib/local-persistence';
import { STATIC_AVATAR_LIST } from '@/lib/avatar-catalog';
import { Loader2 } from 'lucide-react';

/**
 * Componente que garante a inicialização correta do estado do usuário.
 * Corrigido para evitar loops de renderização e travamentos de storage.
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const initAttempted = useRef(false);

  useEffect(() => {
    setMounted(true);
    
    if (initAttempted.current) return;
    initAttempted.current = true;

    const initLocalAuth = async () => {
      try {
        let uid = await LocalPersistence.getUserId();
        let currentProgress = await LocalPersistence.getProgress();

        if (!uid || !currentProgress) {
          if (!uid) {
            uid = `URBE_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
            await LocalPersistence.saveUserId(uid);
          }

          const defaultAvatar = STATIC_AVATAR_LIST[0] || 'hero_default.png';

          const initialData = {
            id: uid,
            displayName: `Explorador_${uid.slice(-4)}`,
            ludoCoins: 50,
            psychomotorLevel: 1,
            totalChallengesCompleted: 0,
            currentStreak: 0,
            hasSeenTutorial: false,
            dominantColor: '#9333ea',
            avatar: { avatarId: defaultAvatar },
            history: []
          };
          await LocalPersistence.saveProgress(initialData);
        }
      } catch (error) {
        console.error("Falha na sincronização de identidade:", error);
      } finally {
        setIsReady(true);
      }
    };

    // Timeout de segurança absoluta: libera a UI em 3 segundos mesmo se o storage falhar
    const safetyTimer = setTimeout(() => {
      setIsReady(true);
    }, 3000);

    initLocalAuth();
    
    return () => clearTimeout(safetyTimer);
  }, []);

  if (!mounted || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase text-primary tracking-widest animate-pulse">Sincronizando Aura...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
