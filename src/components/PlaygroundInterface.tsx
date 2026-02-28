
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  CheckCircle2, 
  Sun, 
  Moon, 
  Home as HomeIcon, 
  MapPin, 
  Lock, 
  Coins, 
  Sparkles,
  Trophy
} from 'lucide-react';
import { proposeDynamicChallenges, type ProposeDynamicChallengesOutput } from '@/ai/flows/propose-dynamic-challenges';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type Phase = 'MORNING' | 'DAY' | 'NIGHT';

export function PlaygroundInterface() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [phase, setPhase] = useState<Phase>('DAY');
  const [isScanning, setIsScanning] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState<ProposeDynamicChallengesOutput | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  const userProgressRef = useMemoFirebase(() => user ? doc(db, 'user_progress', user.uid) : null, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(userProgressRef);

  useEffect(() => {
    const updateCycle = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 10) setPhase('MORNING');
      else if (hour >= 10 && hour < 18) setPhase('DAY');
      else setPhase('NIGHT');

      // Lógica de Reset Diário
      if (profile && profile.dailyCycle) {
        const today = new Date().toLocaleDateString();
        if (profile.dailyCycle.lastResetDate !== today) {
          setDocumentNonBlocking(userProgressRef!, {
            ...profile,
            dailyCycle: {
              homeMissionCompleted: false,
              streetMissionCompleted: false,
              lastResetDate: today
            }
          }, { merge: true });
        }
      }
    };

    updateCycle();
    const interval = setInterval(updateCycle, 60000);
    return () => clearInterval(interval);
  }, [profile, userProgressRef]);

  const handleStartMission = async (type: 'home' | 'street') => {
    setIsScanning(true);
    try {
      const challenge = await proposeDynamicChallenges({
        missionType: type,
        psychomotorLevel: profile?.psychomotorLevel || 1,
        userAgeGroup: profile?.ageGroup || 'adolescent_adult',
        userSkillLevel: profile?.skillLevel || 'intermediate',
        detectedElements: []
      });
      setActiveChallenge(challenge);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro ao conectar com a IA', description: 'Tente novamente em alguns instantes.' });
    } finally {
      setIsScanning(false);
    }
  };

  const completeMission = () => {
    if (!activeChallenge || !user || !userProgressRef) return;

    const missionType = !profile?.dailyCycle?.homeMissionCompleted ? 'home' : 'street';
    
    const activitiesRef = collection(db, 'user_progress', user.uid, 'challenge_activities');
    addDocumentNonBlocking(activitiesRef, {
      userProgressId: user.uid,
      startTime: new Date().toISOString(),
      isCompleted: true,
      ludoCoinsEarned: activeChallenge.ludoCoinsReward,
      missionType: missionType,
      psychomotorLevelAtTime: profile?.psychomotorLevel || 1,
      challengeDescription: activeChallenge.challengeDescription,
      difficulty: activeChallenge.difficulty,
      challengeType: activeChallenge.challengeType
    });

    const totalCompleted = (profile?.totalChallengesCompleted || 0) + 1;
    const shouldLevelUp = totalCompleted % 5 === 0 && (profile?.psychomotorLevel || 1) < 4;

    setDocumentNonBlocking(userProgressRef, {
      ...profile,
      ludoCoins: (profile?.ludoCoins || 0) + activeChallenge.ludoCoinsReward,
      totalChallengesCompleted: totalCompleted,
      psychomotorLevel: shouldLevelUp ? (profile?.psychomotorLevel || 1) + 1 : (profile?.psychomotorLevel || 1),
      dailyCycle: {
        ...profile?.dailyCycle,
        homeMissionCompleted: missionType === 'home' ? true : profile?.dailyCycle?.homeMissionCompleted,
        streetMissionCompleted: missionType === 'street' ? true : profile?.dailyCycle?.streetMissionCompleted,
        lastResetDate: new Date().toLocaleDateString()
      }
    }, { merge: true });

    setCelebrating(true);
    setTimeout(() => {
      setCelebrating(false);
      setActiveChallenge(null);
    }, 4000);
  };

  if (isProfileLoading) return (
    <div className="flex flex-col h-full items-center justify-center gap-4">
      <Loader2 className="animate-spin text-primary w-10 h-10" />
      <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Sincronizando com a Nuvem...</span>
    </div>
  );

  const homeCompleted = profile?.dailyCycle?.homeMissionCompleted;
  const streetCompleted = profile?.dailyCycle?.streetMissionCompleted;
  const pLevel = profile?.psychomotorLevel || 1;
  const levelNames = ["Alicerce", "Movimento", "Precisão", "Ritmo"];

  if (celebrating) {
    return (
      <div className="fixed inset-0 z-[100] bg-primary/95 flex flex-col items-center justify-center p-6 text-center text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://picsum.photos/seed/dance/1200/800')] bg-cover" />
        <div className="space-y-6 animate-in zoom-in-50 duration-500 relative z-10">
          <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center mx-auto shadow-2xl animate-bounce">
             <Trophy className="w-16 h-16 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-5xl font-black uppercase tracking-tighter italic">Missão Cumprida!</h2>
            <p className="text-xl font-bold opacity-80 uppercase tracking-widest">Sincronizando energia vital...</p>
          </div>
          <div className="bg-white/20 px-8 py-4 rounded-3xl flex items-center gap-3 border border-white/30 backdrop-blur-md shadow-2xl">
              <Coins className="w-8 h-8 text-yellow-300" />
              <span className="text-4xl font-black">+{activeChallenge?.ludoCoinsReward}</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Evolução do Avatar Confirmada</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col h-[calc(100vh-80px)] transition-colors duration-1000",
      phase === 'MORNING' ? "bg-orange-50" : phase === 'DAY' ? "bg-sky-50" : "bg-slate-950"
    )}>
      <div className="p-6 flex justify-between items-center bg-background/20 backdrop-blur-sm border-b border-black/5">
        <div className="space-y-1">
          <Badge variant="outline" className="flex gap-1.5 items-center bg-white/80 backdrop-blur-md">
            {phase === 'MORNING' ? <Sun className="w-3 h-3 text-orange-500" /> : phase === 'DAY' ? <Sun className="w-3 h-3 text-yellow-500" /> : <Moon className="w-3 h-3 text-blue-400" />}
            {phase === 'MORNING' ? 'O Despertar' : phase === 'DAY' ? 'A Jornada' : 'O Descanso'}
          </Badge>
          <div className="text-xl font-black tracking-tighter text-primary">Nível {pLevel}: {levelNames[pLevel-1]}</div>
        </div>
        <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 border shadow-sm">
          <Coins className="w-5 h-5 text-yellow-600" />
          <span className="font-black text-lg">{profile?.ludoCoins || 0}</span>
        </div>
      </div>

      <main className="flex-1 container max-w-md mx-auto p-6 overflow-y-auto space-y-6">
        {activeChallenge ? (
          <Card className="animate-in slide-in-from-bottom-10 duration-500 shadow-2xl border-primary/20 overflow-hidden rounded-3xl">
            <div className="h-2 bg-primary" />
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center mb-2">
                <Badge className="bg-accent text-accent-foreground px-3 py-0.5 text-[10px] uppercase font-black tracking-widest">Desafio Ativo</Badge>
                <div className="flex items-center gap-1 text-yellow-600 font-black">
                  <Coins className="w-4 h-4" /> +{activeChallenge.ludoCoinsReward}
                </div>
              </div>
              <CardTitle className="text-2xl font-black uppercase tracking-tighter italic leading-none">{activeChallenge.challengeTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">{activeChallenge.challengeDescription}</p>
              
              <div className="p-4 bg-primary/5 rounded-2xl flex items-center gap-4 border border-primary/10">
                 <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md">
                    <Sparkles className="text-primary w-6 h-6 animate-pulse" />
                 </div>
                 <div className="text-[11px] font-bold text-primary/80 italic leading-tight">"Seu avatar está aprendendo cada movimento seu agora."</div>
              </div>

              <Button onClick={completeMission} className="w-full h-16 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] transition-transform">
                <CheckCircle2 className="mr-3 w-6 h-6" /> Concluir Missão
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Ciclo do Sol: {new Date().toLocaleDateString()}</h3>
              {isScanning && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            </div>
            
            <ChallengeCard 
              title="Missão de Casa"
              description="Prepare o corpo com foco em tônus e equilíbrio estático."
              icon={<HomeIcon className="w-6 h-6" />}
              isCompleted={homeCompleted}
              disabled={isScanning}
              onClick={() => handleStartMission('home')}
            />

            <ChallengeCard 
              title="Missão de Rua"
              description="Desafie a gravidade no cenário urbano real."
              icon={<MapPin className="w-6 h-6" />}
              isCompleted={streetCompleted}
              disabled={!homeCompleted || phase === 'NIGHT' || isScanning}
              onClick={() => handleStartMission('street')}
              lockedText={!homeCompleted ? "Complete o Despertar em casa primeiro" : phase === 'NIGHT' ? "A cidade descansa. Volte amanhã!" : ""}
            />

            {phase === 'NIGHT' && (
              <Card className="bg-slate-900 text-white border-none p-6 text-center space-y-4 rounded-3xl shadow-2xl mt-8">
                <Moon className="w-12 h-12 mx-auto text-blue-400 animate-pulse" />
                <div className="space-y-2">
                  <h4 className="font-black uppercase tracking-tighter text-xl italic">Hora da Calma</h4>
                  <p className="text-xs text-white/60 font-medium">As missões de movimento acabaram por hoje. Que tal visitar seu estúdio e gerenciar suas conquistas?</p>
                </div>
                <Button variant="outline" asChild className="w-full h-12 rounded-2xl border-white/20 hover:bg-white/10 text-white">
                  <Link href="/dashboard">Abrir Estúdio</Link>
                </Button>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function ChallengeCard({ title, description, icon, isCompleted, disabled, onClick, lockedText }: any) {
  return (
    <Card 
      className={cn(
        "relative transition-all duration-500 overflow-hidden cursor-pointer active:scale-95 border-none shadow-sm",
        isCompleted ? "bg-muted/30 grayscale-[0.8]" : "bg-white",
        disabled ? "opacity-60 cursor-not-allowed" : "hover:shadow-2xl hover:scale-[1.01]"
      )}
      onClick={!disabled && !isCompleted ? onClick : undefined}
    >
      <div className="p-6 flex gap-5 items-start">
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-colors",
          isCompleted ? "bg-primary text-white" : disabled ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
        )}>
          {isCompleted ? <CheckCircle2 className="w-7 h-7" /> : disabled ? <Lock className="w-6 h-6 opacity-30" /> : icon}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex justify-between items-center">
            <h4 className="font-black uppercase tracking-tighter italic text-lg">{title}</h4>
            {isCompleted && <Badge className="bg-primary text-[8px] font-black uppercase">Vencido</Badge>}
          </div>
          <p className="text-xs text-muted-foreground leading-snug font-medium">{description}</p>
          {disabled && lockedText && <p className="text-[9px] font-black text-destructive uppercase mt-2 tracking-widest">{lockedText}</p>}
        </div>
      </div>
      {!disabled && !isCompleted && <div className="h-1 bg-primary/20 absolute bottom-0 inset-x-0 overflow-hidden">
        <div className="h-full bg-primary w-1/4 animate-progress-indefinite" />
      </div>}
    </Card>
  );
}
