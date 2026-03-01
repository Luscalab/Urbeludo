'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Play as PlayIcon,
  Eraser,
  Palette as PaletteIcon,
  Zap,
  ChevronRight,
  Sparkles,
  Trophy,
  Coins
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
  const trailCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastFrameRef = useRef<ImageData | null>(null);
  
  const [showGuide, setShowGuide] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  
  const [explorerName, setExplorerName] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState(FALLBACK_AVATAR.id);
  const [avatarColor, setAvatarColor] = useState('#9333ea');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const userProgressRef = useMemoFirebase(() => user ? { id: user.uid, path: `user_progress/${user.uid}` } : null, [user]);
  const { data: profile } = useDoc(userProgressRef);

  useEffect(() => {
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

  const playBeep = (freq: number) => {
    if (!audioContextRef.current) return;
    const osc = audioContextRef.current.createOscillator();
    const gain = audioContextRef.current.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioContextRef.current.currentTime);
    gain.gain.setValueAtTime(0.05, audioContextRef.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioContextRef.current.destination);
    osc.start();
    osc.stop(audioContextRef.current.currentTime + 0.1);
  };

  const processFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !trailCanvasRef.current || !isPlaying) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const trailCanvas = trailCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const trailCtx = trailCanvas.getContext('2d');

    if (!ctx || !trailCtx) return;

    if (canvas.width !== video.videoWidth) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      trailCanvas.width = video.videoWidth;
      trailCanvas.height = video.videoHeight;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (lastFrameRef.current) {
      let motionSumX = 0;
      let motionSumY = 0;
      let motionCount = 0;

      for (let i = 0; i < currentFrame.data.length; i += 4) {
        const diff = Math.abs(currentFrame.data[i] - lastFrameRef.current.data[i]) +
                     Math.abs(currentFrame.data[i+1] - lastFrameRef.current.data[i+1]) +
                     Math.abs(currentFrame.data[i+2] - lastFrameRef.current.data[i+2]);
        
        if (diff > 80) {
          const pixelIndex = i / 4;
          const x = pixelIndex % canvas.width;
          const y = Math.floor(pixelIndex / canvas.width);
          motionSumX += x;
          motionSumY += y;
          motionCount++;
        }
      }

      if (motionCount > 100) {
        const centerX = motionSumX / motionCount;
        const centerY = motionSumY / motionCount;
        trailCtx.beginPath();
        trailCtx.arc(centerX, centerY, 15, 0, Math.PI * 2);
        trailCtx.fillStyle = avatarColor;
        trailCtx.globalAlpha = 0.4;
        trailCtx.fill();
        const freq = 200 + (centerX / canvas.width) * 800;
        playBeep(freq);
        setScore(prev => prev + 1);
      }
    }
    lastFrameRef.current = currentFrame;
    requestAnimationFrame(processFrame);
  }, [isPlaying, avatarColor]);

  const startCamera = async () => {
    initAudio();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsPlaying(true);
      }
    } catch (err) {
      toast({ variant: 'destructive', title: "Câmera negada", description: "Ative a câmera para desenhar com o corpo!" });
    }
  };

  useEffect(() => {
    if (isPlaying) processFrame();
  }, [isPlaying, processFrame]);

  const handleFinish = () => {
    setCelebrating(true);
    const earnedCoins = Math.min(Math.floor(score / 10), 50);
    
    if (userProgressRef && profile) {
      const newHistory = [{
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        score: score,
        earnedCoins: earnedCoins,
        type: 'O Traço Vivo'
      }, ...(profile.history || [])].slice(0, 5);

      updateDocumentNonBlocking(userProgressRef, { 
        ludoCoins: (profile.ludoCoins || 0) + earnedCoins,
        totalChallengesCompleted: (profile.totalChallengesCompleted || 0) + 1,
        history: newHistory
      });
    }

    setTimeout(() => {
      setCelebrating(false);
      router.push('/dashboard');
    }, 3000);
  };

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

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      <AnimatePresence>
        {!showGuide && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative w-full h-full bg-black overflow-hidden z-10">
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-60" autoPlay muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
            <canvas ref={trailCanvasRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none" />
            
            <div className="absolute inset-0 z-30 pointer-events-none p-8 flex flex-col justify-between">
               <div className="flex justify-between items-start">
                  <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-white flex items-center gap-2">
                    <PaletteIcon className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Traço Vivo_2026</span>
                  </div>
                  <div className="bg-primary/20 backdrop-blur-xl border-2 border-white/20 p-4 rounded-[2rem] flex flex-col items-center">
                     <span className="text-[8px] font-black text-white uppercase">Fluxo</span>
                     <span className="text-2xl font-black text-white">{Math.min(Math.floor(score / 10), 50)}</span>
                  </div>
               </div>

               <div className="flex justify-center items-end gap-4 pointer-events-auto">
                  {!isPlaying ? (
                    <Button onClick={startCamera} className="h-24 w-24 rounded-full bg-primary shadow-2xl border-4 border-white active:scale-95 transition-all">
                       <PlayIcon className="w-10 h-10 fill-current" />
                    </Button>
                  ) : (
                    <>
                      <Button onClick={() => trailCanvasRef.current?.getContext('2d')?.clearRect(0,0,trailCanvasRef.current.width,trailCanvasRef.current.height)} variant="secondary" className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/20">
                         <Eraser className="w-6 h-6 text-white" />
                      </Button>
                      <Button onClick={handleFinish} className="h-20 px-10 rounded-full bg-green-500 text-white font-black uppercase tracking-widest shadow-2xl border-4 border-white active:scale-95 transition-all">
                        Finalizar Arte
                      </Button>
                    </>
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
                <Label className="text-[11px] font-black uppercase text-primary/40 tracking-[0.3em] px-4">Codinome</Label>
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
                <label htmlFor="terms" className="text-[10px] font-bold text-muted-foreground leading-tight">Aceito transformar meus movimentos em arte.</label>
              </div>
            </div>
            <Button onClick={handleSaveProfile} disabled={!termsAccepted} className="w-full h-24 rounded-[3.5rem] font-black uppercase bg-primary shadow-2xl flex justify-between px-14 border-b-8 border-primary/80 active:border-b-0 active:translate-y-2 transition-all">
              <span className="text-lg">Entrar no Espelho</span>
              <ChevronRight className="w-8 h-8" />
            </Button>
          </div>
        ) : (
          <div className="max-w-lg mx-auto py-10 space-y-6">
             <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-dashed border-primary/20 text-center space-y-4">
                <Sparkles className="w-10 h-10 text-primary/40 mx-auto" />
                <h4 className="text-xl font-black uppercase italic tracking-tighter">Arte Psicomotora Ativa</h4>
                <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed">O corpo é o pincel. Mova-se livremente para criar.</p>
             </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {celebrating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[250] bg-primary/95 backdrop-blur-3xl flex flex-col items-center justify-center text-white">
            <Trophy className="w-48 h-48 mb-12 text-accent animate-bounce" />
            <h2 className="text-7xl font-black uppercase italic tracking-tighter">Brilhante!</h2>
            <div className="mt-8 flex items-center gap-4 bg-white/20 px-8 py-3 rounded-full">
               <Coins className="w-6 h-6 text-yellow-400" />
               <span className="text-2xl font-black">+{Math.min(Math.floor(score / 10), 50)} LC</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
