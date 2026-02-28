
'use client';

import { useEffect, useState } from 'react';
import { LocalPersistence } from '@/lib/local-persistence';
import { Loader2 } from 'lucide-react';
import { AVATAR_CATALOG } from '@/lib/avatar-catalog';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initLocalAuth = async () => {
      let uid = await LocalPersistence.getUserId();
      
      if (!uid) {
        // Criar nova identidade local permanente
        uid = `URBE_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        await LocalPersistence.saveUserId(uid);
        
        const initialData = {
          id: uid,
          displayName: `Explorador_${uid.slice(-4)}`,
          bio: "Explorador Independente UrbeLudo 🌍",
          ludoCoins: 100, // Bônus inicial Standalone
          psychomotorLevel: 1,
          totalChallengesCompleted: 0,
          currentStreak: 0,
          totalLikesReceived: 0,
          ageGroup: 'adolescent_adult',
          skillLevel: 'beginner',
          badges: [],
          avatar: {
            energy: 100,
            avatarId: AVATAR_CATALOG[0].id,
            unlockedItems: ['foundation-sneakers'],
            equippedItems: ['foundation-sneakers'],
            studioLevel: 1
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
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Iniciando Motor Offline...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
