'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Volume2,
  Hand,
  Info,
  Palette,
  Zap,
  Brain,
  Wind,
  Sun,
  Sparkles,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import { proposeDynamicChallenges, type ProposeDynamicChallengesOutput } from '@/ai/flows/propose-dynamic-challenges';
import { identifyUrbanElements } from '@/ai/flows/identify-urban-elements-flow';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type CategoryType = 'artistic' | 'motor' | 'memory' | 'relaxation';

// --- COMPONENTE DE AVATAR 2D MODERNO (REATIVO) ---
const Modern2DAvatar = ({ motionData, color, isBreathing }: { motionData: { x: number, y: number }, color: string, isBreathing: boolean }) => {
  return (
    <motion.div 
      className="relative w-48 h-48 flex items-center justify-center"
      animate={{ 
        x: motionData.x * 50, 
        y: motionData.y * 30,
        rotate: motionData.x * 10
      }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      {/* Aura de Dados */}
      <motion.div 
        className="absolute inset-0 rounded-full border-2 border-dashed opacity-20"
        style={{ borderColor: color }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Corpo do Avatar (SVG Procedural) */}
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
        <defs>
          <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'black', stopOpacity: 1 }} />
          </radialGradient>
        </defs>
        
        {/* Tronco */}
        <path d="M20,90 Q50,70 80,90 L80,100 L20,100 Z" fill="rgba(0,0,0,0.8)" />
        
        {/* Cabeça */}
        <motion.g
          animate={isBreathing ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <circle cx="50" cy="45" r="30" fill="url(#grad1)" />
          <path d="M25,40 Q50,20 75,40" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
          
          {/* Visor */}
          <rect x="30" y="38" width="40" height="8" rx="4" fill="rgba(255,255,255,0.1)" stroke={color} strokeWidth="1" />
          <motion.rect 
            x="35" y="41" width="30" height="2" rx="1" 
            fill={color}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          
          {/* Olhos (Pupilas Reativas) */}
          <circle cx={42 + motionData.x * 5} cy={42 + motionData.y * 3} r="1.5" fill="white" />
          <circle cx={58 + motionData.x * 5} cy={42 + motionData.y * 3} r="1.5" fill="white" />
        </motion.g>
      </svg>
      
      {/* Efeito de Brilho */}
      <div 
        className="absolute inset-4 rounded-full blur-2xl opacity-20 pointer-events-none"
        style={{ backgroundColor: color }}
      />
    </motion.div>
  );
};

