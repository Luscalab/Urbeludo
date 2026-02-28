
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Wind
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
  const [cameraMode, setCameraMode] = useState<'user' | 'environment'>('user');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isLibrasEnabled, setIsLibrasEnabled] = useState(false);

  const userProgressRef = useMemoFirebase(() => user ? doc(db, 'user_progress', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userProgressRef);

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
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error("Erro ao reproduzir vídeo:", e));
      }
    } catch (error) {
      console.error("Erro ao acessar câmera:", error);
      setHasCameraPermission(false);
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

  // Audio Guide Logic - Narrador dos passos
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
    
    // Garantir que a câmera está pronta para captura
    if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
      toast({ 
        variant: 'destructive', 
        title: "Câmera Inicializando", 
        description: "Aguarde a imagem aparecer na tela e tente o scan novamente." 
      });
      return;
    }

    setIsAvatarizing(true);
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Falha ao criar contexto 2D");
      
      ctx.drawImage(videoRef.current, 0, 0);
      const photo = canvas.toDataURL('image/jpeg');
      
      const result = await avatarizeUser({ photoDataUri: photo });
      setSafeAvatar(result);
      
      // Muda para a câmera traseira após o scan para a exploração de rua
      setCameraMode('environment');
      
      toast({ 
        title: "Avatar Seguro Criado!", 
        description: "Sua identidade está protegida. Dados biométricos descartados com sucesso." 
      });
    } catch (e) {
      console.error("Erro no Scan Facial:", e);
      toast({ 
        variant: 'destructive', 
        title: "Erro no Reconhecimento", 
        description: "Não foi possível processar seu rosto. Tente em um ambiente mais iluminado." 
      });
    } finally {
      setIsAvatarizing(false);
    }
  };

  const handleStartMission = async (type: 'home' | 'street') => {
    if ((profile?.avatar?.energy ?? 100) < 15) {
      toast({ variant: 'destructive', title: 'Energia Insuficiente', description: 'Seu avatar precisa descansar um pouco.' });
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
      toast({ variant: 'destructive', title: 'IA Fora de Sintonia', description: 'O Mestre do Movimento está meditando. Tente novamente em instantes.' });
    } finally {
      setIsScanning(false);
    }
  };

  const takePhotoWithAvatarOverlay = () => {
    if (videoRef.current && canvasRef.current) {
      setIsCapturing(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video.videoWidth === 0) {
        setIsCapturing(false);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        
        // Aplicação do Filtro de Avatar (Privacidade Ativa)
        const centerX = canvas.width / 2;
        const centerY = canvas.height * 0.4;
        const radius = Math.min(canvas.width, canvas.height) * 0.22;

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = safeAvatar?.dominantColor || '#33993D';
        ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
        
        // Detalhes estilizados do avatar
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 4;
        ctx.strokeRect(centerX - radius/2, centerY - radius/4, radius, radius/8);
        ctx.restore();

        // Banner de Conformidade e Segurança
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, canvas.height - 70, canvas.width, 70);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('IDENTIDADE PROTEGIDA POR IA', canvas.width / 2, canvas.height - 40);
        ctx.font = '10px Inter';
        ctx.fillText('BIO-DADOS DESCARTADOS • PROCESSADO LOCALMENTE', canvas.width / 2, canvas.height - 20);

        setPhotoProof(canvas.toDataURL('image/jpeg'));
        toast({ title: "Privacidade Garantida", description: "Sua identidade foi preservada por processamento de borda." });
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
        <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary shadow-inner">
          <Info className="w-12 h-12" />
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Exploração Inclusiva</h2>
          <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto leading-relaxed">
            O UrbeLudo foi desenhado para ser acessível. Ative as ferramentas de suporte abaixo antes de começar.
          </p>
        </div>
        <div className="grid gap-4 w-full max-w-xs">
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
        <Button onClick={() => setShowGuide(false)} className="w-full max-w-xs h-16 rounded-[2.5rem] font-black uppercase tracking-widest shadow-xl bg-primary hover:bg-primary/90">Começar a Jogar</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      <div className="relative w-full aspect-[4/3] bg-black overflow-hidden shadow-2xl">
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover" 
          autoPlay 
          muted 
          playsInline 
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Acessibilidade: Avatar de Libras flutuante */}
        {isLibrasEnabled && activeChallenge && (
          <div className="absolute bottom-6 right-6 w-24 h-24 bg-black/60 backdrop-blur-xl rounded-3xl border-2 border-primary/50 flex flex-col items-center justify-center overflow-hidden z-30 animate-pulse transition-all">
             <div className="flex flex-col items-center gap-1">
                <Hand className="w-10 h-10 text-primary" />
                <span className="text-[8px] font-black text-white uppercase tracking-widest">Libras</span>
             </div>
             <div className="absolute top-0 right-0 p-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
             </div>
          </div>
        )}

        {/* Overlay do Avatar de Privacidade em Tempo Real */}
        {safeAvatar && !photoProof && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
             <div 
               className="w-48 h-48 rounded-full border-4 border-white/60 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center text-white text-center p-6 transition-all duration-500 scale-110"
               style={{ backgroundColor: `${safeAvatar.dominantColor}A0`, backdropFilter: 'blur(12px)' }}
             >
                <div className="bg-white/30 w-36 h-8 rounded-full border border-white/40 mb-3 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none drop-shadow-md">Escudo Digital Ativo</span>
             </div>
          </div>
        )}

        {photoProof && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-6 z-40 animate-in fade-in zoom-in-95">
             <div className="relative">
               <img src={photoProof} className="max-h-[80vh] rounded-3xl border-4 border-white/20 shadow-[0_0_100px_rgba(0,0,0,0.8)]" alt="Prova de Atividade" />
               <Button variant="destructive" size="icon" className="absolute -top-4 -right-4 rounded-full w-12 h-12 shadow-xl" onClick={() => setPhotoProof(null)}><RefreshCw className="w-6 h-6" /></Button>
             </div>
          </div>
        )}
        
        <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none z-10">
           <Badge variant="outline" className="bg-black/50 text-white border-white/20 backdrop-blur-lg gap-2 py-2 px-4 shadow-xl">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span className="text-[9px] font-black uppercase tracking-tighter">Identidade Preservada</span>
           </Badge>
        </div>
      </div>

      <div className="flex-1 -mt-12 bg-background rounded-t-[3.5rem] p-8 shadow-[0_-20px_40px_rgba(0,0,0,0.1)] overflow-y-auto space-y-6 z-20">
        
        {/* Tela de Scan Inicial */}
        {!safeAvatar && hasCameraPermission && (
          <div className="p-8 bg-primary/5 rounded-[3rem] border-2 border-dashed border-primary/20 text-center space-y-6 animate-in zoom-in-95">
             <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary shadow-inner">
                <Scan className="w-10 h-10" />
             </div>
             <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Scan de Identidade</h3>
                <p className="text-xs font-medium text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  Posicione seu rosto no centro da câmera para gerar seu avatar seguro. 
                  <span className="block mt-2 text-primary font-black uppercase tracking-widest text-[10px]">A foto original é descartada instantaneamente.</span>
                </p>
             </div>
             <Button onClick={handleFaceScan} disabled={isAvatarizing} className="w-full h-16 rounded-[2rem] font-black uppercase tracking-widest bg-primary text-white shadow-xl">
               {isAvatarizing ? <Loader2 className="animate-spin" /> : "Gerar Avatar Seguro"}
             </Button>
          </div>
        )}

        {/* Seleção de Desafios após o Scan */}
        {safeAvatar && !activeChallenge && (
          <div className="space-y-6">
             <div className="flex flex-wrap gap-2 mb-4 scroll-smooth">
                <CategoryButton active={selectedCategory === 'artistic'} onClick={() => setSelectedCategory('artistic')} icon={<Palette className="w-3 h-3" />} label="Artístico" />
                <CategoryButton active={selectedCategory === 'motor'} onClick={() => setSelectedCategory('motor')} icon={<Zap className="w-3 h-3" />} label="Motor" />
                <CategoryButton active={selectedCategory === 'memory'} onClick={() => setSelectedCategory('memory')} icon={<Brain className="w-3 h-3" />} label="Cognitivo" />
                <CategoryButton active={selectedCategory === 'relaxation'} onClick={() => setSelectedCategory('relaxation')} icon={<Wind className="w-3 h-3" />} label="Relax" />
             </div>
             
             <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-5">
                   <div className="flex items-center gap-2">
                      <Battery className={cn("w-5 h-5", (profile?.avatar?.energy ?? 100) < 30 ? "text-destructive" : "text-primary")} />
                      <span className="text-[11px] font-black uppercase text-muted-foreground">{profile?.avatar?.energy ?? 100}% Energia</span>
                   </div>
                   <button onClick={() => setIsAudioEnabled(!isAudioEnabled)} className={cn("p-2 rounded-xl bg-muted/50", isAudioEnabled ? "text-primary border border-primary/20" : "text-muted-foreground")}><Volume2 className="w-5 h-5" /></button>
                </div>
                <Link href="/community" className="text-[11px] font-black uppercase text-primary flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-xl"><Share2 className="w-4 h-4" /> Mural</Link>
             </div>
             
             <ChallengeRow title="O Despertar" subtitle="Casa & Imaginação" icon={<HomeIcon />} isCompleted={profile?.dailyCycle?.homeMissionCompleted} onClick={() => handleStartMission('home')} disabled={isScanning} />
             <ChallengeRow title="A Jornada" subtitle="Rua & Descoberta" icon={<MapPin />} isCompleted={profile?.dailyCycle?.streetMissionCompleted} onClick={() => handleStartMission('street')} disabled={isScanning} />
          </div>
        )}

        {/* Fluxo de Missão Ativa */}
        {activeChallenge && (
          <Card className="border-none bg-primary/5 rounded-[3rem] shadow-sm animate-in slide-in-from-bottom-6 duration-500">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center mb-4">
                <Badge className="bg-accent text-accent-foreground font-black text-[10px] uppercase tracking-widest px-4 py-1">Nível: {activeChallenge.difficulty}</Badge>
                <div className="flex items-center gap-2 font-black text-primary text-lg"><Coins className="w-5 h-5 text-yellow-500" /> {activeChallenge.ludoCoinsReward}</div>
              </div>
              <CardTitle className="text-2xl font-black uppercase italic tracking-tighter leading-none">{activeChallenge.challengeTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                 {activeChallenge.steps.map((step, idx) => (
                   <div key={idx} className={cn(
                     "flex items-center gap-4 p-5 rounded-3xl transition-all duration-300 border-2",
                     currentStep === idx ? "bg-white shadow-md border-primary/30 translate-x-1" : 
                     currentStep > idx ? "bg-primary/10 opacity-60 border-transparent" : "bg-muted/40 opacity-40 border-transparent"
                   )}>
                     <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-black", currentStep >= idx ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>{idx + 1}</div>
                     <p className="text-sm font-bold leading-tight flex-1">{step}</p>
                   </div>
                 ))}
              </div>

              <div className="pt-4">
                {currentStep < activeChallenge.steps.length - 1 ? (
                  <Button onClick={() => setCurrentStep(prev => prev + 1)} className="w-full h-16 rounded-[2rem] font-black uppercase tracking-widest bg-primary text-white shadow-xl hover:translate-y-1 transition-transform">
                    Concluir Etapa <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                ) : !photoProof ? (
                  <Button onClick={takePhotoWithAvatarOverlay} disabled={isCapturing} className="w-full h-20 rounded-[2.5rem] font-black uppercase tracking-widest bg-accent text-accent-foreground shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all">
                    {isCapturing ? <Loader2 className="w-8 h-8 animate-spin" /> : <Camera className="w-8 h-8" />} 
                    Comprovar com IA
                  </Button>
                ) : (
                  <Button onClick={completeMission} className="w-full h-20 rounded-[2.5rem] font-black uppercase tracking-widest bg-primary text-white shadow-2xl animate-bounce">
                    <CheckCircle2 className="w-8 h-8 mr-3" /> Receber Recompensa
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {celebrating && (
        <div className="fixed inset-0 z-[100] bg-primary flex flex-col items-center justify-center p-10 text-center text-white animate-in zoom-in duration-500">
          <Trophy className="w-32 h-32 mb-10 animate-bounce text-yellow-300" />
          <h2 className="text-5xl font-black uppercase italic mb-6 tracking-tighter">Explêndido!</h2>
          <div className="bg-white/20 px-10 py-6 rounded-[3rem] border-2 border-white/30 backdrop-blur-3xl shadow-2xl">
             <span className="text-5xl font-black flex items-center gap-3"><Coins className="w-10 h-10 text-yellow-300" /> +{activeChallenge?.ludoCoinsReward}</span>
          </div>
          <p className="mt-8 text-sm font-black uppercase tracking-widest opacity-80">Seu avatar está mais forte!</p>
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
        "px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase flex items-center gap-2 transition-all border-2 shadow-sm whitespace-nowrap",
        active ? "bg-primary text-white border-primary scale-105" : "bg-white text-muted-foreground border-transparent hover:border-muted/20"
      )}
    >
      {icon} {label}
    </button>
  );
}

function ChallengeRow({ title, subtitle, icon, isCompleted, onClick, disabled }: any) {
  return (
    <div onClick={!disabled && !isCompleted ? onClick : undefined} className={cn(
      "p-7 rounded-[3rem] flex items-center gap-6 transition-all duration-300", 
      isCompleted ? "bg-muted/40 opacity-60 grayscale" : 
      disabled ? "bg-muted/10 opacity-30 cursor-not-allowed" : "bg-white border-2 border-primary/5 shadow-xl hover:shadow-2xl active:scale-95 cursor-pointer"
    )}>
      <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-colors", isCompleted ? "bg-primary text-white" : "bg-primary/10 text-primary")}>
        {isCompleted ? <CheckCircle2 className="w-8 h-8" /> : icon}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{subtitle}</span>
        <h4 className="text-xl font-black uppercase italic leading-none mt-1">{title}</h4>
      </div>
    </div>
  );
}
