'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles,
  Trophy,
  ArrowLeft,
  Move,
  Music,
  Fingerprint,
  CheckCircle2,
  Volume2,
  Zap
} from 'lucide-react';

import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useI18n } from '@/components/I18nProvider';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';

type GameMode = 'select' | 'balance' | 'rhythm' | 'path';

export function PlaygroundInterface({ debugMode = false }: { debugMode?: boolean }) {
  const router = useRouter();
  const { user } = useUser();
  const { t } = useI18n();
  
  const [gameMode, setGameMode] = useState<GameMode>('select');
  const [isWin, setIsWin] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  
  const userProgressRef = useMemoFirebase(() => user ? { id: user.uid, path: `user_progress/${user.uid}` } : null, [user]);
  const { data: profile } = useDoc(userProgressRef);
  const auraColor = profile?.dominantColor || '#9333ea';

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleWin = useCallback((reward: number = 30, type: string = 'Desafio Concluído') => {
    if (isWin) return;
    setIsWin(true);
    setRewardAmount(reward);
    speak(t('playground.winTitle'));
    
    if (userProgressRef && profile) {
      const newHistory = [{
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        score: 100,
        earnedCoins: reward,
        type: type
      }, ...(profile.history || [])].slice(0, 5);
      
      updateDocumentNonBlocking(userProgressRef, { 
        ludoCoins: (profile.ludoCoins || 0) + reward,
        totalChallengesCompleted: (profile.totalChallengesCompleted || 0) + 1,
        history: newHistory,
        psychomotorLevel: Math.floor((profile.totalChallengesCompleted + 1) / 5) + 1
      });
    }
  }, [isWin, userProgressRef, profile, t]);

  if (isWin) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="fixed inset-0 z-[100] bg-primary flex flex-col items-center justify-center text-white p-12 text-center"
      >
        <Trophy className="w-40 h-40 text-yellow-400 mb-8 animate-bounce" />
        <h2 className="text-5xl font-black uppercase italic mb-8">{t('playground.winTitle')}</h2>
        <div className="bg-white/20 p-8 rounded-[3rem] mb-10 border-4 border-white/30">
           <span className="text-6xl font-black text-white">+{rewardAmount} LC</span>
        </div>
        <Button 
          onClick={() => router.push('/dashboard')} 
          className="h-20 px-16 rounded-full bg-white text-primary font-black uppercase shadow-[0_20px_0_rgba(255,255,255,0.3)] active:translate-y-2 active:shadow-none transition-all text-xl"
        >
          {t('playground.collectCoins')}
        </Button>
      </motion.div>
    );
  }

  if (gameMode === 'select') {
    return (
      <div className="flex-1 bg-slate-900 p-8 flex flex-col items-center justify-center gap-10 relative">
        <AccessibilityToolbar />
        <div className="text-center space-y-4">
           <div className="p-4 bg-primary/20 rounded-[2rem] inline-block mb-2">
             <UrbeLudoLogo className="w-16 h-16 text-primary" />
           </div>
           <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">{t('playground.selectGame')}</h2>
           <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Laboratório Psicomotor Offline</p>
        </div>

        <div className="grid gap-6 w-full max-w-sm">
          <GameModeCard 
            icon={<Move className="w-8 h-8" />}
            title={t('playground.modes.balance.title')}
            desc={t('playground.modes.balance.desc')}
            color="bg-blue-500"
            onClick={() => {
              setGameMode('balance');
              speak(t('playground.modes.balance.title') + ". " + t('playground.modes.balance.desc'));
            }}
          />
          <GameModeCard 
            icon={<Music className="w-8 h-8" />}
            title={t('playground.modes.rhythm.title')}
            desc={t('playground.modes.rhythm.desc')}
            color="bg-primary"
            onClick={() => {
              setGameMode('rhythm');
              speak(t('playground.modes.rhythm.title') + ". " + t('playground.modes.rhythm.desc'));
            }}
          />
          <GameModeCard 
            icon={<Fingerprint className="w-8 h-8" />}
            title={t('playground.modes.path.title')}
            desc={t('playground.modes.path.desc')}
            color="bg-accent"
            onClick={() => {
              setGameMode('path');
              speak(t('playground.modes.path.title') + ". " + t('playground.modes.path.desc'));
            }}
          />
        </div>
        
        <Link href="/dashboard" className="text-[10px] font-black uppercase text-white/30 hover:text-white transition-colors tracking-widest">{t('common.back')}</Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden">
      <AccessibilityToolbar />
      <header className="absolute top-0 inset-x-0 p-8 flex items-center justify-between z-50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setGameMode('select')} 
          className="text-white/40 hover:text-white bg-white/5 rounded-2xl"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="bg-black/40 backdrop-blur-2xl px-6 py-2 rounded-full border border-white/10 text-white flex items-center gap-3">
           <Zap className="w-4 h-4 text-yellow-400" />
           <span className="text-[10px] font-black uppercase tracking-widest">
             {t(`playground.modes.${gameMode}.title`)}
           </span>
        </div>
        <div className="w-10" />
      </header>

      <AnimatePresence mode="wait">
        {gameMode === 'balance' && <BalanceGame key="balance" onWin={() => handleWin(50, 'Mestre do Equilíbrio')} auraColor={auraColor} />}
        {gameMode === 'rhythm' && <RhythmGame key="rhythm" onWin={() => handleWin(50, 'Maestro de Auras')} auraColor={auraColor} />}
        {gameMode === 'path' && <PathGame key="path" onWin={() => handleWin(50, 'Caminho de Luz')} auraColor={auraColor} />}
      </AnimatePresence>
    </div>
  );
}

