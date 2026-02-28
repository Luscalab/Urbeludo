
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Scan,
  Volume2,
  Hand,
  Info,
  Palette,
  Zap,
  Brain,
  Wind,
  Sun,
  Sparkles,
  ChevronRight
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

// Helper to ensure colors are valid HEX
function ensureHexColor(color: string | undefined, fallback: string): string {
  if (!color) return fallback;
  if (color.startsWith('#') && (color.length === 4 || color.length === 7)) return color;
  
  // Mapping common descriptive terms to hex
  const map: Record<string, string> = {
    'claro': '#f5d1b0',
    'medio': '#e0ac69',
    'médio': '#e0ac69',
    'escuro': '#8d5524',
    'pardo': '#b58150',
    'preto': '#333333',
    'branco': '#ffffff',
    'rosa': '#ffc0cb',
    'loiro': '#ffd700',
    'castanho': '#8b4513',
    'ruivo': '#d2691e',
    'azul': '#0000ff',
    'verde': '#00ff00',
  };

  const normalized = color.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return map[normalized] || fallback;
}

// Helper to darken/lighten colors safely
function adjustColor(colorStr: string, amt: number): string {
  const hex = ensureHexColor(colorStr, '#000000').replace('#', '');
  const num = parseInt(hex, 16);
  if (isNaN(num)) return colorStr;

  let r = (num >> 16) + amt;
  if (r > 255) r = 255; else if (r < 0) r = 0;
  let b = ((num >> 8) & 0x00FF) + amt;
  if (b > 255) b = 255; else if (b < 0) b = 0;
  let g = (num & 0x0000FF) + amt;
  if (g > 255) g = 255; else if (g < 0) g = 0;
  return "#" + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
}

// --- ENGINE DE RENDERIZAÇÃO PROCEDURAL URBELUDO 2026 ---
const ProceduralLudoAvatar = ({ traits, motionData, isBreathing }: { traits: AvatarizeUserOutput, motionData: { x: number, y: number }, isBreathing: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const { x, y } = motionData;
      const tilt = x * 20; 
      const breathScale = isBreathing ? Math.sin(Date.now() / 500) * 5 : 0;
      
      // Validated Colors
      const skinTone = ensureHexColor(traits.face?.tone, '#e0ac69');
      const hairColor = ensureHexColor(traits.hair?.color, '#333333');
      const eyeColor = ensureHexColor(traits.eyes?.color, '#00FFFF');
      const accentColor = ensureHexColor(traits.dominantColor, '#33993D');

      // --- TRONCO ---
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height + 20);
      const bodyGrad = ctx.createLinearGradient(0, -100, 0, 0);
      bodyGrad.addColorStop(0, accentColor);
      bodyGrad.addColorStop(1, '#000000');
      
      ctx.beginPath();
      ctx.moveTo(-60, 0);
      ctx.bezierCurveTo(-70, -80 - breathScale, 70, -80 - breathScale, 60, 0);
      ctx.fillStyle = bodyGrad;
      ctx.fill();
      ctx.restore();

      // --- CABEÇA E PESCOÇO ---
      ctx.save();
      ctx.translate(canvas.width / 2 + tilt, canvas.height / 2 + y * 20);
      ctx.rotate(tilt * Math.PI / 180 * 0.2);

      // Pescoço
      ctx.beginPath();
      ctx.moveTo(-15, 40);
      ctx.quadraticCurveTo(0, 55, 15, 40);
      ctx.strokeStyle = skinTone;
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Rosto
      const faceGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 50);
      faceGrad.addColorStop(0, skinTone);
      faceGrad.addColorStop(1, adjustColor(skinTone, -20));

      ctx.beginPath();
      ctx.moveTo(-40, -10);
      ctx.bezierCurveTo(-45, 45, 45, 45, 40, -10);
      ctx.bezierCurveTo(40, -50, -40, -50, -40, -10);
      ctx.fillStyle = faceGrad;
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.fill();

      // Olhos
      const drawEye = (eyeX: number) => {
        ctx.save();
        ctx.translate(eyeX, -5);
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 6, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        const irisGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 5);
        irisGrad.addColorStop(0, '#000000');
        irisGrad.addColorStop(0.6, eyeColor);
        irisGrad.addColorStop(1, adjustColor(eyeColor, -40));
        
        ctx.beginPath();
        ctx.arc(x * 5, y * 3, 4, 0, Math.PI * 2);
        ctx.fillStyle = irisGrad;
        ctx.fill();
        ctx.restore();
      };
      drawEye(-18);
      drawEye(18);

      // Cabelo
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = hairColor;
      if (traits.hair?.style === 'curto') {
        ctx.moveTo(-45, -20);
        ctx.bezierCurveTo(-50, -60, 50, -60, 45, -20);
        ctx.lineTo(40, -10);
        ctx.bezierCurveTo(0, -25, -40, -10, -40, -10);
      } else {
        ctx.moveTo(-45, -10);
        ctx.bezierCurveTo(-60, 40, -30, 60, -20, 40);
        ctx.bezierCurveTo(0, 50, 30, 60, 45, -10);
        ctx.bezierCurveTo(50, -70, -50, -70, -45, -10);
      }
      ctx.fill();
      ctx.restore();

      // Visor Neon
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.beginPath();
      ctx.rect(-35, -12, 70, 12);
      const visorGrad = ctx.createLinearGradient(-35, 0, 35, 0);
      visorGrad.addColorStop(0, 'transparent');
      visorGrad.addColorStop(0.5, accentColor);
      visorGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = visorGrad;
      ctx.shadowBlur = 20;
      ctx.shadowColor = accentColor;
      ctx.fill();
      ctx.restore();

      // Boca
      ctx.beginPath();
      const mouthY = 20 + (isBreathing ? Math.sin(Date.now() / 500) * 3 : 0);
      ctx.moveTo(-10, mouthY);
      ctx.quadraticCurveTo(0, mouthY + 5, 10, mouthY);
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();

      // Aura
      drawAura(ctx, canvas.width, canvas.height, accentColor);

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationRef.current);
  }, [traits, motionData, isBreathing]);

  return <canvas ref={canvasRef} width={400} height={400} className="w-full h-full" />;
};

