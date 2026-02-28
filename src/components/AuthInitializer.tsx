
'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { LocalPersistence } from '@/lib/local-persistence';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [initStarted, setInitStarted] = useState(false);

  // Persistência de Identidade Offline
  useEffect(() => {
    const checkOfflineId = async () => {
      if (!user && !isUserLoading && !initStarted) {
        const savedId = await LocalPersistence.getUserId();
        if (savedId) {
          // Se temos um ID salvo, mas não estamos logados, tentamos o login anônimo
          // O Firebase tentará restaurar a sessão se possível
          setInitStarted(true);
          initiateAnonymousSignIn(auth);
        } else if (!initStarted) {
          setInitStarted(true);
          initiateAnonymousSignIn(auth);
        }
      }
    };
    checkOfflineId();
  }, [user, isUserLoading, auth, initStarted]);

  useEffect(() => {
    if (user && db) {
      // Salva o UID localmente para futuras sessões offline
      LocalPersistence.saveUserId(user.uid);

      const checkProfile = async () => {
        const userRef = doc(db, 'user_progress', user.uid);
        try {
          const snapshot = await getDoc(userRef);
          if (!snapshot.exists()) {
            const initialData = {
              id: user.uid,
              displayName: `Explorador_${user.uid.slice(0, 4)}`,
              bio: "Novo no UrbeLudo! 🌍",
              ludoCoins: 50,
              psychomotorLevel: 1,
              totalChallengesCompleted: 0,
              currentStreak: 0,
              totalLikesReceived: 0,
              ageGroup: 'adolescent_adult',
              sex: 'prefer_not_to_say',
              neurodivergence: '',
              physicalLimitations: '',
              skillLevel: 'intermediate',
              badges: [],
              equippedBadges: [],
              dailyCycle: {
                homeMissionCompleted: false,
                streetMissionCompleted: false,
                lastResetDate: new Date().toLocaleDateString()
              },
              avatar: {
                energy: 100,
                unlockedItems: ['foundation-sneakers'],
                equippedItems: ['foundation-sneakers'],
                studioLevel: 1
              }
            };
            setDocumentNonBlocking(userRef, initialData, { merge: true });
            LocalPersistence.saveProgress(initialData);
          } else {
            // Sincroniza o dado remoto com o cache local
            LocalPersistence.saveProgress(snapshot.data());
          }
        } catch (e) {
          // Se falhar (offline), tentamos carregar do cache local
          console.warn("Falha ao sincronizar com Firestore, usando cache local.");
        }
      };
      checkProfile();
    }
  }, [user, db]);

  if (isUserLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Sincronizando Playground...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
