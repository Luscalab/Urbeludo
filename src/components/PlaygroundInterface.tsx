'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Loader2, 
  CheckCircle2, 
  Home as HomeIcon, 
  MapPin, 
  Coins, 
  Trophy,
  Hand,
  Zap,
  Brain,
  Wind,
  ChevronRight,
  User as UserIcon,
  Sparkles,
  Palette as PaletteIcon,
  Music,
  Camera,
  Scan
} from 'lucide-react';

import { proposeDynamicChallenges, type ProposeDynamicChallengesOutput } from '@/ai/flows/propose-dynamic-challenges';
import { identifyUrbanElements } from '@/ai/flows/identify-urban-elements-flow';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useI18n } from '@/components/I18nProvider';
import { MissionCategory } from '@/lib/types';
import { AvatarSelection } from '@/components/AvatarSelection';
import { FALLBACK_AVATAR } from '@/lib/avatar-catalog';

export function PlaygroundInterface({ debugMode = false }: { debugMode?: boolean }) {
  const { user } = useUser();
  const { toast } = useToast();
  const { t } = useI18n();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [showGuide, setShowGuide] = useState(true);
  const [isInitializingCamera, setIsInitializingCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState<ProposeDynamicChallengesOutput & { missionType?: 'home' | 'street', urbanElements?: any[] } | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MissionCategory>('Motor');
  
  const [cameraMode, setCameraMode] = useState<'user' | 'environment'>('user');
  const [explorerName, setExplorerName] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState(FALLBACK_AVATAR.id);
  const [ageGroup, setAgeGroup] = useState('adolescent_adult');
  const [avatarColor, setAvatarColor] = useState('#9333ea');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [detector, setDetector] = useState<any>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);

  const userProgressRef = useMemoFirebase(() => user ? { id: user.uid, path: `user_progress/${user.uid}` } : null, [user]);
  const { data: profile } = useDoc(userProgressRef);

  useEffect(() => {
    if (profile) {
      if (profile.displayName && profile.hasSeenTutorial) {
        setShowGuide(false);
      }
      setExplorerName(profile.displayName || '');
      setAgeGroup(profile.ageGroup || 'adolescent_adult');
      setAvatarColor(profile.dominantColor || '#9333ea');
      setSelectedAvatarId(profile.avatar?.avatarId || FALLBACK_AVATAR.id);
    }
  }, [profile]);

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
        const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
        const newDetector = await poseDetection.createDetector(model, detectorConfig);
        setDetector(newDetector);
      } catch (e) {
        console.error("TF Model Load Error:", e);
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
                  trailCtx.arc(wrist.x, wrist.y, 14, 0, Math.PI * 2);
                  trailCtx.fillStyle = avatarColor;
                  trailCtx.globalAlpha = 0.5;
                  trailCtx.fill();
                }
              });
            }
          }
        } catch (e) {}
      }
      animationId = requestAnimationFrame(processPose);
    };
    processPose();
    return () => cancelAnimationFrame(animationId);
  }, [isCameraRequired, selectedCategory, avatarColor, detector]);

  const startCamera = async (mode: 'user' | 'environment') => {
    setIsInitializingCamera(true);
    try {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setTimeout(() => setIsInitializingCamera(false), 500);
        };
      }
    } catch (error) {
      setIsInitializingCamera(false);
      toast({ variant: 'destructive', title: 'Câmera Offline', description: 'Permita o acesso para jogar.' });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (isCameraRequired) startCamera(cameraMode);
    else stopCamera();
    return () => stopCamera();
  }, [cameraMode, isCameraRequired]);

  const handleSaveProfile = async () => {
    if (!termsAccepted || !explorerName.trim()) return;
    const isSapient = explorerName.toLowerCase() === 'sapient';
    if (userProgressRef) {
      updateDocumentNonBlocking(userProgressRef, { 
        displayName: explorerName,
        ageGroup, 
        dominantColor: avatarColor,
        hasSeenTutorial: false,
        ludoCoins: isSapient ? 99999 : (profile?.ludoCoins || 150),
        avatar: { ...profile?.avatar, avatarId: selectedAvatarId }
      });
    }
    router.push('/studio');
  };

  const handleStartMission = async (type: 'home' | 'street') => {
    if ((profile?.avatar?.energy ?? 100) < 10) {
      toast({ variant: 'destructive', title: 'Energia Baixa', description: 'Descanse no estúdio para recarregar.' });
      return;
    }

    setCameraMode(type === 'street' ? 'environment' : 'user');
    setIsScanning(true);
    
    try {
      let urbanContext: any = null;
      if (type === 'street' && videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
        const dataUri = canvas.toDataURL('image/jpeg');
        urbanContext = await identifyUrbanElements({ webcamFeedDataUri: dataUri });
      }

      const challenge = await proposeDynamicChallenges({
        category: selectedCategory,
        psychomotorLevel: profile?.psychomotorLevel || 1,
      });
      
      await new Promise(r => setTimeout(r, 1500));
      setActiveChallenge({ ...challenge, missionType: type, urbanElements: urbanContext?.elements });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro na IA', description: 'Usando motor de backup.' });
    } finally {
      setIsScanning(false);
    }
  };

  const completeMission = () => {
    if (!activeChallenge || !userProgressRef) return;
    const updates = {
      ludoCoins: (profile?.ludoCoins || 0) + activeChallenge.ludoCoinsReward,
      totalChallengesCompleted: (profile?.totalChallengesCompleted || 0) + 1,
      avatar: { ...profile?.avatar, energy: Math.max(0, (profile?.avatar?.energy ?? 100) - 20) },
    };
    updateDocumentNonBlocking(userProgressRef, updates);
    setCelebrating(true);
    setTimeout(() => { setCelebrating(false); setActiveChallenge(null); }, 3000);
  };

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      <AnimatePresence>
        {isCameraRequired && (
          <motion.div 
            initial={{ height: 0 }} animate={{ height: '55vh' }} exit={{ height: 0 }}
            className="relative w-full bg-black overflow-hidden z-10"
          >
            <video ref={videoRef} className="w-full h-full object-cover opacity-90" autoPlay muted playsInline />
            <canvas ref={trailCanvasRef} className="absolute inset-0 z-20 w-full h-full pointer-events-none" />
            
            {isScanning && (
              <div className="absolute inset-0 z-40 bg-primary/20 backdrop-blur-md flex flex-col items-center justify-center">
                <div className="relative">
                  <Scan className="w-40 h-40 text-white animate-pulse" />
                  <motion.div 
                    animate={{ top: ['0%', '100%', '0%'] }} 
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_20px_white]"
                  />
                </div>
                <span className="mt-8 text-[12px] font-black uppercase tracking-[0.4em] text-white">Analisando Arquitetura...</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn(
        "flex-1 bg-background p-8 z-20 overflow-y-auto transition-all",
        isCameraRequired ? "-mt-12 rounded-t-[4rem] shadow-2xl" : "pt-12"
      )}>
        {showGuide ? (
          <div className="space-y-8 max-w-md mx-auto">
            <div className="text-center space-y-2">
               <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Perfil de Herói</h2>
               <p className="text-[11px] font-bold text-muted-foreground uppercase">Configure seu Sensor de Borda</p>
            </div>
            
            <div className="grid gap-6">
              <AvatarSelection initialAvatarId={selectedAvatarId} onSelect={setSelectedAvatarId} />

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Codinome de Explorador</Label>
                <Input value={explorerName} onChange={(e) => setExplorerName(e.target.value)} className="rounded-2xl h-14 bg-muted/20 border-none" />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Cor da Aura</Label>
                <div className="flex justify-between bg-muted/20 p-4 rounded-3xl">
                  {['#9333ea', '#3B82F6', '#EF4444', '#10b981', '#f59e0b'].map(c => (
                    <button key={c} onClick={() => setAvatarColor(c)} className={cn("w-10 h-10 rounded-full border-4", avatarColor === c ? "border-white scale-110 shadow-lg" : "border-transparent opacity-50")} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(v) => setTermsAccepted(!!v)} className="w-6 h-6 border-2 border-primary" />
                <label htmlFor="terms" className="text-[10px] font-bold text-muted-foreground">Aceito os termos de segurança UrbeLudo.</label>
              </div>
            </div>

            <Button onClick={handleSaveProfile} disabled={!termsAccepted} className="w-full h-20 rounded-[3rem] font-black uppercase tracking-widest bg-primary shadow-2xl flex justify-between px-12 border-b-6 border-primary/80 active:border-b-0 active:translate-y-1">
              <span>Sincronizar e Jogar</span>
              <ChevronRight className="w-7 h-7" />
            </Button>
          </div>
        ) : (
          <div className="space-y-8 max-w-lg mx-auto">
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                <CategoryButton active={selectedCategory === 'Arte'} onClick={() => setSelectedCategory('Arte')} icon={<PaletteIcon />} label="Arte" />
                <CategoryButton active={selectedCategory === 'Motor'} onClick={() => setSelectedCategory('Motor')} icon={<Zap />} label="Motor" />
                <CategoryButton active={selectedCategory === 'Mente'} onClick={() => setSelectedCategory('Mente')} icon={<Brain />} label="Mente" />
                <CategoryButton active={selectedCategory === 'Zen'} onClick={() => setSelectedCategory('Zen')} icon={<Wind />} label="Zen" />
            </div>

            {!activeChallenge ? (
              <div className="space-y-6">
                <div className="text-center">
                   <h3 className="text-3xl font-black uppercase italic tracking-tighter">Escolha sua Arena</h3>
                </div>
                <ChallengeRow title="Missão em Casa" subtitle="Treino de Borda" icon={<HomeIcon />} onClick={() => handleStartMission('home')} />
                <ChallengeRow title="Missão de Rua" subtitle="Desafio Contextual" icon={<MapPin />} onClick={() => handleStartMission('street')} />
              </div>
            ) : (
              <div className="bg-primary/5 rounded-[4rem] p-8 space-y-8 border border-primary/10 shadow-inner">
                <div className="flex justify-between items-center">
                  <Badge className="bg-accent text-white font-black text-[10px] uppercase px-5 py-2 rounded-full">{activeChallenge.difficulty}</Badge>
                  <div className="flex items-center gap-2 font-black text-primary text-2xl"><Coins className="w-7 h-7 text-yellow-500" /> {activeChallenge.ludoCoinsReward}</div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{activeChallenge.challengeTitle}</h3>
                  {activeChallenge.urbanElements && activeChallenge.urbanElements.length > 0 && (
                    <div className="bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20 text-[9px] font-black text-blue-600 uppercase">
                      Detectado: {activeChallenge.urbanElements[0].description} ({activeChallenge.urbanElements[0].location})
                    </div>
                  )}
                  <p className="text-[12px] font-medium text-muted-foreground">{activeChallenge.challengeDescription}</p>
                </div>

                <div className="space-y-4">
                   {activeChallenge.steps.map((step, idx) => (
                     <div key={idx} className={cn("flex items-center gap-5 p-6 rounded-[3rem] border-2", currentStep === idx ? "bg-white border-primary shadow-xl" : "bg-muted/30 border-transparent opacity-50")}>
                       <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-black", currentStep >= idx ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                         {currentStep > idx ? <CheckCircle2 className="w-6 h-6" /> : idx + 1}
                       </div>
                       <p className="text-[11px] font-bold leading-tight">{step}</p>
                     </div>
                   ))}
                </div>

                <div className="pt-6">
                  {currentStep < activeChallenge.steps.length - 1 ? (
                    <Button onClick={() => setCurrentStep(prev => prev + 1)} className="w-full h-18 rounded-[2.5rem] font-black uppercase bg-primary shadow-xl border-b-6 border-primary/80">Próximo Passo</Button>
                  ) : (
                    <Button onClick={completeMission} className="w-full h-24 rounded-[3.5rem] font-black uppercase bg-accent shadow-2xl text-2xl text-white">Finalizar Desafio!</Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {celebrating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[250] bg-primary/95 backdrop-blur-3xl flex flex-col items-center justify-center text-white">
            <Trophy className="w-40 h-40 mb-10 text-accent animate-bounce" />
            <h2 className="text-6xl font-black uppercase italic mb-8">Missão Cumprida!</h2>
            <div className="bg-white/10 px-16 py-8 rounded-[4rem] text-5xl font-black flex items-center gap-5">
              <Coins className="w-12 h-12 text-yellow-400" /> +{activeChallenge?.ludoCoinsReward} LC
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={cn("px-10 py-5 rounded-[2.5rem] text-[12px] font-black uppercase flex items-center gap-4 transition-all border-2 shrink-0", active ? "bg-primary text-white border-primary shadow-xl scale-105" : "bg-white text-muted-foreground border-transparent hover:bg-muted/20")}>
      {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })} {label}
    </button>
  );
}

function ChallengeRow({ title, subtitle, icon, onClick }: any) {
  return (
    <button onClick={onClick} className="p-10 rounded-[4rem] flex items-center gap-8 bg-white border-2 border-primary/5 shadow-xl active:scale-95 transition-all w-full text-left">
      <div className="w-20 h-20 rounded-[2.5rem] bg-primary/10 flex items-center justify-center text-primary">
        {React.cloneElement(icon as React.ReactElement, { className: "w-10 h-10" })}
      </div>
      <div className="flex-1">
        <span className="text-[10px] font-black uppercase text-muted-foreground opacity-60 tracking-widest">{subtitle}</span>
        <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-none mt-1">{title}</h4>
      </div>
      <ChevronRight className="w-8 h-8 text-primary/40" />
    </button>
  );
}
