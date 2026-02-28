'use client';

import { useEffect, useState } from 'react';
import { LocalPersistence } from '@/lib/local-persistence';
import { Loader2 } from 'lucide-react';
import { FALLBACK_AVATAR } from '@/lib/avatar-catalog';

/**
 * Componente que garante a inicialização correta do estado do usuário.
 * Corrigido para remover importações obsoletas e usar o sistema dinâmico.
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initLocalAuth = async () => {
      let uid = await LocalPersistence.getUserId();
      
      if (!uid) {
        uid = `URBE_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        await LocalPersistence.saveUserId(uid);
        
        const initialData = {
          id: uid,
          displayName: `Explorador_${uid.slice(-4)}`,
          bio: "Explorador Independente UrbeLudo 🌍",
          ludoCoins: 500,
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
            unlockedItems: ['cama-01'],
            equippedItems: [],
            studioLevel: 1
          },
          studioState: {
            unlockedItemIds: ['tapete-01'],
            placedItems: [],
            backgroundId: 'default',
            worldConfig: { width: 1200, height: 1200, theme: 'minimalist-purple' },
            avatar: { lastPosition: { x: 600, y: 800 } }
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
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest italic">Sincronizando Sensor de Borda...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
