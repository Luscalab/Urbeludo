
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Play as PlayIcon,
  Eraser,
  Palette as PaletteIcon,
  Zap,
  ChevronRight,
  Sparkles,
  Trophy,
  Coins,
  Volume2
} from 'lucide-react';

import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AvatarSelection } from '@/components/AvatarSelection';
import { FALLBACK_AVATAR } from '@/lib/avatar-catalog';

export function PlaygroundInterface({ debugMode = false }: { debugMode?: boolean }) {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fogCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastFrameRef = useRef<ImageData | null>(null);
  const requestRef = useRef<number>(null);
  
  const [mounted, setMounted] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [grid, setGrid] = useState<boolean[]>(new Array(100).fill(false));
  const [celebrating, setCelebrating] = useState(false);
  
  const [explorerName, setExplorerName] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState(FALLBACK_AVATAR.id);
  const [avatarColor, setAvatarColor] = useState('#9333ea');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const userProgressRef = useMemoFirebase(() => user ? { id: user.uid, path: `user_progress/${user.uid}` } : null, [user]);
  const { data: profile } = useDoc(userProgressRef);

  useEffect(() => {
    setMounted(true);
    if (profile) {
      const editMode = searchParams.get('edit') === 'true';
      if (profile.displayName && profile.hasSeenTutorial && !editMode) {
        setShowGuide(false);
      }
      setExplorerName(profile.displayName || '');
      setAvatarColor(profile.dominantColor || '#9333ea');
      setSelectedAvatarId(profile.avatar?.avatarId || FALLBACK_AVATAR.id);
    }
  }, [profile, searchParams]);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playSymphony = (x: number, width: number, intensity: number) => {
    if (!audioContextRef.current || intensity < 0.1) return;
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Frequência baseada na posição X (Grave à esquerda, agudo à direita)
    const freq = 150 + (x / width) * 600;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    // Volume baseado na intensidade do movimento
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(Math.min(intensity * 0.1, 0.2), ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  };

  const initFog = useCallback(() => {
    const canvas = fogCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Preenche com a "Neblina Digital" na cor da Aura
    ctx.fillStyle = avatarColor;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Reseta o grid
    setGrid(new Array(100).fill(false));
    setProgress(0);
  }, [avatarColor]);

  const processFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !fogCanvasRef.current || !isPlaying) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const fogCanvas = fogCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const fogCtx = fogCanvas.getContext('2d');

    if (!ctx || !fogCtx) return;

    if (canvas.width !== video.videoWidth) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      fogCanvas.width = video.videoWidth;
      fogCanvas.height = video.videoHeight;
      initFog();
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (lastFrameRef.current) {
      let motionSumX = 0;
      let motionSumY = 0;
      let motionCount = 0;

      for (let i = 0; i < currentFrame.data.length; i += 40) { // Amostragem para performance
        const diff = Math.abs(currentFrame.data[i] - lastFrameRef.current.data[i]) +
                     Math.abs(currentFrame.data[i+1] - lastFrameRef.current.data[i+1]) +
                     Math.abs(currentFrame.data[i+2] - lastFrameRef.current.data[i+2]);
        
        if (diff > 100) {
          const pixelIndex = i / 4;
          const x = pixelIndex % canvas.width;
          const y = Math.floor(pixelIndex / canvas.width);
          motionSumX += x;
          motionSumY += y;
          motionCount++;
        }
      }

      if (motionCount > 50) {
        const centerX = motionSumX / motionCount;
        const centerY = motionSumY / motionCount;
        const intensity = motionCount / (canvas.width * canvas.height / 400);

        // MECÂNICA: Revelar o vídeo apagando a neblina
        fogCtx.globalCompositeOperation = 'destination-out';
        fogCtx.beginPath();
        const brushSize = 40 + intensity * 100;
        fogCtx.arc(centerX, centerY, brushSize, 0, Math.PI * 2);
        fogCtx.fill();
        
        // Desenha rastro de brilho da Aura (opcional, por cima)
        fogCtx.globalCompositeOperation = 'source-over';
        fogCtx.beginPath();
        fogCtx.arc(centerX, centerY, brushSize * 0.5, 0, Math.PI * 2);
        fogCtx.fillStyle = avatarColor;
        fogCtx.globalAlpha = 0.1;
        fogCtx.fill();

        // Feedback Sonoro
        playSymphony(centerX, canvas.width, intensity);

        // Atualização do Grid de Performance
        const gx = Math.floor((centerX / canvas.width) * 10);
        const gy = Math.floor((centerY / canvas.height) * 10);
        const gridIdx = gy * 10 + gx;
        
        if (gridIdx >= 0 && gridIdx < 100) {
          setGrid(prev => {
            if (prev[gridIdx]) return prev;
            const newGrid = [...prev];
            newGrid[gridIdx] = true;
            const newProgress = (newGrid.filter(v => v).length / 100) * 100;
            setProgress(newProgress);
            
            // Condição de Vitória: 80%
            if (newProgress >= 80 && !celebrating) {
              handleWin();
            }
            return newGrid;
          });
        }
      }
    }
    lastFrameRef.current = currentFrame;
    requestRef.current = requestAnimationFrame(processFrame);
  }, [isPlaying, avatarColor, initFog, celebrating]);

  const startCamera = async () => {
    initAudio();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsPlaying(true);
      }
    } catch (err) {
      toast({ variant: 'destructive', title: "Câmera negada", description: "Ative a câmera para brincar no Espelho Mágico!" });
    }
  };

  const handleWin = () => {
    setCelebrating(true);
    setIsPlaying(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    const earnedCoins = 50;
    
    if (userProgressRef && profile) {
      const newHistory = [{
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        score: 100,
        earnedCoins: earnedCoins,
        type: 'Limpa-Vidros Mágico'
      }, ...(profile.history || [])].slice(0, 5);

      updateDocumentNonBlocking(userProgressRef, { 
        ludoCoins: (profile.ludoCoins || 0) + earnedCoins,
        totalChallengesCompleted: (profile.totalChallengesCompleted || 0) + 1,
        history: newHistory
      });
    }
  };

  useEffect(() => {
    if (isPlaying) {
      processFrame();
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, processFrame]);

  const handleSaveProfile = async () => {
    if (!termsAccepted || !explorerName.trim()) {
      toast({ variant: 'destructive', title: "Atenção", description: "Complete seu perfil para continuar." });
      return;
    }
    if (userProgressRef) {
      updateDocumentNonBlocking(userProgressRef, { 
        displayName: explorerName,
        dominantColor: avatarColor,
        hasSeenTutorial: true,
        avatar: { ...profile?.avatar, avatarId: selectedAvatarId }
      });
    }
    const isEditMode = searchParams.get('edit') === 'true';
    if (isEditMode) router.push('/dashboard');
    else setShowGuide(false);
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      <AnimatePresence>
        {!showGuide && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative w-full h-full bg-black overflow-hidden z-10">
            {/* Camada 0: Vídeo Real */}
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" autoPlay muted playsInline />
            
            {/* Camada 1: Canvas de Processamento (Oculto) */}
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Camada 2: Neblina Digital (Revelação) */}
            <canvas ref={fogCanvasRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1] z-20" />
            
            {/* HUD de Jogo */}
            <div className="absolute inset-0 z-30 pointer-events-none p-8 flex flex-col justify-between">
               <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest">O Traço Vivo: Limpa-Vidros</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl flex items-center gap-3 border border-white/20">
                       <Volume2 className="w-4 h-4 text-white" />
                       <div className="h-1.5 w-24 bg-white/20 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-primary"
                            animate={{ width: isPlaying ? '100%' : '0%' }}
                            transition={{ duration: 1 }}
                          />
                       </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-[8px] font-black uppercase text-white tracking-widest px-1">
                      <span>Progresso da Revelação</span>
                      <span>{Math.floor(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-3 bg-white/10 border border-white/20" />
                  </div>
               </div>

               <div className="flex justify-center items-end gap-4 pointer-events-auto">
                  {!isPlaying && !celebrating && (
                    <Button onClick={startCamera} className="h-28 w-28 rounded-full bg-primary shadow-[0_0_50px_rgba(147,51,234,0.5)] border-4 border-white active:scale-95 transition-all group">
                       <PlayIcon className="w-12 h-12 fill-current group-hover:scale-110 transition-transform" />
                    </Button>
                  )}
                  {isPlaying && (
                    <Button onClick={() => initFog()} variant="secondary" className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/20 hover:bg-white/30">
                       <Eraser className="w-6 h-6 text-white" />
                    </Button>
                  )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn("flex-1 bg-background p-10 z-20 overflow-y-auto no-scrollbar pt-12")}>
        {showGuide ? (
          <div className="space-y-10 max-w-md mx-auto pb-20">
            <AvatarSelection initialAvatarId={selectedAvatarId} onSelect={setSelectedAvatarId} />
            <div className="space-y-8 bg-muted/20 p-8 rounded-[3.5rem] border border-primary/5">
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase text-primary/40 tracking-[0.3em] px-4">Codinome do Herói</Label>
                <Input value={explorerName} onChange={(e) => setExplorerName(e.target.value)} className="rounded-3xl h-16 bg-white border-none shadow-inner text-lg font-bold px-8" />
              </div>
              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase text-primary/40 tracking-[0.3em] px-4">Cor da Aura</Label>
                <div className="grid grid-cols-5 gap-3 bg-white/50 p-4 rounded-[2rem]">
                  {['#9333ea', '#3B82F6', '#EF4444', '#10b981', '#f59e0b'].map(c => (
                    <button key={c} onClick={() => setAvatarColor(c)} className={cn("aspect-square rounded-2xl border-4 transition-all", avatarColor === c ? "border-primary scale-110 shadow-xl" : "border-transparent opacity-40")} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-white/50 p-4 rounded-3xl">
                <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(v) => setTermsAccepted(!!v)} className="w-8 h-8 rounded-xl border-2 border-primary" />
                <label htmlFor="terms" className="text-[10px] font-bold text-muted-foreground leading-tight">Aceito transformar meus movimentos em sinfonia e arte.</label>
              </div>
            </div>
            <Button onClick={handleSaveProfile} disabled={!termsAccepted} className="w-full h-24 rounded-[3.5rem] font-black uppercase bg-primary shadow-2xl flex justify-between px-14 border-b-8 border-primary/80 active:border-b-0 active:translate-y-2 transition-all">
              <span className="text-lg">Entrar no Espelho</span>
              <ChevronRight className="w-8 h-8" />
            </Button>
          </div>
        ) : !isPlaying && !celebrating && (
          <div className="max-w-lg mx-auto py-10 space-y-8 text-center">
             <div className="bg-primary/5 p-10 rounded-[3.5rem] border-2 border-dashed border-primary/20 space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
                   <Zap className="w-10 h-10 text-primary animate-pulse" />
                </div>
                <h4 className="text-2xl font-black uppercase italic tracking-tighter">Motor Sensorial Ativo</h4>
                <p className="text-[11px] font-bold text-muted-foreground uppercase leading-relaxed max-w-[280px] mx-auto">
                  Limpe a neblina movendo seu corpo. Quanto mais rápido, mais intenso será o som!
                </p>
                <div className="pt-4">
                   <Button onClick={startCamera} className="rounded-full px-12 h-14 font-black uppercase tracking-widest bg-primary">Começar Agora</Button>
                </div>
             </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {celebrating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[250] bg-primary/95 backdrop-blur-3xl flex flex-col items-center justify-center text-white p-10 text-center">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12 }}
            >
              <Trophy className="w-48 h-48 mb-8 text-yellow-400 drop-shadow-[0_0_50px_rgba(250,204,21,0.5)]" />
            </motion.div>
            
            <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none mb-4">REVELAÇÃO COMPLETA!</h2>
            <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-80 mb-12">Sua sinfonia motor foi concluída com sucesso.</p>
            
            <div className="flex flex-col gap-4 w-full max-w-xs">
              <div className="bg-white/20 p-6 rounded-[2.5rem] flex items-center justify-center gap-4 border border-white/20">
                 <Coins className="w-8 h-8 text-yellow-400" />
                 <span className="text-4xl font-black">+50 LC</span>
              </div>
              <Button onClick={() => router.push('/dashboard')} size="lg" className="h-20 rounded-[2.5rem] bg-white text-primary font-black uppercase tracking-widest text-lg border-b-8 border-zinc-200 active:border-b-0 active:translate-y-2 transition-all">
                Coletar e Perfil
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
