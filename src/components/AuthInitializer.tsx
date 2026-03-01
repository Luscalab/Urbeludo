
'use client';

import { useEffect, useState } from 'react';
import { LocalPersistence } from '@/lib/local-persistence';
import { Loader2 } from 'lucide-react';
import { FALLBACK_AVATAR } from '@/lib/avatar-catalog';

/**
 * Componente que garante a inicialização correta do estado do usuário.
 * Corrigido para remover importações de arquivos inexistentes e garantir robustez.
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initLocalAuth = async () => {
      let uid = await LocalPersistence.getUserId();
      
      if (!uid) {
        uid = `URBE_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        await LocalPersistence.saveUserId(uid);
        
        // Dados iniciais inspirados no padrão de progressão Cafeland/Sims
        const initialData = {
          id: uid,
          displayName: `Explorador_${uid.slice(-4)}`,
          bio: "Explorador Independente UrbeLudo 🌍",
          ludoCoins: 750, // Capital inicial para decoração
          psychomotorLevel: 1,
          totalChallengesCompleted: 0,
          currentStreak: 0,
          totalLikesReceived: 0,
          ageGroup: 'adolescent_adult',
          skillLevel: 'beginner',
          badges: [],
          hasSeenTutorial: false,
          dominantColor: '#9333ea',
          avatar: {
            energy: 100,
            avatarId: FALLBACK_AVATAR.id,
            unlockedItems: ['cama-01', 'tapete-01'], // Mochila inicial
            equippedItems: [],
            studioLevel: 1
          },
          studioState: {
            unlockedItemIds: ['vaso-01'],
            placedItems: [],
            backgroundId: 'default',
            worldConfig: { width: 1200, height: 1200, theme: 'minimalist-purple' },
            avatar: { lastPosition: { x: 750, y: 1000 } }
          },
          dailyCycle: {
            homeMissionCompleted: false,
            streetMissionCompleted: false,
            lastResetDate: new Date().toLocaleDateString()
          }
        };
        await LocalPersistence.saveProgress(initialData);
      }
      
      setIsReady(true);
    };

    initLocalAuth();
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="p-8 bg-primary/10 rounded-[3rem] animate-pulse">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-[10px] font-black uppercase text-primary tracking-[0.4em] italic">Carregando Estúdio</p>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Sincronizando Identidade Digital...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
