
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles,
  Trophy,
  AlertCircle,
  Play,
  ArrowLeft,
  Move,
  CheckCircle2,
  Activity
} from 'lucide-react';

import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useI18n } from '@/components/I18nProvider';

export function PlaygroundInterface({ debugMode = false }: { debugMode?: boolean }) {
  const router = useRouter();
  const { user } = useUser();
  const { t } = useI18n();
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  const [status, setStatus] = useState(t('playground.waitingStart') || "Inicie o Equilíbrio");
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isWin, setIsWin] = useState(false);
  
  // Posição da Aura (em graus de inclinação)
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [timerProgress, setTimerProgress] = useState(0);
  const [isCentering, setIsCentering] = useState(false);

  const userProgressRef = useMemoFirebase(() => user ? { id: user.uid, path: `user_progress/${user.uid}` } : null, [user]);
  const { data: profile } = useDoc(userProgressRef);
  const auraColor = profile?.dominantColor || '#9333ea';

  // Inicializa o Áudio
  const initAudio = () => {
    if (!audioContextRef.current) {
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
        oscillatorRef.current = audioContextRef.current.createOscillator();
        gainNodeRef.current = audioContextRef.current.createGain();
        
        oscillatorRef.current.type = 'sine';
        gainNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
        
        oscillatorRef.current.connect(gainNodeRef.current);
        gainNodeRef.current.connect(audioContextRef.current.destination);
        oscillatorRef.current.start();
      }
    }
    if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
  };

  const updateAudioFeedback = (distance: number) => {
    if (!audioContextRef.current || !oscillatorRef.current || !gainNodeRef.current) return;
    const now = audioContextRef.current.currentTime;
    
    // Frequência harmônica no centro (440Hz), dissonante nas bordas (200Hz)
    const freq = Math.max(200, 440 - (distance * 4));
    oscillatorRef.current.frequency.setTargetAtTime(freq, now, 0.1);
    
    // Volume aumenta conforme se afasta do centro para gerar "tensão"
    const volume = Math.min(0.1, distance / 500);
    gainNodeRef.current.gain.setTargetAtTime(volume, now, 0.1);
  };

  const handleWin = useCallback(() => {
    if (isWin) return;
    setIsWin(true);
    
    // Para o som
    if (gainNodeRef.current) gainNodeRef.current.gain.setTargetAtTime(0, 0, 0.1);

    if (userProgressRef && profile) {
      const earnedCoins = 30;
      const newHistory = [{
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        score: 100,
        earnedCoins: earnedCoins,
        type: 'Mestre do Equilíbrio'
      }, ...(profile.history || [])].slice(0, 5);
      
      updateDocumentNonBlocking(userProgressRef, { 
        ludoCoins: (profile.ludoCoins || 0) + earnedCoins,
        totalChallengesCompleted: (profile.totalChallengesCompleted || 0) + 1,
        history: newHistory
      });
    }
  }, [isWin, userProgressRef, profile]);

  const requestPermission = async () => {
    initAudio();
    setErrorMessage(null);
    
    try {
      // iOS 13+ exige permissão explícita
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          startSensors();
        } else {
          setErrorMessage("Permissão negada para os sensores.");
        }
      } else {
        // Android e Browsers Desktop
        startSensors();
      }
    } catch (err: any) {
      setErrorMessage("Erro ao acessar sensores: " + err.message);
    }
  };

  const startSensors = () => {
    setPermissionGranted(true);
    window.addEventListener('deviceorientation', (e) => {
      // gamma: -90 a 90 (esquerda/direita)
      // beta: -180 a 180 (frente/trás)
      const x = e.gamma || 0;
      const y = e.beta || 0;
      setTilt({ x, y });
    });
  };

  // Loop do Jogo: Checa se está no centro
  useEffect(() => {
    if (!permissionGranted || isWin) return;

    const distance = Math.sqrt(tilt.x * tilt.x + (tilt.y - 45) * (tilt.y - 45)); // Alvo centralizado em 45 graus (confortável)
    updateAudioFeedback(distance);

    const isCentered = distance < 8; // Margem de erro do centro
    setIsCentering(isCentered);

    if (isCentered) {
      const interval = setInterval(() => {
        setTimerProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            handleWin();
            return 100;
          }
          return prev + 2; // ~5 segundos para completar
        });
      }, 100);
      return () => clearInterval(interval);
    } else {
      setTimerProgress(0);
    }
  }, [tilt, permissionGranted, isWin, handleWin]);

  // Limpeza
  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', () => {});
      if (oscillatorRef.current) oscillatorRef.current.stop();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-900 relative overflow-hidden">
      <AnimatePresence>
        {!permissionGranted && (
          <motion.div exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 bg-slate-900/95 backdrop-blur-md">
             <div className="bg-white p-10 rounded-[3.5rem] text-center space-y-8 shadow-2xl border-b-8 border-slate-200 max-w-sm">
                <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto">
                   {errorMessage ? <AlertCircle className="w-10 h-10 text-red-500" /> : <Activity className="w-10 h-10 text-primary animate-pulse" />}
                </div>
                <div className="space-y-2">
                   <h2 className="text-2xl font-black uppercase italic tracking-tighter">Mestre da Aura</h2>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                     {errorMessage || "Use seu corpo para equilibrar a esfera no centro do alvo."}
                   </p>
                </div>
                <Button onClick={requestPermission} className="w-full h-16 bg-primary text-white font-black rounded-full uppercase shadow-xl border-b-4 border-primary/70 active:border-b-0 active:translate-y-1 transition-all">
                  Ativar Sensores
                </Button>
                <Link href="/dashboard" className="block text-[9px] font-black uppercase text-muted-foreground hover:text-primary">Voltar ao Perfil</Link>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative flex-1 bg-mesh-game flex items-center justify-center p-12">
        {/* HUD de Progresso */}
        <div className="absolute top-12 inset-x-0 px-8 z-30 flex flex-col gap-4 items-center">
           <div className="bg-black/40 backdrop-blur-xl px-6 py-2 rounded-full border border-white/10 text-white flex items-center gap-3">
              <Move className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest">Equilibre a Aura</span>
           </div>
           <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-[8px] font-black text-white/60 uppercase tracking-widest">
                 <span>Estabilidade</span>
                 <span>{Math.floor(timerProgress)}%</span>
              </div>
              <Progress value={timerProgress} className="h-3 bg-white/10 border border-white/10" />
           </div>
        </div>

        {/* ALVO CENTRAL */}
        <div className="relative w-64 h-64 flex items-center justify-center">
           <div className={`absolute inset-0 rounded-full border-4 border-dashed border-white/20 animate-spin-slow`} />
           <div className={`absolute w-32 h-32 rounded-full border-4 border-white/40 transition-all duration-500 ${isCentering ? 'scale-110 border-primary shadow-[0_0_40px_rgba(147,51,234,0.4)]' : 'scale-100'}`} />
           
           {/* A AURA (ESFERA MOVÍVEL) */}
           <motion.div 
             animate={{ 
               x: tilt.x * 5, 
               y: (tilt.y - 45) * 5,
               scale: isCentering ? 1.2 : 1 
             }}
             transition={{ type: "spring", stiffness: 100, damping: 20 }}
             className="w-16 h-16 rounded-full shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden border-4 border-white z-20"
             style={{ backgroundColor: auraColor }}
           >
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent" />
             <Sparkles className="w-6 h-6 text-white/80 animate-pulse" />
           </motion.div>
        </div>

        {/* FEEDBACK DE INCLINAÇÃO DEBUG */}
        {debugMode && (
          <div className="absolute bottom-24 bg-black/80 text-white p-4 rounded-2xl font-mono text-[10px] space-y-1">
            <div>X (Gamma): {tilt.x.toFixed(2)}</div>
            <div>Y (Beta): {tilt.y.toFixed(2)}</div>
            <div>Centrado: {isCentering ? "SIM" : "NÃO"}</div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {isWin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-primary/95 flex flex-col items-center justify-center text-white p-12 text-center">
            <Trophy className="w-40 h-40 text-yellow-400 mb-8" />
            <h2 className="text-5xl font-black uppercase italic mb-8">EQUILÍBRIO PERFEITO!</h2>
            <div className="bg-white/20 p-6 rounded-[2.5rem] mb-10">
               <span className="text-4xl font-black text-white">+30 LC</span>
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
