
'use client';

import { useEffect, useState } from 'react';
import { LocalPersistence } from '@/lib/local-persistence';
import { Loader2 } from 'lucide-react';
import { FALLBACK_AVATAR } from '@/lib/avatar-catalog';

/**
 * Componente que garante a inicialização correta do estado do usuário.
 * Versão Standalone - Foco em "O Traço Vivo".
 * Implementa verificação de montagem para evitar erros de hidratação.
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setMounted(true);
    const initLocalAuth = async () => {
      let uid = await LocalPersistence.getUserId();
      
      if (!uid) {
        uid = `URBE_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        await LocalPersistence.saveUserId(uid);
        
        // Dados iniciais simplificados para o conceito de "O Traço Vivo"
        const initialData = {
          id: uid,
          displayName: `Explorador_${uid.slice(-4)}`,
          ludoCoins: 50,
          psychomotorLevel: 1,
          totalChallengesCompleted: 0,
          currentStreak: 0,
          hasSeenTutorial: false,
          dominantColor: '#9333ea',
          avatar: {
            avatarId: FALLBACK_AVATAR.id
          },
          history: []
        };
        await LocalPersistence.saveProgress(initialData);
      }
      
      setIsReady(true);
    };

    initLocalAuth();
  }, []);

  // Renderiza o loader de forma consistente no servidor e na primeira montagem do cliente
  if (!mounted || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="p-8 bg-primary/10 rounded-[3rem] animate-pulse">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-[10px] font-black uppercase text-primary tracking-[0.4em] italic">Iniciando Espelho Mágico</p>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Sincronizando Sensor Motor...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
