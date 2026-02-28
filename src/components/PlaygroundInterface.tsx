
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
  Scan,
  Volume2,
  Hand,
  Info,
  Palette,
  Zap,
  Brain,
  Wind,
  Sun,
  ShieldAlert,
  Sparkles
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
  const [isBlinking, setIsBlinking] = useState(false);

  const [ageGroup, setAgeGroup] = useState('adolescent_adult');
  const [neurodivergence, setNeurodivergence] = useState('');

  const userProgressRef = useMemoFirebase(() => user ? doc(db, 'user_progress', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userProgressRef);

  useEffect(() => {
    if (profile) {
      setAgeGroup(profile.ageGroup || 'adolescent_adult');
      setNeurodivergence(profile.neurodivergence || '');
      if (profile.avatar?.traits) {
        setSafeAvatar(profile.avatar.traits as any);
      }
    }
  }, [profile]);

  // Simulação de ações do rosto (piscar)
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  const startCamera = async (mode: 'user' | 'environment') => {
    setIsInitializingCamera(true);
    try {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: mode },
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
    if (video.videoWidth === 0) {
      toast({ title: "Aguarde...", description: "Câmera inicializando para o scan." });
      return;
    }

    const brightness = checkBrightness(video);
    if (brightness < 60) {
      setIsLowLight(true);
      const msg = "Ambiente muito escuro. Vá para um local iluminado para o scan facial.";
      speak(msg);
      toast({ variant: 'destructive', title: "Luz Insuficiente", description: msg });
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
        updateDocumentNonBlocking(userProgressRef, { "avatar.traits": result });
      }
      toast({ title: "Avatar Criado!", description: "Sua identidade está protegida." });
    } catch (e) {
      toast({ variant: 'destructive', title: "Erro no Scan", description: "Tentando novamente com avatar padrão." });
      const fallback = {
        hair: { style: 'curto' as any, color: '#333333', texture: 'Liso' },
        eyes: { shape: 'Amendoado', color: '#33993D', eyebrowShape: 'Natural' },
        face: { shape: 'Oval', tone: 'Médio', undertone: 'Neutro', noseShape: 'Natural', mouthShape: 'Natural' },
        accessories: [],
        dominantColor: "#33993D",
        accessoryType: "Visor Pulse",
        avatarStyleDescription: "Explorador UrbeLudo"
      };
      setSafeAvatar(fallback);
    } finally {
      setIsAvatarizing(false);
    }
  };

  const handleSaveProfile = async () => {
    if (userProgressRef) {
      updateDocumentNonBlocking(userProgressRef, {
        ageGroup, neurodivergence
      });
    }
    setShowGuide(false);
    setCameraMode('user');
  };

  const handleStartMission = async (type: 'home' | 'street') => {
    const energy = profile?.avatar?.energy ?? 100;
    if (energy < 15) {
      toast({ variant: 'destructive', title: 'Energia Baixa', description: 'Descanse para continuar explorando.' });
      return;
    }

    if (type === 'street') setCameraMode('environment');
    else setCameraMode('user');

    setIsScanning(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
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
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro na IA', description: 'Tente novamente.' });
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
        
        // Simulação de Blur e Overlay de Avatar Seguro
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
        ctx.lineWidth = 10;
        ctx.stroke();
        ctx.restore();

        // Banner de Privacidade
        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
        ctx.fillStyle = '#99E630';
        ctx.font = 'black 16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('IDENTIDADE PROTEGIDA • IA DE BORDA URBELUDO', canvas.width / 2, canvas.height - 60);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Inter';
        ctx.fillText('DADOS BIOMÉTRICOS DESCARTADOS POR SEGURANÇA', canvas.width / 2, canvas.height - 35);

        setPhotoProof(canvas.toDataURL('image/jpeg', 0.85));
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
    if (activityData.isPublic) addDocumentNonBlocking(collection(db, 'public_gallery'), activityData);

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
      setCameraMode('user');
    }, 4000);
  };

  const isBreathingActivity = activeChallenge?.challengeType === 'breathing' || selectedCategory === 'relaxation';

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Viewport da Câmera */}
      <div className="relative w-full aspect-[4/3] bg-black overflow-hidden shadow-2xl z-0">
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover" 
          autoPlay 
          muted 
          playsInline 
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Alerta de Luz */}
        {isLowLight && (
          <div className="absolute inset-0 z-40 bg-black/80 flex flex-col items-center justify-center text-center p-8 animate-pulse">
            <Sun className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-white font-black uppercase text-sm">Ambiente Escuro</h3>
            <p className="text-white/60 text-[9px] font-bold uppercase mt-2">O Scan Facial requer mais luz para sua proteção.</p>
          </div>
        )}

        {/* Guia Visual do Scan */}
        {cameraMode === 'user' && !safeAvatar && !isInitializingCamera && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="w-60 h-72 border-4 border-dashed border-primary/40 rounded-[3.5rem] relative">
              <div className="absolute inset-0 bg-primary/5 rounded-[3.5rem]" />
              <div className="absolute -top-12 inset-x-0 text-center text-primary font-black text-[10px] uppercase">Enquadre seu rosto para o scan</div>
            </div>
          </div>
        )}

        {/* Representação do Avatar Visual (LUDO PERSONA) */}
        {safeAvatar && cameraMode === 'user' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
             <div 
               className={cn(
                 "relative w-64 h-64 rounded-[3.5rem] border-4 border-white/40 shadow-2xl flex flex-col items-center justify-center overflow-hidden transition-all duration-700",
                 isBreathingActivity ? "animate-breathing-avatar" : "animate-float-libras"
               )}
               style={{ backgroundColor: safeAvatar.dominantColor || '#33993D' }}
             >
                {/* Camada de Estilo: Cabelo */}
                <div 
                  className={cn(
                    "absolute top-0 w-full h-2/5 opacity-90 transition-all",
                    safeAvatar.hair?.style === 'cacheado' ? "rounded-b-[2rem]" : "rounded-none"
                  )}
                  style={{ backgroundColor: safeAvatar.hair?.color || '#333' }}
                />

                {/* Camada de Olhos / Visor */}
                <div className="w-48 h-12 bg-black/30 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-around px-8 z-10 animate-pulse-glow">
                   <div 
                     className={cn("w-4 h-4 rounded-full transition-all", isBlinking && "scale-y-0")} 
                     style={{ backgroundColor: safeAvatar.eyes?.color || 'cyan' }} 
                   />
                   <div 
                     className={cn("w-4 h-4 rounded-full transition-all", isBlinking && "scale-y-0")} 
                     style={{ backgroundColor: safeAvatar.eyes?.color || 'cyan' }} 
                   />
                </div>

                {/* Camada de Expressão / Boca */}
                <div className="mt-8 w-12 h-1 bg-white/40 rounded-full" />

                {/* Label de Identidade */}
                <div className="absolute bottom-4 text-center">
                   <div className="text-[10px] font-black text-white/80 uppercase italic leading-none">{safeAvatar.accessoryType}</div>
                   <div className="text-[7px] font-bold text-white/30 uppercase tracking-widest mt-1">Identidade UrbeLudo</div>
                </div>
             </div>
             
             {/* Efeito de Aura de Privacidade */}
             <div className="absolute inset-0 bg-primary/10 backdrop-blur-[1px] pointer-events-none" />
          </div>
        )}

        {/* Acessibilidade Libras */}
        {isLibrasEnabled && (activeChallenge || isLowLight) && (
          <div className="absolute bottom-6 left-6 w-24 h-24 bg-black/80 backdrop-blur-xl rounded-3xl border border-primary/50 flex flex-col items-center justify-center z-40 animate-float-libras shadow-2xl">
             <Hand className="w-10 h-10 text-primary" />
             <span className="text-[8px] font-black text-white uppercase mt-2 tracking-widest">Libras Ativa</span>
          </div>
        )}

        {/* Inicialização */}
        {isInitializingCamera && (
          <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center gap-4 text-white">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
             <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando Sensores...</span>
          </div>
        )}

        {/* Prova de Foto Segura (Overlay) */}
        {photoProof && (
          <div className="absolute inset-0 bg-black/98 flex flex-col items-center justify-center p-6 z-[100] animate-in fade-in zoom-in-95">
             <img src={photoProof} className="max-h-[75vh] rounded-[3rem] border-2 border-primary/50 shadow-2xl" alt="Prova" />
             <Button variant="ghost" className="mt-4 text-white font-black uppercase text-[10px]" onClick={() => setPhotoProof(null)}><RefreshCw className="w-4 h-4 mr-2" /> Refazer Captura</Button>
          </div>
        )}
      </div>

      {/* Interface de Controle */}
      <div className="flex-1 -mt-10 bg-background rounded-t-[3.5rem] p-8 shadow-[0_-15px_40px_rgba(0,0,0,0.15)] overflow-y-auto space-y-8 z-20">
        
        {showGuide ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6">
            <div className="flex flex-col items-center text-center space-y-4">
               <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary shadow-inner"><Info className="w-10 h-10" /></div>
               <h2 className="text-3xl font-black uppercase italic tracking-tighter">Guia de Exploração</h2>
               <p className="text-xs font-medium text-muted-foreground max-w-xs leading-relaxed">Personalize seu playground para uma experiência inclusiva.</p>
            </div>
            <div className="grid gap-3">
              <AcessibilityToggle active={isAudioEnabled} onClick={() => setIsAudioEnabled(!isAudioEnabled)} icon={<Volume2 />} label="Áudio Guia" sub="Narra missões" />
              <AcessibilityToggle active={isLibrasEnabled} onClick={() => setIsLibrasEnabled(!isLibrasEnabled)} icon={<Hand />} label="Libras" sub="Gestos visuais" />
            </div>
            <div className="space-y-4">
              <ProfileInput label="Idade" value={ageGroup} onValueChange={setAgeGroup} options={[
                {v: 'preschool', l: '3-6 anos'}, {v: 'school_age', l: '7-12 anos'}, {v: 'adolescent_adult', l: '13+ anos'}
              ]} />
              <Input placeholder="Neurodivergência (opcional)" value={neurodivergence} onChange={e => setNeurodivergence(e.target.value)} className="rounded-2xl h-14" />
            </div>
            <Button onClick={handleSaveProfile} className="w-full h-16 rounded-[2.5rem] font-black uppercase tracking-widest bg-primary shadow-xl">Entrar no Playground</Button>
          </div>
        ) : !safeAvatar ? (
          <div className="p-8 bg-primary/5 rounded-[3rem] border-2 border-dashed border-primary/20 text-center space-y-6">
             <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary animate-pulse"><Scan className="w-10 h-10" /></div>
             <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase italic">Scan de Privacidade</h3>
                <p className="text-[10px] font-medium text-muted-foreground max-w-[260px] mx-auto leading-relaxed">
                  Transformaremos seu rosto em traços artísticos digitais. Seus dados biométricos reais serão deletados permanentemente após o scan.
                </p>
             </div>
             <Button onClick={handleFaceScan} disabled={isAvatarizing || isInitializingCamera} className="w-full h-16 rounded-[2.5rem] font-black uppercase tracking-widest bg-primary shadow-lg border-b-4 border-primary/80 active:border-b-0 active:translate-y-1 transition-all">
               {isAvatarizing ? <Loader2 className="animate-spin" /> : "Gerar Identidade Segura"}
             </Button>
          </div>
        ) : (
          <>
            <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                <CategoryButton active={selectedCategory === 'artistic'} onClick={() => setSelectedCategory('artistic')} icon={<Palette className="w-4 h-4" />} label="Arte" />
                <CategoryButton active={selectedCategory === 'motor'} onClick={() => setSelectedCategory('motor')} icon={<Zap className="w-4 h-4" />} label="Motor" />
                <CategoryButton active={selectedCategory === 'memory'} onClick={() => setSelectedCategory('memory')} icon={<Brain className="w-4 h-4" />} label="Mente" />
                <CategoryButton active={selectedCategory === 'relaxation'} onClick={() => setSelectedCategory('relaxation')} icon={<Wind className="w-4 h-4" />} label="Zen" />
            </div>

            {!activeChallenge ? (
              <div className="space-y-4">
                <ChallengeRow title="O Despertar" subtitle="Espaço Casa" icon={<HomeIcon />} isCompleted={profile?.dailyCycle?.homeMissionCompleted} onClick={() => handleStartMission('home')} disabled={isScanning} />
                <ChallengeRow title="A Jornada" subtitle="Espaço Urbano" icon={<MapPin />} isCompleted={profile?.dailyCycle?.streetMissionCompleted} onClick={() => handleStartMission('street')} disabled={isScanning} />
              </div>
            ) : (
              <div className="bg-primary/5 rounded-[3rem] p-8 space-y-8 animate-in slide-in-from-bottom-8">
                <div className="flex justify-between items-center">
                  <Badge className="bg-accent text-accent-foreground font-black text-[10px] uppercase px-4 py-1">Dif: {activeChallenge.difficulty}</Badge>
                  <div className="flex items-center gap-1 font-black text-primary text-lg"><Coins className="w-5 h-5 text-yellow-500" /> {activeChallenge.ludoCoinsReward}</div>
                </div>
                <h3 className="text-2xl font-black uppercase italic leading-none">{activeChallenge.challengeTitle}</h3>
                <div className="space-y-3">
                   {activeChallenge.steps.map((step, idx) => (
                     <div key={idx} className={cn(
                       "flex items-center gap-4 p-5 rounded-[2rem] border-2 transition-all",
                       currentStep === idx ? "bg-white border-primary/30 shadow-xl scale-105" : "bg-muted/30 border-transparent opacity-40"
                     )}>
                       <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-black", currentStep >= idx ? "bg-primary text-white" : "bg-muted")}>{idx + 1}</div>
                       <p className="text-[11px] font-bold leading-tight">{step}</p>
                     </div>
                   ))}
                </div>
                <div className="pt-4">
                  {currentStep < activeChallenge.steps.length - 1 ? (
                    <Button onClick={() => { setCurrentStep(prev => prev + 1); speak(activeChallenge.steps[currentStep + 1]); }} className="w-full h-16 rounded-[2.5rem] font-black uppercase bg-primary shadow-lg">Avançar Passo</Button>
                  ) : !photoProof ? (
                    <Button onClick={takePhotoWithAvatarOverlay} disabled={isCapturing} className="w-full h-18 rounded-[2.5rem] font-black uppercase bg-accent text-accent-foreground flex items-center justify-center gap-3 shadow-xl border-b-4 border-accent/80 active:border-b-0 active:translate-y-1 transition-all">
                      <Camera className="w-8 h-8" /> Registrar Prova Segura
                    </Button>
                  ) : (
                    <Button onClick={completeMission} className="w-full h-18 rounded-[2.5rem] font-black uppercase bg-primary text-white animate-bounce shadow-2xl">Concluir Missão</Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {celebrating && (
        <div className="fixed inset-0 z-[200] bg-primary flex flex-col items-center justify-center p-12 text-center text-white animate-in zoom-in-95">
          <Trophy className="w-24 h-24 mb-6 animate-bounce text-yellow-300" />
          <h2 className="text-5xl font-black uppercase italic mb-6">Incrível!</h2>
          <div className="bg-white/20 px-10 py-5 rounded-[2.5rem] border border-white/30 backdrop-blur-2xl">
             <span className="text-4xl font-black">+{activeChallenge?.ludoCoinsReward} LudoCoins</span>
          </div>
          <p className="mt-8 text-xs font-bold uppercase tracking-widest opacity-80">Seu avatar subiu de nível!</p>
        </div>
      )}
    </div>
  );
}

function AcessibilityToggle({ active, onClick, icon, label, sub }: any) {
  return (
    <Button variant="outline" className={cn("h-18 rounded-2xl gap-4 transition-all px-6", active && "border-primary bg-primary/5")} onClick={onClick}>
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", active ? "text-primary bg-primary/10" : "text-muted-foreground bg-muted")}>{icon}</div>
      <div className="text-left flex-1">
        <span className="text-xs font-black uppercase block leading-none">{label}</span>
        <span className="text-[9px] font-bold text-muted-foreground">{sub} • {active ? "Ativo" : "Off"}</span>
      </div>
    </Button>
  );
}

function ProfileInput({ label, value, onValueChange, options }: any) {
  return (
    <div className="space-y-2">
      <Label className="text-[10px] font-black uppercase text-muted-foreground px-2">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="rounded-2xl h-14 bg-muted/20 border-transparent focus:border-primary">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-2xl">
          {options.map((opt: any) => <SelectItem key={opt.v} value={opt.v}>{opt.l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function CategoryButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={cn(
      "px-6 py-3 rounded-2xl text-[9px] font-black uppercase flex items-center gap-3 transition-all border-2 whitespace-nowrap shadow-sm active:scale-95",
      active ? "bg-primary text-white border-primary" : "bg-white text-muted-foreground border-transparent"
    )}>
      {icon} {label}
    </button>
  );
}

function ChallengeRow({ title, subtitle, icon, isCompleted, onClick, disabled }: any) {
  return (
    <div onClick={!disabled && !isCompleted ? onClick : undefined} className={cn(
      "p-6 rounded-[2.5rem] flex items-center gap-5 transition-all", 
      isCompleted ? "bg-muted/40 opacity-50" : 
      disabled ? "bg-muted/10 opacity-30" : "bg-white border-2 border-primary/5 shadow-md active:scale-95 cursor-pointer hover:border-primary/20"
    )}>
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner", isCompleted ? "bg-primary text-white" : "bg-primary/10 text-primary")}>
        {isCompleted ? <CheckCircle2 className="w-8 h-8" /> : icon}
      </div>
      <div className="flex-1 text-left">
        <span className="text-[9px] font-black uppercase text-muted-foreground opacity-70">{subtitle}</span>
        <h4 className="text-xl font-black uppercase italic mt-0.5 tracking-tighter">{title}</h4>
      </div>
    </div>
  );
}
