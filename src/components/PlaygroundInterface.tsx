"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  CheckCircle2, 
  Home as HomeIcon, 
  MapPin, 
  Lock, 
  Coins, 
  Zap,
  Trophy,
  Camera,
  RefreshCw,
  Battery
} from 'lucide-react';
import { proposeDynamicChallenges, type ProposeDynamicChallengesOutput } from '@/ai/flows/propose-dynamic-challenges';
import { identifyUrbanElements } from '@/ai/flows/identify-urban-elements-flow';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [phase, setPhase] = useState<Phase>('DAY');
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<ProposeDynamicChallengesOutput | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  const userProgressRef = useMemoFirebase(() => user ? doc(db, 'user_progress', user.uid) : null, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(userProgressRef);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };

    getCameraPermission();
  }, []);

  useEffect(() => {
    const updateCycle = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 10) setPhase('MORNING');
      else if (hour >= 10 && hour < 18) setPhase('DAY');
      else setPhase('NIGHT');

      if (profile && profile.dailyCycle) {
        const today = new Date().toLocaleDateString();
        if (profile.dailyCycle.lastResetDate !== today) {
          setDocumentNonBlocking(userProgressRef!, {
            dailyCycle: {
              homeMissionCompleted: false,
              streetMissionCompleted: false,
              lastResetDate: today
            },
            // Regenerate some energy daily
            avatar: { ...profile?.avatar, energy: Math.min(100, (profile?.avatar?.energy || 0) + 50) }
          }, { merge: true });
        }
      }
    };

    updateCycle();
    const interval = setInterval(updateCycle, 60000);
    return () => clearInterval(interval);
  }, [profile, userProgressRef]);

  const handleStartMission = async (type: 'home' | 'street') => {
    const energy = profile?.avatar?.energy ?? 100;
    if (energy < 15) {
      toast({ variant: 'destructive', title: 'Avatar Cansado', description: 'Descanse para recuperar stamina!' });
      return;
    }

    setIsScanning(true);
    let detectedElements: string[] = [];

    try {
      if (type === 'street' && videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0);
          const dataUri = canvas.toDataURL('image/jpeg');
          const result = await identifyUrbanElements({ webcamFeedDataUri: dataUri });
          detectedElements = result.elements.map(e => `${e.type}: ${e.description}`);
        }
      }

      const challenge = await proposeDynamicChallenges({
        missionType: type,
        psychomotorLevel: profile?.psychomotorLevel || 1,
        userAgeGroup: profile?.ageGroup || 'adolescent_adult',
        userSkillLevel: profile?.skillLevel || 'intermediate',
        detectedElements: detectedElements
      });
      setActiveChallenge(challenge);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Falha na IA', description: 'O sinal urbano está instável.' });
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
      challengeTitle: activeChallenge.challengeTitle,
      difficulty: activeChallenge.difficulty,
      challengeType: activeChallenge.challengeType
    });

    const totalCompleted = (profile?.totalChallengesCompleted || 0) + 1;
    const shouldLevelUp = totalCompleted % 5 === 0 && (profile?.psychomotorLevel || 1) < 4;
    const currentEnergy = profile?.avatar?.energy ?? 100;

    setDocumentNonBlocking(userProgressRef, {
      ludoCoins: (profile?.ludoCoins || 0) + activeChallenge.ludoCoinsReward,
      totalChallengesCompleted: totalCompleted,
      psychomotorLevel: shouldLevelUp ? (profile?.psychomotorLevel || 1) + 1 : (profile?.psychomotorLevel || 1),
      avatar: {
        ...profile?.avatar,
        energy: Math.max(0, currentEnergy - 20) // Stamina cost
      },
      dailyCycle: {
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
    <div className="flex flex-col h-full items-center justify-center p-6 text-center space-y-4">
      <Loader2 className="animate-spin text-primary w-12 h-12" />
      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Sincronizando DNA Digital...</p>
    </div>
  );

  const homeCompleted = profile?.dailyCycle?.homeMissionCompleted;
  const streetCompleted = profile?.dailyCycle?.streetMissionCompleted;
  const pLevel = profile?.psychomotorLevel || 1;
  const levelNames = ["Alicerce", "Movimento", "Precisão", "Ritmo"];
  const energy = profile?.avatar?.energy ?? 100;

  if (celebrating) {
    return (
      <div className="fixed inset-0 z-[100] bg-primary flex flex-col items-center justify-center p-8 text-center text-white">
        <div className="animate-bounce mb-8">
           <Trophy className="w-24 h-24" />
        </div>
        <h2 className="text-4xl font-black uppercase italic mb-4">Missão Concluída!</h2>
        <div className="bg-white/20 px-8 py-4 rounded-3xl border border-white/30 backdrop-blur-xl mb-6">
           <span className="text-4xl font-black flex items-center gap-2">
             <Coins className="w-8 h-8 text-yellow-300" /> +{activeChallenge?.ludoCoinsReward}
           </span>
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-80">Seu avatar está subindo de nível!</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col h-full transition-colors duration-1000",
      phase === 'MORNING' ? "bg-orange-50/50" : phase === 'DAY' ? "bg-sky-50/50" : "bg-slate-950"
    )}>
      {/* Viewfinder Cam */}
      <div className="relative w-full aspect-[4/3] bg-black overflow-hidden shadow-inner">
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover" 
          autoPlay 
          muted 
          playsInline 
        />
        <div className="absolute inset-0 border-[2px] border-primary/30 m-4 rounded-3xl pointer-events-none" />
        <div className="absolute top-6 left-6 flex items-center gap-2">
           <Badge className="bg-black/50 backdrop-blur-md border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
             {hasCameraPermission === false ? "Câmera Bloqueada" : "Scan Ativo"}
           </Badge>
        </div>
        {hasCameraPermission === false && (
          <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center p-6 text-center">
             <div className="space-y-4">
               <Camera className="w-12 h-12 text-destructive mx-auto" />
               <h4 className="text-white font-black uppercase italic">Permissão Necessária</h4>
               <p className="text-white/60 text-xs">Ative a câmera para identificar elementos urbanos.</p>
               <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="text-white border-white/20">
                 <RefreshCw className="w-4 h-4 mr-2" /> Recarregar
               </Button>
             </div>
          </div>
        )}
      </div>

      <div className="flex-1 -mt-8 bg-background rounded-t-[3rem] p-6 shadow-2xl overflow-y-auto space-y-6">
        {/* Top Indicators */}
        <div className="flex justify-between items-center mb-2">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{levelNames[pLevel-1]}</span>
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-primary">Nível {pLevel}</h3>
          </div>
          <div className="flex flex-col items-end gap-1">
             <div className="bg-primary/10 px-4 py-2 rounded-2xl flex items-center gap-2 border border-primary/20">
               <Coins className="w-5 h-5 text-yellow-600" />
               <span className="font-black text-lg">{profile?.ludoCoins || 0}</span>
             </div>
             <div className="flex items-center gap-1.5 px-2">
                <Battery className={cn("w-3 h-3", energy < 30 ? "text-destructive" : "text-primary")} />
                <span className="text-[8px] font-black uppercase text-muted-foreground">Stamina: {energy}%</span>
             </div>
          </div>
        </div>

        {activeChallenge ? (
          <Card className="border-2 border-primary/20 bg-primary/5 rounded-[2rem] shadow-xl animate-in slide-in-from-bottom-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <Badge className="bg-accent text-accent-foreground text-[8px] uppercase font-black tracking-widest">Missão Ativa</Badge>
                <span className="text-xs font-black text-primary flex items-center gap-1"><Coins className="w-3 h-3" /> {activeChallenge.ludoCoinsReward}</span>
              </div>
              <CardTitle className="text-2xl font-black uppercase italic mt-2">{activeChallenge.challengeTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm font-medium text-muted-foreground leading-relaxed italic">{activeChallenge.challengeDescription}</p>
              <Button onClick={completeMission} className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-[0.2em] shadow-lg">
                <CheckCircle2 className="w-6 h-6 mr-3" /> Finalizar Missão
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <ChallengeRow 
              title="O Despertar"
              subtitle="Missão de Casa"
              isCompleted={homeCompleted}
              disabled={isScanning || energy < 15}
              icon={<HomeIcon />}
              onClick={() => handleStartMission('home')}
            />
            <ChallengeRow 
              title="A Jornada"
              subtitle="Missão de Rua"
              isCompleted={streetCompleted}
              disabled={!homeCompleted || phase === 'NIGHT' || isScanning || energy < 15}
              icon={<MapPin />}
              onClick={() => handleStartMission('street')}
              lockedText={energy < 15 ? "Avatar Cansado" : !homeCompleted ? "Complete a Casa primeiro" : phase === 'NIGHT' ? "Aguarde o amanhecer" : ""}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ChallengeRow({ title, subtitle, isCompleted, disabled, icon, onClick, lockedText }: any) {
  return (
    <div 
      onClick={!disabled && !isCompleted ? onClick : undefined}
      className={cn(
        "p-5 rounded-[2.5rem] flex items-center gap-5 transition-all active:scale-95",
        isCompleted ? "bg-muted/40 grayscale" : disabled ? "bg-muted/20 opacity-40" : "bg-white border-2 border-primary/5 shadow-md hover:shadow-xl"
      )}
    >
      <div className={cn(
        "w-14 h-14 rounded-[1.5rem] flex items-center justify-center transition-colors",
        isCompleted ? "bg-primary text-white" : "bg-primary/10 text-primary"
      )}>
        {isCompleted ? <CheckCircle2 className="w-7 h-7" /> : disabled ? <Lock className="w-5 h-5 opacity-40" /> : icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{subtitle}</span>
        <h4 className="text-lg font-black uppercase italic leading-none">{title}</h4>
        {disabled && lockedText && <p className="text-[8px] font-bold text-destructive uppercase mt-1">{lockedText}</p>}
      </div>
    </div>
  );
}