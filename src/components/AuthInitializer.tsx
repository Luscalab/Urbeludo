'use client';

import { useEffect, useState } from 'react';
import { LocalPersistence } from '@/lib/local-persistence';
import { Loader2 } from 'lucide-react';

/**
 * Componente que garante a inicialização correta do estado do usuário.
 * Versão Standalone - Gerenciamento Dinâmico de Identidade.
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

          // Busca o primeiro herói disponível na pasta public/assets/avatars dinamicamente
          let defaultAvatar = '';
          try {
            const res = await fetch('/api/avatars');
            if (res.ok) {
              const list = await res.json();
              if (list && list.length > 0) {
                defaultAvatar = list[0];
              }
            }
          } catch (e) {
            console.warn("API de avatares inacessível no boot.");
          }

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
        console.error("Falha fatal na sincronização de identidade:", error);
      } finally {
        setIsReady(true);
      }
    };
    initLocalAuth();
  }, []);

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
