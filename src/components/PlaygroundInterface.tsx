
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
  Volume2,
  AlertCircle
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
  const lastBeepTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [mounted, setMounted] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [profile, searchParams]);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const playPleasantSymphony = (x: number, width: number, intensity: number) => {
    if (!audioContextRef.current || intensity < 0.15) return;
    
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    if (now - lastBeepTimeRef.current < 0.12) return;
    lastBeepTimeRef.current = now;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    const freq = 180 + (x / width) * 550;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.3);
  };

  const initFog = useCallback(() => {
    const canvas = fogCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = avatarColor;
    ctx.globalAlpha = 0.88;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
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

    if (!ctx || !fogCtx || video.videoWidth === 0) {
      requestRef.current = requestAnimationFrame(processFrame);
      return;
    }

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

      for (let i = 0; i < currentFrame.data.length; i += 60) { 
        const diff = Math.abs(currentFrame.data[i] - lastFrameRef.current.data[i]) +
                     Math.abs(currentFrame.data[i+1] - lastFrameRef.current.data[i+1]) +
                     Math.abs(currentFrame.data[i+2] - lastFrameRef.current.data[i+2]);
        
        if (diff > 110) {
          const pixelIndex = i / 4;
          const x = pixelIndex % canvas.width;
          const y = Math.floor(pixelIndex / canvas.width);
          motionSumX += x;
          motionSumY += y;
          motionCount++;
        }
      }

      if (motionCount > 80) {
        const centerX = motionSumX / motionCount;
        const centerY = motionSumY / motionCount;
        const intensity = motionCount / (canvas.width * canvas.height / 500);

        fogCtx.globalCompositeOperation = 'destination-out';
        fogCtx.beginPath();
        const brushSize = 50 + intensity * 120;
        fogCtx.arc(centerX, centerY, brushSize, 0, Math.PI * 2);
        fogCtx.fill();
        
        fogCtx.globalCompositeOperation = 'source-over';
        fogCtx.beginPath();
        fogCtx.arc(centerX, centerY, brushSize * 0.4, 0, Math.PI * 2);
        fogCtx.fillStyle = avatarColor;
        fogCtx.globalAlpha = 0.08;
        fogCtx.fill();

        playPleasantSymphony(centerX, canvas.width, intensity);

        const gx = Math.floor((centerX / canvas.width) * 10);
        const gy = Math.floor((centerY / canvas.height) * 10);
        const gridIdx = Math.max(0, Math.min(99, gy * 10 + gx));
        
        setGrid(prev => {
          if (prev[gridIdx]) return prev;
          const newGrid = [...prev];
          newGrid[gridIdx] = true;
          const newProgress = (newGrid.filter(v => v).length / 100) * 100;
          setProgress(newProgress);
          
          if (newProgress >= 80 && !celebrating) {
            handleWin();
          }
          return newGrid;
        });
      }
    }
    lastFrameRef.current = currentFrame;
    requestRef.current = requestAnimationFrame(processFrame);
  }, [isPlaying, avatarColor, initFog, celebrating]);

  const startCamera = async () => {
    initAudio();
    setErrorMessage(null);
    setIsCameraReady(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("A API de câmera não é suportada neste dispositivo.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user', 
          width: { ideal: 640 }, 
          height: { ideal: 480 } 
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            setIsCameraReady(true);
            setIsPlaying(true);
          }).catch(e => {
            setErrorMessage("Erro ao dar play no vídeo: " + e.message);
          });
        };
      }
    } catch (err: any) {
      console.error("Falha Crítica na Câmera:", err);
      if (err.name === 'NotAllowedError') {
        setErrorMessage("Permissão negada. Você precisa liberar o acesso à câmera.");
      } else if (err.name === 'NotFoundError') {
        setErrorMessage("Nenhuma câmera foi encontrada no seu dispositivo.");
      } else if (err.name === 'NotReadableError') {
        setErrorMessage("A câmera já está sendo usada por outro aplicativo (feche outros apps).");
      } else {
        setErrorMessage(`Erro no Sensor: ${err.message}`);
      }
      
      toast({ 
        variant: 'destructive', 
        title: "Câmera negada", 
        description: "O Espelho Mágico precisa da sua imagem para brilhar!" 
      });
    }
  };

  const handleWin = () => {
    setCelebrating(true);
    setIsPlaying(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    if (userProgressRef && profile) {
      const earnedCoins = 50;
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
    if (isPlaying && isCameraReady) {
      processFrame();
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isCameraReady, processFrame]);

  const handleSaveProfile = async () => {
    if (!termsAccepted || !explorerName.trim()) {
      toast({ variant: 'destructive', title: "Atenção", description: "Complete seu perfil de herói para continuar." });
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
            {/* Tag Video Blindada e Oculta */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="hidden" 
            />
            
            {/* Feedback de Carregamento/Erro */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center z-50 pointer-events-none">
              {errorMessage && (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-8 bg-red-600 rounded-[3rem] shadow-2xl pointer-events-auto border-4 border-white">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                  <h2 className="text-xl font-black uppercase italic mb-2">Sensor Falhou</h2>
                  <p className="text-xs font-bold opacity-90">{errorMessage}</p>
                  <Button onClick={startCamera} className="mt-6 bg-white text-red-600 font-black rounded-full px-8 py-2">Tentar Novamente</Button>
                </motion.div>
              )}
              
              {!isCameraReady && !errorMessage && isPlaying && (
                <div className="flex flex-col items-center gap-6">
                   <div className="p-8 bg-primary/20 rounded-[3rem] animate-pulse">
                      <Sparkles className="w-12 h-12 text-primary" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] italic text-primary">Ativando Espelho Mágico...</p>
                </div>
              )}
            </div>

            {/* Camada de Processamento (Oculta) */}
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Camada de Revelação: A Neblina Digital */}
            <canvas 
              ref={fogCanvasRef} 
              className={cn(
                "absolute inset-0 w-full h-full object-cover scale-x-[-1] z-20 transition-opacity duration-1000",
                isCameraReady ? "opacity-100" : "opacity-0"
              )} 
            />
            
            {/* HUD de Jogo */}
            <div className="absolute inset-0 z-30 pointer-events-none p-8 flex flex-col justify-between">
               <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <div className="bg-black/60 backdrop-blur-xl px-6 py-3 rounded-[1.5rem] border border-white/20 text-white flex items-center gap-3 shadow-2xl">
                      <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-widest italic">O Traço Vivo: Revelação</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl flex items-center gap-3 border border-white/20 shadow-xl">
                       <Volume2 className="w-5 h-5 text-white" />
                       <div className="h-2 w-32 bg-white/20 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-primary"
                            animate={{ width: isPlaying ? '100%' : '0%' }}
                            transition={{ duration: 1 }}
                          />
                       </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 max-w-sm">
                    <div className="flex justify-between text-[9px] font-black uppercase text-white tracking-widest px-1 drop-shadow-md">
                      <span>Progresso da Arte</span>
                      <span>{Math.floor(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-4 bg-white/10 border border-white/20 shadow-2xl" />
                  </div>
               </div>

               <div className="flex justify-center items-end gap-6 pointer-events-auto pb-10">
                  {!isPlaying && !celebrating && !errorMessage && (
                    <Button onClick={startCamera} className="h-32 w-32 rounded-full bg-primary shadow-[0_0_80px_rgba(147,51,234,0.6)] border-4 border-white active:scale-90 transition-all group">
                       <PlayIcon className="w-14 h-14 fill-current group-hover:scale-110 transition-transform" />
                    </Button>
                  )}
                  {isPlaying && isCameraReady && (
                    <Button onClick={() => initFog()} variant="secondary" className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-xl border-4 border-white/20 hover:bg-white/40 shadow-2xl">
                       <Eraser className="w-8 h-8 text-white" />
                    </Button>
                  )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn("flex-1 bg-background p-8 z-20 overflow-y-auto no-scrollbar pt-12")}>
        {showGuide ? (
          <div className="space-y-12 max-w-md mx-auto pb-24">
            <AvatarSelection initialAvatarId={selectedAvatarId} onSelect={setSelectedAvatarId} />
            <div className="space-y-8 bg-muted/20 p-8 rounded-[3.5rem] border border-primary/5 shadow-inner">
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase text-primary/40 tracking-[0.4em] px-4">Codinome UrbeLudo</Label>
                <Input value={explorerName} onChange={(e) => setExplorerName(e.target.value)} className="rounded-3xl h-16 bg-white border-none shadow-xl text-lg font-bold px-8 focus:ring-4 ring-primary/10 transition-all" />
              </div>
              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase text-primary/40 tracking-[0.4em] px-4">Cor da sua Aura</Label>
                <div className="grid grid-cols-5 gap-4 bg-white/50 p-6 rounded-[2.5rem] shadow-sm">
                  {['#9333ea', '#3B82F6', '#EF4444', '#10b981', '#f59e0b'].map(c => (
                    <button 
                      key={c} 
                      onClick={() => setAvatarColor(c)} 
                      className={cn(
                        "aspect-square rounded-2xl border-4 transition-all hover:scale-105", 
                        avatarColor === c ? "border-primary scale-115 shadow-2xl z-10" : "border-transparent opacity-40"
                      )} 
                      style={{ backgroundColor: c }} 
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-5 bg-white/60 p-6 rounded-[2.5rem] shadow-sm">
                <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(v) => setTermsAccepted(!!v)} className="w-8 h-8 rounded-xl border-2 border-primary" />
                <label htmlFor="terms" className="text-[10px] font-bold text-muted-foreground leading-tight select-none">
                  Aceito que meus movimentos transformem o mundo em música e cores.
                </label>
              </div>
            </div>
            <Button 
              onClick={handleSaveProfile} 
              disabled={!termsAccepted} 
              className="w-full h-24 rounded-[3.5rem] font-black uppercase bg-primary shadow-2xl flex justify-between px-14 border-b-8 border-primary/80 active:border-b-0 active:translate-y-2 transition-all group"
            >
              <span className="text-xl tracking-widest italic">Entrar no Espelho</span>
              <ChevronRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
            </Button>
          </div>
        ) : !isPlaying && !celebrating && !errorMessage && (
          <div className="max-w-lg mx-auto py-16 space-y-10 text-center animate-in fade-in zoom-in-95">
             <div className="bg-primary/5 p-12 rounded-[4rem] border-4 border-dashed border-primary/20 space-y-8 shadow-2xl">
                <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
                   <Zap className="w-12 h-12 text-primary animate-pulse" />
                </div>
                <h4 className="text-3xl font-black uppercase italic tracking-tighter text-foreground">Prepare sua Aura</h4>
                <p className="text-sm font-bold text-muted-foreground uppercase leading-relaxed max-w-[280px] mx-auto opacity-70">
                  Mova o corpo para limpar a neblina. Quanto mais energia, mais intensa será a sua sinfonia!
                </p>
                <div className="pt-6">
                   <Button onClick={startCamera} className="rounded-full px-16 h-16 font-black uppercase tracking-[0.2em] bg-primary text-sm shadow-xl hover:scale-105 transition-transform">Brincar Agora</Button>
                </div>
             </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {celebrating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[250] bg-primary/95 backdrop-blur-[60px] flex flex-col items-center justify-center text-white p-12 text-center">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 100 }}
              className="relative"
            >
              <Trophy className="w-56 h-56 mb-12 text-yellow-400 drop-shadow-[0_0_70px_rgba(250,204,21,0.6)]" />
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-yellow-400/20 blur-[80px] rounded-full -z-10"
              />
            </motion.div>
            
            <h2 className="text-7xl font-black uppercase italic tracking-tighter leading-none mb-6 text-white">FANTÁSTICO!</h2>
            <p className="text-lg font-bold uppercase tracking-[0.3em] opacity-80 mb-16 italic">Sua sinfonia motora foi revelada.</p>
            
            <div className="flex flex-col gap-6 w-full max-w-sm">
              <div className="bg-white/20 p-8 rounded-[3rem] flex items-center justify-center gap-6 border-2 border-white/20 shadow-2xl">
                 <Coins className="w-10 h-10 text-yellow-400" />
                 <span className="text-5xl font-black">+50 LC</span>
              </div>
              <Button onClick={() => router.push('/dashboard')} size="lg" className="h-24 rounded-[3rem] bg-white text-primary font-black uppercase tracking-[0.3em] text-xl border-b-8 border-zinc-200 active:border-b-0 active:translate-y-2 transition-all shadow-2xl">
                Coletar e Perfil
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
