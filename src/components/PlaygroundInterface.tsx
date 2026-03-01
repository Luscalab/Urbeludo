
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
  Volume2,
  AlertCircle,
  Camera,
  Play,
  ArrowLeft
} from 'lucide-react';

import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export function PlaygroundInterface({ debugMode = false }: { debugMode?: boolean }) {
  const router = useRouter();
  const { user } = useUser();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fogCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastFrameRef = useRef<ImageData | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastBeepTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [status, setStatus] = useState("Aguardando ignição...");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [grid, setGrid] = useState<boolean[]>(new Array(100).fill(false));

  const userProgressRef = useMemoFirebase(() => user ? { id: user.uid, path: `user_progress/${user.uid}` } : null, [user]);
  const { data: profile } = useDoc(userProgressRef);
  const auraColor = profile?.dominantColor || '#9333ea';

  // Limpeza ao sair
  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const initAudio = () => {
    if (!audioContextRef.current) {
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
      if (AudioCtx) audioContextRef.current = new AudioCtx();
    }
    if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
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
      let motionSumX = 0, motionSumY = 0, motionCount = 0;
      for (let i = 0; i < currentFrame.data.length; i += 200) { 
        const diff = Math.abs(currentFrame.data[i] - lastFrameRef.current.data[i]) +
                     Math.abs(currentFrame.data[i+1] - lastFrameRef.current.data[i+1]) +
                     Math.abs(currentFrame.data[i+2] - lastFrameRef.current.data[i+2]);
        if (diff > 100) {
          const px = i / 4;
          motionSumX += px % canvas.width;
          motionSumY += Math.floor(px / canvas.width);
          motionCount++;
        }
      }

      if (motionCount > 50) {
        const cX = motionSumX / motionCount, cY = motionSumY / motionCount;
        const intensity = motionCount / (canvas.width * canvas.height / 800);
        fogCtx.globalCompositeOperation = 'destination-out';
        fogCtx.beginPath();
        fogCtx.arc(cX, cY, 50 + (intensity * 80), 0, Math.PI * 2);
        fogCtx.fill();
        playSymphony(cX, canvas.width, intensity);

        const gx = Math.floor((cX / canvas.width) * 10), gy = Math.floor((cY / canvas.height) * 10);
        const gIdx = Math.max(0, Math.min(99, gy * 10 + gx));
        setGrid(prev => {
          if (prev[gIdx]) return prev;
          const newGrid = [...prev];
          newGrid[gIdx] = true;
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
      if (!navigator.mediaDevices) throw new Error("Câmera não suportada.");
      setStatus("2. Pedindo acesso...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 } },
        audio: false
      });
      streamRef.current = stream;
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
      setErrorMessage(err.message);
    }
  };

  useEffect(() => {
    if (isPlaying && isCameraReady) processFrame();
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isPlaying, isCameraReady, processFrame]);

  return (
    <div className="flex flex-col h-full bg-slate-900 relative overflow-hidden">
      <AnimatePresence>
        {!isCameraReady && !celebrating && (
          <motion.div exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 bg-slate-900/95 backdrop-blur-md">
             <div className="bg-white p-10 rounded-[3.5rem] text-center space-y-8 shadow-2xl border-b-8 border-slate-200 max-w-sm">
                <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto">
                   {errorMessage ? <AlertCircle className="w-10 h-10 text-red-500" /> : <Camera className="w-10 h-10 text-primary animate-pulse" />}
                </div>
                <div className="space-y-2">
                   <h2 className="text-2xl font-black uppercase italic tracking-tighter">Espelho Mágico</h2>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{errorMessage || status}</p>
                </div>
                <Button onClick={startCamera} className="w-full h-16 bg-primary text-white font-black rounded-full uppercase shadow-xl border-b-4 border-primary/70 active:border-b-0 active:translate-y-1 transition-all">
                  Ligar Espelho
                </Button>
                <Link href="/dashboard" className="block text-[9px] font-black uppercase text-muted-foreground hover:text-primary">Voltar ao Perfil</Link>
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
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full scale-x-[-1] opacity-0 pointer-events-none" />
        <canvas ref={fogCanvasRef} className="absolute inset-0 w-full h-full scale-x-[-1] z-20 pointer-events-none" />
        
        {isCameraReady && (
          <div className="absolute top-0 inset-x-0 z-30 p-8 pointer-events-none flex flex-col gap-4">
             <div className="flex justify-between items-center">
                <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/20 text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-[9px] font-black uppercase italic">Limpa-Vidros</span>
                </div>
                <Button onClick={() => initFog()} variant="secondary" className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 pointer-events-auto">
                   <Eraser className="w-4 h-4 text-white" />
                </Button>
             </div>
             <Progress value={progress} className="h-3 bg-white/20 border border-white/10" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {celebrating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-primary/95 flex flex-col items-center justify-center text-white p-12 text-center">
            <Trophy className="w-40 h-40 text-yellow-400 mb-8" />
            <h2 className="text-5xl font-black uppercase italic mb-8">BRILHANTE!</h2>
            <div className="bg-white/20 p-6 rounded-[2.5rem] mb-10">
               <span className="text-4xl font-black text-white">+50 LC</span>
            </div>
            <Button onClick={() => router.push('/dashboard')} className="h-16 px-12 rounded-full bg-white text-primary font-black uppercase shadow-2xl">
              Coletar Prêmios
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import Link from 'next/link';
