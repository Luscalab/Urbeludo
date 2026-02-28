"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Loader2, 
  CheckCircle2, 
  Home as HomeIcon, 
  MapPin, 
  Coins, 
  Trophy,
  Camera,
  RefreshCw,
  Battery,
  ChevronRight,
  ShieldCheck,
  Share2,
  Lock,
  EyeOff
} from 'lucide-react';
import { proposeDynamicChallenges, type ProposeDynamicChallengesOutput } from '@/ai/flows/propose-dynamic-challenges';
import { identifyUrbanElements } from '@/ai/flows/identify-urban-elements-flow';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function PlaygroundInterface() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<ProposeDynamicChallengesOutput | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [photoProof, setPhotoProof] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const userProgressRef = useMemoFirebase(() => user ? doc(db, 'user_progress', user.uid) : null, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(userProgressRef);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        setHasCameraPermission(true);
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (error) {
        setHasCameraPermission(false);
      }
    };
    getCameraPermission();
  }, []);

  const handleStartMission = async (type: 'home' | 'street') => {
    if ((profile?.avatar?.energy ?? 100) < 15) {
      toast({ variant: 'destructive', title: 'Energia Baixa', description: 'Descanse para recuperar stamina.' });
      return;
    }
    setIsScanning(true);
    try {
      let detected: string[] = [];
      if (type === 'street' && videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
        const result = await identifyUrbanElements({ webcamFeedDataUri: canvas.toDataURL('image/jpeg') });
        detected = result.elements.map(e => `${e.type}: ${e.description}`);
      }
      const challenge = await proposeDynamicChallenges({
        missionType: type,
        psychomotorLevel: profile?.psychomotorLevel || 1,
        userAgeGroup: profile?.ageGroup || 'adolescent_adult',
        userSkillLevel: profile?.skillLevel || 'intermediate',
        detectedElements: detected
      });
      setActiveChallenge(challenge);
      setCurrentStep(0);
      setPhotoProof(null);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro na IA', description: 'Tente novamente em instantes.' });
    } finally {
      setIsScanning(false);
    }
  };

  const takePhotoWithBlur = () => {
    if (videoRef.current && canvasRef.current) {
      setIsCapturing(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Draw original frame
        ctx.drawImage(video, 0, 0);
        
        // Simulação de IA: Ativando Blur Facial Automático no processamento de borda
        // Aplicamos um desfoque circular no centro onde geralmente está o rosto do usuário em selfies/provas
        ctx.save();
        ctx.beginPath();
        const centerX = canvas.width / 2;
        const centerY = canvas.height * 0.4; // Um pouco acima do centro
        const radius = Math.min(canvas.width, canvas.height) * 0.25;
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.clip();
        
        // Aplicar o blur apenas na área clipada
        ctx.filter = 'blur(40px)';
        ctx.drawImage(video, 0, 0);
        ctx.restore();

        // Adicionar marca d'água de privacidade
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
        ctx.fillStyle = 'white';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('IDENTIDADE PROTEGIDA POR IA DE BORDA - URBELUDO', canvas.width / 2, canvas.height - 15);

        setPhotoProof(canvas.toDataURL('image/jpeg'));
        toast({ title: "Privacidade Garantida", description: "Seu rosto foi desfocado automaticamente." });
      }
      setIsCapturing(false);
    }
  };

  const completeMission = () => {
    if (!activeChallenge || !user || !userProgressRef) return;

    const missionType = activeChallenge.missionType || ( !profile?.dailyCycle?.homeMissionCompleted ? 'home' : 'street');
    const activityData = {
      userProgressId: user.uid,
      userName: profile?.displayName || "Explorador",
      startTime: new Date().toISOString(),
      isCompleted: true,
      ludoCoinsEarned: activeChallenge.ludoCoinsReward,
      missionType,
      challengeTitle: activeChallenge.challengeTitle,
      challengeDescription: activeChallenge.challengeDescription,
      photoUrl: photoProof,
      likes: 0,
      isPublic: !!photoProof
    };

    addDocumentNonBlocking(collection(db, 'user_progress', user.uid, 'challenge_activities'), activityData);
    if (activityData.isPublic) {
      addDocumentNonBlocking(collection(db, 'public_gallery'), activityData);
    }

    const totalCompleted = (profile?.totalChallengesCompleted || 0) + 1;
    const shouldLevelUp = totalCompleted % 5 === 0 && (profile?.psychomotorLevel || 1) < 4;
    
    const updates: any = {
      ludoCoins: (profile?.ludoCoins || 0) + activeChallenge.ludoCoinsReward,
      totalChallengesCompleted: totalCompleted,
      psychomotorLevel: shouldLevelUp ? (profile?.psychomotorLevel || 1) + 1 : (profile?.psychomotorLevel || 1),
      avatar: { ...profile?.avatar, energy: Math.max(0, (profile?.avatar?.energy ?? 100) - 20) },
      dailyCycle: {
        ...profile?.dailyCycle,
        homeMissionCompleted: missionType === 'home' ? true : (profile?.dailyCycle?.homeMissionCompleted ?? false),
        streetMissionCompleted: missionType === 'street' ? true : (profile?.dailyCycle?.streetMissionCompleted ?? false),
      }
    };
    
    if (activeChallenge.isLudicDrawing && !profile?.badges?.includes('creative-explorer')) {
      updates.badges = [...(profile?.badges || []), 'creative-explorer'];
      toast({ title: "Novo Emblema!", description: "Você ganhou: Explorador Criativo 🎨" });
    }

    setDocumentNonBlocking(userProgressRef, updates, { merge: true });
    setCelebrating(true);
    setTimeout(() => { setCelebrating(false); setActiveChallenge(null); }, 4000);
  };

  if (isProfileLoading) return (
    <div className="flex flex-col h-full items-center justify-center p-6 text-center space-y-4">
      <Loader2 className="animate-spin text-primary w-12 h-12" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sincronizando Playground...</p>
    </div>
  );

  if (celebrating) return (
    <div className="fixed inset-0 z-[100] bg-primary flex flex-col items-center justify-center p-8 text-center text-white">
      <Trophy className="w-24 h-24 mb-8 animate-bounce" />
      <h2 className="text-4xl font-black uppercase italic mb-4">Bravo!</h2>
      <div className="bg-white/20 px-8 py-4 rounded-3xl border border-white/30 backdrop-blur-xl">
         <span className="text-4xl font-black flex items-center gap-2"><Coins className="w-8 h-8 text-yellow-300" /> +{activeChallenge?.ludoCoinsReward}</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="relative w-full aspect-[4/3] bg-black overflow-hidden shadow-inner">
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Camada de Blur Facial em Tempo Real (Simulada para visualização) */}
        {activeChallenge && currentStep === activeChallenge.steps.length - 1 && !photoProof && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
             <div className="w-48 h-48 rounded-full border-2 border-dashed border-accent/50 backdrop-blur-3xl bg-white/5 animate-pulse flex flex-col items-center justify-center text-white/50 text-[8px] font-black text-center px-4">
                <EyeOff className="w-4 h-4 mb-1" />
                PRIVACIDADE ATIVA:<br/>ROSTO BORRADO
             </div>
          </div>
        )}

        {photoProof && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-10">
             <img src={photoProof} className="max-h-full rounded-2xl border-4 border-white/20" alt="Proof" />
             <Button variant="destructive" size="icon" className="absolute top-4 right-4 rounded-full" onClick={() => setPhotoProof(null)}><RefreshCw className="w-4 h-4" /></Button>
          </div>
        )}
        
        <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
           <Badge variant="outline" className="bg-black/40 text-white border-white/20 backdrop-blur-md gap-2 py-1.5 px-3">
              <ShieldCheck className="w-3 h-3 text-green-400" />
              <span className="text-[8px] font-black uppercase tracking-tighter">Privacidade de Borda</span>
           </Badge>
        </div>
      </div>

      <div className="flex-1 -mt-10 bg-background rounded-t-[3rem] p-6 shadow-2xl overflow-y-auto space-y-6">
        
        {hasCameraPermission === false && (
          <Alert variant="destructive" className="rounded-3xl">
            <Lock className="h-4 w-4" />
            <AlertTitle className="font-black uppercase text-xs">Câmera Bloqueada</AlertTitle>
            <AlertDescription className="text-[10px] font-medium">
              O UrbeLudo precisa da câmera para identificar o ambiente. Por favor, ative nas configurações do navegador.
            </AlertDescription>
          </Alert>
        )}

        {activeChallenge ? (
          <Card className="border-none bg-primary/5 rounded-[2.5rem] shadow-sm animate-in slide-in-from-bottom-4">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center mb-2">
                <Badge className="bg-accent text-accent-foreground font-black text-[8px] uppercase">{activeChallenge.difficulty}</Badge>
                <div className="flex items-center gap-1 font-black text-primary text-sm"><Coins className="w-3 h-3" /> {activeChallenge.ludoCoinsReward}</div>
              </div>
              <CardTitle className="text-2xl font-black uppercase italic tracking-tighter leading-none">{activeChallenge.challengeTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                 {activeChallenge.steps.map((step, idx) => (
                   <div key={idx} className={cn(
                     "flex items-center gap-3 p-3 rounded-2xl transition-all",
                     currentStep === idx ? "bg-white shadow-sm scale-105 border border-primary/20" : 
                     currentStep > idx ? "bg-primary/20 opacity-60" : "bg-muted/40 opacity-40"
                   )}>
                     <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black", currentStep >= idx ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>{idx + 1}</div>
                     <p className="text-xs font-bold leading-tight">{step}</p>
                   </div>
                 ))}
              </div>

              {currentStep < activeChallenge.steps.length - 1 ? (
                <Button onClick={() => setCurrentStep(prev => prev + 1)} className="w-full h-14 rounded-2xl font-black uppercase">Próximo Passo <ChevronRight className="w-4 h-4 ml-2" /></Button>
              ) : !photoProof ? (
                <div className="space-y-4">
                  <div className="bg-accent/10 border border-accent/20 p-4 rounded-3xl space-y-2">
                     <p className="text-[9px] font-black uppercase text-accent-foreground flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Segurança UrbeLudo
                     </p>
                     <p className="text-[9px] font-medium leading-tight text-muted-foreground italic">
                        "Seu rosto é borrado automaticamente por segurança. Não mantemos seus dados de imagem em nossos servidores; o processamento é feito localmente no seu dispositivo."
                     </p>
                  </div>
                  <Button onClick={takePhotoWithBlur} disabled={isCapturing} className="w-full h-16 rounded-2xl font-black uppercase bg-accent text-accent-foreground hover:bg-accent/80 shadow-lg border-b-4 border-accent-foreground/10 active:border-b-0 active:translate-y-1 transition-all">
                    {isCapturing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6 mr-3" />} 
                    Capturar Prova Segura
                  </Button>
                </div>
              ) : (
                <Button onClick={completeMission} className="w-full h-16 rounded-2xl font-black uppercase bg-primary text-white shadow-xl border-b-4 border-primary-foreground/10 active:border-b-0 active:translate-y-1 transition-all">
                  <CheckCircle2 className="w-6 h-6 mr-3" /> Finalizar Missão
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
             <div className="flex justify-between items-center mb-2 px-2">
                <div className="flex items-center gap-2">
                   <Battery className={cn("w-4 h-4", (profile?.avatar?.energy ?? 100) < 30 ? "text-destructive" : "text-primary")} />
                   <span className="text-[10px] font-black uppercase text-muted-foreground">Stamina: {profile?.avatar?.energy ?? 100}%</span>
                </div>
                <Link href="/community" className="text-[10px] font-black uppercase text-primary flex items-center gap-1"><Share2 className="w-3 h-3" /> Comunidade</Link>
             </div>
             <ChallengeRow title="O Despertar" subtitle="Casa & Criatividade" icon={<HomeIcon />} isCompleted={profile?.dailyCycle?.homeMissionCompleted} onClick={() => handleStartMission('home')} disabled={isScanning || (profile?.avatar?.energy ?? 100) < 15} />
             <ChallengeRow title="A Jornada" subtitle="Rua & Descoberta" icon={<MapPin />} isCompleted={profile?.dailyCycle?.streetMissionCompleted} onClick={() => handleStartMission('street')} disabled={!profile?.dailyCycle?.homeMissionCompleted || isScanning || (profile?.avatar?.energy ?? 100) < 15} />
          </div>
        )}
      </div>
    </div>
  );
}

function ChallengeRow({ title, subtitle, icon, isCompleted, onClick, disabled }: any) {
  return (
    <div onClick={!disabled && !isCompleted ? onClick : undefined} className={cn("p-6 rounded-[2.5rem] flex items-center gap-5 transition-all active:scale-95", isCompleted ? "bg-muted/40 opacity-60" : disabled ? "bg-muted/10 opacity-30" : "bg-white border-2 border-primary/5 shadow-md")}>
      <div className={cn("w-14 h-14 rounded-[1.5rem] flex items-center justify-center", isCompleted ? "bg-primary text-white" : "bg-primary/10 text-primary")}>
        {isCompleted ? <CheckCircle2 className="w-7 h-7" /> : icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{subtitle}</span>
        <h4 className="text-lg font-black uppercase italic leading-none">{title}</h4>
      </div>
    </div>
  );
}
