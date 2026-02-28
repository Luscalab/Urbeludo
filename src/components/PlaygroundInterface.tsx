
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Palette,
  Zap,
  Brain,
  Wind,
  ChevronRight,
  User as UserIcon,
  ZapOff,
  Sparkles
} from 'lucide-react';
import { proposeDynamicChallenges, type ProposeDynamicChallengesOutput } from '@/ai/flows/propose-dynamic-challenges';
import { identifyUrbanElements } from '@/ai/flows/identify-urban-elements-flow';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useI18n } from '@/components/I18nProvider';

type CategoryType = 'artistic' | 'motor' | 'memory' | 'relaxation';

// --- ENGINE DE RENDERIZAÇÃO PROCEDURAL 2026 (CANVAS 2D) ---
const ProceduralLudoAvatar = ({ motionData, color, isBreathing }: { motionData: { x: number, y: number }, color: string, isBreathing: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, 400, 400);
      ctx.save();
      ctx.translate(200 + motionData.x * 20, 200 + motionData.y * 10);

      const breatheScale = isBreathing ? 1 + Math.sin(Date.now() / 500) * 0.05 : 1;
      ctx.scale(breatheScale, 1 / breatheScale);

      ctx.beginPath();
      ctx.ellipse(0, 160, 60, 20, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fill();

      for (let i = 0; i < 5; i++) {
        const time = Date.now() / 1000 + i;
        const px = Math.cos(time) * 100;
        const py = Math.sin(time) * 100;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.moveTo(-40, 140);
      ctx.bezierCurveTo(-60, 80, -30, 40, 0, 40);
      ctx.bezierCurveTo(30, 40, 60, 80, 40, 140);
      ctx.closePath();
      ctx.fillStyle = '#111';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      const faceGrad = ctx.createRadialGradient(0, -20, 10, 0, -20, 60);
      faceGrad.addColorStop(0, color);
      faceGrad.addColorStop(1, '#000');
      
      ctx.beginPath();
      ctx.moveTo(-35, -20);
      ctx.bezierCurveTo(-35, -70, 35, -70, 35, -20);
      ctx.bezierCurveTo(35, 30, -35, 30, -35, -20);
      ctx.fillStyle = faceGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.roundRect(-25, -25, 50, 15, 8);
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(-10 + motionData.x * 5, -18 + motionData.y * 2, 1.5, 0, Math.PI * 2);
      ctx.arc(10 + motionData.x * 5, -18 + motionData.y * 2, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      frameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frameId);
  }, [motionData, color, isBreathing]);

  return <canvas ref={canvasRef} width={400} height={400} className="w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]" />;
};

