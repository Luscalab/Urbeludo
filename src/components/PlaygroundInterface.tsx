
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Scan,
  Volume2,
  Hand,
  Info,
  Palette,
  Zap,
  Brain,
  Wind,
  UserCircle,
  AlertTriangle,
  Sun
} from 'lucide-react';
import { proposeDynamicChallenges, type ProposeDynamicChallengesOutput } from '@/ai/flows/propose-dynamic-challenges';
import { identifyUrbanElements } from '@/ai/flows/identify-urban-elements-flow';
import { avatarizeUser, type AvatarizeUserOutput } from '@/ai/flows/avatarize-user-flow';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
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
  const [setupStep, setSetupStep] = useState(0); 
  const [isInitializingCamera, setIsInitializingCamera] = useState(false);
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
  const [cameraMode, setCameraMode] = useState<'user' | 'environment'>('user');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isLibrasEnabled, setIsLibrasEnabled] = useState(false);
  const [isLowLight, setIsLowLight] = useState(false);

  const [ageGroup, setAgeGroup] = useState('adolescent_adult');
  const [sex, setSex] = useState('prefer_not_to_say');
  const [neurodivergence, setNeurodivergence] = useState('');
  const [physicalLimitations, setPhysicalLimitations] = useState('');

  const userProgressRef = useMemoFirebase(() => user ? doc(db, 'user_progress', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userProgressRef);

  useEffect(() => {
    if (profile) {
      setAgeGroup(profile.ageGroup || 'adolescent_adult');
      setSex(profile.sex || 'prefer_not_to_say');
      setNeurodivergence(profile.neurodivergence || '');
      setPhysicalLimitations(profile.physicalLimitations || '');
      if (profile.avatar?.traits) {
        setSafeAvatar(profile.avatar.traits as any);
      }
    }
  }, [profile]);

  const startCamera = async (mode: 'user' | 'environment') => {
    setIsInitializingCamera(true);
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
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.error("Erro ao reproduzir vídeo:", e));
          setTimeout(() => setIsInitializingCamera(false), 800);
        };
      }
    } catch (error) {
      console.error("Erro ao acessar câmera:", error);
      setHasCameraPermission(false);
      setIsInitializingCamera(false);
      toast({
        variant: 'destructive',
        title: 'Câmera Não Encontrada',
        description: 'Por favor, verifique as permissões de câmera do seu dispositivo.'
      });
    }
  };

  useEffect(() => {
    if (!showGuide) {
      startCamera(cameraMode);
    }
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraMode, showGuide]);

  const speak = (text: string) => {
    if (isAudioEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (activeChallenge) {
      const stepText = activeChallenge.steps[currentStep];
      speak(stepText);
    }
  }, [currentStep, activeChallenge]);

  const checkBrightness = (video: HTMLVideoElement): number => {
    const canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 255;

    ctx.drawImage(video, 0, 0, 50, 50);
    const imageData = ctx.getImageData(0, 0, 50, 50);
    const data = imageData.data;
    let totalBrightness = 0;

    for (let i = 0; i < data.length; i += 4) {
      totalBrightness += (data[i] + data[i+1] + data[i+2]) / 3;
    }

    return totalBrightness / (data.length / 4);
  };

  const handleFaceScan = async () => {
    if (!videoRef.current || isInitializingCamera) return;
    
    const video = videoRef.current;
    const brightness = checkBrightness(video);
    
    if (brightness < 60) {
      setIsLowLight(true);
      const lowLightMsg = "Ambiente muito escuro. Vá para um local mais iluminado para o scan facial.";
      speak(lowLightMsg);
      toast({ variant: 'destructive', title: "Luz Insuficiente", description: lowLightMsg });
      return;
    } 

    setIsLowLight(false);
    setIsAvatarizing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Canvas context error");
      
      ctx.drawImage(video, 0, 0);
      const photo = canvas.toDataURL('image/jpeg', 0.8);
      
      const result = await avatarizeUser({ photoDataUri: photo });
      setSafeAvatar(result);

      if (userProgressRef) {
        updateDocumentNonBlocking(userProgressRef, {
          "avatar.traits": result
        });
      }
      
      toast({ 
        title: "Avatar Seguro Criado!", 
        description: "Seu rosto foi transformado em traços artísticos. Dados originais descartados." 
      });
      
      setTimeout(() => setCameraMode('environment'), 2000);
    } catch (e) {
      console.error("Erro no scan:", e);
      setCameraMode('environment');
    } finally {
      setIsAvatarizing(false);
    }
  };

  const handleSaveProfile = async () => {
    if (userProgressRef) {
      updateDocumentNonBlocking(userProgressRef, {
        ageGroup,
        sex,
        neurodivergence,
        physicalLimitations
      });
    }
    setSetupStep(0);
    setShowGuide(false);
  };

  const handleStartMission = async (type: 'home' | 'street') => {
    const energy = profile?.avatar?.energy ?? 100;
    if (energy < 15) {
      toast({ variant: 'destructive', title: 'Energia Baixa', description: 'Descanse seu avatar para continuar.' });
      return;
    }
    setIsScanning(true);
    try {
      let detected: string[] = [];
      if (type === 'street' && videoRef.current && videoRef.current.videoWidth > 0) {
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
      toast({ variant: 'destructive', title: 'Erro na IA', description: 'Tente novamente em alguns segundos.' });
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
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('IDENTIDADE PROTEGIDA • PROCESSAMENTO LOCAL • URBELUDO', canvas.width / 2, canvas.height - 35);

        setPhotoProof(canvas.toDataURL('image/jpeg'));
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
    setTimeout(() => { 
      setCelebrating(false); 
      setActiveChallenge(null);
      setPhotoProof(null);
    }, 4000);
  };

  const isBreathingActivity = activeChallenge?.challengeType === 'breathing';

  if (showGuide) {
    return (
      <div className="min-h-full bg-background flex flex-col p-8 items-center justify-center text-center space-y-8 animate-in fade-in duration-500 overflow-y-auto">
        {setupStep === 0 ? (
          <>
            <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary shadow-inner shrink-0">
              <Info className="w-10 h-10" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Bem-vindo</h2>
              <p className="text-xs font-medium text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Vamos configurar sua acessibilidade e perfil para uma experiência segura.
              </p>
            </div>
            <div className="grid gap-3 w-full max-w-xs">
              <Button variant="outline" className={cn("h-16 rounded-2xl gap-3 transition-all", isAudioEnabled && "border-primary bg-primary/5")} onClick={() => setIsAudioEnabled(!isAudioEnabled)}>
                <Volume2 className={cn("w-6 h-6", isAudioEnabled ? "text-primary" : "text-muted-foreground")} />
                <div className="text-left">
                  <span className="text-[10px] font-black uppercase block leading-none">Áudio Guia</span>
                  <span className="text-[8px] font-bold text-muted-foreground">{isAudioEnabled ? "Ativado" : "Desativado"}</span>
                </div>
              </Button>
              <Button variant="outline" className={cn("h-16 rounded-2xl gap-3 transition-all", isLibrasEnabled && "border-primary bg-primary/5")} onClick={() => setIsLibrasEnabled(!isLibrasEnabled)}>
                <Hand className={cn("w-6 h-6", isLibrasEnabled ? "text-primary" : "text-muted-foreground")} />
                <div className="text-left">
                  <span className="text-[10px] font-black uppercase block leading-none">Libras</span>
                  <span className="text-[8px] font-bold text-muted-foreground">{isLibrasEnabled ? "Ativado" : "Desativado"}</span>
                </div>
              </Button>
            </div>
            <Button onClick={() => setSetupStep(1)} className="w-full max-w-xs h-16 rounded-[2rem] font-black uppercase tracking-widest bg-primary">Continuar</Button>
          </>
        ) : (
          <div className="w-full max-w-xs space-y-6 text-left animate-in slide-in-from-right-4">
            <h2 className="text-xl font-black uppercase italic leading-none mb-6">Seu Perfil</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Idade</Label>
                <Select value={ageGroup} onValueChange={setAgeGroup}>
                  <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preschool">3-6 anos</SelectItem>
                    <SelectItem value="school_age">7-12 anos</SelectItem>
                    <SelectItem value="adolescent_adult">13+ anos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Neurodivergência</Label>
                <Input placeholder="Ex: TDAH, Autismo..." value={neurodivergence} onChange={(e) => setNeurodivergence(e.target.value)} className="rounded-xl h-12" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Limitações Físicas</Label>
                <Input placeholder="Ex: Joelho, Coluna..." value={physicalLimitations} onChange={(e) => setPhysicalLimitations(e.target.value)} className="rounded-xl h-12" />
              </div>
            </div>
            <div className="pt-4 flex gap-3">
               <Button onClick={handleSaveProfile} className="flex-1 h-14 rounded-2xl font-black uppercase bg-primary">Prosseguir</Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      <div className="relative w-full aspect-[4/3] bg-black overflow-hidden shadow-2xl">
        {isInitializingCamera && (
          <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center gap-4 text-white">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
             <span className="text-[10px] font-black uppercase tracking-widest">Iniciando Sensor...</span>
          </div>
        )}
        
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
        <canvas ref={canvasRef} className="hidden" />

        {isLowLight && (
          <div className="absolute inset-0 z-40 bg-black/60 flex flex-col items-center justify-center text-center p-6 animate-pulse">
            <Sun className="w-12 h-12 text-destructive mb-3" />
            <h3 className="text-white font-black uppercase italic text-sm">Luz Insuficiente</h3>
            <p className="text-white/70 text-[8px] font-bold uppercase mt-1">Vá para um local mais iluminado</p>
          </div>
        )}

        {safeAvatar && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
             <div 
               className={cn(
                 "w-48 h-48 rounded-full border-4 border-white/50 shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-700",
                 isBreathingActivity ? "animate-breathing-avatar" : "animate-pulse"
               )}
               style={{ backgroundColor: safeAvatar.dominantColor }}
             >
                <div className="text-white text-center p-4">
                   <div className="text-[8px] font-black uppercase tracking-tighter mb-1">{safeAvatar.accessoryType}</div>
                   <div className="text-[6px] font-bold uppercase opacity-60">ID Seguro Ativo</div>
                   {safeAvatar.hair && <div className="text-[5px] uppercase mt-1 opacity-40">{safeAvatar.hair.style} • {safeAvatar.hair.color}</div>}
                </div>
             </div>
          </div>
        )}
        
        {isLibrasEnabled && (activeChallenge || isLowLight) && (
          <div className="absolute bottom-4 right-4 w-20 h-20 bg-black/60 backdrop-blur-md rounded-2xl border border-primary/40 flex flex-col items-center justify-center z-30 animate-pulse">
             <Hand className="w-8 h-8 text-primary" />
             <span className="text-[7px] font-black text-white uppercase mt-1 tracking-widest">Acessibilidade</span>
          </div>
        )}

        {photoProof && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 z-40 animate-in fade-in zoom-in-95">
             <div className="relative max-w-full">
               <img src={photoProof} className="max-h-[70vh] rounded-2xl border-2 border-primary/50 shadow-2xl" alt="Prova" />
               <Button variant="destructive" size="icon" className="absolute -top-4 -right-4 rounded-full" onClick={() => setPhotoProof(null)}><RefreshCw className="w-5 h-5" /></Button>
             </div>
          </div>
        )}
      </div>

      <div className="flex-1 -mt-8 bg-background rounded-t-[3rem] p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] overflow-y-auto space-y-6 z-20">
        
        {!safeAvatar && (
          <div className="p-6 bg-primary/5 rounded-[2.5rem] border-2 border-dashed border-primary/10 text-center space-y-4">
             <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary"><Scan className="w-8 h-8" /></div>
             <div className="space-y-1">
                <h3 className="text-xl font-black uppercase italic">Scan de Privacidade</h3>
                <p className="text-[9px] font-medium text-muted-foreground leading-relaxed max-w-[220px] mx-auto">
                  Sua foto será convertida em uma base de dados de traços artísticos. O original será deletado instantaneamente.
                </p>
             </div>
             <Button onClick={handleFaceScan} disabled={isAvatarizing} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-primary shadow-lg">
               {isAvatarizing ? <Loader2 className="animate-spin" /> : "Gerar Avatar Seguro"}
             </Button>
          </div>
        )}

        {safeAvatar && !activeChallenge && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
             <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                <CategoryButton active={selectedCategory === 'artistic'} onClick={() => setSelectedCategory('artistic')} icon={<Palette className="w-3 h-3" />} label="Arte" />
                <CategoryButton active={selectedCategory === 'motor'} onClick={() => setSelectedCategory('motor')} icon={<Zap className="w-3 h-3" />} label="Motor" />
                <CategoryButton active={selectedCategory === 'memory'} onClick={() => setSelectedCategory('memory')} icon={<Brain className="w-3 h-3" />} label="Mente" />
                <CategoryButton active={selectedCategory === 'relaxation'} onClick={() => setSelectedCategory('relaxation')} icon={<Wind className="w-3 h-3" />} label="Zen" />
             </div>
             <div className="space-y-3">
                <ChallengeRow title="O Despertar" subtitle="Casa & Criatividade" icon={<HomeIcon />} isCompleted={profile?.dailyCycle?.homeMissionCompleted} onClick={() => handleStartMission('home')} disabled={isScanning} />
                <ChallengeRow title="A Jornada" subtitle="Rua & Exploração" icon={<MapPin />} isCompleted={profile?.dailyCycle?.streetMissionCompleted} onClick={() => handleStartMission('street')} disabled={isScanning} />
             </div>
          </div>
        )}

        {activeChallenge && (
          <div className="bg-primary/5 rounded-[2.5rem] p-6 space-y-6 animate-in slide-in-from-bottom-6">
            <div className="flex justify-between items-center">
              <Badge className="bg-accent text-accent-foreground font-black text-[8px] uppercase">Dificuldade: {activeChallenge.difficulty}</Badge>
              <div className="flex items-center gap-1 font-black text-primary text-sm"><Coins className="w-4 h-4 text-yellow-500" /> {activeChallenge.ludoCoinsReward}</div>
            </div>
            <h3 className="text-xl font-black uppercase italic leading-none">{activeChallenge.challengeTitle}</h3>
            <div className="space-y-2">
               {activeChallenge.steps.map((step, idx) => (
                 <div key={idx} className={cn(
                   "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                   currentStep === idx ? "bg-white border-primary/30 shadow-md" : "bg-muted/30 border-transparent opacity-40"
                 )}>
                   <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black", currentStep >= idx ? "bg-primary text-white" : "bg-muted")}>{idx + 1}</div>
                   <p className="text-xs font-bold leading-tight">{step}</p>
                 </div>
               ))}
            </div>
            <div className="pt-2">
              {currentStep < activeChallenge.steps.length - 1 ? (
                <Button onClick={() => setCurrentStep(prev => prev + 1)} className="w-full h-14 rounded-2xl font-black uppercase bg-primary">Próximo Passo</Button>
              ) : !photoProof ? (
                <Button onClick={takePhotoWithAvatarOverlay} disabled={isCapturing} className="w-full h-16 rounded-[2rem] font-black uppercase bg-accent text-accent-foreground flex items-center justify-center gap-2">
                  <Camera className="w-6 h-6" /> Comprovar Missão
                </Button>
              ) : (
                <Button onClick={completeMission} className="w-full h-16 rounded-[2rem] font-black uppercase bg-primary text-white animate-bounce">Concluir Agora</Button>
              )}
            </div>
          </div>
        )}
      </div>

      {celebrating && (
        <div className="fixed inset-0 z-[100] bg-primary flex flex-col items-center justify-center p-10 text-center text-white animate-in zoom-in">
          <Trophy className="w-20 h-20 mb-4 animate-bounce text-yellow-300" />
          <h2 className="text-4xl font-black uppercase italic mb-4">LudoCoins!</h2>
          <div className="bg-white/20 px-8 py-4 rounded-[2rem] border border-white/30 backdrop-blur-xl">
             <span className="text-3xl font-black">+{activeChallenge?.ludoCoinsReward}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={cn(
      "px-4 py-2 rounded-xl text-[8px] font-black uppercase flex items-center gap-2 transition-all border-2 whitespace-nowrap",
      active ? "bg-primary text-white border-primary" : "bg-white text-muted-foreground border-transparent shadow-sm"
    )}>
      {icon} {label}
    </button>
  );
}

function ChallengeRow({ title, subtitle, icon, isCompleted, onClick, disabled }: any) {
  return (
    <div onClick={!disabled && !isCompleted ? onClick : undefined} className={cn(
      "p-6 rounded-[2.5rem] flex items-center gap-4 transition-all", 
      isCompleted ? "bg-muted/40 opacity-50" : 
      disabled ? "bg-muted/10 opacity-30" : "bg-white border-2 border-primary/5 shadow-md active:scale-95 cursor-pointer"
    )}>
      <div className={cn("w-12 h-12 rounded-[1rem] flex items-center justify-center", isCompleted ? "bg-primary text-white" : "bg-primary/10 text-primary")}>
        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : icon}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <span className="text-[8px] font-black uppercase text-muted-foreground">{subtitle}</span>
        <h4 className="text-lg font-black uppercase italic mt-0.5">{title}</h4>
      </div>
    </div>
  );
}
