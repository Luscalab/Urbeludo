
"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Camera, CheckCircle2, ScanLine, Sun, Moon, Home as HomeIcon, MapPin, Lock, Coins, Sparkles } from 'lucide-react';
import { identifyUrbanElements } from '@/ai/flows/identify-urban-elements-flow';
import { proposeDynamicChallenges, type ProposeDynamicChallengesOutput } from '@/ai/flows/propose-dynamic-challenges';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Phase = 'MORNING' | 'DAY' | 'NIGHT';

export function PlaygroundInterface() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [phase, setPhase] = useState<Phase>('DAY');
  const [isScanning, setIsScanning] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState<ProposeDynamicChallengesOutput | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const userProgressRef = useMemoFirebase(() => user ? doc(db, 'user_progress', user.uid) : null, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(userProgressRef);

  // Determinar fase do dia (Efeito de Cliente para evitar erro de hidratação)
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10) setPhase('MORNING');
    else if (hour >= 10 && hour < 18) setPhase('DAY');
    else setPhase('NIGHT');
  }, []);

  const handleStartMission = async (type: 'home' | 'street') => {
    setIsScanning(true);
    try {
      let elements: string[] = [];
      if (type === 'street') {
        setShowCamera(true);
        // Em um app real, aqui capturaríamos o frame. Simulando por agora ou abrindo câmera.
        // Para simplificar o fluxo de teste, vamos propor direto se for home ou pedir scan se street.
      }
      
      const challenge = await proposeDynamicChallenges({
        missionType: type,
        psychomotorLevel: profile?.psychomotorLevel || 1,
        userAgeGroup: profile?.ageGroup || 'adolescent_adult',
        userSkillLevel: profile?.skillLevel || 'intermediate',
        detectedElements: [] // Idealmente preenchido após capture
      });
      setActiveChallenge(challenge);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro ao gerar missão' });
    } finally {
      setIsScanning(false);
    }
  };

  const completeMission = () => {
    if (!activeChallenge || !user || !userProgressRef) return;

    const missionType = activeChallenge.ludoCoinsReward > 30 ? 'street' : 'home'; // Simplificação lógica
    const isHome = !profile?.dailyCycle?.homeMissionCompleted;
    
    const activitiesRef = collection(db, 'user_progress', user.uid, 'challenge_activities');
    addDocumentNonBlocking(activitiesRef, {
      userProgressId: user.uid,
      startTime: new Date().toISOString(),
      isCompleted: true,
      ludoCoinsEarned: activeChallenge.ludoCoinsReward,
      missionType: isHome ? 'home' : 'street',
      psychomotorLevelAtTime: profile?.psychomotorLevel || 1
    });

    const nextLevelProgress = (profile?.totalChallengesCompleted || 0) + 1;
    const shouldLevelUp = nextLevelProgress % 5 === 0 && (profile?.psychomotorLevel || 1) < 4;

    setDocumentNonBlocking(userProgressRef, {
      ...profile,
      ludoCoins: (profile?.ludoCoins || 0) + activeChallenge.ludoCoinsReward,
      totalChallengesCompleted: nextLevelProgress,
      psychomotorLevel: shouldLevelUp ? (profile?.psychomotorLevel || 1) + 1 : (profile?.psychomotorLevel || 1),
      dailyCycle: {
        ...profile?.dailyCycle,
        homeMissionCompleted: isHome ? true : profile?.dailyCycle?.homeMissionCompleted,
        streetMissionCompleted: !isHome ? true : profile?.dailyCycle?.streetMissionCompleted,
        lastResetDate: new Date().toLocaleDateString()
      }
    }, { merge: true });

    toast({
      title: "Missão Cumprida!",
      description: `Você ganhou ${activeChallenge.ludoCoinsReward} LudoCoins!`,
    });
    setActiveChallenge(null);
    setShowCamera(false);
  };

  if (isProfileLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin" /></div>;

  const homeCompleted = profile?.dailyCycle?.homeMissionCompleted;
  const streetCompleted = profile?.dailyCycle?.streetMissionCompleted;
  const pLevel = profile?.psychomotorLevel || 1;
  const levelNames = ["Alicerce", "Movimento", "Precisão", "Ritmo"];

  return (
    <div className={cn(
      "flex flex-col h-[calc(100vh-80px)] transition-colors duration-1000",
      phase === 'MORNING' ? "bg-orange-50" : phase === 'DAY' ? "bg-sky-50" : "bg-slate-900"
    )}>
      <div className="p-6 flex justify-between items-center">
        <div className="space-y-1">
          <Badge variant="outline" className="flex gap-1.5 items-center bg-white/50 backdrop-blur-sm">
            {phase === 'MORNING' ? <Sun className="w-3 h-3 text-orange-500" /> : phase === 'DAY' ? <Sun className="w-3 h-3 text-yellow-500" /> : <Moon className="w-3 h-3 text-blue-400" />}
            {phase === 'MORNING' ? 'O Despertar' : phase === 'DAY' ? 'A Jornada' : 'O Descanso'}
          </Badge>
          <div className="text-2xl font-black tracking-tighter text-primary">Nível {pLevel}: {levelNames[pLevel-1]}</div>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-2xl flex items-center gap-2 border border-primary/20">
          <Coins className="w-5 h-5 text-yellow-600" />
          <span className="font-bold">{profile?.ludoCoins || 0}</span>
        </div>
      </div>

      <main className="flex-1 container max-w-md mx-auto p-6 overflow-y-auto">
        {activeChallenge ? (
          <Card className="animate-in zoom-in-95 duration-300 shadow-2xl border-primary/20 overflow-hidden">
            <div className="h-2 bg-primary" style={{ width: '100%' }} />
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge className="bg-accent text-accent-foreground mb-2">Desafio Ativo</Badge>
                <div className="flex items-center gap-1 text-yellow-600 font-bold">
                  <Coins className="w-4 h-4" /> +{activeChallenge.ludoCoinsReward}
                </div>
              </div>
              <CardTitle className="text-2xl font-black">{activeChallenge.challengeTitle || "Mova-se agora!"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">{activeChallenge.challengeDescription}</p>
              
              <div className="p-4 bg-muted rounded-2xl flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center shadow-inner">
                    <Sparkles className="text-primary w-6 h-6 animate-pulse" />
                 </div>
                 <div className="text-xs italic">"O seu avatar está observando... mostre como se faz!"</div>
              </div>

              <Button onClick={completeMission} className="w-full h-14 text-lg font-bold rounded-2xl">
                <CheckCircle2 className="mr-2" /> Concluir Missão
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <h3 className="font-bold text-lg opacity-60 px-2">Cartas de Desafio do Dia</h3>
            
            {/* Card 1: HOME */}
            <ChallengeCard 
              title="Missão de Casa"
              description="Prepare o corpo. Foco em tônus e equilíbrio estático."
              icon={<HomeIcon />}
              isCompleted={homeCompleted}
              disabled={false}
              onClick={() => handleStartMission('home')}
            />

            {/* Card 2: STREET */}
            <ChallengeCard 
              title="Missão de Rua"
              description="Desafie a gravidade na cidade. Encontre elementos urbanos."
              icon={<MapPin />}
              isCompleted={streetCompleted}
              disabled={!homeCompleted || phase === 'NIGHT'}
              onClick={() => handleStartMission('street')}
              lockedText={!homeCompleted ? "Vença a Missão de Casa primeiro" : phase === 'NIGHT' ? "A cidade descansa... volte amanhã" : ""}
            />

            {phase === 'NIGHT' && (
              <Card className="bg-primary/5 border-dashed border-primary/30 p-6 text-center space-y-4">
                <Moon className="w-10 h-10 mx-auto text-blue-400" />
                <div>
                  <h4 className="font-bold">Hora de Relaxar</h4>
                  <p className="text-sm text-muted-foreground">O sol se pôs. Vá ao Dashboard para cuidar do seu Avatar.</p>
                </div>
                <Button variant="outline" asChild className="w-full rounded-xl">
                  <a href="/dashboard">Ver Avatar</a>
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
        "relative transition-all duration-300 overflow-hidden cursor-pointer active:scale-95",
        isCompleted ? "opacity-60 grayscale-[0.5]" : "",
        disabled ? "bg-muted/50 cursor-not-allowed" : "hover:border-primary/50 hover:shadow-xl"
      )}
      onClick={!disabled && !isCompleted ? onClick : undefined}
    >
      <div className="p-6 flex gap-4 items-start">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
          isCompleted ? "bg-primary text-white" : disabled ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
        )}>
          {isCompleted ? <CheckCircle2 /> : disabled ? <Lock className="w-5 h-5" /> : icon}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex justify-between items-center">
            <h4 className="font-black tracking-tight">{title}</h4>
            {isCompleted && <Badge className="bg-primary text-white">Pronto</Badge>}
          </div>
          <p className="text-xs text-muted-foreground leading-snug">{description}</p>
          {disabled && lockedText && <p className="text-[10px] font-bold text-destructive uppercase mt-2">{lockedText}</p>}
        </div>
      </div>
      {!disabled && !isCompleted && <div className="h-1 bg-primary/20 absolute bottom-0 inset-x-0 overflow-hidden">
        <div className="h-full bg-primary w-1/3 animate-progress-indefinite" />
      </div>}
    </Card>
  );
}
