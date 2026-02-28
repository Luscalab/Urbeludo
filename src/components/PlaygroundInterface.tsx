
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
  EyeOff,
  Palette,
  Zap,
  Brain,
  Wind,
  Info,
  UserCheck,
  Scan,
  Volume2,
  Hand
} from 'lucide-react';
import { proposeDynamicChallenges, type ProposeDynamicChallengesOutput } from '@/ai/flows/propose-dynamic-challenges';
import { identifyUrbanElements } from '@/ai/flows/identify-urban-elements-flow';
import { avatarizeUser, type AvatarizeUserOutput } from '@/ai/flows/avatarize-user-flow';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type CategoryType = 'artistic' | 'motor' | 'memory' | 'relaxation';

export function PlaygroundInterface() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [showGuide, setShowGuide] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<ProposeDynamicChallengesOutput & { missionType?: 'home' | 'street' } | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [photoProof, setPhotoProof] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('motor');
  
  const [isAvatarizing, setIsAvatarizing] = useState(false);
  const [safeAvatar, setSafeAvatar] = useState<AvatarizeUserOutput | null>(null);
  const [cameraMode, setCameraMode] = useState<'user' | 'environment'>('user'); // Default to 'user' for initial scan
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isLibrasEnabled, setIsLibrasEnabled] = useState(false);

  const userProgressRef = useMemoFirebase(() => user ? doc(db, 'user_progress', user.uid) : null, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(userProgressRef);

  const startCamera = async (mode: 'user' | 'environment') => {
    try {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setHasCameraPermission(true);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error) {
      console.error("Erro ao acessar câmera:", error);
      setHasCameraPermission(false);
    }
  };

  useEffect(() => {
    startCamera(cameraMode);
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraMode]);

  // Audio Guide Logic
  useEffect(() => {
    if (isAudioEnabled && activeChallenge) {
      const stepText = activeChallenge.steps[currentStep];
      const utterance = new SpeechSynthesisUtterance(stepText);
      utterance.lang = 'pt-BR';
      window.speechSynthesis.speak(utterance);
    }
  }, [currentStep, activeChallenge, isAudioEnabled]);

  const handleFaceScan = async () => {
    if (!videoRef.current) return;
    setIsAvatarizing(true);
    
    // Pequeno delay para garantir frame pronto
    setTimeout(async () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current!.videoWidth;
        canvas.height = videoRef.current!.videoHeight;
        canvas.getContext('2d')?.drawImage(videoRef.current!, 0, 0);
        const photo = canvas.toDataURL('image/jpeg');
        
        const result = await avatarizeUser({ photoDataUri: photo });
        setSafeAvatar(result);
        setCameraMode('environment'); // Switch to back camera for missions
        toast({ 
          title: "Avatar Seguro Gerado", 
          description: "Sua foto original foi descartada por segurança." 
        });
      } catch (e) {
        toast({ variant: 'destructive', title: "Erro no Scan", description: "Tente novamente posicionando melhor o rosto." });
      } finally {
        setIsAvatarizing(false);
      }
    }, 1500);
  };

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
        category: selectedCategory,
        psychomotorLevel: profile?.psychomotorLevel || 1,
        userAgeGroup: profile?.ageGroup || 'adolescent_adult',
        userSkillLevel: profile?.skillLevel || 'intermediate',
        detectedElements: detected
      });
      setActiveChallenge({ ...challenge, missionType: type });
      setCurrentStep(0);
      setPhotoProof(null);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro na IA', description: 'Tente novamente em instantes.' });
    } finally {
      setIsScanning(false);
    }
  };

  const takePhotoWithAvatarOverlay = () => {
    if (videoRef.current && canvasRef.current) {
      setIsCapturing(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        
        // Simulação de Filtro de Avatar
        const centerX = canvas.width / 2;
        const centerY = canvas.height * 0.4;
        const radius = Math.min(canvas.width, canvas.height) * 0.22;

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = safeAvatar?.dominantColor || '#33993D';
        ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        ctx.strokeRect(centerX - radius/2, centerY - radius/4, radius, radius/8);
        ctx.restore();

        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('IDENTIDADE PROTEGIDA: AVATAR SEGURO ATIVO', canvas.width / 2, canvas.height - 28);

        setPhotoProof(canvas.toDataURL('image/jpeg'));
        toast({ title: "Privacidade Garantida", description: "Identidade bio-protegida." });
      }
      setIsCapturing(false);
    }
  };

  const completeMission = () => {
    if (!activeChallenge || !user || !userProgressRef) return;

    const missionType = activeChallenge.missionType || 'home';
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

    const updates = {
      ludoCoins: (profile?.ludoCoins || 0) + activeChallenge.ludoCoinsReward,
      totalChallengesCompleted: (profile?.totalChallengesCompleted || 0) + 1,
      avatar: { ...profile?.avatar, energy: Math.max(0, (profile?.avatar?.energy ?? 100) - 20) },
      dailyCycle: {
        ...profile?.dailyCycle,
        homeMissionCompleted: missionType === 'home' ? true : (profile?.dailyCycle?.homeMissionCompleted ?? false),
        streetMissionCompleted: missionType === 'street' ? true : (profile?.dailyCycle?.streetMissionCompleted ?? false),
      }
    };
    
    setDocumentNonBlocking(userProgressRef, updates, { merge: true });
    setCelebrating(true);
    setTimeout(() => { setCelebrating(false); setActiveChallenge(null); }, 4000);
  };

  if (showGuide) {
    return (
      <div className="min-h-full bg-background flex flex-col p-8 items-center justify-center text-center space-y-8 animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary">
          <Info className="w-10 h-10" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Bem-vindo à Jornada</h2>
          <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto">
            O UrbeLudo conecta seu corpo à cidade de forma acessível e segura.
          </p>
        </div>
        <div className="grid gap-4 w-full max-w-xs">
          <Button variant="outline" className="h-14 rounded-2xl gap-3" onClick={() => setIsAudioEnabled(!isAudioEnabled)}>
            <Volume2 className={cn("w-5 h-5", isAudioEnabled ? "text-primary" : "text-muted-foreground")} />
            <span className="text-[10px] font-black uppercase">{isAudioEnabled ? "Guia por Áudio Ativo" : "Ativar Áudio Guia"}</span>
          </Button>
          <Button variant="outline" className="h-14 rounded-2xl gap-3" onClick={() => setIsLibrasEnabled(!isLibrasEnabled)}>
            <Hand className={cn("w-5 h-5", isLibrasEnabled ? "text-primary" : "text-muted-foreground")} />
            <span className="text-[10px] font-black uppercase">{isLibrasEnabled ? "Libras Ativo" : "Ativar Libras"}</span>
          </Button>
        </div>
        <Button onClick={() => setShowGuide(false)} className="w-full max-w-xs h-16 rounded-[2.5rem] font-black uppercase tracking-widest shadow-xl">Começar Agora</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      <div className="relative w-full aspect-[4/3] bg-black overflow-hidden shadow-inner">
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Libras Avatar Overlay */}
        {isLibrasEnabled && activeChallenge && (
          <div className="absolute bottom-4 right-4 w-20 h-20 bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center overflow-hidden z-30 animate-pulse">
             <div className="flex flex-col items-center gap-1">
                <Hand className="w-8 h-8 text-primary" />
                <span className="text-[8px] font-black text-white uppercase">Libras</span>
             </div>
          </div>
        )}

        {/* Dynamic Avatar Filter */}
        {safeAvatar && !photoProof && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
             <div 
               className="w-44 h-44 rounded-full border-4 border-white/50 shadow-2xl flex flex-col items-center justify-center text-white text-center p-4 transition-all"
               style={{ backgroundColor: `${safeAvatar.dominantColor}99`, backdropFilter: 'blur(10px)' }}
             >
                <div className="bg-white/20 w-32 h-6 rounded-full border border-white/40 mb-2" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Avatar Ativo</span>
             </div>
          </div>
        )}

        {photoProof && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-10">
             <img src={photoProof} className="max-h-full rounded-2xl border-4 border-white/20 shadow-2xl" alt="Proof" />
             <Button variant="destructive" size="icon" className="absolute top-4 right-4 rounded-full" onClick={() => setPhotoProof(null)}><RefreshCw className="w-4 h-4" /></Button>
          </div>
        )}
        
        <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
           <Badge variant="outline" className="bg-black/40 text-white border-white/20 backdrop-blur-md gap-2 py-1.5 px-3">
              <ShieldCheck className="w-3 h-3 text-green-400" />
              <span className="text-[8px] font-black uppercase tracking-tighter">Bio-Privacidade Ativa</span>
           </Badge>
        </div>
      </div>

      <div className="flex-1 -mt-10 bg-background rounded-t-[3rem] p-6 shadow-2xl overflow-y-auto space-y-6 z-20">
        
        {!safeAvatar && hasCameraPermission && (
          <div className="p-6 bg-accent/5 rounded-[2.5rem] border-2 border-dashed border-accent/20 text-center space-y-4 animate-in zoom-in-95">
             <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-accent">
                <Scan className="w-8 h-8" />
             </div>
             <div className="space-y-1">
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Scan de Identidade</h3>
                <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                  Posicione seu rosto para gerar o Avatar Seguro. <br/>
                  <span className="text-primary font-bold">A foto será descartada imediatamente após o scan.</span>
                </p>
             </div>
             <Button onClick={handleFaceScan} disabled={isAvatarizing} className="w-full h-14 rounded-2xl font-black uppercase bg-accent text-accent-foreground">
               {isAvatarizing ? <Loader2 className="animate-spin" /> : "Iniciar Scan de Segurança"}
             </Button>
          </div>
        )}

        {safeAvatar && !activeChallenge && (
          <div className="space-y-4">
             <div className="flex flex-wrap gap-2 mb-2">
                <CategoryButton active={selectedCategory === 'artistic'} onClick={() => setSelectedCategory('artistic')} icon={<Palette className="w-3 h-3" />} label="Artístico" />
                <CategoryButton active={selectedCategory === 'motor'} onClick={() => setSelectedCategory('motor')} icon={<Zap className="w-3 h-3" />} label="Motor" />
                <CategoryButton active={selectedCategory === 'memory'} onClick={() => setSelectedCategory('memory')} icon={<Brain className="w-3 h-3" />} label="Memória" />
                <CategoryButton active={selectedCategory === 'relaxation'} onClick={() => setSelectedCategory('relaxation')} icon={<Wind className="w-3 h-3" />} label="Relax" />
             </div>
             
             <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1">
                      <Battery className={cn("w-4 h-4", (profile?.avatar?.energy ?? 100) < 30 ? "text-destructive" : "text-primary")} />
                      <span className="text-[10px] font-black uppercase text-muted-foreground">{profile?.avatar?.energy ?? 100}%</span>
                   </div>
                   <button onClick={() => setIsAudioEnabled(!isAudioEnabled)} className={cn("p-1 rounded-full", isAudioEnabled ? "text-primary" : "text-muted-foreground")}><Volume2 className="w-4 h-4" /></button>
                </div>
                <Link href="/community" className="text-[10px] font-black uppercase text-primary flex items-center gap-1"><Share2 className="w-3 h-3" /> Galeria</Link>
             </div>
             
             <ChallengeRow title="O Despertar" subtitle="Casa" icon={<HomeIcon />} isCompleted={profile?.dailyCycle?.homeMissionCompleted} onClick={() => handleStartMission('home')} disabled={isScanning} />
             <ChallengeRow title="A Jornada" subtitle="Rua" icon={<MapPin />} isCompleted={profile?.dailyCycle?.streetMissionCompleted} onClick={() => handleStartMission('street')} disabled={isScanning} />
          </div>
        )}

        {activeChallenge && (
          <Card className="border-none bg-primary/5 rounded-[2.5rem] shadow-sm animate-in slide-in-from-bottom-4">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center mb-2">
                <Badge className="bg-accent text-accent-foreground font-black text-[8px] uppercase">{activeChallenge.difficulty}</Badge>
                <div className="flex items-center gap-1 font-black text-primary text-sm"><Coins className="w-3 h-3" /> {activeChallenge.ludoCoinsReward}</div>
              </div>
              <CardTitle className="text-xl font-black uppercase italic tracking-tighter leading-none">{activeChallenge.challengeTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                 {activeChallenge.steps.map((step, idx) => (
                   <div key={idx} className={cn(
                     "flex items-center gap-3 p-3 rounded-2xl transition-all",
                     currentStep === idx ? "bg-white shadow-sm border border-primary/20" : 
                     currentStep > idx ? "bg-primary/20 opacity-60" : "bg-muted/40 opacity-40"
                   )}>
                     <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black", currentStep >= idx ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>{idx + 1}</div>
                     <p className="text-xs font-bold leading-tight">{step}</p>
                   </div>
                 ))}
              </div>

              {currentStep < activeChallenge.steps.length - 1 ? (
                <Button onClick={() => setCurrentStep(prev => prev + 1)} className="w-full h-14 rounded-2xl font-black uppercase">Seguir <ChevronRight className="w-4 h-4 ml-2" /></Button>
              ) : !photoProof ? (
                <Button onClick={takePhotoWithAvatarOverlay} disabled={isCapturing} className="w-full h-16 rounded-2xl font-black uppercase bg-accent text-accent-foreground shadow-lg">
                  {isCapturing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6 mr-3" />} 
                  Capturar Prova Segura
                </Button>
              ) : (
                <Button onClick={completeMission} className="w-full h-16 rounded-2xl font-black uppercase bg-primary text-white shadow-xl">
                  <CheckCircle2 className="w-6 h-6 mr-3" /> Finalizar Missão
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {celebrating && (
        <div className="fixed inset-0 z-[100] bg-primary flex flex-col items-center justify-center p-8 text-center text-white animate-in zoom-in">
          <Trophy className="w-24 h-24 mb-8 animate-bounce" />
          <h2 className="text-4xl font-black uppercase italic mb-4">Bravo!</h2>
          <div className="bg-white/20 px-8 py-4 rounded-3xl border border-white/30 backdrop-blur-xl">
             <span className="text-4xl font-black flex items-center gap-2"><Coins className="w-8 h-8 text-yellow-300" /> +{activeChallenge?.ludoCoinsReward}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-2xl text-[8px] font-black uppercase flex items-center gap-2 transition-all border shadow-sm",
        active ? "bg-primary text-white border-primary" : "bg-white text-muted-foreground border-muted hover:bg-muted/10"
      )}
    >
      {icon} {label}
    </button>
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
