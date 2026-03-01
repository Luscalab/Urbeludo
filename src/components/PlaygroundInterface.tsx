
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Eraser,
  Sparkles,
  Trophy,
  Coins,
  Volume2,
  AlertCircle,
  Loader2,
  Camera,
  Play
} from 'lucide-react';

import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { cn } from '@/lib/utils';
import { FALLBACK_AVATAR } from '@/lib/avatar-catalog';

export function PlaygroundInterface({ debugMode = false }: { debugMode?: boolean }) {
  const { user } = useUser();
  const router = useRouter();
  
  // Referências para hardware e processamento
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fogCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastFrameRef = useRef<ImageData | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastBeepTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Estados de controle e diagnóstico
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState("Aguardando ignição...");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Estados de Jogo
  const [progress, setProgress] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [grid, setGrid] = useState<boolean[]>(new Array(100).fill(false));

  const userProgressRef = useMemoFirebase(() => user ? { id: user.uid, path: `user_progress/${user.uid}` } : null, [user]);
  const { data: profile } = useDoc(userProgressRef);

  const auraColor = profile?.dominantColor || '#9333ea';

  useEffect(() => {
    setMounted(true);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const initAudio = () => {
    try {
      if (!audioContextRef.current) {
        const AudioCtxClass = (window.AudioContext || (window as any).webkitAudioContext);
        if (AudioCtxClass) {
          audioContextRef.current = new AudioCtxClass();
        }
      }
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
    } catch (e) {
      console.warn("Falha ao iniciar áudio:", e);
    }
  };

  const playSymphony = (x: number, width: number, intensity: number) => {
    if (!audioContextRef.current || intensity < 0.2) return;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    if (now - lastBeepTimeRef.current < 0.15) return;
    lastBeepTimeRef.current = now;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = 150 + (x / width) * 600;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  };

  const initFog = useCallback(() => {
    const fogCanvas = fogCanvasRef.current;
    if (!fogCanvas) return;
    const ctx = fogCanvas.getContext('2d');
    if (!ctx) return;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = auraColor;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(0, 0, fogCanvas.width, fogCanvas.height);
    setGrid(new Array(100).fill(false));
    setProgress(0);
    setCelebrating(false);
  }, [auraColor]);

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

      for (let i = 0; i < currentFrame.data.length; i += 160) { 
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
        const intensity = motionCount / (canvas.width * canvas.height / 800);

        fogCtx.globalCompositeOperation = 'destination-out';
        fogCtx.beginPath();
        fogCtx.arc(centerX, centerY, 50 + (intensity * 80), 0, Math.PI * 2);
        fogCtx.fill();
        
        playSymphony(centerX, canvas.width, intensity);

        const gx = Math.floor((centerX / canvas.width) * 10);
        const gy = Math.floor((centerY / canvas.height) * 10);
        const gridIdx = Math.max(0, Math.min(99, gy * 10 + gx));
        
        setGrid(prev => {
          if (prev[gridIdx]) return prev;
          const newGrid = [...prev];
          newGrid[gridIdx] = true;
          const newProgress = (newGrid.filter(v => v).length / 100) * 100;
          setProgress(newProgress);
          if (newProgress >= 80 && !celebrating) handleWin();
          return newGrid;
        });
      }
    }
    lastFrameRef.current = currentFrame;
    requestRef.current = requestAnimationFrame(processFrame);
  }, [isPlaying, initFog, celebrating]);

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

  const startCamera = async () => {
    initAudio();
    setErrorMessage(null);
    setStatus("1. Checando suporte...");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Câmera não suportada neste dispositivo.");
      }
      setStatus("2. Pedindo acesso...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 } },
        audio: false
      });
      streamRef.current = stream;
      setStatus("3. Injetando vídeo...");
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            setIsCameraReady(true);
            setIsPlaying(true);
            setStatus("PRONTO!");
          }).catch(e => setErrorMessage("Erro no Play: " + e.message));
        };
      }
    } catch (err: any) {
      console.error("Erro na Câmera:", err);
      setErrorMessage(err.name === 'NotAllowedError' ? "Acesso Negado. Libere a câmera." : `Erro: ${err.message}`);
    }
  };

  useEffect(() => {
    if (isPlaying && isCameraReady) processFrame();
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isPlaying, isCameraReady, processFrame]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full bg-slate-900 relative overflow-hidden">
      <AnimatePresence>
        {!isCameraReady && !celebrating && (
          <motion.div exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 bg-slate-900/90 backdrop-blur-sm">
             <div className="bg-white p-12 rounded-[4rem] text-center space-y-8 shadow-2xl border-b-8 border-slate-200 max-w-sm">
                <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto">
                   {errorMessage ? <AlertCircle className="w-12 h-12 text-red-500" /> : <Camera className="w-12 h-12 text-primary animate-pulse" />}
                </div>
                <div>
                   <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Espelho Mágico</h2>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{errorMessage || status}</p>
                </div>
                <Button onClick={startCamera} className="w-full h-20 bg-primary text-white font-black rounded-full uppercase text-lg shadow-xl border-b-8 border-primary/70 active:border-b-0 active:translate-y-2 transition-all">
                  Ligar Espelho
                </Button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex-1 bg-black">
        <video ref={videoRef} autoPlay playsInline muted className="hidden" />
        <div className="absolute inset-0">
           <video 
             autoPlay playsInline muted 
             className="w-full h-full object-cover scale-x-[-1]"
             ref={(el) => { if(el && videoRef.current) el.srcObject = videoRef.current.srcObject; }}
           />
        </div>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-0 pointer-events-none" />
        <canvas ref={fogCanvasRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1] z-20 pointer-events-none" />
        
        {isCameraReady && (
          <div className="absolute top-0 inset-x-0 z-30 p-8 pointer-events-none flex flex-col gap-6">
             <div className="flex justify-between items-center">
                <div className="bg-black/60 backdrop-blur-xl px-6 py-3 rounded-[1.5rem] border border-white/20 text-white flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest italic">Limpa-Vidros</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                   <Volume2 className="w-5 h-5 text-white" />
                </div>
             </div>
             <div className="space-y-2">
               <div className="flex justify-between text-[10px] font-black uppercase text-white drop-shadow-lg px-2">
                  <span>Revelação</span>
                  <span>{Math.floor(progress)}%</span>
               </div>
               <Progress value={progress} className="h-4 bg-white/20 border border-white/10" />
             </div>
          </div>
        )}

        <div className="absolute bottom-12 inset-x-0 z-30 flex justify-center">
           {isPlaying && (
             <Button onClick={() => initFog()} variant="secondary" className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-xl border-2 border-white/40 text-white">
                <Eraser className="w-8 h-8" />
             </Button>
           )}
        </div>
      </div>

      <AnimatePresence>
        {celebrating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-primary/95 flex flex-col items-center justify-center text-white p-12 text-center">
            <Trophy className="w-56 h-56 text-yellow-400 mb-8" />
            <h2 className="text-6xl font-black uppercase italic mb-12">VAI!</h2>
            <div className="bg-white/20 p-8 rounded-[3rem] mb-12">
               <span className="text-5xl font-black">+50 LC</span>
            </div>
            <Button onClick={() => router.push('/dashboard')} className="h-24 px-16 rounded-[3rem] bg-white text-primary font-black uppercase text-xl shadow-2xl">
              Coletar Prêmios
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
