
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
  UserCircle
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
  const [setupStep, setSetupStep] = useState(0); // 0: Welcome/Accessibility, 1: Profile Info
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

  // Form State
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

  useEffect(() => {
    if (isAudioEnabled && activeChallenge) {
      const stepText = activeChallenge.steps[currentStep];
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(stepText);
        utterance.lang = 'pt-BR';
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [currentStep, activeChallenge, isAudioEnabled]);

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

  const handleFaceScan = async () => {
    if (!videoRef.current || isInitializingCamera) return;
    
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0 || video.readyState < 2) {
      toast({ 
        variant: 'destructive', 
        title: "Câmera Inicializando", 
        description: "Aguarde o sinal de vídeo aparecer e tente novamente." 
      });
      return;
    }

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
      
      toast({ 
        title: "Avatar Seguro Criado!", 
        description: "Sua identidade foi preservada. Dados originais descartados." 
      });
      
      // Muda para câmera traseira após o scan bem sucedido
      setTimeout(() => setCameraMode('environment'), 1500);
    } catch (e) {
      console.error("Erro no scan:", e);
      setSafeAvatar({
        avatarStyleDescription: "Explorador Cibernético Minimalista",
        dominantColor: "#33993D",
        accessoryType: "Visor de Neon"
      });
      setCameraMode('environment');
    } finally {
      setIsAvatarizing(false);
    }
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
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('IDENTIDADE PROTEGIDA POR IA • PROCESSAMENTO LOCAL', canvas.width / 2, canvas.height - 35);

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
              <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Guia de Exploração</h2>
              <p className="text-xs font-medium text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Bem-vindo ao UrbeLudo. Antes de começar, vamos configurar sua experiência.
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
                  <span className="text-[10px] font-black uppercase block leading-none">Guia de Libras</span>
                  <span className="text-[8px] font-bold text-muted-foreground">{isLibrasEnabled ? "Ativado" : "Desativado"}</span>
                </div>
              </Button>
            </div>
            <Button onClick={() => setSetupStep(1)} className="w-full max-w-xs h-16 rounded-[2rem] font-black uppercase tracking-widest shadow-xl bg-primary hover:bg-primary/90">Configurar Perfil</Button>
          </>
        ) : (
          <div className="w-full max-w-xs space-y-6 text-left animate-in slide-in-from-right-4">
            <div className="flex items-center gap-3 mb-6">
               <UserCircle className="w-8 h-8 text-primary" />
               <h2 className="text-xl font-black uppercase italic leading-none">Seu Perfil</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Idade</Label>
                <Select value={ageGroup} onValueChange={setAgeGroup}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="Selecione sua idade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preschool">Pré-escolar (3-6)</SelectItem>
                    <SelectItem value="school_age">Escolar (7-12)</SelectItem>
                    <SelectItem value="adolescent_adult">Adolescente/Adulto (13+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Sexo</Label>
                <Select value={sex} onValueChange={setSex}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="Selecione seu sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefiro não dizer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Neurodivergência (Opcional)</Label>
                <Input 
                  placeholder="Ex: TDAH, Autismo..." 
                  value={neurodivergence} 
                  onChange={(e) => setNeurodivergence(e.target.value)}
                  className="rounded-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Limitações Físicas (Opcional)</Label>
                <Input 
                  placeholder="Ex: Lesão no joelho..." 
                  value={physicalLimitations} 
                  onChange={(e) => setPhysicalLimitations(e.target.value)}
                  className="rounded-xl h-12"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
               <Button variant="ghost" onClick={() => setSetupStep(0)} className="h-14 font-black uppercase text-[10px]">Voltar</Button>
               <Button onClick={handleSaveProfile} className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest bg-primary">Prosseguir</Button>
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
          <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center gap-4">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
             <span className="text-[10px] font-black uppercase text-white tracking-widest">Iniciando Sensor...</span>
          </div>
        )}
        
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover" 
          autoPlay 
          muted 
          playsInline 
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Overlay do Avatar Seguro */}
        {safeAvatar && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
             <div 
               className={cn(
                 "w-48 h-48 rounded-full border-4 border-white/50 shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-1000",
                 isBreathingActivity ? "animate-breathing-avatar" : "animate-pulse"
               )}
               style={{ backgroundColor: safeAvatar.dominantColor }}
             >
                <div className="text-white text-center p-4">
                   <div className="text-[8px] font-black uppercase tracking-tighter mb-1">{safeAvatar.accessoryType}</div>
                   <div className="text-[6px] font-bold uppercase opacity-60">Identidade Protegida</div>
                </div>
             </div>
             {isBreathingActivity && (
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 rounded-full border border-primary/30 animate-ping opacity-20" />
                  <div className="absolute bottom-10 bg-black/60 px-6 py-2 rounded-full border border-primary/40 backdrop-blur-md">
                     <span className="text-[10px] font-black text-primary uppercase tracking-widest">Respire com o Avatar</span>
                  </div>
               </div>
             )}
          </div>
        )}
        
        {isLibrasEnabled && activeChallenge && (
          <div className="absolute bottom-4 right-4 w-20 h-20 bg-black/60 backdrop-blur-md rounded-2xl border border-primary/40 flex flex-col items-center justify-center z-30 animate-pulse">
             <Hand className="w-8 h-8 text-primary" />
             <span className="text-[7px] font-black text-white uppercase mt-1 tracking-widest">Libras</span>
          </div>
        )}

        {photoProof && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 z-40 animate-in fade-in zoom-in-95">
             <div className="relative max-w-full">
               <img src={photoProof} className="max-h-[70vh] rounded-2xl border-2 border-primary/50 shadow-2xl" alt="Prova" />
               <Button variant="destructive" size="icon" className="absolute -top-4 -right-4 rounded-full" onClick={() => setPhotoProof(null)}><RefreshCw className="w-5 h-5" /></Button>
             </div>
             <p className="mt-4 text-[10px] font-black text-primary uppercase tracking-widest">Identidade Preservada com Sucesso</p>
          </div>
        )}
      </div>

      <div className="flex-1 -mt-8 bg-background rounded-t-[3rem] p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] overflow-y-auto space-y-6 z-20">
        
        {!safeAvatar && hasCameraPermission !== false && (
          <div className="p-6 bg-primary/5 rounded-[2.5rem] border-2 border-dashed border-primary/10 text-center space-y-5 animate-in zoom-in-95">
             <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <Scan className="w-8 h-8" />
             </div>
             <div className="space-y-1">
                <h3 className="text-xl font-black uppercase italic">Scan de Identidade</h3>
                <p className="text-[10px] font-medium text-muted-foreground leading-relaxed max-w-[200px] mx-auto">
                  Analise seu rosto para gerar um avatar de privacidade. A foto original será descartada instantaneamente.
                </p>
             </div>
             <Button onClick={handleFaceScan} disabled={isAvatarizing || isInitializingCamera} className="w-full h-14 rounded-[1.5rem] font-black uppercase tracking-widest bg-primary">
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
             
             <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1">
                      <Battery className={cn("w-4 h-4", (profile?.avatar?.energy ?? 100) < 30 ? "text-destructive" : "text-primary")} />
                      <span className="text-[9px] font-black uppercase text-muted-foreground">{profile?.avatar?.energy ?? 100}% Energia</span>
                   </div>
                </div>
                <Link href="/community" className="text-[9px] font-black uppercase text-primary flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-xl"><Share2 className="w-3 h-3" /> Galeria</Link>
             </div>
             
             <div className="space-y-3">
                <ChallengeRow title="O Despertar" subtitle="Casa & Criatividade" icon={<HomeIcon />} isCompleted={profile?.dailyCycle?.homeMissionCompleted} onClick={() => handleStartMission('home')} disabled={isScanning} />
                <ChallengeRow title="A Jornada" subtitle="Rua & Exploração" icon={<MapPin />} isCompleted={profile?.dailyCycle?.streetMissionCompleted} onClick={() => handleStartMission('street')} disabled={isScanning} />
             </div>
          </div>
        )}

        {activeChallenge && (
          <Card className="border-none bg-primary/5 rounded-[2.5rem] shadow-sm animate-in slide-in-from-bottom-6">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center mb-2">
                <Badge className="bg-accent text-accent-foreground font-black text-[9px] uppercase px-3">Dificuldade: {activeChallenge.difficulty}</Badge>
                <div className="flex items-center gap-1 font-black text-primary text-sm"><Coins className="w-4 h-4 text-yellow-500" /> {activeChallenge.ludoCoinsReward}</div>
              </div>
              <CardTitle className="text-xl font-black uppercase italic leading-none">{activeChallenge.challengeTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                 {activeChallenge.steps.map((step, idx) => (
                   <div key={idx} className={cn(
                     "flex items-center gap-3 p-4 rounded-2xl transition-all border-2",
                     currentStep === idx ? "bg-white shadow-md border-primary/30" : 
                     currentStep > idx ? "bg-primary/10 opacity-50 border-transparent" : "bg-muted/40 opacity-30 border-transparent"
                   )}>
                     <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black", currentStep >= idx ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>{idx + 1}</div>
                     <p className="text-xs font-bold leading-tight flex-1">{step}</p>
                   </div>
                 ))}
              </div>

              <div className="pt-2">
                {currentStep < activeChallenge.steps.length - 1 ? (
                  <Button onClick={() => setCurrentStep(prev => prev + 1)} className="w-full h-14 rounded-[1.5rem] font-black uppercase tracking-widest bg-primary text-white">
                    Concluir Etapa <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : !photoProof ? (
                  <Button onClick={takePhotoWithAvatarOverlay} disabled={isCapturing} className="w-full h-16 rounded-[2rem] font-black uppercase tracking-widest bg-accent text-accent-foreground shadow-lg flex items-center justify-center gap-2">
                    {isCapturing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />} 
                    Comprovar com IA
                  </Button>
                ) : (
                  <Button onClick={completeMission} className="w-full h-16 rounded-[2rem] font-black uppercase tracking-widest bg-primary text-white shadow-lg animate-bounce">
                    <CheckCircle2 className="w-6 h-6 mr-2" /> Concluir Missão
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {celebrating && (
        <div className="fixed inset-0 z-[100] bg-primary flex flex-col items-center justify-center p-10 text-center text-white animate-in zoom-in duration-500">
          <Trophy className="w-24 h-24 mb-6 animate-bounce text-yellow-300" />
          <h2 className="text-4xl font-black uppercase italic mb-4">Incrível!</h2>
          <div className="bg-white/20 px-8 py-4 rounded-[2rem] border border-white/30 backdrop-blur-xl">
             <span className="text-3xl font-black flex items-center gap-2"><Coins className="w-8 h-8 text-yellow-300" /> +{activeChallenge?.ludoCoinsReward}</span>
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
        "px-4 py-2 rounded-xl text-[8px] font-black uppercase flex items-center gap-2 transition-all border-2 whitespace-nowrap",
        active ? "bg-primary text-white border-primary" : "bg-white text-muted-foreground border-transparent shadow-sm"
      )}
    >
      {icon} {label}
    </button>
  );
}

function ChallengeRow({ title, subtitle, icon, isCompleted, onClick, disabled }: any) {
  return (
    <div onClick={!disabled && !isCompleted ? onClick : undefined} className={cn(
      "p-6 rounded-[2.5rem] flex items-center gap-4 transition-all", 
      isCompleted ? "bg-muted/40 opacity-50" : 
      disabled ? "bg-muted/10 opacity-30 cursor-not-allowed" : "bg-white border-2 border-primary/5 shadow-md active:scale-95 cursor-pointer"
    )}>
      <div className={cn("w-12 h-12 rounded-[1rem] flex items-center justify-center", isCompleted ? "bg-primary text-white" : "bg-primary/10 text-primary")}>
        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : icon}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{subtitle}</span>
        <h4 className="text-lg font-black uppercase italic leading-none mt-0.5">{title}</h4>
      </div>
    </div>
  );
}