export function PlaygroundInterface() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [motionData, setMotionData] = useState({ x: 0, y: 0 });
  const [showGuide, setShowGuide] = useState(true);
  const [isInitializingCamera, setIsInitializingCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<ProposeDynamicChallengesOutput & { missionType?: 'home' | 'street' } | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [photoProof, setPhotoProof] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('motor');
  
  const [cameraMode, setCameraMode] = useState<'user' | 'environment'>('user');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isLibrasEnabled, setIsLibrasEnabled] = useState(false);
  const [isLowLight, setIsLowLight] = useState(false);

  const [ageGroup, setAgeGroup] = useState('adolescent_adult');
  const [neurodivergence, setNeurodivergence] = useState('');
  const [avatarColor, setAvatarColor] = useState('#33993D');

  const userProgressRef = useMemoFirebase(() => user ? doc(db, 'user_progress', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userProgressRef);

  useEffect(() => {
    if (profile) {
      setAgeGroup(profile.ageGroup || 'adolescent_adult');
      setNeurodivergence(profile.neurodivergence || '');
      setAvatarColor(profile.dominantColor || '#33993D');
    }
  }, [profile]);

  useEffect(() => {
    let animationId: number;
    let lastX = 0;
    let lastY = 0;

    const analyzeMotion = () => {
      if (videoRef.current && videoRef.current.readyState === 4 && cameraMode === 'user') {
        const video = videoRef.current;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 40; 
        tempCanvas.height = 30;
        const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
        
        if (ctx) {
          ctx.drawImage(video, 0, 0, 40, 30);
          const pixels = ctx.getImageData(0, 0, 40, 30).data;
          
          let totalX = 0;
          let totalY = 0;
          let weight = 0;

          for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i+1];
            const b = pixels[i+2];
            const brightness = (r + g + b) / 3;
            
            if (brightness > 120) { 
              const x = (i / 4) % 40;
              const y = Math.floor((i / 4) / 40);
              totalX += x;
              totalY += y;
              weight++;
            }
          }

          if (weight > 5) {
            const avgX = (totalX / weight) / 40 - 0.5;
            const avgY = (totalY / weight) / 30 - 0.5;
            lastX = lastX * 0.8 + avgX * 0.2;
            lastY = lastY * 0.8 + avgY * 0.2;
            setMotionData({ x: -lastX, y: lastY });
            setIsLowLight(false);
          } else {
            setIsLowLight(true);
          }
        }
      }
      animationId = requestAnimationFrame(analyzeMotion);
    };

    if (!showGuide) {
      analyzeMotion();
    }

    return () => cancelAnimationFrame(animationId);
  }, [showGuide, cameraMode]);

  const startCamera = async (mode: 'user' | 'environment') => {
    setIsInitializingCamera(true);
    try {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: mode } 
      });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.error("Video play error:", e));
          setTimeout(() => setIsInitializingCamera(false), 300);
        };
      }
    } catch (error) {
      console.error("Camera access error:", error);
      setHasCameraPermission(false);
      setIsInitializingCamera(false);
      toast({
        variant: 'destructive',
        title: 'Câmera Não Acessível',
        description: 'Verifique as permissões do navegador.'
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

  const handleSaveProfile = async () => {
    if (userProgressRef) {
      updateDocumentNonBlocking(userProgressRef, { ageGroup, neurodivergence, dominantColor: avatarColor });
    }
    setShowGuide(false);
  };

  const handleStartMission = async (type: 'home' | 'street') => {
    const energy = profile?.avatar?.energy ?? 100;
    if (energy < 10) {
      toast({ variant: 'destructive', title: 'Energia Baixa', description: 'O avatar precisa de recarga.' });
      return;
    }

    setCameraMode(type === 'street' ? 'environment' : 'user');
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
      speak(challenge.challengeTitle);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro de IA', description: 'Reconectando com o estúdio...' });
    } finally {
      setIsScanning(false);
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
      isPublic: false
    };

    addDocumentNonBlocking(collection(db, 'user_progress', user.uid, 'challenge_activities'), activityData);
    const updates = {
      ludoCoins: (profile?.ludoCoins || 0) + activeChallenge.ludoCoinsReward,
      totalChallengesCompleted: (profile?.totalChallengesCompleted || 0) + 1,
      avatar: { ...profile?.avatar, energy: Math.max(0, (profile?.avatar?.energy ?? 100) - 15) },
    };
    setDocumentNonBlocking(userProgressRef, updates, { merge: true });
    setCelebrating(true);
    setTimeout(() => { 
      setCelebrating(false); 
      setActiveChallenge(null);
      setCameraMode('user');
    }, 3000);
  };

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Câmera e Avatar Layer */}
      <div className="relative w-full aspect-[3/4] bg-slate-900 overflow-hidden shadow-inner z-0">
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover opacity-50 grayscale-[0.2]" 
          autoPlay 
          muted 
          playsInline 
        />
        
        {/* Avatar 2D Moderno (Renderizado via Código) */}
        {!showGuide && cameraMode === 'user' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none p-4">
            <Modern2DAvatar 
              motionData={motionData} 
              color={avatarColor}
              isBreathing={selectedCategory === 'relaxation' || activeChallenge?.challengeType === 'breathing'}
            />
          </div>
        )}

        {/* Low Light Alert */}
        <AnimatePresence>
          {isLowLight && !showGuide && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 z-[60] bg-destructive/90 text-white px-6 py-2 rounded-full flex items-center gap-2 shadow-lg border border-white/20"
            >
              <Sun className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Sensor: Luz Baixa</span>
            </motion.div>
          )}
        </AnimatePresence>

        {isInitializingCamera && (
          <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center gap-4">
             <div className="relative">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
                <Sparkles className="absolute top-0 right-0 w-6 h-6 text-accent animate-pulse" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">Syncing...</span>
          </div>
        )}
      </div>

      {/* Interface Inferior (Painel de Controle) */}
      <div className="flex-1 -mt-16 bg-background rounded-t-[4rem] p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] z-20 border-t border-primary/10 overflow-y-auto">
        
        {showGuide ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col items-center text-center space-y-4">
               <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                 <UserIcon className="w-10 h-10" />
               </div>
               <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Configuração de Borda</h2>
               <p className="text-[11px] font-medium text-muted-foreground max-w-[280px] leading-relaxed">Personalize seu avatar e sensores de acessibilidade sem processamento pesado.</p>
            </div>
            
            <div className="grid gap-4">
              <div className="space-y-3 px-4">
                 <Label className="text-[11px] font-black uppercase text-muted-foreground tracking-widest">Cor da Identidade</Label>
                 <div className="flex gap-3">
                   {['#33993D', '#3B82F6', '#EAB308', '#EF4444', '#A855F7'].map(color => (
                     <button 
                       key={color} 
                       onClick={() => setAvatarColor(color)}
                       className={cn(
                         "w-10 h-10 rounded-full border-4 transition-all",
                         avatarColor === color ? "border-primary scale-110" : "border-transparent opacity-50"
                       )}
                       style={{ backgroundColor: color }}
                     />
                   ))}
                 </div>
              </div>

              <AcessibilityToggle active={isAudioEnabled} onClick={() => { setIsAudioEnabled(!isAudioEnabled); speak("Áudio guia ativado"); }} icon={<Volume2 />} label="Áudio Guia" sub="Instruções Narradas" />
              <AcessibilityToggle active={isLibrasEnabled} onClick={() => setIsLibrasEnabled(!isLibrasEnabled)} icon={<Hand />} label="Puppet Libras" sub="Tradução Visual" />
            </div>

            <div className="space-y-6 pt-4">
              <div className="space-y-3">
                 <Label className="text-[11px] font-black uppercase text-muted-foreground px-4 tracking-widest">Nível de Exploração</Label>
                 <Select value={ageGroup} onValueChange={setAgeGroup}>
                   <SelectTrigger className="rounded-[2rem] h-16 bg-muted/30 border-transparent font-black px-6 shadow-sm">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="rounded-3xl border-none shadow-2xl">
                     <SelectItem value="preschool" className="rounded-2xl font-black uppercase text-[10px] py-3">Iniciante (Infantil)</SelectItem>
                     <SelectItem value="school_age" className="rounded-2xl font-black uppercase text-[10px] py-3">Explorador (Escolar)</SelectItem>
                     <SelectItem value="adolescent_adult" className="rounded-2xl font-black uppercase text-[10px] py-3">Mestre (Adulto)</SelectItem>
                   </SelectContent>
                 </Select>
              </div>
            </div>

            <Button onClick={handleSaveProfile} className="w-full h-18 rounded-[3rem] font-black uppercase tracking-widest bg-primary shadow-2xl flex justify-between px-10 border-b-4 border-primary/60 hover:translate-y-1 transition-all">
              <span>Carregar Playground</span>
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar -mx-8 px-8">
                <CategoryButton active={selectedCategory === 'artistic'} onClick={() => setSelectedCategory('artistic')} icon={<Palette className="w-4 h-4" />} label="Arte" />
                <CategoryButton active={selectedCategory === 'motor'} onClick={() => setSelectedCategory('motor')} icon={<Zap className="w-4 h-4" />} label="Motor" />
                <CategoryButton active={selectedCategory === 'memory'} onClick={() => setSelectedCategory('memory')} icon={<Brain className="w-4 h-4" />} label="Mente" />
                <CategoryButton active={selectedCategory === 'relaxation'} onClick={() => setSelectedCategory('relaxation')} icon={<Wind className="w-4 h-4" />} label="Zen" />
            </div>

            {!activeChallenge ? (
              <div className="space-y-4">
                <ChallengeRow title="Missão Casa" subtitle="Exploração de Borda" icon={<HomeIcon />} isCompleted={profile?.dailyCycle?.homeMissionCompleted} onClick={() => handleStartMission('home')} disabled={isScanning} />
                <ChallengeRow title="Missão Rua" subtitle="Desafio de Campo" icon={<MapPin />} isCompleted={profile?.dailyCycle?.streetMissionCompleted} onClick={() => handleStartMission('street')} disabled={isScanning} />
              </div>
            ) : (
              <div className="bg-primary/5 rounded-[4rem] p-8 space-y-8 border border-primary/10 shadow-inner animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="flex justify-between items-center px-2">
                  <Badge className="bg-accent text-accent-foreground font-black text-[10px] uppercase px-4 py-1.5 rounded-full">Nível: {activeChallenge.difficulty}</Badge>
                  <div className="flex items-center gap-2 font-black text-primary text-2xl"><Coins className="w-6 h-6" /> {activeChallenge.ludoCoinsReward}</div>
                </div>
                
                <div className="space-y-2 px-2">
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{activeChallenge.challengeTitle}</h3>
                  <p className="text-[11px] font-medium text-muted-foreground">{activeChallenge.challengeDescription}</p>
                </div>

                <div className="space-y-4">
                   {activeChallenge.steps.map((step, idx) => (
                     <motion.div 
                       key={idx} 
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ 
                         opacity: currentStep >= idx ? 1 : 0.3,
                         x: 0,
                         scale: currentStep === idx ? 1.02 : 1
                       }}
                       className={cn(
                         "flex items-center gap-5 p-6 rounded-[2.5rem] border-2 transition-all",
                         currentStep === idx ? "bg-white border-primary/30 shadow-xl" : "bg-muted/20 border-transparent"
                       )}
                     >
                       <div className={cn(
                         "w-12 h-12 rounded-[1.25rem] flex items-center justify-center text-sm font-black transition-all", 
                         currentStep >= idx ? "bg-primary text-white shadow-lg" : "bg-muted text-muted-foreground"
                       )}>
                         {currentStep > idx ? <CheckCircle2 className="w-6 h-6" /> : idx + 1}
                       </div>
                       <p className="text-[11px] font-bold leading-relaxed flex-1">{step}</p>
                     </motion.div>
                   ))}
                </div>

                <div className="pt-4">
                  {currentStep < activeChallenge.steps.length - 1 ? (
                    <Button onClick={() => { setCurrentStep(prev => prev + 1); speak(activeChallenge.steps[currentStep + 1]); }} className="w-full h-18 rounded-[2.5rem] font-black uppercase bg-primary shadow-2xl text-lg">Próximo Passo</Button>
                  ) : (
                    <Button onClick={completeMission} className="w-full h-20 rounded-[3rem] font-black uppercase bg-primary shadow-2xl border-b-8 border-primary/60 text-xl active:border-b-0 active:translate-y-2 transition-all">Concluir Missão</Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tela de Celebração */}
      <AnimatePresence>
        {celebrating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] bg-primary flex flex-col items-center justify-center p-12 text-center text-white"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Trophy className="w-32 h-32 mb-8 text-yellow-300 drop-shadow-[0_0_30px_rgba(253,224,71,0.5)]" />
            </motion.div>
            <h2 className="text-6xl font-black uppercase italic mb-6 tracking-tighter">Level Up!</h2>
            <div className="bg-white/10 backdrop-blur-3xl px-12 py-6 rounded-[4rem] border border-white/20 shadow-2xl">
               <span className="text-5xl font-black flex items-center gap-4">
                 <Coins className="w-10 h-10 text-yellow-300" />
                 +{activeChallenge?.ludoCoinsReward} LC
               </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AcessibilityToggle({ active, onClick, icon, label, sub }: any) {
  return (
    <button 
      className={cn(
        "h-20 rounded-[2.5rem] gap-5 transition-all px-8 border-2 flex items-center text-left w-full", 
        active ? "border-primary bg-primary/5 shadow-inner" : "bg-muted/30 border-transparent shadow-sm"
      )} 
      onClick={onClick}
    >
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all", 
        active ? "text-primary bg-primary/10" : "text-muted-foreground bg-muted"
      )}>
        {React.cloneElement(icon, { className: "w-6 h-6" })}
      </div>
      <div className="flex-1">
        <span className="text-[11px] font-black uppercase block leading-none tracking-widest">{label}</span>
        <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-70">{sub}</span>
      </div>
    </button>
  );
}

function CategoryButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={cn(
      "px-8 py-5 rounded-[2rem] text-[11px] font-black uppercase flex items-center gap-3 transition-all border-2",
      active ? "bg-primary text-white border-primary shadow-2xl scale-105" : "bg-white text-muted-foreground border-transparent hover:bg-muted/10"
    )}>
      {icon} {label}
    </button>
  );
}

function ChallengeRow({ title, subtitle, icon, isCompleted, onClick, disabled }: any) {
  return (
    <button 
      onClick={!disabled && !isCompleted ? onClick : undefined} 
      className={cn(
        "p-8 rounded-[3.5rem] flex items-center gap-6 transition-all w-full text-left group", 
        isCompleted ? "bg-muted/20 opacity-40 grayscale" : 
        disabled ? "bg-muted/10 opacity-30 cursor-not-allowed" : "bg-white border-2 border-primary/5 shadow-xl active:scale-95 cursor-pointer hover:border-primary/20"
      )}
    >
      <div className={cn(
        "w-20 h-20 rounded-[2.5rem] flex items-center justify-center transition-transform group-hover:rotate-12", 
        isCompleted ? "bg-primary text-white" : "bg-primary/10 text-primary"
      )}>
        {isCompleted ? <CheckCircle2 className="w-10 h-10" /> : React.cloneElement(icon as React.ReactElement, { className: "w-10 h-10" })}
      </div>
      <div className="flex-1">
        <span className="text-[10px] font-black uppercase text-muted-foreground opacity-60 tracking-[0.15em]">{subtitle}</span>
        <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-none mt-1">{title}</h4>
      </div>
      <ChevronRight className="w-6 h-6 text-primary/40 group-hover:translate-x-2 transition-transform" />
    </button>
  );
}
