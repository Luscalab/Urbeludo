
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
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
  Volume2
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
  
  const userProgressRef = useMemoFirebase(() => user ? { id: user.uid, path: `user_progress/${user.uid}` } : null, [user]);
  const { data: profile } = useDoc(userProgressRef);
  const auraColor = profile?.dominantColor || '#9333ea';

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleWin = useCallback((reward: number = 30, type: string = 'Desafio Concluído') => {
    if (isWin) return;
    setIsWin(true);
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
        history: newHistory
      });
    }
  }, [isWin, userProgressRef, profile, t]);

  if (isWin) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-primary/95 flex flex-col items-center justify-center text-white p-12 text-center">
        <AccessibilityToolbar />
        <Trophy className="w-40 h-40 text-yellow-400 mb-8" />
        <h2 className="text-5xl font-black uppercase italic mb-8">{t('playground.winTitle')}</h2>
        <div className="bg-white/20 p-6 rounded-[2.5rem] mb-10">
           <span className="text-4xl font-black text-white">+50 LC</span>
        </div>
        <Button onClick={() => router.push('/dashboard')} className="h-16 px-12 rounded-full bg-white text-primary font-black uppercase shadow-2xl">
          {t('playground.collectCoins')}
        </Button>
      </motion.div>
    );
  }

  if (gameMode === 'select') {
    return (
      <div className="flex-1 bg-slate-900 p-8 flex flex-col items-center justify-center gap-8 relative">
        <AccessibilityToolbar />
        <div className="text-center space-y-2">
           <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">{t('playground.selectGame')}</h2>
           <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">3 Modos de Ação Psicomotora</p>
        </div>

        <div className="grid gap-4 w-full max-w-sm">
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
        
        <Link href="/dashboard" className="text-[9px] font-black uppercase text-white/40 hover:text-white transition-colors">{t('common.back')}</Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden">
      <AccessibilityToolbar />
      <header className="absolute top-0 inset-x-0 p-6 flex items-center justify-between z-50">
        <Button variant="ghost" size="icon" onClick={() => setGameMode('select')} className="text-white/40">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="bg-black/40 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 text-white flex items-center gap-2">
           <Sparkles className="w-3 h-3 text-primary" />
           <span className="text-[9px] font-black uppercase tracking-widest">
             {t(`playground.modes.${gameMode}.title`)}
           </span>
        </div>
        <div className="w-10" />
      </header>

      {gameMode === 'balance' && <BalanceGame onWin={() => handleWin(50, 'Mestre do Equilíbrio')} auraColor={auraColor} />}
      {gameMode === 'rhythm' && <RhythmGame onWin={() => handleWin(50, 'Maestro de Auras')} auraColor={auraColor} />}
      {gameMode === 'path' && <PathGame onWin={() => handleWin(50, 'Caminho de Luz')} auraColor={auraColor} />}
    </div>
  );
}

function GameModeCard({ icon, title, desc, color, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="p-6 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center gap-6 text-left hover:bg-white/10 transition-all active:scale-95 group"
    >
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-black uppercase italic tracking-tighter text-white leading-tight">{title}</h3>
        <p className="text-[9px] text-white/40 font-bold uppercase leading-relaxed">{desc}</p>
      </div>
    </button>
  );
}

// --- JOGO 1: EQUILIBRISTA ---
function BalanceGame({ onWin, auraColor }: any) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(false);

  const requestSensors = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      const res = await (DeviceOrientationEvent as any).requestPermission();
      if (res === 'granted') start();
    } else {
      start();
    }
  };

  const start = () => {
    setActive(true);
    window.addEventListener('deviceorientation', (e) => {
      setTilt({ x: e.gamma || 0, y: (e.beta || 45) - 45 });
    });
  };

  useEffect(() => {
    if (!active) return;
    const distance = Math.sqrt(tilt.x * tilt.x + tilt.y * tilt.y);
    const isCentered = distance < 8;

    if (isCentered) {
      const timer = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(timer);
            onWin();
            return 100;
          }
          return p + 2;
        });
      }, 100);
      return () => clearInterval(timer);
    } else {
      setProgress(0);
    }
  }, [tilt, active, onWin]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-900 relative">
      {!active ? (
        <Button onClick={requestSensors} className="h-20 px-12 rounded-full bg-primary font-black uppercase shadow-2xl">Ativar Sensores</Button>
      ) : (
        <>
          <div className="absolute top-24 w-full max-w-xs px-12 space-y-2">
            <Progress value={progress} className="h-3 bg-white/10" />
            <p className="text-center text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">Estabilize no Centro</p>
          </div>
          <div className="relative w-72 h-72 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-dashed border-white/20 rounded-full animate-spin-slow" />
            <div className={`absolute w-32 h-32 border-4 border-white/40 rounded-full transition-all ${progress > 0 ? 'scale-110 border-primary' : ''}`} />
            <motion.div 
              animate={{ x: tilt.x * 5, y: tilt.y * 5, scale: progress > 0 ? 1.2 : 1 }}
              className="w-16 h-16 rounded-full border-4 border-white shadow-2xl z-20"
              style={{ backgroundColor: auraColor }}
            />
          </div>
        </>
      )}
    </div>
  );
}