function GameModeCard({ icon, title, desc, color, onClick }: any) {
  return (
    <motion.button 
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="p-6 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center gap-6 text-left group transition-colors hover:bg-white/10"
    >
      <div className={`w-16 h-16 rounded-[1.5rem] ${color} flex items-center justify-center text-white shadow-2xl group-hover:rotate-6 transition-transform`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-black uppercase italic tracking-tighter text-white leading-tight">{title}</h3>
        <p className="text-[9px] text-white/40 font-bold uppercase leading-relaxed mt-1">{desc}</p>
      </div>
    </motion.button>
  );
}

// --- JOGO 1: EQUILIBRISTA (REFORÇADO) ---
function BalanceGame({ onWin, auraColor }: any) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const start = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      const res = await (DeviceOrientationEvent as any).requestPermission();
      if (res === 'granted') {
        setActive(true);
      }
    } else {
      setActive(true);
    }
  };

  useEffect(() => {
    if (!active) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // Gamma: Esquerda/Direita (-90 a 90)
      // Beta: Frente/Trás (-180 a 180)
      setTilt({ x: e.gamma || 0, y: (e.beta || 0) - 45 });
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    
    const distance = Math.sqrt(tilt.x * tilt.x + tilt.y * tilt.y);
    const isCentered = distance < 10;

    let timer: NodeJS.Timeout;
    if (isCentered) {
      timer = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(timer);
            onWin();
            return 100;
          }
          return p + 2;
        });
      }, 100);
    } else {
      setProgress(0);
    }
    
    return () => clearInterval(timer);
  }, [tilt, active, onWin]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-900 relative">
      {!active ? (
        <div className="text-center space-y-8">
           <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-primary/30 animate-spin-slow">
             <Move className="w-12 h-12 text-primary" />
           </div>
           <Button onClick={start} className="h-20 px-16 rounded-full bg-primary font-black uppercase shadow-2xl text-lg">Ativar Gravidade</Button>
        </div>
      ) : (
        <>
          <div className="absolute top-32 w-full max-w-xs px-12 space-y-4">
            <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/5">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${progress}%` }}
                 className="h-full bg-primary shadow-[0_0_20px_rgba(147,51,234,0.5)]"
               />
            </div>
            <p className="text-center text-[9px] font-black text-white/40 uppercase tracking-[0.4em] animate-pulse">Equilibre no Centro</p>
          </div>
          
          <div className="relative w-80 h-80 flex items-center justify-center">
            {/* Alvos visuais */}
            <div className="absolute inset-0 border-4 border-dashed border-white/10 rounded-full animate-spin-slow opacity-20" />
            <div className={`absolute w-40 h-40 border-4 border-white/20 rounded-full transition-all duration-300 ${progress > 0 ? 'scale-110 border-primary shadow-[0_0_40px_rgba(147,51,234,0.2)]' : ''}`} />
            <div className="absolute w-12 h-12 border-2 border-white/40 rounded-full" />
            
            <motion.div 
              animate={{ 
                x: tilt.x * 4, 
                y: tilt.y * 4,
                scale: progress > 0 ? 1.3 : 1,
              }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="w-20 h-20 rounded-full border-4 border-white shadow-[0_20px_40px_rgba(0,0,0,0.5)] z-20 relative"
              style={{ backgroundColor: auraColor }}
            >
               <div className="absolute inset-2 rounded-full bg-white/20 blur-sm" />
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}

// --- JOGO 2: MAESTRO (REFATORADO) ---
function RhythmGame({ onWin, auraColor }: any) {
  const [active, setActive] = useState(false);
  const [beat, setBeat] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const lastShakeRef = useRef(0);

  const start = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      const res = await (DeviceMotionEvent as any).requestPermission();
      if (res !== 'granted') return;
    }
    setActive(true);
  };

  useEffect(() => {
    if (!active) return;

    const rhythmInterval = setInterval(() => {
      setBeat(true);
      setTimeout(() => setBeat(false), 300);
    }, 1200);

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const totalAcc = Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs(acc.z || 0);
      
      // Detecção de pico de aceleração (Tonicidade)
      if (totalAcc > 28 && Date.now() - lastShakeRef.current > 500) {
        lastShakeRef.current = Date.now();
        if (beat) {
          checkRhythm(true);
        } else {
          checkRhythm(false);
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => {
      clearInterval(rhythmInterval);
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [active, beat]);

  const checkRhythm = (onTime: boolean) => {
    if (onTime) {
      setScore(s => {
        if (s >= 14) {
          onWin();
          return 15;
        }
        return s + 1;
      });
      setFeedback('PÁ!');
    } else {
      setFeedback('OPS!');
    }
    setTimeout(() => setFeedback(''), 400);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-900 gap-16">
      {!active ? (
        <div className="text-center space-y-8">
           <div className="w-32 h-32 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
             <Music className="w-12 h-12 text-accent" />
           </div>
           <Button onClick={start} className="h-20 px-16 rounded-full bg-accent text-white font-black uppercase shadow-2xl text-lg">Reger Orquestra</Button>
        </div>
      ) : (
        <>
          <div className="text-center space-y-6">
             <div className="text-3xl font-black italic text-white/20 uppercase tracking-tighter">Sincronize o Movimento</div>
             <div className="flex justify-center gap-6">
               {[...Array(5)].map((_, i) => (
                 <motion.div 
                   key={i}
                   animate={{ scale: beat ? 1.6 : 1, opacity: beat ? 1 : 0.2 }}
                   className="w-4 h-4 rounded-full bg-accent"
                 />
               ))}
             </div>
          </div>

          <div className="relative w-72 h-72 flex items-center justify-center">
             <AnimatePresence>
               {beat && (
                 <motion.div 
                   initial={{ scale: 0.8, opacity: 0 }}
                   animate={{ scale: 1.4, opacity: 0.1 }}
                   exit={{ opacity: 0 }}
                   className="absolute inset-0 bg-accent rounded-full"
                 />
               )}
             </AnimatePresence>
             
             <motion.div 
               animate={{ scale: beat ? 1.15 : 1, rotate: beat ? 5 : 0 }}
               className="w-56 h-56 rounded-[3.5rem] border-8 border-white/10 flex flex-col items-center justify-center gap-4 bg-white/5 shadow-2xl"
             >
                <Music className={`w-16 h-16 ${beat ? 'text-accent' : 'text-white/10'}`} />
                <div className="text-3xl font-black text-white">{score}/15</div>
             </motion.div>

             <AnimatePresence>
                {feedback && (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0, y: 0 }}
                    animate={{ scale: 2.5, opacity: 1, y: -100 }}
                    exit={{ opacity: 0 }}
                    className={`absolute font-black text-6xl italic ${feedback === 'PÁ!' ? 'text-accent' : 'text-red-500'} pointer-events-none`}
                  >
                    {feedback}
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}

// --- JOGO 3: CAMINHO (FINA REFORÇADA) ---
function PathGame({ onWin, auraColor }: any) {
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouch = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touchY = e.touches[0].clientY - rect.top;
    const height = rect.height;
    
    // Inverte o cálculo: de baixo para cima
    const rawPercent = 100 - (touchY / height) * 100;
    const percent = Math.min(100, Math.max(0, rawPercent));
    
    // Exige continuidade: o novo ponto deve estar perto do progresso atual
    if (percent > progress && percent < progress + 15) {
       setIsDragging(true);
       setProgress(percent);
       if (percent >= 98) onWin();
    } else if (percent < progress - 5) {
       // Permite voltar, mas não saltar
       setProgress(Math.max(0, percent));
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-black gap-12">
      <div className="text-center space-y-2">
         <h2 className="text-2xl font-black uppercase italic text-white tracking-tighter">Caminho de Luz</h2>
         <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Arraste com Precisão</p>
      </div>

      <div 
        ref={containerRef}
        onTouchMove={handleTouch}
        onTouchEnd={() => setIsDragging(false)}
        className="relative w-40 h-[500px] bg-white/5 rounded-full border-4 border-white/10 overflow-hidden shadow-inner"
      >
        {/* Glow de Progresso */}
        <div 
          className="absolute bottom-0 w-full transition-all duration-300 rounded-full opacity-30 blur-2xl"
          style={{ height: `${progress}%`, backgroundColor: auraColor }}
        />
        
        {/* Trilho Central */}
        <div className="absolute inset-x-0 h-full flex justify-center">
           <div className="w-1.5 h-full bg-white/5 border-dashed border-l-2 border-white/10" />
        </div>

        {/* Aura do Jogador */}
        <motion.div 
          animate={{ 
            bottom: `${progress}%`, 
            scale: isDragging ? 1.3 : 1,
            boxShadow: isDragging ? `0 0 50px ${auraColor}` : `0 10px 30px rgba(0,0,0,0.5)`
          }}
          className="absolute left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 border-white flex items-center justify-center z-50 touch-none cursor-pointer"
          style={{ backgroundColor: auraColor, marginBottom: '-40px' }}
        >
          <Fingerprint className="w-10 h-10 text-white/40" />
          <div className="absolute inset-1 rounded-full border-2 border-white/20 animate-pulse" />
        </motion.div>

        {/* Meta */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/20">
           <Trophy className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
}

function UrbeLudoLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="48" fill="white" fillOpacity="0.05" stroke="currentColor" strokeWidth="2" />
      <path d="M50 20 L50 80 M20 50 L80 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      <circle cx="50" cy="50" r="10" fill="currentColor" />
      <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
    </svg>
  );
}
