
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Trophy,
  ArrowLeft,
  Move,
  Music,
  Fingerprint,
  Zap,
  Rocket,
  Hand,
  Radar,
  Wind,
  ArrowUp,
  Waves,
  ShieldCheck,
  Sparkles,
  Info,
  Play
} from 'lucide-react';

import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useI18n } from '@/components/I18nProvider';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { cn } from '@/lib/utils';

type GameMode = 'select' | 'balance' | 'rhythm' | 'path' | 'jump' | 'twister' | 'radar' | 'breath' | 'voice' | 'pitch';

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

  const vibrate = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const speak = useCallback((text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const handleWin = useCallback((reward: number = 30, type: string = 'Desafio Concluído') => {
    if (isWin) return;
    setIsWin(true);
    setRewardAmount(reward);
    vibrate([100, 50, 100]);
    speak(t('playground.winTitle'));
    
    if (userProgressRef && profile) {
      const history = profile.history || [];
      const newHistory = [{
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        score: 100,
        earnedCoins: reward,
        type: type
      }, ...history].slice(0, 5);
      
      updateDocumentNonBlocking(userProgressRef, { 
        ludoCoins: (profile.ludoCoins || 0) + reward,
        totalChallengesCompleted: (profile.totalChallengesCompleted || 0) + 1,
        history: newHistory,
        psychomotorLevel: Math.floor((profile.totalChallengesCompleted + 1) / 5) + 1
      });
    }
  }, [isWin, userProgressRef, profile, t, speak]);

  if (isWin) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center text-white p-12 text-center"
      >
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle at center, ${auraColor}, transparent)` }} />
        <Trophy className="w-40 h-40 text-yellow-400 mb-8 animate-bounce relative z-10" />
        <h2 className="text-5xl font-black uppercase italic mb-8 relative z-10">{t('playground.winTitle')}</h2>
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[3rem] mb-10 border-4 border-white/20 relative z-10">
           <span className="text-6xl font-black text-white">+{rewardAmount} LC</span>
        </div>
        <Button 
          onClick={() => router.push('/dashboard')} 
          className="h-20 px-16 rounded-full bg-primary text-white font-black uppercase shadow-[0_20px_0_rgba(147,51,234,0.3)] active:translate-y-2 active:shadow-none transition-all text-xl relative z-10"
        >
          {t('playground.collectCoins')}
        </Button>
      </motion.div>
    );
  }

  if (gameMode === 'select') {
    return (
      <div className="flex-1 bg-slate-900 p-8 flex flex-col items-center justify-start gap-10 relative overflow-y-auto no-scrollbar">
        <AccessibilityToolbar />
        
        <div className="text-center space-y-4 pt-4">
           <div className="flex items-center justify-center gap-2 mb-2">
             <div className="px-3 py-1 bg-primary/20 rounded-full border border-primary/30 flex items-center gap-2">
               <ShieldCheck className="w-3 h-3 text-primary" />
               <span className="text-[8px] font-black uppercase text-primary tracking-widest">Soberania de Dados: 100% Offline</span>
             </div>
           </div>
           <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">{t('playground.selectGame')}</h2>
           <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Laboratório Psicomotor de Precisão</p>
        </div>

        <div className="grid gap-4 w-full max-w-sm pb-10">
          <GameModeCard icon={<Move />} title={t('playground.modes.balance.title')} desc={t('playground.modes.balance.desc')} goal={t('playground.modes.balance.goal')} color="bg-blue-500" onClick={() => setGameMode('balance')} />
          <GameModeCard icon={<Music />} title={t('playground.modes.rhythm.title')} desc={t('playground.modes.rhythm.desc')} goal={t('playground.modes.rhythm.goal')} color="bg-primary" onClick={() => setGameMode('rhythm')} />
          <GameModeCard icon={<Fingerprint />} title={t('playground.modes.path.title')} desc={t('playground.modes.path.desc')} goal={t('playground.modes.path.goal')} color="bg-accent" onClick={() => setGameMode('path')} />
          <GameModeCard icon={<Rocket />} title={t('playground.modes.jump.title')} desc={t('playground.modes.jump.desc')} goal={t('playground.modes.jump.goal')} color="bg-orange-500" onClick={() => setGameMode('jump')} />
          <GameModeCard icon={<Hand />} title={t('playground.modes.twister.title')} desc={t('playground.modes.twister.desc')} goal={t('playground.modes.twister.goal')} color="bg-green-500" onClick={() => setGameMode('twister')} />
          <GameModeCard icon={<Radar />} title={t('playground.modes.radar.title')} desc={t('playground.modes.radar.desc')} goal={t('playground.modes.radar.goal')} color="bg-indigo-500" onClick={() => setGameMode('radar')} />
          
          <div className="w-full border-t border-white/10 pt-4 mt-2">
            <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em] mb-4 text-center">Fonoaudiologia e Respiração</p>
          </div>

          <GameModeCard icon={<Wind />} title={t('playground.modes.breath.title')} desc={t('playground.modes.breath.desc')} goal={t('playground.modes.breath.goal')} color="bg-teal-500" onClick={() => setGameMode('breath')} />
          <GameModeCard icon={<ArrowUp />} title={t('playground.modes.voice.title')} desc={t('playground.modes.voice.desc')} goal={t('playground.modes.voice.goal')} color="bg-pink-500" onClick={() => setGameMode('voice')} />
          <GameModeCard icon={<Waves />} title={t('playground.modes.pitch.title')} desc={t('playground.modes.pitch.desc')} goal={t('playground.modes.pitch.goal')} color="bg-cyan-500" onClick={() => setGameMode('pitch')} />
        </div>
        
        <Link href="/dashboard" className="text-[10px] font-black uppercase text-white/40 hover:text-white transition-colors tracking-widest mt-auto pb-4 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> {t('common.back')}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden">
      <AccessibilityToolbar />
      <header className="absolute top-0 inset-x-0 p-8 flex items-center justify-between z-50">
        <Button variant="ghost" size="icon" onClick={() => setGameMode('select')} className="text-white/40 hover:text-white bg-white/5 rounded-2xl">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="bg-black/60 backdrop-blur-2xl px-6 py-2 rounded-full border border-white/10 text-white flex flex-col items-center">
           <div className="flex items-center gap-2">
             <Sparkles className="w-3 h-3 text-yellow-400" />
             <span className="text-[10px] font-black uppercase tracking-widest">
               {t(`playground.modes.${gameMode}.title`)}
             </span>
           </div>
           <span className="text-[7px] font-bold text-white/40 uppercase tracking-widest mt-0.5">
             {t(`playground.modes.${gameMode}.goal`)}
           </span>
        </div>
        <div className="w-10" />
      </header>

      <AnimatePresence mode="wait">
        {gameMode === 'balance' && <BalanceGame key="balance" onWin={() => handleWin(50, 'Mestre do Equilíbrio')} auraColor={auraColor} />}
        {gameMode === 'rhythm' && <RhythmGame key="rhythm" onWin={(reward, name) => handleWin(reward, name)} auraColor={auraColor} />}
        {gameMode === 'path' && <PathGame key="path" onWin={(reward, name) => handleWin(reward, name)} auraColor={auraColor} />}
        {gameMode === 'jump' && <div className="flex-1 flex items-center justify-center text-white">Próximo Desafio...</div>}
        {gameMode === 'twister' && <div className="flex-1 flex items-center justify-center text-white">Próximo Desafio...</div>}
      </AnimatePresence>
    </div>
  );
}

function GameModeCard({ icon, title, desc, goal, color, onClick }: any) {
  return (
    <motion.button 
      whileHover={{ scale: 1.02, x: 5 }} 
      whileTap={{ scale: 0.95 }} 
      onClick={onClick} 
      className="p-5 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center gap-5 text-left group transition-all hover:bg-white/10 w-full relative overflow-hidden"
    >
      <div className={cn("w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl group-hover:rotate-6 transition-transform shrink-0", color)}>
        {React.cloneElement(icon, { className: "w-8 h-8" })}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <h3 className="text-sm font-black uppercase italic tracking-tighter text-white leading-tight">{title}</h3>
        <p className="text-[8px] text-white/40 font-bold uppercase leading-relaxed">{desc}</p>
        <div className="flex items-center gap-1.5 pt-1">
          <Info className="w-2.5 h-2.5 text-primary/60" />
          <span className="text-[7px] font-black uppercase text-primary/60 tracking-widest">Objetivo: {goal}</span>
        </div>
      </div>
    </motion.button>
  );
}

// --- JOGO 1: EQUILIBRISTA DE AURAS ---
function BalanceGame({ onWin, auraColor }: any) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (progress >= 100) onWin();
  }, [progress, onWin]);

  const start = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      const res = await (DeviceOrientationEvent as any).requestPermission();
      if (res === 'granted') setActive(true);
    } else {
      setActive(true);
    }
  };

  useEffect(() => {
    if (!active) return;
    const handleOrientation = (e: DeviceOrientationEvent) => {
      setTilt({ x: e.gamma || 0, y: (e.beta || 0) - 45 });
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const distance = Math.sqrt(tilt.x * tilt.x + tilt.y * tilt.y);
    const isCentered = distance < 12;
    let timer: NodeJS.Timeout;

    if (isCentered) {
      timer = setInterval(() => setProgress(p => Math.min(100, p + 2.5)), 100);
    } else {
      setProgress(0);
    }
    return () => clearInterval(timer);
  }, [tilt, active]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-900 relative">
      {!active ? (
        <Button onClick={start} className="h-20 px-16 rounded-full bg-primary text-white font-black uppercase shadow-2xl flex gap-3">
          <Play /> Ativar Sensores
        </Button>
      ) : (
        <>
          <div className="absolute top-32 w-full max-w-xs px-12 space-y-4">
             <div className="flex justify-between text-[8px] font-black uppercase text-white/40 tracking-widest">
                <span>Concentração</span>
                <span>{Math.round(progress)}%</span>
             </div>
             <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/5">
                <motion.div animate={{ width: `${progress}%` }} className="h-full bg-primary" />
             </div>
          </div>
          <div className="relative w-80 h-80 flex items-center justify-center">
            <div className="absolute inset-0 border-8 border-dashed border-white/5 rounded-full animate-spin-slow" />
            <div className="absolute w-32 h-32 border-4 border-white/20 rounded-full flex items-center justify-center">
               <div className="w-2 h-2 bg-white/40 rounded-full" />
            </div>
            <motion.div 
              animate={{ x: tilt.x * 4, y: tilt.y * 4 }} 
              transition={{ type: "spring", stiffness: 100, damping: 15 }} 
              className="w-20 h-20 rounded-full border-4 border-white shadow-2xl z-20" 
              style={{ backgroundColor: auraColor }}
            />
          </div>
        </>
      )}
    </div>
  );
}

// --- JOGO 2: MAESTRO DE AURAS (RITMO) ---
function RhythmGame({ onWin, auraColor }: any) {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState(0);
  const [hits, setHits] = useState(0);
  const [lastHitTime, setLastHitTime] = useState(0);
  const [pulse, setPulse] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const PHASES = [
    { name: 'Adagio', bpm: 60, reward: 30, goal: 5 },
    { name: 'Andante', bpm: 90, reward: 45, goal: 8 },
    { name: 'Allegro', bpm: 120, reward: 60, goal: 10 },
    { name: 'Presto', bpm: 145, reward: 80, goal: 12 }
  ];

  const currentPhase = PHASES[phase] || PHASES[0];

  useEffect(() => {
    if (hits >= currentPhase.goal) {
      if (phase < PHASES.length - 1) {
        setPhase(p => p + 1);
        setHits(0);
      } else {
        onWin(currentPhase.reward, 'Maestro Supremo');
      }
    }
  }, [hits, phase, onWin, currentPhase]);

  const playSound = () => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const freq = 261.63 * Math.pow(2, hits / 12); // Melodia ascendente

    const oscs = [0, 5, 12].map(transpose => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq * Math.pow(2, transpose/12), now);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      return osc;
    });

    oscs.forEach(o => { o.start(now); o.stop(now + 1.5); });
  };

  const start = async () => {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    audioContextRef.current = new AC();
    
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      const res = await (DeviceOrientationEvent as any).requestPermission();
      if (res === 'granted') setActive(true);
    } else {
      setActive(true);
    }
  };

  useEffect(() => {
    if (!active) return;
    
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 100);
    }, (60 / currentPhase.bpm) * 1000);

    const handleMotion = (e: DeviceMotionEvent) => {
      const accel = Math.sqrt(
        (e.accelerationIncludingGravity?.x || 0) ** 2 +
        (e.accelerationIncludingGravity?.y || 0) ** 2 +
        (e.accelerationIncludingGravity?.z || 0) ** 2
      );

      if (accel > 15) {
        const now = Date.now();
        if (now - lastHitTime > 300) {
          setHits(h => h + 1);
          setLastHitTime(now);
          playSound();
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => {
      clearInterval(interval);
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [active, currentPhase, lastHitTime]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900">
      {!active ? (
        <Button onClick={start} className="h-24 px-12 rounded-[2.5rem] bg-primary text-white font-black uppercase shadow-2xl flex gap-4 text-xl">
           <Music className="w-8 h-8" /> Iniciar Sinfonia
        </Button>
      ) : (
        <div className="flex flex-col items-center gap-12 text-center">
           <div className="space-y-2">
              <h3 className="text-5xl font-black uppercase italic text-white tracking-tighter">{currentPhase.name}</h3>
              <p className="text-[10px] font-black uppercase text-primary tracking-[0.4em]">{currentPhase.bpm} BPM</p>
           </div>

           <motion.div 
             animate={{ scale: pulse ? 1.2 : 1, opacity: pulse ? 1 : 0.6 }}
             className="w-48 h-48 rounded-[4rem] border-8 border-white flex items-center justify-center shadow-[0_0_80px_rgba(255,255,255,0.2)]"
             style={{ backgroundColor: auraColor }}
           >
             <Music className="w-20 h-20 text-white" />
           </motion.div>

           <div className="w-64 space-y-4">
              <div className="flex justify-between text-[9px] font-black uppercase text-white/40 tracking-widest">
                 <span>Tonicidade</span>
                 <span>{hits}/{currentPhase.goal}</span>
              </div>
              <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/5 p-1">
                 <motion.div animate={{ width: `${(hits/currentPhase.goal)*100}%` }} className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(147,51,234,0.5)]" />
              </div>
           </div>
           <p className="text-[9px] font-black uppercase text-white/20 tracking-widest animate-bounce">Balance o celular no ritmo!</p>
        </div>
      )}
    </div>
  );
}

// --- JOGO 3: CAMINHO DE LUZ (COORDENAÇÃO FINA) ---
function PathGame({ onWin, auraColor }: any) {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const PHASES = [
    { name: 'Voo do Beija-Flor', path: 'M 50,450 L 50,50', reward: 30 },
    { name: 'Deslize da Serpente', path: 'M 50,450 C 150,350 -50,150 50,50', reward: 45 },
    { name: 'Montanhas de Cristal', path: 'M 50,450 L 150,350 L 50,250 L 150,150 L 50,50', reward: 60 },
    { name: 'Portal do Zen', path: 'M 50,450 C 250,450 250,50 50,50 C -150,50 -150,450 50,450', reward: 100 }
  ];

  const currentPhase = PHASES[phase] || PHASES[0];

  useEffect(() => {
    if (progress >= 0.98) {
      if (phase < PHASES.length - 1) {
        setPhase(p => p + 1);
        setProgress(0);
      } else {
        onWin(currentPhase.reward, 'Mestre do Caminho');
      }
    }
  }, [progress, phase, onWin, currentPhase]);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pathRef.current || !svgRef.current) return;
    
    const touch = e.touches[0];
    const rect = svgRef.current.getBoundingClientRect();
    
    // Converte coordenadas do Viewport para o ViewBox do SVG (0 a 100/500)
    const x = ((touch.clientX - rect.left) / rect.width) * 200; 
    const y = ((touch.clientY - rect.top) / rect.height) * 500;

    const path = pathRef.current;
    const length = path.getTotalLength();
    
    // Encontra o ponto no caminho mais próximo do toque (Iteração simples)
    let bestDist = Infinity;
    let bestProg = 0;
    
    for (let i = 0; i <= 100; i += 2) {
      const p = path.getPointAtLength((i / 100) * length);
      const dist = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2);
      if (dist < bestDist) {
        bestDist = dist;
        bestProg = i / 100;
      }
    }

    // Só avança se o toque estiver próximo da linha (Ímã de precisão) e for para frente
    if (bestDist < 40 && bestProg > progress - 0.05) {
      setProgress(Math.max(progress, bestProg));
    }
  };

  const currentPoint = pathRef.current ? pathRef.current.getPointAtLength(progress * pathRef.current.getTotalLength()) : { x: 50, y: 450 };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900">
      <div className="text-center mb-8 space-y-1">
        <h3 className="text-2xl font-black uppercase italic text-white tracking-tighter">{currentPhase.name}</h3>
        <p className="text-[8px] font-black uppercase text-primary tracking-[0.4em]">Fase {phase + 1} de {PHASES.length}</p>
      </div>

      <div className="relative w-full max-w-xs aspect-[2/5] bg-white/5 rounded-[3rem] border-4 border-white/10 overflow-hidden shadow-2xl">
        <svg 
          ref={svgRef} 
          viewBox="0 0 200 500" 
          className="w-full h-full touch-none"
          onTouchMove={handleTouchMove}
        >
          {/* Caminho Base (Guia) */}
          <path 
            ref={pathRef}
            d={currentPhase.path}
            fill="none"
            stroke="white"
            strokeWidth="30"
            strokeLinecap="round"
            strokeOpacity="0.1"
          />
          
          {/* Caminho Ativado (Luz) */}
          <path 
            d={currentPhase.path}
            fill="none"
            stroke={auraColor}
            strokeWidth="30"
            strokeLinecap="round"
            strokeDasharray="1000"
            strokeDashoffset={1000 - (progress * 1000)}
            className="aura-glow"
          />

          {/* O Alvo (Aura do Usuário) */}
          <circle 
            cx={currentPoint.x} 
            cy={currentPoint.y} 
            r="15" 
            fill="white" 
            className="shadow-2xl"
          />
        </svg>

        {/* HUD de Progresso Interno */}
        <div className="absolute bottom-4 inset-x-4 h-1 bg-white/10 rounded-full">
           <motion.div animate={{ width: `${progress * 100}%` }} className="h-full bg-primary" />
        </div>
      </div>
      
      <p className="mt-8 text-[9px] font-black uppercase text-white/40 tracking-[0.3em] flex items-center gap-2">
        <Fingerprint className="w-4 h-4" /> Deslize com cuidado
      </p>
    </div>
  );
}