export function PlaygroundInterface() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [motionData, setMotionData] = useState({ x: 0, y: 0 });
  const [showGuide, setShowGuide] = useState(true);
  const [isInitializingCamera, setIsInitializingCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
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
  const [avatarColor, setAvatarColor] = useState('#9333ea');

  const userProgressRef = useMemoFirebase(() => user ? doc(db, 'user_progress', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userProgressRef);

  useEffect(() => {
    if (profile) {
      setAgeGroup(profile.ageGroup || 'adolescent_adult');
      setAvatarColor(profile.dominantColor || '#9333ea');
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
            
            if (brightness > 140) { 
              const x = (i / 4) % 40;
              const y = Math.floor((i / 4) / 40);
              totalX += x;
              totalY += y;
              weight++;
            }
          }

          if (weight > 3) {
            const avgX = (totalX / weight) / 40 - 0.5;
            const avgY = (totalY / weight) / 30 - 0.5;
            lastX = lastX * 0.85 + avgX * 0.15;
            lastY = lastY * 0.85 + avgY * 0.15;
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
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.error("Video play error:", e));
          setTimeout(() => setIsInitializingCamera(false), 300);
        };
      }
    } catch (error) {
      setIsInitializingCamera(false);
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: 'Câmera inacessível.'
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
      updateDocumentNonBlocking(userProgressRef, { ageGroup, dominantColor: avatarColor });
    }
    setShowGuide(false);
  };

  const handleStartMission = async (type: 'home' | 'street') => {
    const energy = profile?.avatar?.energy ?? 100;
    if (energy < 10) {
      toast({ variant: 'destructive', title: t('playground.energyLow'), description: t('playground.energyLowDesc') });
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
      <div className="relative w-full aspect-[3/4] bg-zinc-950 overflow-hidden shadow-inner z-0 border-b border-primary/10">
        <video ref={videoRef} className="w-full h-full object-cover opacity-60 grayscale-[0.3]" autoPlay muted playsInline />
        
        {!showGuide && cameraMode === 'user' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none p-4">
            <ProceduralLudoAvatar 
              motionData={motionData} 
              color={avatarColor}
              isBreathing={selectedCategory === 'relaxation' || activeChallenge?.challengeType === 'breathing'}
            />
          </div>
        )}

        <AnimatePresence>
          {isLowLight && !showGuide && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-8 left-1/2 -translate-x-1/2 z-[60] bg-destructive/90 text-white px-6 py-2 rounded-full flex items-center gap-2 shadow-lg border border-white/20">
              <ZapOff className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">{t('playground.lowLight')}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {isInitializingCamera && (
          <div className="absolute inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center gap-4">
             <div className="relative">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
                <Sparkles className="absolute top-0 right-0 w-6 h-6 text-accent animate-pulse" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">Syncing Ludo Studio...</span>
          </div>
        )}
      </div>

      <div className="flex-1 -mt-20 bg-background rounded-t-[4rem] p-8 shadow-[0_-20px_40px_rgba(147,51,234,0.1)] z-20 border-t border-primary/10 overflow-y-auto">
        {showGuide ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="flex flex-col items-center text-center space-y-4">
               <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary border border-primary/20">
                 <UserIcon className="w-10 h-10" />
               </div>
               <div className="space-y-1">
                 <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{t('playground.configTitle')}</h2>
                 <p className="text-[10px] font-medium text-muted-foreground max-w-[240px] mx-auto">{t('playground.configDesc')}</p>
               </div>
            </div>
            
            <div className="grid gap-6">
              <div className="space-y-3 px-2">
                 <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t('playground.auraColor')}</Label>
                 <div className="flex justify-between items-center bg-muted/20 p-3 rounded-[2rem]">
                   {['#9333ea', '#3B82F6', '#f472b6', '#EF4444', '#10b981'].map(color => (
                     <button key={color} onClick={() => setAvatarColor(color)} className={cn("w-10 h-10 rounded-full border-4 transition-all", avatarColor === color ? "border-primary scale-110 shadow-lg" : "border-transparent opacity-40")} style={{ backgroundColor: color }} />
                   ))}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <AcessibilityToggle active={isAudioEnabled} onClick={() => setIsAudioEnabled(!isAudioEnabled)} icon={<Volume2 />} label="Audio" />
                <AcessibilityToggle active={isLibrasEnabled} onClick={() => setIsLibrasEnabled(!isLibrasEnabled)} icon={<Hand />} label="Libras" />
              </div>

              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-muted-foreground px-2">{t('playground.ageGroup')}</Label>
                 <Select value={ageGroup} onValueChange={setAgeGroup}>
                   <SelectTrigger className="rounded-[2rem] h-16 bg-muted/30 border-2 border-primary/5 font-black px-6 shadow-sm">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="rounded-[2rem]">
                     <SelectItem value="preschool" className="font-black uppercase text-[10px]">Infantil</SelectItem>
                     <SelectItem value="school_age" className="font-black uppercase text-[10px]">Escolar</SelectItem>
                     <SelectItem value="adolescent_adult" className="font-black uppercase text-[10px]">Adulto</SelectItem>
                   </SelectContent>
                 </Select>
              </div>
            </div>

            <Button onClick={handleSaveProfile} className="w-full h-18 rounded-[2.5rem] font-black uppercase tracking-widest bg-primary shadow-xl flex justify-between px-10 border-b-4 border-primary/80 active:border-b-0 active:translate-y-1 transition-all">
              <span>{t('playground.syncPlayground')}</span>
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar -mx-8 px-8">
                <CategoryButton active={selectedCategory === 'artistic'} onClick={() => setSelectedCategory('artistic')} icon={<Palette className="w-4 h-4" />} label={t('playground.art')} />
                <CategoryButton active={selectedCategory === 'motor'} onClick={() => setSelectedCategory('motor')} icon={<Zap className="w-4 h-4" />} label={t('playground.motor')} />
                <CategoryButton active={selectedCategory === 'memory'} onClick={() => setSelectedCategory('memory')} icon={<Brain className="w-4 h-4" />} label={t('playground.mind')} />
                <CategoryButton active={selectedCategory === 'relaxation'} onClick={() => setSelectedCategory('relaxation')} icon={<Wind className="w-4 h-4" />} label={t('playground.zen')} />
            </div>

            {!activeChallenge ? (
              <div className="space-y-4">
                <ChallengeRow title={t('playground.homeMission')} subtitle={t('playground.edgeAnalysis')} icon={<HomeIcon />} isCompleted={profile?.dailyCycle?.homeMissionCompleted} onClick={() => handleStartMission('home')} disabled={isScanning} />
                <ChallengeRow title={t('playground.streetMission')} subtitle={t('playground.fieldChallenge')} icon={<MapPin />} isCompleted={profile?.dailyCycle?.streetMissionCompleted} onClick={() => handleStartMission('street')} disabled={isScanning} />
              </div>
            ) : (
              <div className="bg-primary/5 rounded-[3.5rem] p-8 space-y-8 border border-primary/10 shadow-inner animate-in fade-in slide-in-from-right-5 duration-500">
                <div className="flex justify-between items-center">
                  <Badge className="bg-accent text-white font-black text-[9px] uppercase px-4 py-1.5 rounded-full shadow-lg">{t('playground.level')}: {activeChallenge.difficulty}</Badge>
                  <div className="flex items-center gap-2 font-black text-primary text-xl"><Coins className="w-6 h-6 text-yellow-500" /> {activeChallenge.ludoCoinsReward}</div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{activeChallenge.challengeTitle}</h3>
                  <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">{activeChallenge.challengeDescription}</p>
                </div>

                <div className="space-y-4">
                   {activeChallenge.steps.map((step, idx) => (
                     <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: currentStep >= idx ? 1 : 0.2, x: 0 }} className={cn("flex items-center gap-4 p-5 rounded-[2.5rem] border-2 transition-all", currentStep === idx ? "bg-white border-primary/30 shadow-xl" : "bg-muted/30 border-transparent")}>
                       <div className={cn("w-10 h-10 rounded-[1rem] flex items-center justify-center text-sm font-black transition-all", currentStep >= idx ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                         {currentStep > idx ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                       </div>
                       <p className="text-[11px] font-bold leading-tight flex-1">{step}</p>
                     </motion.div>
                   ))}
                </div>

                <div className="pt-4">
                  {currentStep < activeChallenge.steps.length - 1 ? (
                    <Button onClick={() => { setCurrentStep(prev => prev + 1); speak(activeChallenge.steps[currentStep + 1]); }} className="w-full h-16 rounded-[2.5rem] font-black uppercase bg-primary shadow-xl">{t('playground.nextStep')}</Button>
                  ) : (
                    <Button onClick={completeMission} className="w-full h-20 rounded-[3rem] font-black uppercase bg-accent shadow-xl border-b-6 border-accent/50 text-xl active:border-b-0 active:translate-y-1 transition-all">{t('playground.finishMission')}</Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {celebrating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[250] bg-primary/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center text-white">
            <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
              <Trophy className="w-32 h-32 mb-8 text-accent drop-shadow-[0_0_40px_rgba(244,114,182,0.6)]" />
            </motion.div>
            <h2 className="text-6xl font-black uppercase italic mb-6 tracking-tighter">Level Up!</h2>
            <div className="bg-white/10 px-12 py-6 rounded-[3rem] border border-white/20 shadow-2xl">
               <span className="text-5xl font-black flex items-center gap-4">
                 <Coins className="w-10 h-10 text-yellow-400" />
                 +{activeChallenge?.ludoCoinsReward} LC
               </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AcessibilityToggle({ active, onClick, icon, label }: any) {
  return (
    <button className={cn("h-20 rounded-[2.5rem] transition-all px-4 border-2 flex flex-col items-center justify-center gap-1 text-center w-full", active ? "border-primary bg-primary/5 shadow-inner" : "bg-muted/40 border-transparent")} onClick={onClick}>
      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center transition-all", active ? "text-primary bg-primary/10" : "text-muted-foreground bg-muted")}>
        {React.cloneElement(icon, { className: "w-4 h-4" })}
      </div>
      <span className="text-[9px] font-black uppercase leading-none tracking-widest">{label}</span>
    </button>
  );
}

function CategoryButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={cn("px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase flex items-center gap-3 transition-all border-2 shrink-0", active ? "bg-primary text-white border-primary shadow-lg scale-105" : "bg-white text-muted-foreground border-transparent hover:bg-muted/20")}>
      {icon} {label}
    </button>
  );
}

function ChallengeRow({ title, subtitle, icon, isCompleted, onClick, disabled }: any) {
  return (
    <button onClick={!disabled && !isCompleted ? onClick : undefined} className={cn("p-8 rounded-[3rem] flex items-center gap-6 transition-all w-full text-left group", isCompleted ? "bg-muted/30 opacity-40" : disabled ? "bg-muted/10 opacity-30 cursor-not-allowed" : "bg-white border-2 border-primary/5 shadow-lg active:scale-95 cursor-pointer hover:border-primary/20")}>
      <div className={cn("w-16 h-16 rounded-[2rem] flex items-center justify-center transition-transform group-hover:rotate-6", isCompleted ? "bg-primary text-white" : "bg-primary/10 text-primary")}>
        {isCompleted ? <CheckCircle2 className="w-10 h-10" /> : React.cloneElement(icon as React.ReactElement, { className: "w-8 h-8" })}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[9px] font-black uppercase text-muted-foreground opacity-60 tracking-widest">{subtitle}</span>
        <h4 className="text-xl font-black uppercase italic tracking-tighter leading-none mt-1 truncate">{title}</h4>
      </div>
      <ChevronRight className="w-6 h-6 text-primary/40 group-hover:translate-x-2 transition-transform" />
    </button>
  );
}

function Palette(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.6 0-.4-.2-.8-.5-1.1-.3-.3-.5-.7-.5-1.1 0-.9.7-1.6 1.6-1.6H17c2.8 0 5-2.2 5-5 0-4.4-4.5-8-10-8Z"/></svg>; }