// --- JOGO 2: MAESTRO (RITMO) ---
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
    
    const rhythmInterval = setInterval(() => {
      setBeat(true);
      setTimeout(() => setBeat(false), 200);
    }, 1000);

    const handleMotion = (e: any) => {
      const acc = e.accelerationIncludingGravity;
      const totalAcc = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);
      
      if (totalAcc > 25 && Date.now() - lastShakeRef.current > 400) {
        lastShakeRef.current = Date.now();
        checkRhythm();
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => {
      clearInterval(rhythmInterval);
      window.removeEventListener('devicemotion', handleMotion);
    };
  };

  const checkRhythm = () => {
    setScore(s => {
      if (s >= 15) {
        onWin();
        return 15;
      }
      return s + 1;
    });
    setFeedback('PÁ!');
    setTimeout(() => setFeedback(''), 500);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-900 gap-12">
      {!active ? (
        <Button onClick={start} className="h-20 px-12 rounded-full bg-primary font-black uppercase shadow-2xl">Reger Orquestra</Button>
      ) : (
        <>
          <div className="text-center space-y-4">
             <div className="text-4xl font-black italic text-white/20 uppercase tracking-tighter">Siga a Batida</div>
             <div className="flex justify-center gap-4">
               {[...Array(5)].map((_, i) => (
                 <motion.div 
                   key={i}
                   animate={{ scale: beat ? 1.5 : 1, opacity: beat ? 1 : 0.3 }}
                   className="w-3 h-3 rounded-full bg-primary"
                 />
               ))}
             </div>
          </div>

          <div className="relative w-64 h-64 flex items-center justify-center">
             <AnimatePresence>
               {beat && (
                 <motion.div 
                   initial={{ scale: 0.8, opacity: 0 }}
                   animate={{ scale: 1.2, opacity: 0.2 }}
                   exit={{ opacity: 0 }}
                   className="absolute inset-0 bg-primary rounded-full"
                 />
               )}
             </AnimatePresence>
             
             <motion.div 
               animate={{ scale: beat ? 1.1 : 1 }}
               className="w-48 h-48 rounded-[3rem] border-8 border-white/10 flex flex-col items-center justify-center gap-2"
               style={{ backgroundColor: `${auraColor}20` }}
             >
                <Music className={`w-12 h-12 ${beat ? 'text-primary' : 'text-white/20'}`} />
                <div className="text-xl font-black text-white">{score}/15</div>
             </motion.div>

             <AnimatePresence>
                {feedback && (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 2, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute font-black text-6xl italic text-primary pointer-events-none"
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

// --- JOGO 3: CAMINHO (FINA) ---
function PathGame({ onWin, auraColor }: any) {
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouch = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touchY = e.touches[0].clientY - rect.top;
    const height = rect.height;
    
    const percent = Math.min(100, Math.max(0, 100 - (touchY / height) * 100));
    
    if (percent > progress && percent < progress + 15) {
       setIsDragging(true);
       setProgress(percent);
       if (percent >= 98) onWin();
    } else if (percent < progress - 5) {
       setProgress(Math.max(0, percent));
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-black gap-12">
      <div className="text-center space-y-1">
         <h2 className="text-xl font-black uppercase italic text-white tracking-tighter">Caminho de Luz</h2>
         <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Arraste a Aura até o topo</p>
      </div>

      <div 
        ref={containerRef}
        onTouchMove={handleTouch}
        onTouchEnd={() => setIsDragging(false)}
        className="relative w-32 h-[450px] bg-white/5 rounded-full border-4 border-white/10 overflow-hidden"
      >
        <div 
          className="absolute bottom-0 w-full transition-all duration-300 rounded-full opacity-40 blur-xl"
          style={{ height: `${progress}%`, backgroundColor: auraColor }}
        />
        
        <div className="absolute inset-x-0 h-full flex justify-center">
           <div className="w-1 h-full bg-white/10 border-dashed border-l" />
        </div>

        <motion.div 
          animate={{ bottom: `${progress}%`, scale: isDragging ? 1.2 : 1 }}
          className="absolute left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-4 border-white shadow-2xl flex items-center justify-center z-50 touch-none"
          style={{ backgroundColor: auraColor, marginBottom: '-32px' }}
        >
          <Fingerprint className="w-8 h-8 text-white/40" />
        </motion.div>
      </div>
    </div>
  );
}