function drawAura(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  ctx.save();
  const time = Date.now() / 1000;
  for (let i = 0; i < 8; i++) {
    const angle = time + i * (Math.PI / 4);
    const px = w / 2 + Math.cos(angle) * 120;
    const py = h / 2 + Math.sin(angle * 0.5) * 120;
    ctx.beginPath();
    ctx.arc(px, py, 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.fill();
  }
  ctx.restore();
}

// --- INTERFACE PRINCIPAL ---
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
  
  const [isAvatarizing, setIsAvatarizing] = useState(false);
  const [safeAvatar, setSafeAvatar] = useState<AvatarizeUserOutput | null>(null);
  const [cameraMode, setCameraMode] = useState<'user' | 'environment'>('user');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isLibrasEnabled, setIsLibrasEnabled] = useState(false);
  const [isLowLight, setIsLowLight] = useState(false);

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
            
            if (brightness > 90 && r > g) { 
              const x = (i / 4) % 40;
              const y = Math.floor((i / 4) / 40);
              totalX += x;
              totalY += y;
              weight++;
            }
          }

          if (weight > 10) {
            const avgX = (totalX / weight) / 40 - 0.5;
            const avgY = (totalY / weight) / 30 - 0.5;
            lastX = lastX * 0.9 + avgX * 0.1;
            lastY = lastY * 0.9 + avgY * 0.1;
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

  const handleFaceScan = async () => {
    if (!videoRef.current || isInitializingCamera) return;
    
    setIsAvatarizing(true);
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Context failure");
      ctx.drawImage(video, 0, 0);
      const photo = canvas.toDataURL('image/jpeg', 0.8);
      
      const result = await avatarizeUser({ photoDataUri: photo });
      setSafeAvatar(result);

      if (userProgressRef) {
        updateDocumentNonBlocking(userProgressRef, { "avatar.traits": result });
      }
      toast({ title: "Identidade Procedural Gerada!", description: "Seu Bio-Puppet 2026 está pronto." });
    } catch (e) {
      console.error("Scan error:", e);
      toast({ title: "Aviso de IA", description: "Usando visual padrão." });
    } finally {
      setIsAvatarizing(false);
    }
  };

  const handleSaveProfile = async () => {
    if (userProgressRef) {
      updateDocumentNonBlocking(userProgressRef, { ageGroup, neurodivergence });
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
      <div className="relative w-full aspect-[3/4] bg-slate-900 overflow-hidden shadow-inner z-0">
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover opacity-60 grayscale-[0.3]" 
          autoPlay 
          muted 
          playsInline 
        />
        
        {safeAvatar && cameraMode === 'user' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none p-4">
            <ProceduralLudoAvatar 
              traits={safeAvatar} 
              isBreathing={activeChallenge?.challengeType === 'breathing' || selectedCategory === 'relaxation'} 
              motionData={motionData}
            />
          </div>
        )}

        <AnimatePresence>
          {isLowLight && !showGuide && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 z-[60] bg-destructive/90 text-white px-6 py-2 rounded-full flex items-center gap-2 shadow-lg border border-white/20"
            >
              <Sun className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Sensor: Luz Insuficiente</span>
            </motion.div>
          )}
        </AnimatePresence>

        {isLibrasEnabled && (
          <motion.div 
            drag
            className="absolute bottom-12 right-8 z-[45] w-24 h-24 bg-primary/20 backdrop-blur-2xl rounded-[3rem] border border-white/30 flex items-center justify-center shadow-2xl cursor-grab active:cursor-grabbing"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
             <Hand className="w-10 h-10 text-primary drop-shadow-lg" />
          </motion.div>
        )}

        {isInitializingCamera && (
          <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center gap-4">
             <div className="relative">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
                <Sparkles className="absolute top-0 right-0 w-6 h-6 text-accent animate-pulse" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">Syncing Bio-Data...</span>
          </div>
        )}
      </div>

      <div className="flex-1 -mt-16 bg-background rounded-t-[4rem] p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] z-20 border-t border-primary/10 overflow-y-auto">
        
        {showGuide ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col items-center text-center space-y-4">
               <div className="w-24 h-24 bg-primary/10 rounded-[3rem] flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                 <Info className="w-10 h-10" />
               </div>
               <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Estúdio de Imersão</h2>
               <p className="text-[11px] font-medium text-muted-foreground max-w-[280px] leading-relaxed">Personalize as diretrizes de acessibilidade e os sensores biométricos da sua jornada.</p>
            </div>
            
            <div className="grid gap-4">
              <AcessibilityToggle active={isAudioEnabled} onClick={() => { setIsAudioEnabled(!isAudioEnabled); speak("Áudio guia ativado"); }} icon={<Volume2 />} label="Áudio Guia" sub="Instruções Narradas" />
              <AcessibilityToggle active={isLibrasEnabled} onClick={() => setIsLibrasEnabled(!isLibrasEnabled)} icon={<Hand />} label="Puppet Libras" sub="Tradução Visual" />
            </div>

            <div className="space-y-6 pt-4">
              <div className="space-y-3">
                 <Label className="text-[11px] font-black uppercase text-muted-foreground px-4 tracking-widest">Categoria Motora</Label>
                 <Select value={ageGroup} onValueChange={setAgeGroup}>
                   <SelectTrigger className="rounded-[2rem] h-16 bg-muted/30 border-transparent font-black px-6 shadow-sm">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="rounded-3xl border-none shadow-2xl">
                     <SelectItem value="preschool" className="rounded-2xl font-black uppercase text-[10px] py-3">Nível Infantil (3-6)</SelectItem>
                     <SelectItem value="school_age" className="rounded-2xl font-black uppercase text-[10px] py-3">Nível Escolar (7-12)</SelectItem>
                     <SelectItem value="adolescent_adult" className="rounded-2xl font-black uppercase text-[10px] py-3">Nível Avançado (13+)</SelectItem>
                   </SelectContent>
                 </Select>
              </div>
              
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase text-muted-foreground px-4 tracking-widest">Neurodivergência</Label>
                <Input 
                  placeholder="Ex: TDAH, Autismo (Ajusta o ritmo)" 
                  value={neurodivergence} 
                  onChange={e => setNeurodivergence(e.target.value)} 
                  className="rounded-[2rem] h-16 bg-muted/30 border-transparent px-6 font-bold focus:bg-white transition-all shadow-sm" 
                />
              </div>
            </div>

            <Button onClick={handleSaveProfile} className="w-full h-18 rounded-[3rem] font-black uppercase tracking-widest bg-primary shadow-2xl flex justify-between px-10 border-b-4 border-primary/60 hover:translate-y-1 transition-all">
              <span>Carregar Playground</span>
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        ) : !safeAvatar ? (
          <div className="p-10 bg-primary/5 rounded-[4rem] border-2 border-dashed border-primary/20 text-center space-y-8 animate-in zoom-in-95 duration-500">
             <div className="relative w-28 h-28 mx-auto">
                <div className="absolute inset-0 bg-primary/20 rounded-[3rem] animate-ping" />
                <div className="relative w-full h-full bg-primary/10 rounded-[3rem] flex items-center justify-center text-primary border border-primary/30">
                  <Scan className="w-12 h-12" />
                </div>
             </div>
             <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Sync Bio-Puppet</h3>
                <p className="text-[11px] font-medium text-muted-foreground max-w-[260px] mx-auto leading-relaxed">
                  Gere sua representação procedural avançada. Seus dados biométricos são processados e descartados localmente.
                </p>
             </div>
             <Button onClick={handleFaceScan} disabled={isAvatarizing || isInitializingCamera} className="w-full h-18 rounded-[3rem] font-black uppercase bg-primary shadow-2xl border-b-4 border-primary/70 text-lg">
               {isAvatarizing ? <Loader2 className="animate-spin" /> : "Iniciar Bio-Scan"}
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
                  <Badge className="bg-accent text-accent-foreground font-black text-[10px] uppercase px-4 py-1.5 rounded-full">Dificuldade: {activeChallenge.difficulty}</Badge>
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
        active ? "text-primary bg-primary/10 rotate-12" : "text-muted-foreground bg-muted"
      )}>
        {React.cloneElement(icon, { className: "w-6 h-6" })}
      </div>
      <div className="flex-1">
        <span className="text-[11px] font-black uppercase block leading-none tracking-widest">{label}</span>
        <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-70">{sub}</span>
      </div>
      <div className={cn("w-3 h-3 rounded-full", active ? "bg-primary animate-pulse" : "bg-muted")} />
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
