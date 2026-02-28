
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Loader2, 
  CheckCircle2, 
  Home as HomeIcon, 
  MapPin, 
  Coins, 
  Trophy,
  Volume2,
  Hand,
  Zap,
  Brain,
  Wind,
  ChevronRight,
  User as UserIcon,
  ZapOff,
  Sparkles,
  Palette as PaletteIcon,
  ChevronLeft,
  Music,
  Camera,
  CameraOff,
  Info,
  ChevronDown
} from 'lucide-react';

import { proposeDynamicChallenges, type ProposeDynamicChallengesOutput } from '@/ai/flows/propose-dynamic-challenges';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useI18n } from '@/components/I18nProvider';
import { MissionCategory } from '@/lib/types';
import { STUDIO_CATALOG } from '@/lib/studio-catalog';
import { AvatarSelection } from '@/components/AvatarSelection';
import { AVATAR_CATALOG } from '@/lib/avatar-catalog';

export function PlaygroundInterface() {
  const { user } = useUser();
  const { toast } = useToast();
  const { t } = useI18n();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [showGuide, setShowGuide] = useState(true);
  const [isInitializingCamera, setIsInitializingCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState<ProposeDynamicChallengesOutput & { missionType?: 'home' | 'street' } | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MissionCategory>('Motor');
  
  const [cameraMode, setCameraMode] = useState<'user' | 'environment'>('user');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isLibrasEnabled, setIsLibrasEnabled] = useState(false);

  // Identity States
  const [explorerName, setExplorerName] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState(AVATAR_CATALOG[0].id);
  const [ageGroup, setAgeGroup] = useState('adolescent_adult');
  const [avatarColor, setAvatarColor] = useState('#9333ea');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // AI Pose Detector State
  const [detector, setDetector] = useState<any>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);

  // Standalone references
  const userProgressRef = useMemoFirebase(() => user ? { id: user.uid, path: `user_progress/${user.uid}` } : null, [user]);
  const { data: profile } = useDoc(userProgressRef);

  useEffect(() => {
    if (profile) {
      if (profile.displayName && !showTutorialCheck()) {
        setShowGuide(false);
      }
      setExplorerName(profile.displayName || '');
      setAgeGroup(profile.ageGroup || 'adolescent_adult');
      setAvatarColor(profile.dominantColor || '#9333ea');
      setSelectedAvatarId(profile.avatar?.avatarId || AVATAR_CATALOG[0].id);
    }
  }, [profile]);

  const showTutorialCheck = () => {
    return profile && !profile.hasSeenTutorial;
  };

  // Load TensorFlow Model Dynamically
  useEffect(() => {
    async function loadModel() {
      setIsModelLoading(true);
      try {
        const [tf, poseDetection] = await Promise.all([
          import('@tensorflow/tfjs-core'),
          import('@tensorflow-models/pose-detection'),
          import('@tensorflow/tfjs-backend-webgl')
        ]);
        
        await tf.ready();
        const model = poseDetection.SupportedModels.MoveNet;
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        };
        const newDetector = await poseDetection.createDetector(model, detectorConfig);
        setDetector(newDetector);
      } catch (e) {
        console.error("Erro ao carregar modelo de IA local:", e);
      } finally {
        setIsModelLoading(false);
      }
    }
    loadModel();
  }, []);

  const isCameraRequired = useMemo(() => {
    if (showGuide) return false;
    if (isScanning) return true;
    if (!activeChallenge) return false;
    return selectedCategory === 'Arte' || activeChallenge.missionType === 'street';
  }, [showGuide, isScanning, activeChallenge, selectedCategory]);

  useEffect(() => {
    let animationId: number;

    const processPose = async () => {
      if (!videoRef.current || !trailCanvasRef.current || !detector || !isCameraRequired) {
        animationId = requestAnimationFrame(processPose);
        return;
      }

      const video = videoRef.current;
      const trailCanvas = trailCanvasRef.current;
      const trailCtx = trailCanvas.getContext('2d');

      if (video.readyState === 4 && trailCtx) {
        if (trailCanvas.width !== video.videoWidth || trailCanvas.height !== video.videoHeight) {
          trailCanvas.width = video.videoWidth;
          trailCanvas.height = video.videoHeight;
        }

        try {
          const poses = await detector.estimatePoses(video);
          
          if (poses.length > 0) {
            const pose = poses[0];
            
            if (selectedCategory === 'Arte') {
              const wrists = pose.keypoints.filter((kp: any) => kp.name === 'left_wrist' || kp.name === 'right_wrist');
              
              wrists.forEach((wrist: any) => {
                if (wrist.score && wrist.score > 0.4) {
                  trailCtx.beginPath();
                  trailCtx.arc(wrist.x, wrist.y, 12, 0, Math.PI * 2);
                  trailCtx.fillStyle = avatarColor;
                  trailCtx.globalAlpha = 0.6;
                  trailCtx.fill();

                  if (isAudioEnabled && Math.random() > 0.9) {
                    playBeep(200 + (1 - wrist.y / trailCanvas.height) * 800);
                  }
                }
              });
            }
          }
        } catch (e) {
          console.error("Erro na estimativa de pose:", e);
        }
      }
      animationId = requestAnimationFrame(processPose);
    };

    processPose();
    return () => cancelAnimationFrame(animationId);
  }, [isCameraRequired, selectedCategory, avatarColor, isAudioEnabled, detector, activeChallenge]);

  const playBeep = (freq: number) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}
  };

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
          videoRef.current?.play().catch(e => console.error("Erro ao iniciar vídeo:", e));
          setTimeout(() => setIsInitializingCamera(false), 300);
        };
      }
    } catch (error) {
      setIsInitializingCamera(false);
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: 'Câmera indisponível no dispositivo.'
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (isCameraRequired) {
      startCamera(cameraMode);
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [cameraMode, isCameraRequired]);

  const speak = (text: string) => {
    if (isAudioEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSaveProfile = async () => {
    if (!termsAccepted) {
      toast({ variant: 'destructive', title: 'Atenção', description: t('auth.termsAccept') });
      return;
    }
    if (!explorerName.trim()) {
      toast({ variant: 'destructive', title: 'Atenção', description: 'Por favor, defina seu nome de explorador.' });
      return;
    }

    const isSapient = explorerName.toLowerCase() === 'sapient';

    if (userProgressRef) {
      const shopItems = ['foundation-sneakers', 'neon-sneakers', 'rhythm-visor', 'zen-rug', 'blue-precision-aura'];
      const studioItems = STUDIO_CATALOG.map(i => i.id);
      const allItems = [...shopItems, ...studioItems];

      updateDocumentNonBlocking(userProgressRef, { 
        displayName: explorerName,
        ageGroup, 
        dominantColor: avatarColor,
        hasSeenTutorial: false,
        ludoCoins: isSapient ? 999999 : (profile?.ludoCoins || 100),
        psychomotorLevel: isSapient ? 4 : (profile?.psychomotorLevel || 1),
        avatar: {
          ...profile?.avatar,
          avatarId: selectedAvatarId,
          unlockedItems: isSapient ? allItems : (profile?.avatar?.unlockedItems || ['foundation-sneakers'])
        }
      });
    }
    router.push('/studio');
  };

  const handleStartMission = async (type: 'home' | 'street') => {
    const energy = profile?.avatar?.energy ?? 100;
    if (energy < 10) {
      toast({ variant: 'destructive', title: t('playground.energyLow'), description: t('playground.energyLowDesc') });
      return;
    }

    setCameraMode(type === 'street' ? 'environment' : 'user');
    setIsScanning(true);
    
    if (trailCanvasRef.current) {
      const trailCtx = trailCanvasRef.current.getContext('2d');
      trailCtx?.clearRect(0, 0, trailCanvasRef.current.width, trailCanvasRef.current.height);
    }

    try {
      const challenge = await proposeDynamicChallenges({
        category: selectedCategory,
        psychomotorLevel: profile?.psychomotorLevel || 1,
      });
      
      await new Promise(r => setTimeout(r, 1200));

      setActiveChallenge({ ...challenge, missionType: type });
      setCurrentStep(0);
      speak(challenge.challengeTitle);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Falha no Motor', description: 'O sistema de desafios falhou ao carregar.' });
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
      photoUrl: '',
      likes: 0,
      isPublic: false
    };

    addDocumentNonBlocking({ path: 'activities' }, activityData);
    
    const updates = {
      ludoCoins: (profile?.ludoCoins || 0) + activeChallenge.ludoCoinsReward,
      totalChallengesCompleted: (profile?.totalChallengesCompleted || 0) + 1,
      avatar: { ...profile?.avatar, energy: Math.max(0, (profile?.avatar?.energy ?? 100) - 15) },
    };
    updateDocumentNonBlocking(userProgressRef, updates);
    setCelebrating(true);
    setTimeout(() => { 
      setCelebrating(false); 
      setActiveChallenge(null);
      setCameraMode('user');
    }, 3000);
  };

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      <AnimatePresence>
        {isCameraRequired && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: '55vh', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className="relative w-full bg-zinc-950 overflow-hidden shadow-inner z-10 border-b border-primary/20"
          >
            <video ref={videoRef} className="w-full h-full object-cover opacity-80" autoPlay muted playsInline />
            <canvas ref={trailCanvasRef} className="absolute inset-0 z-20 w-full h-full pointer-events-none" />
            
            {isScanning && (
              <div className="absolute inset-0 z-40 bg-primary/20 backdrop-blur-[2px] flex flex-col items-center justify-center">
                <div className="w-64 h-64 border-2 border-white/50 rounded-[3rem] relative overflow-hidden">
                  <motion.div animate={{ y: [0, 256, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-full h-1 bg-primary shadow-[0_0_15px_rgba(147,51,234,0.8)]" />
                </div>
                <span className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-white drop-shadow-md">Escaneando Pose...</span>
              </div>
            )}

            {isModelLoading && (
              <div className="absolute inset-0 z-[60] bg-black/80 flex flex-col items-center justify-center gap-4">
                 <Loader2 className="w-12 h-12 animate-spin text-primary" />
                 <span className="text-[10px] font-black uppercase text-white tracking-widest">Iniciando IA de Borda...</span>
              </div>
            )}

            {selectedCategory === 'Arte' && !isScanning && !isModelLoading && (
              <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 animate-pulse">
                <PaletteIcon className="w-4 h-4 text-accent" />
                <span className="text-[9px] font-black uppercase text-white tracking-widest">{t('playground.art')}</span>
              </div>
            )}

            {isInitializingCamera && (
              <div className="absolute inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center gap-4">
                 <div className="relative">
                    <Loader2 className="w-16 h-16 animate-spin text-primary" />
                    <Sparkles className="absolute top-0 right-0 w-6 h-6 text-accent animate-pulse" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">Lente de Visão Urbe...</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn(
        "flex-1 bg-background p-8 z-20 overflow-y-auto transition-all duration-500",
        isCameraRequired ? "-mt-16 rounded-t-[4rem] shadow-[0_-20px_40px_rgba(147,51,234,0.12)] border-t border-primary/10" : "pt-12"
      )}>
        {showGuide ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500 pb-12 max-w-md mx-auto">
            <div className="flex flex-col items-center text-center space-y-4">
               <div className="space-y-1">
                 <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{t('playground.configTitle')}</h2>
                 <p className="text-[11px] font-medium text-muted-foreground">{t('playground.configDesc')}</p>
               </div>
            </div>
            
            <div className="grid gap-6">
              <AvatarSelection initialAvatarId={selectedAvatarId} onSelect={setSelectedAvatarId} />

              <div className="space-y-2 px-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t('auth.nameLabel')}</Label>
                <Input 
                  value={explorerName} 
                  onChange={(e) => setExplorerName(e.target.value)} 
                  placeholder="Ex: Super Ludo" 
                  className="rounded-2xl h-14 bg-muted/20 border-transparent focus:border-primary font-bold text-sm"
                />
              </div>

              <div className="space-y-3 px-2">
                 <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t('playground.auraColor')}</Label>
                 <div className="flex justify-between items-center bg-muted/20 p-4 rounded-[2.5rem]">
                   {['#9333ea', '#3B82F6', '#f472b6', '#EF4444', '#10b981'].map(color => (
                     <button key={color} onClick={() => setAvatarColor(color)} className={cn("w-10 h-10 rounded-full border-4 transition-all", avatarColor === color ? "border-primary scale-110 shadow-lg" : "border-transparent opacity-40")} style={{ backgroundColor: color }} />
                   ))}
                 </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-muted-foreground px-2">{t('playground.accessibility')}</Label>
                <div className="grid grid-cols-2 gap-3">
                  <AcessibilityToggle active={isAudioEnabled} onClick={() => setIsAudioEnabled(!isAudioEnabled)} icon={<Music />} label="Sinfonia" />
                  <AcessibilityToggle active={isLibrasEnabled} onClick={() => setIsLibrasEnabled(!isLibrasEnabled)} icon={<Hand />} label="Libras" />
                </div>
              </div>

              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-muted-foreground px-2">{t('playground.ageGroup')}</Label>
                 <Select value={ageGroup} onValueChange={setAgeGroup}>
                   <SelectTrigger className="rounded-[2rem] h-14 bg-muted/30 border-none font-black px-6 shadow-sm">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="rounded-[2rem]">
                     <SelectItem value="preschool" className="font-black uppercase text-[10px]">Infantil</SelectItem>
                     <SelectItem value="school_age" className="font-black uppercase text-[10px]">Escolar</SelectItem>
                     <SelectItem value="adolescent_adult" className="font-black uppercase text-[10px]">Adulto</SelectItem>
                   </SelectContent>
                 </Select>
              </div>

              <div className="flex items-center space-x-3 px-2">
                <Checkbox 
                  id="terms-play" 
                  checked={termsAccepted} 
                  onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                  className="w-6 h-6 rounded-md border-2 border-primary"
                />
                <Dialog>
                  <DialogTrigger asChild>
                    <label htmlFor="terms-play" className="text-[10px] font-bold text-muted-foreground leading-tight hover:text-primary transition-colors cursor-pointer">
                      {t('auth.termsAccept')} <Info className="inline w-3 h-3 mb-0.5" />
                    </label>
                  </DialogTrigger>
                  <DialogContent className="rounded-[3rem] max-w-[90vw] overflow-y-auto max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-black uppercase italic">{t('auth.termsTitle')}</DialogTitle>
                    </DialogHeader>
                    <div className="text-[11px] font-medium leading-relaxed space-y-4 py-4 text-muted-foreground">
                      <p><strong>1. Natureza do Aplicativo:</strong> O UrbeLudo utiliza IA local para apoio à psicomotricidade.</p>
                      <p><strong>2. Segurança:</strong> Atividades devem ser supervisionadas por adultos.</p>
                      <p><strong>3. Privacidade:</strong> A visão computacional ocorre localmente em tempo real. Nenhuma imagem é enviada para servidores.</p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Button onClick={handleSaveProfile} disabled={!termsAccepted} className="w-full h-20 rounded-[3rem] font-black uppercase tracking-widest bg-primary shadow-2xl flex justify-between px-12 border-b-6 border-primary/80 active:border-b-0 active:translate-y-1 transition-all mt-4 disabled:opacity-50">
              <span>{t('playground.syncPlayground')}</span>
              <ChevronRight className="w-7 h-7" />
            </Button>
          </div>
        ) : (
          <div className="space-y-8 pb-12 max-w-lg mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar -mx-8 px-8 flex-1">
                  <CategoryButton active={selectedCategory === 'Arte'} onClick={() => setSelectedCategory('Arte')} icon={<PaletteIcon className="w-5 h-5" />} label={t('playground.art')} />
                  <CategoryButton active={selectedCategory === 'Motor'} onClick={() => setSelectedCategory('Motor')} icon={<Zap className="w-5 h-5" />} label={t('playground.motor')} />
                  <CategoryButton active={selectedCategory === 'Mente'} onClick={() => setSelectedCategory('Mente')} icon={<Brain className="w-5 h-5" />} label={t('playground.mind')} />
                  <CategoryButton active={selectedCategory === 'Zen'} onClick={() => setSelectedCategory('Zen')} icon={<Wind className="w-5 h-5" />} label={t('playground.zen')} />
              </div>
              <Button variant="ghost" size="icon" className="rounded-full shrink-0 ml-4" onClick={() => setShowGuide(true)}>
                <UserIcon className="w-6 h-6 text-primary" />
              </Button>
            </div>

            {!activeChallenge ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div className="text-center space-y-2 mb-8">
                   <h3 className="text-4xl font-black uppercase italic tracking-tighter">{t('playground.chooseMission')}</h3>
                   <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Estúdio de Movimento em Borda</p>
                </div>
                <ChallengeRow title={t('playground.homeMission')} subtitle="Treino Doméstico" icon={<HomeIcon />} isCompleted={profile?.dailyCycle?.homeMissionCompleted} onClick={() => handleStartMission('home')} disabled={isScanning} />
                <ChallengeRow title={t('playground.streetMission')} subtitle="Exploração de Pose" icon={<MapPin />} isCompleted={profile?.dailyCycle?.streetMissionCompleted} onClick={() => handleStartMission('street')} disabled={isScanning} />
              </div>
            ) : (
              <div className="bg-primary/5 rounded-[4rem] p-8 space-y-8 border border-primary/10 shadow-inner animate-in fade-in slide-in-from-right-5 duration-500">
                <div className="flex justify-between items-center">
                  <Badge className="bg-accent text-white font-black text-[10px] uppercase px-5 py-2 rounded-full shadow-lg">{t('playground.level')}: {activeChallenge.difficulty}</Badge>
                  <div className="flex items-center gap-2 font-black text-primary text-2xl"><Coins className="w-7 h-7 text-yellow-500" /> {activeChallenge.ludoCoinsReward}</div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{activeChallenge.challengeTitle}</h3>
                  <p className="text-[12px] font-medium text-muted-foreground leading-relaxed">{activeChallenge.challengeDescription}</p>
                </div>

                <div className="space-y-4">
                   {activeChallenge.steps.map((step, idx) => (
                     <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: currentStep >= idx ? 1 : 0.2, x: 0 }} className={cn("flex items-center gap-5 p-6 rounded-[3rem] border-2 transition-all", currentStep === idx ? "bg-white border-primary/30 shadow-2xl scale-105" : "bg-muted/30 border-transparent")}>
                       <div className={cn("w-12 h-12 rounded-[1.2rem] flex items-center justify-center text-base font-black transition-all", currentStep >= idx ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                         {currentStep > idx ? <CheckCircle2 className="w-6 h-6" /> : idx + 1}
                       </div>
                       <p className="text-[12px] font-bold leading-tight flex-1">{step}</p>
                     </motion.div>
                   ))}
                </div>

                <div className="pt-6 flex flex-col gap-4">
                  {currentStep < activeChallenge.steps.length - 1 ? (
                    <Button onClick={() => { setCurrentStep(prev => prev + 1); speak(activeChallenge.steps[currentStep + 1]); }} className="w-full h-18 rounded-[2.5rem] font-black uppercase bg-primary shadow-xl border-b-6 border-primary/80 active:border-b-0 active:translate-y-1 transition-all">{t('playground.nextStep')}</Button>
                  ) : (
                    <Button onClick={completeMission} className="w-full h-24 rounded-[3.5rem] font-black uppercase bg-accent shadow-2xl border-b-8 border-accent/50 text-2xl active:border-b-0 active:translate-y-1 transition-all text-white">{t('playground.finishMission')}</Button>
                  )}
                  <Button variant="ghost" className="rounded-full text-[11px] font-black uppercase text-muted-foreground mt-2" onClick={() => setActiveChallenge(null)}>
                    Abandonar Missão
                  </Button>
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
              <Trophy className="w-40 h-40 mb-10 text-accent drop-shadow-[0_0_50px_rgba(244,114,182,0.8)]" />
            </motion.div>
            <h2 className="text-7xl font-black uppercase italic mb-8 tracking-tighter">Vitória!</h2>
            <div className="bg-white/10 px-16 py-8 rounded-[4rem] border border-white/20 shadow-2xl">
               <span className="text-6xl font-black flex items-center gap-5">
                 <Coins className="w-12 h-12 text-yellow-400" />
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
    <button className={cn("h-20 rounded-[2rem] transition-all px-4 border-2 flex flex-col items-center justify-center gap-2 text-center w-full", active ? "border-primary bg-primary/5 shadow-inner" : "bg-muted/40 border-transparent")} onClick={onClick}>
      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center transition-all", active ? "text-primary bg-primary/10" : "text-muted-foreground bg-muted")}>
        {React.cloneElement(icon, { className: "w-4 h-4" })}
      </div>
      <span className="text-[9px] font-black uppercase leading-none tracking-widest">{label}</span>
    </button>
  );
}

function CategoryButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={cn("px-10 py-5 rounded-[2.5rem] text-[12px] font-black uppercase flex items-center gap-4 transition-all border-2 shrink-0", active ? "bg-primary text-white border-primary shadow-2xl scale-110 z-10" : "bg-white text-muted-foreground border-transparent hover:bg-muted/20")}>
      {icon} {label}
    </button>
  );
}

function ChallengeRow({ title, subtitle, icon, isCompleted, onClick, disabled }: any) {
  return (
    <button onClick={!disabled && !isCompleted ? onClick : undefined} className={cn("p-10 rounded-[4rem] flex items-center gap-8 transition-all w-full text-left group", isCompleted ? "bg-muted/30 opacity-40" : disabled ? "bg-muted/10 opacity-30 cursor-not-allowed" : "bg-white border-2 border-primary/5 shadow-xl active:scale-95 cursor-pointer hover:border-primary/20 hover:shadow-2xl")}>
      <div className={cn("w-20 h-20 rounded-[2.5rem] flex items-center justify-center transition-transform group-hover:rotate-6", isCompleted ? "bg-primary text-white" : "bg-primary/10 text-primary")}>
        {isCompleted ? <CheckCircle2 className="w-12 h-12" /> : React.cloneElement(icon as React.ReactElement, { className: "w-10 h-10" })}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-black uppercase text-muted-foreground opacity-60 tracking-widest">{subtitle}</span>
        <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-none mt-1 truncate">{title}</h4>
      </div>
      <ChevronRight className="w-8 h-8 text-primary/40 group-hover:translate-x-3 transition-transform" />
    </button>
  );
}

