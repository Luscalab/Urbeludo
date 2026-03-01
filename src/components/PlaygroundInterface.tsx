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
  ChevronRight,
  ChevronLeft,
  Star,
  Activity,
  Volume2,
  AlertCircle,
  Rocket,
  Hand,
  Radar
} from 'lucide-react';

import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useI18n } from '@/components/I18nProvider';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';

type GameMode = 'select' | 'balance' | 'rhythm' | 'path' | 'jump' | 'twister' | 'radar';

// Escala Orquestral (Pentatônica Maior de Dó)
const ORCHESTRA_SCALE = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];

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
      <div className="flex-1 bg-slate-900 p-8 flex flex-col items-center justify-start gap-10 relative overflow-y-auto no-scrollbar">
        <AccessibilityToolbar />
        <div className="text-center space-y-4 pt-4">
           <div className="p-4 bg-primary/20 rounded-[2rem] inline-block mb-2">
             <UrbeLudoLogo className="w-16 h-16 text-primary" />
           </div>
           <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">{t('playground.selectGame')}</h2>
           <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Laboratório Psicomotor Offline</p>
        </div>

        <div className="grid gap-4 w-full max-w-sm pb-10">
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
          <GameModeCard 
            icon={<Rocket className="w-8 h-8" />}
            title={t('playground.modes.jump.title')}
            desc={t('playground.modes.jump.desc')}
            color="bg-orange-500"
            onClick={() => {
              setGameMode('jump');
              speak(t('playground.modes.jump.title'));
            }}
          />
          <GameModeCard 
            icon={<Hand className="w-8 h-8" />}
            title={t('playground.modes.twister.title')}
            desc={t('playground.modes.twister.desc')}
            color="bg-green-500"
            onClick={() => {
              setGameMode('twister');
              speak(t('playground.modes.twister.title'));
            }}
          />
          <GameModeCard 
            icon={<Radar className="w-8 h-8" />}
            title={t('playground.modes.radar.title')}
            desc={t('playground.modes.radar.desc')}
            color="bg-indigo-500"
            onClick={() => {
              setGameMode('radar');
              speak(t('playground.modes.radar.title'));
            }}
          />
        </div>
        
        <Link href="/dashboard" className="text-[10px] font-black uppercase text-white/40 hover:text-white transition-colors tracking-widest mt-auto pb-4">
          <ArrowLeft className="w-4 h-4 inline mr-2" /> {t('common.back')}
        </Link>
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
        {gameMode === 'rhythm' && <RhythmGame key="rhythm" onWin={(reward, name) => handleWin(reward, name)} auraColor={auraColor} />}
        {gameMode === 'path' && <PathGame key="path" onWin={(reward, name) => handleWin(reward, name)} auraColor={auraColor} />}
        {gameMode === 'jump' && <JumpGame key="jump" onWin={() => handleWin(60, 'Salto de Gigante')} auraColor={auraColor} />}
        {gameMode === 'twister' && <TwisterGame key="twister" onWin={() => handleWin(45, 'Mestre do Twister Digital')} auraColor={auraColor} />}
        {gameMode === 'radar' && <RadarGame key="radar" onWin={() => handleWin(70, 'Explorador de Radares')} auraColor={auraColor} />}
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
      className="p-5 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center gap-5 text-left group transition-colors hover:bg-white/10 w-full"
    >
      <div className={`w-14 h-14 rounded-[1.5rem] ${color} flex items-center justify-center text-white shadow-2xl group-hover:rotate-6 transition-transform shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-black uppercase italic tracking-tighter text-white leading-tight">{title}</h3>
        <p className="text-[8px] text-white/40 font-bold uppercase leading-relaxed mt-1">{desc}</p>
      </div>
    </motion.button>
  );
}

// --- JOGO 1: EQUILIBRISTA ---
function BalanceGame({ onWin, auraColor }: any) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(false);

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
            <div className="absolute inset-0 border-4 border-dashed border-white/10 rounded-full animate-spin-slow opacity-20" />
            <div className={`absolute w-40 h-40 border-4 border-white/20 rounded-full transition-all duration-300 ${progress > 0 ? 'scale-110 border-primary shadow-[0_0_40px_rgba(147,51,234,0.2)]' : ''}`} />
            
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

// --- JOGO 2: MAESTRO ORQUESTRAL ---
interface RhythmLevel {
  id: number;
  name: string;
  bpm: number;
  soundType: OscillatorType;
  reward: number;
  targetScore: number;
}

const RHYTHM_LEVELS: RhythmLevel[] = [
  { id: 1, name: "Adagio: Flautas de Seda", bpm: 60, soundType: 'sine', reward: 20, targetScore: 8 },
  { id: 2, name: "Andante: Cordas d'Água", bpm: 85, soundType: 'triangle', reward: 35, targetScore: 12 },
  { id: 3, name: "Allegro: Metais de Ouro", bpm: 115, soundType: 'sawtooth', reward: 50, targetScore: 16 },
  { id: 4, name: "Presto: Orquestra Galáctica", bpm: 140, soundType: 'square', reward: 75, targetScore: 20 },
];

function RhythmGame({ onWin, auraColor }: { onWin: (reward: number, name: string) => void, auraColor: string }) {
  const [active, setActive] = useState(false);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [beat, setBeat] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [sensorError, setSensorError] = useState(false);
  
  const lastShakeRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const level = RHYTHM_LEVELS[currentLevelIdx];

  const playOrchestraNote = useCallback((freqIndex: number) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    
    const now = ctx.currentTime;
    const freq = ORCHESTRA_SCALE[freqIndex % ORCHESTRA_SCALE.length];

    [0, 1.01, 2.02].forEach((ratio, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = level.soundType;
      osc.frequency.setValueAtTime(freq * (1 + ratio * 0.002), now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(i === 0 ? 0.2 : 0.05, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.5);
    });
  }, [level.soundType]);

  const start = async () => {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    audioCtxRef.current = new AudioContextClass();
    await audioCtxRef.current.resume();

    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const res = await (DeviceMotionEvent as any).requestPermission();
        if (res !== 'granted') setSensorError(true);
      } catch (e) { setSensorError(true); }
    }
    setActive(true);
  };

  const checkRhythm = useCallback(() => {
    if (beat) {
      setScore(s => {
        const nextScore = s + 1;
        playOrchestraNote(nextScore);
        setFeedback('EXCELENTE!');
        if (nextScore >= level.targetScore) {
          if (currentLevelIdx < RHYTHM_LEVELS.length - 1) {
            setTimeout(() => { setCurrentLevelIdx(v => v + 1); setScore(0); }, 1200);
          } else { onWin(level.reward, `Grande Maestro Orquestral`); }
        }
        return nextScore;
      });
    } else { setFeedback('OPS!'); }
    setTimeout(() => setFeedback(''), 500);
  }, [beat, level, currentLevelIdx, onWin, playOrchestraNote]);

  useEffect(() => {
    if (!active) return;
    const intervalMs = (60 / level.bpm) * 1000;
    intervalRef.current = setInterval(() => {
      setBeat(true);
      setTimeout(() => setBeat(false), 450); 
    }, intervalMs);

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const totalAcc = Math.sqrt((acc.x || 0)**2 + (acc.y || 0)**2 + (acc.z || 0)**2);
      const now = Date.now();
      if (totalAcc > 20 && now - lastShakeRef.current > (60000 / level.bpm) * 0.4) {
        lastShakeRef.current = now;
        checkRhythm();
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [active, level, checkRhythm]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900 gap-12">
      {!active ? (
        <div className="text-center space-y-8">
           <Music className="w-20 h-20 text-accent mx-auto animate-pulse" />
           <Button onClick={start} className="h-20 px-16 rounded-full bg-accent text-white font-black uppercase">Iniciar Concerto</Button>
        </div>
      ) : (
        <div className="relative w-64 h-64 flex items-center justify-center">
           <AnimatePresence>{beat && <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1.8, opacity: 0.2 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-accent rounded-full blur-3xl" />}</AnimatePresence>
           <button onClick={checkRhythm} className="w-48 h-48 rounded-[3rem] border-4 border-accent flex flex-col items-center justify-center gap-2 bg-white/5 relative z-10">
              <Music className="w-12 h-12 text-accent" />
              <div className="text-3xl font-black text-white">{score} / {level.targetScore}</div>
           </button>
           <AnimatePresence>{feedback && <motion.div initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: -100 }} exit={{ opacity: 0 }} className="absolute font-black text-3xl text-accent">{feedback}</motion.div>}</AnimatePresence>
        </div>
      )}
    </div>
  );
}

// --- JOGO 3: CAMINHO DE LUZ ---
function PathGame({ onWin, auraColor }: { onWin: (reward: number, name: string) => void, auraColor: string }) {
  const [progress, setProgress] = useState(0); 
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleTouch = (e: React.TouchEvent) => {
    if (!pathRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const touchX = (e.touches[0].clientX - rect.left) * (200 / rect.width);
    const touchY = (e.touches[0].clientY - rect.top) * (500 / rect.height);
    const pathLength = pathRef.current.getTotalLength();
    let bestDist = Infinity, bestT = 0;
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const point = pathRef.current.getPointAtLength(t * pathLength);
      const dist = Math.sqrt((point.x - touchX)**2 + (point.y - touchY)**2);
      if (dist < bestDist) { bestDist = dist; bestT = t; }
    }
    if (bestDist < 40 && bestT >= progress && bestT <= progress + 0.1) {
      setProgress(bestT);
      if (bestT > 0.98) onWin(40, 'Mestre do Caminho');
    }
  };

  const pointOnPath = pathRef.current ? pathRef.current.getPointAtLength(progress * pathRef.current.getTotalLength()) : { x: 100, y: 450 };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-black p-6">
      <svg ref={svgRef} viewBox="0 0 200 500" className="w-full h-full max-w-[300px] touch-none" onTouchMove={handleTouch}>
        <path ref={pathRef} d="M 100 450 C 200 350, 0 150, 100 50" fill="none" stroke="white" strokeWidth="30" strokeOpacity="0.1" />
        <path d="M 100 450 C 200 350, 0 150, 100 50" fill="none" stroke={auraColor} strokeWidth="8" strokeDasharray="5 10" />
        <circle cx={pointOnPath.x} cy={pointOnPath.y} r="20" fill={auraColor} className="drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
      </svg>
    </div>
  );
}

// --- JOGO 4: O PULO DO GIGANTE ---
function JumpGame({ onWin, auraColor }: { onWin: () => void, auraColor: string }) {
  const [active, setActive] = useState(false);
  const [jumpPower, setJumpPower] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [jumping, setJumping] = useState(false);
  const maxAccRef = useRef(0);

  const start = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      const res = await (DeviceMotionEvent as any).requestPermission();
      if (res !== 'granted') return;
    }
    setActive(true);
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setJumping(true);
      setTimeout(() => {
        setJumping(false);
        if (maxAccRef.current > 15) onWin();
        else { setJumpPower(0); setCountdown(3); maxAccRef.current = 0; }
      }, 2000);
    }
  }, [countdown, onWin]);

  useEffect(() => {
    if (!jumping) return;
    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const total = Math.sqrt((acc.x || 0)**2 + (acc.y || 0)**2 + (acc.z || 0)**2);
      if (total > maxAccRef.current) {
        maxAccRef.current = total;
        setJumpPower(Math.min(100, (total - 9.8) * 5));
      }
    };
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [jumping]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 p-8">
      {!active ? (
        <Button onClick={start} className="h-24 px-12 rounded-full bg-orange-500 font-black text-xl">PREPARAR SALTO!</Button>
      ) : (
        <div className="text-center space-y-10">
          <div className="text-7xl font-black text-white">{countdown === 0 ? "PULA!!!" : countdown}</div>
          <motion.div animate={{ y: -jumpPower * 4 }} className="w-32 h-32 rounded-full mx-auto shadow-2xl" style={{ backgroundColor: auraColor }}>
             <Rocket className="w-16 h-16 text-white m-8" />
          </motion.div>
          <p className="text-white/40 font-black uppercase tracking-widest">Segure firme no peito e pule!</p>
        </div>
      )}
    </div>
  );
}

// --- JOGO 5: TWISTER DE AURAS ---
function TwisterGame({ onWin, auraColor }: { onWin: () => void, auraColor: string }) {
  const [points, setPoints] = useState<{ id: number, x: number, y: number, active: boolean }[]>([]);
  const [winProgress, setWinProgress] = useState(0);

  useEffect(() => {
    const newPoints = [
      { id: 1, x: 20 + Math.random() * 20, y: 20 + Math.random() * 20, active: false },
      { id: 2, x: 60 + Math.random() * 20, y: 30 + Math.random() * 20, active: false },
      { id: 3, x: 40 + Math.random() * 20, y: 60 + Math.random() * 20, active: false },
    ];
    setPoints(newPoints);
  }, []);

  const handleTouch = (e: React.TouchEvent) => {
    const touches = Array.from(e.touches);
    const updatedPoints = points.map(p => {
      const isTouched = touches.some(t => {
        const dx = t.clientX - (p.x * window.innerWidth / 100);
        const dy = t.clientY - (p.y * window.innerHeight / 100);
        return Math.sqrt(dx*dx + dy*dy) < 60;
      });
      return { ...p, active: isTouched };
    });
    setPoints(updatedPoints);
    if (updatedPoints.every(p => p.active)) {
      setWinProgress(prev => {
        if (prev >= 100) { onWin(); return 100; }
        return prev + 2;
      });
    } else { setWinProgress(0); }
  };

  return (
    <div className="flex-1 bg-black relative touch-none" onTouchMove={handleTouch} onTouchStart={handleTouch} onTouchEnd={handleTouch}>
      <div className="absolute top-32 left-10 right-10 h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-green-500 transition-all" style={{ width: `${winProgress}%` }} />
      </div>
      {points.map(p => (
        <div key={p.id} className={`absolute w-20 h-20 rounded-full border-4 transition-all ${p.active ? 'scale-125 border-white bg-white/20' : 'border-green-500'}`} style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }} />
      ))}
      <div className="absolute bottom-20 inset-x-0 text-center text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Use 3 dedos ao mesmo tempo!</div>
    </div>
  );
}

// --- JOGO 6: RADAR CEGO ---
function RadarGame({ onWin, auraColor }: { onWin: () => void, auraColor: string }) {
  const [active, setActive] = useState(false);
  const [bearing, setBearing] = useState(0);
  const [targetAngle] = useState(Math.random() * 360);
  const [intensity, setIntensity] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const pannerRef = useRef<PannerNode | null>(null);

  const start = async () => {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    audioCtxRef.current = new AudioContextClass();
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    pannerRef.current = audioCtxRef.current.createPanner();
    
    osc.connect(pannerRef.current);
    pannerRef.current.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    osc.start();
    
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      const res = await (DeviceOrientationEvent as any).requestPermission();
      if (res !== 'granted') return;
    }
    setActive(true);
  };

  useEffect(() => {
    if (!active) return;
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const alpha = e.alpha || 0;
      setBearing(alpha);
      const diff = Math.abs(alpha - targetAngle);
      const dist = Math.min(diff, 360 - diff);
      const newIntensity = Math.max(0, 1 - dist / 60);
      setIntensity(newIntensity);
      
      if (pannerRef.current) {
        const x = Math.sin((alpha - targetAngle) * (Math.PI / 180));
        pannerRef.current.positionX.setValueAtTime(x, 0);
      }
      if (newIntensity > 0.98) onWin();
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [active, targetAngle, onWin]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-black" style={{ backgroundColor: `rgba(147, 51, 234, ${intensity * 0.3})` }}>
      {!active ? (
        <Button onClick={start} className="h-20 px-12 rounded-full bg-indigo-500 font-black">LIGAR RADAR</Button>
      ) : (
        <div className="text-center space-y-10">
           <Radar className={`w-32 h-32 mx-auto transition-all ${intensity > 0.5 ? 'text-white' : 'text-white/10'}`} style={{ transform: `rotate(${bearing}deg)` }} />
           <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.5em]">Gire o corpo para achar o som</p>
        </div>
      )}
    </div>
  );
}