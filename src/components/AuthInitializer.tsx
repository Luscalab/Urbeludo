
'use client';

import { useEffect, useState } from 'react';
import { LocalPersistence } from '@/lib/local-persistence';
import { STATIC_AVATAR_LIST } from '@/lib/avatar-catalog';
import { Loader2 } from 'lucide-react';

/**
 * Componente que garante a inicialização correta do estado do usuário.
 * Versão Standalone com timeout de segurança para evitar travamento na inicialização.
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Timeout de segurança: Se a persistência demorar mais de 2s, libera o app
    const safetyTimeout = setTimeout(() => {
      if (!isReady) {
        console.warn("AuthInitializer: Timeout de segurança atingido. Liberando renderização.");
        setIsReady(true);
      }
    }, 2000);

    const initLocalAuth = async () => {
      try {
        let uid = await LocalPersistence.getUserId();
        let currentProgress = await LocalPersistence.getProgress();

        // Se o usuário não tem perfil ou UID, inicializamos
        if (!uid || !currentProgress) {
          if (!uid) {
            uid = `URBE_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
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
        clearTimeout(safetyTimeout);
        setIsReady(true);
      }
    };

    initLocalAuth();
    
    return () => clearTimeout(safetyTimeout);
  }, [isReady]);

  if (!mounted || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase text-primary tracking-widest animate-pulse">Invocando Heróis...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
