'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Star,
  Activity,
  Volume2,
  AlertCircle,
  Rocket,
  Hand,
  Radar,
  Wind,
  ArrowUp,
  Waves
} from 'lucide-react';

import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useI18n } from '@/components/I18nProvider';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';

type GameMode = 'select' | 'balance' | 'rhythm' | 'path' | 'jump' | 'twister' | 'radar' | 'breath' | 'voice' | 'pitch';

// Escala Orquestral (Pentatônica Maior de Dó)
const ORCHESTRA_SCALE = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];

const RHYTHM_LEVELS = [
  { bpm: 60, soundType: 'sine' as OscillatorType, reward: 20, targetScore: 8 },
  { bpm: 90, soundType: 'triangle' as OscillatorType, reward: 35, targetScore: 12 },
  { bpm: 120, soundType: 'sawtooth' as OscillatorType, reward: 50, targetScore: 16 }
];

export function PlaygroundInterface({ debugMode = false }: { debugMode?: boolean }) {
  const router = useRouter();
  const { user } = user ? useUser() : { user: null };
  const { t } = useI18n();
  
  const [gameMode, setGameMode] = useState<GameMode>('select');
  const [isWin, setIsWin] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  
  const userProgressRef = useMemoFirebase(() => user ? { id: user.uid, path: `user_progress/${user.uid}` } : null, [user]);
  const { data: profile } = useDoc(userProgressRef);
  const auraColor = profile?.dominantColor || '#9333ea';

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
          <GameModeCard icon={<Move />} title={t('playground.modes.balance.title')} desc={t('playground.modes.balance.desc')} color="bg-blue-500" onClick={() => setGameMode('balance')} />
          <GameModeCard icon={<Music />} title={t('playground.modes.rhythm.title')} desc={t('playground.modes.rhythm.desc')} color="bg-primary" onClick={() => setGameMode('rhythm')} />
          <GameModeCard icon={<Fingerprint />} title={t('playground.modes.path.title')} desc={t('playground.modes.path.desc')} color="bg-accent" onClick={() => setGameMode('path')} />
          <GameModeCard icon={<Rocket />} title={t('playground.modes.jump.title')} desc={t('playground.modes.jump.desc')} color="bg-orange-500" onClick={() => setGameMode('jump')} />
          <GameModeCard icon={<Hand />} title={t('playground.modes.twister.title')} desc={t('playground.modes.twister.desc')} color="bg-green-500" onClick={() => setGameMode('twister')} />
          <GameModeCard icon={<Radar />} title={t('playground.modes.radar.title')} desc={t('playground.modes.radar.desc')} color="bg-indigo-500" onClick={() => setGameMode('radar')} />
          
          <div className="w-full border-t border-white/10 pt-4 mt-2">
            <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em] mb-4 text-center">Fonoaudiologia e Respiração</p>
          </div>

          <GameModeCard icon={<Wind />} title={t('playground.modes.breath.title')} desc={t('playground.modes.breath.desc')} color="bg-teal-500" onClick={() => setGameMode('breath')} />
          <GameModeCard icon={<ArrowUp />} title={t('playground.modes.voice.title')} desc={t('playground.modes.voice.desc')} color="bg-pink-500" onClick={() => setGameMode('voice')} />
          <GameModeCard icon={<Waves />} title={t('playground.modes.pitch.title')} desc={t('playground.modes.pitch.desc')} color="bg-cyan-500" onClick={() => setGameMode('pitch')} />
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
        <Button variant="ghost" size="icon" onClick={() => setGameMode('select')} className="text-white/40 hover:text-white bg-white/5 rounded-2xl">
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
        {gameMode === 'breath' && <BreathGame key="breath" onWin={() => handleWin(55, 'Mestre do Sopro')} auraColor={auraColor} />}
        {gameMode === 'voice' && <VoiceGame key="voice" onWin={() => handleWin(65, 'Mestre do Elevador')} auraColor={auraColor} />}
        {gameMode === 'pitch' && <PitchGame key="pitch" onWin={() => handleWin(75, 'Mestre da Montanha Russa')} auraColor={auraColor} />}
      </AnimatePresence>
    </div>
  );
}

function GameModeCard({ icon, title, desc, color, onClick }: any) {
  return (
    <motion.button whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.95 }} onClick={onClick} className="p-5 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center gap-5 text-left group transition-colors hover:bg-white/10 w-full">
      <div className={`w-14 h-14 rounded-[1.5rem] ${color} flex items-center justify-center text-white shadow-2xl group-hover:rotate-6 transition-transform shrink-0`}>
        {React.cloneElement(icon, { className: "w-8 h-8" })}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-black uppercase italic tracking-tighter text-white leading-tight">{title}</h3>
        <p className="text-[8px] text-white/40 font-bold uppercase leading-relaxed mt-1">{desc}</p>
      </div>
    </motion.button>
  );
}

function BalanceGame({ onWin, auraColor }: any) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(false);

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
      timer = setInterval(() => {
        setProgress(p => Math.min(100, p + 2));
      }, 100);
    } else {
      setProgress(0);
    }
    return () => clearInterval(timer);
  }, [tilt, active]);

  useEffect(() => {
    if (progress >= 100) {
      onWin();
    }
  }, [progress, onWin]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-900 relative">
      {!active ? (
        <Button onClick={start} className="h-20 px-16 rounded-full bg-primary font-black uppercase shadow-2xl">
          Ativar Gravidade
        </Button>
      ) : (
        <>
          <div className="absolute top-32 w-full max-w-xs px-12 space-y-4">
            <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/5">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-primary" />
            </div>
          </div>
          <div className="relative w-80 h-80 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-dashed border-white/10 rounded-full animate-spin-slow opacity-20" />
            <motion.div animate={{ x: tilt.x * 4, y: tilt.y * 4 }} transition={{ type: "spring", stiffness: 100, damping: 15 }} className="w-20 h-20 rounded-full border-4 border-white shadow-2xl z-20" style={{ backgroundColor: auraColor }} />
          </div>
        </>
      )}
    </div>
  );
}

function RhythmGame({ onWin, auraColor }: { onWin: (reward: number, name: string) => void, auraColor: string }) {
  const [active, setActive] = useState(false);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [beat, setBeat] = useState(false);
  const [score, setScore] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const level = RHYTHM_LEVELS[currentLevelIdx] || RHYTHM_LEVELS[0];

  const playOrchestraNote = useCallback((freqIndex: number) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const freq = ORCHESTRA_SCALE[freqIndex % ORCHESTRA_SCALE.length];

    [0, 1.01].forEach(ratio => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = level.soundType;
      osc.frequency.setValueAtTime(freq * (1 + ratio * 0.002), now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
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
    setActive(true);
  };

  useEffect(() => {
    if (!active) return;
    const intervalMs = (60 / level.bpm) * 1000;
    const timer = setInterval(() => {
      setBeat(true);
      setTimeout(() => setBeat(false), 450);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [active, level]);

  useEffect(() => {
    if (score >= level.targetScore) {
      if (currentLevelIdx < RHYTHM_LEVELS.length - 1) {
        setCurrentLevelIdx(i => i + 1);
        setScore(0);
      } else {
        onWin(level.reward, 'Maestro');
      }
    }
  }, [score, level, currentLevelIdx, onWin]);

  const handleInteraction = () => {
    setScore(s => s + 1);
    playOrchestraNote(score + 1);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900 gap-12">
      {!active ? (
        <Button onClick={start} className="h-20 px-16 rounded-full bg-accent text-white font-black uppercase">
          Iniciar Concerto
        </Button>
      ) : (
        <div className="relative w-64 h-64 flex items-center justify-center">
          <AnimatePresence>
            {beat && <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1.8, opacity: 0.2 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-accent rounded-full blur-3xl" />}
          </AnimatePresence>
          <button onClick={handleInteraction} className="w-48 h-48 rounded-[3rem] border-4 border-accent flex flex-col items-center justify-center gap-2 bg-white/5 relative z-10">
            <Music className="w-12 h-12 text-accent" />
            <div className="text-3xl font-black text-white">{score} / {level.targetScore}</div>
          </button>
        </div>
      )}
    </div>
  );
}

function PathGame({ onWin, auraColor }: any) {
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
      if (dist < bestDist) {
        bestDist = dist;
        bestT = t;
      }
    }

    if (bestDist < 40 && bestT >= progress && bestT <= progress + 0.1) {
      setProgress(bestT);
    }
  };

  useEffect(() => {
    if (progress > 0.98) {
      onWin(40, 'Mestre do Caminho');
    }
  }, [progress, onWin]);

  const pointOnPath = pathRef.current ? pathRef.current.getPointAtLength(progress * pathRef.current.getTotalLength()) : { x: 100, y: 450 };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-black p-6">
      <svg ref={svgRef} viewBox="0 0 200 500" className="w-full h-full max-w-[300px] touch-none" onTouchMove={handleTouch}>
        <path ref={pathRef} d="M 100 450 C 200 350, 0 150, 100 50" fill="none" stroke="white" strokeWidth="30" strokeOpacity="0.1" />
        <path d="M 100 450 C 200 350, 0 150, 100 50" fill="none" stroke={auraColor} strokeWidth="8" strokeDasharray="5 10" />
        <circle cx={pointOnPath.x} cy={pointOnPath.y} r="20" fill={auraColor} />
      </svg>
    </div>
  );
}

function JumpGame({ onWin, auraColor }: any) {
  const [active, setActive] = useState(false);
  const [jumpPower, setJumpPower] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
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
      setTimeout(() => {
        if (maxAccRef.current > 15) {
          onWin();
        } else {
          setCountdown(3);
          maxAccRef.current = 0;
        }
      }, 2000);
    }
  }, [countdown, onWin]);

  useEffect(() => {
    if (countdown !== 0) return;
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
  }, [countdown]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 p-8">
      {!active ? (
        <Button onClick={start} className="h-24 px-12 rounded-full bg-orange-500 font-black">
          PREPARAR SALTO!
        </Button>
      ) : (
        <div className="text-center space-y-10">
          <div className="text-7xl font-black text-white">{countdown === 0 ? "PULA!!!" : countdown}</div>
          <motion.div animate={{ y: -jumpPower * 4 }} className="w-32 h-32 rounded-full mx-auto" style={{ backgroundColor: auraColor }}>
            <Rocket className="w-16 h-16 text-white m-8" />
          </motion.div>
        </div>
      )}
    </div>
  );
}

function TwisterGame({ onWin, auraColor }: any) {
  const [points, setPoints] = useState<{ id: number, x: number, y: number, active: boolean }[]>([]);
  const [winProgress, setWinProgress] = useState(0);

  useEffect(() => {
    setPoints([{ id: 1, x: 25, y: 25, active: false }, { id: 2, x: 75, y: 25, active: false }, { id: 3, x: 50, y: 75, active: false }]);
  }, []);

  const handleTouch = (e: React.TouchEvent) => {
    const ts = Array.from(e.touches);
    const ups = points.map(p => {
      const isT = ts.some(t => {
        const dx = t.clientX - (p.x * window.innerWidth / 100);
        const dy = t.clientY - (p.y * window.innerHeight / 100);
        return Math.sqrt(dx*dx + dy*dy) < 60;
      });
      return { ...p, active: isT };
    });
    setPoints(ups);
    
    if (ups.every(p => p.active)) {
      setWinProgress(v => Math.min(100, v + 2));
    } else {
      setWinProgress(0);
    }
  };

  useEffect(() => {
    if (winProgress >= 100) {
      onWin();
    }
  }, [winProgress, onWin]);

  return (
    <div className="flex-1 bg-black relative" onTouchMove={handleTouch} onTouchStart={handleTouch} onTouchEnd={handleTouch}>
      <div className="absolute top-32 inset-x-10 h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-green-500" style={{ width: `${winProgress}%` }} />
      </div>
      {points.map(p => (
        <div key={p.id} className={`absolute w-20 h-20 rounded-full border-4 ${p.active ? 'border-white bg-white/20 scale-110' : 'border-green-500'}`} style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }} />
      ))}
    </div>
  );
}

function RadarGame({ onWin, auraColor }: any) {
  const [active, setActive] = useState(false);
  const [bearing, setBearing] = useState(0);
  const [target] = useState(Math.random() * 360);
  const [intensity, setIntensity] = useState(0);

  const start = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') await (DeviceOrientationEvent as any).requestPermission();
    setActive(true);
  };

  useEffect(() => {
    if (!active) return;
    const handle = (e: DeviceOrientationEvent) => {
      const a = e.alpha || 0;
      setBearing(a);
      const d = Math.abs(a - target);
      const dist = Math.min(d, 360 - d);
      const i = Math.max(0, 1 - dist / 60);
      setIntensity(i);
    };
    window.addEventListener('deviceorientation', handle);
    return () => window.removeEventListener('deviceorientation', handle);
  }, [active, target]);

  useEffect(() => {
    if (intensity > 0.98) {
      onWin();
    }
  }, [intensity, onWin]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-black" style={{ backgroundColor: `rgba(147, 51, 234, ${intensity * 0.3})` }}>
      {!active ? (
        <Button onClick={start} className="h-20 px-12 rounded-full bg-indigo-500 font-black">
          LIGAR RADAR
        </Button>
      ) : (
        <Radar className={`w-32 h-32 transition-all ${intensity > 0.5 ? 'text-white' : 'text-white/10'}`} style={{ transform: `rotate(${bearing}deg)` }} />
      )}
    </div>
  );
}

function BreathGame({ onWin, auraColor }: { onWin: () => void, auraColor: string }) {
  const [active, setActive] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
      const source = audioCtxRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      setActive(true);
    } catch (e) {
      console.error("Erro no microfone:", e);
    }
  };

  useEffect(() => {
    if (!active || !analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    const update = () => {
      analyserRef.current!.getByteFrequencyData(dataArray);
      const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
      
      if (volume > 30) {
        setRotation(r => r + volume * 0.2);
        setProgress(p => Math.min(100, p + 0.5));
      } else {
        setProgress(p => Math.max(0, p - 1));
      }
      animationRef.current = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(animationRef.current);
  }, [active]);

  useEffect(() => {
    if (progress >= 100) {
      onWin();
    }
  }, [progress, onWin]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 p-8 gap-8">
      {!active ? (
        <Button onClick={start} className="h-20 px-12 rounded-full bg-teal-500 font-black text-white">LIGAR SOPRO</Button>
      ) : (
        <>
          <div className="w-full max-w-xs h-4 bg-white/10 rounded-full overflow-hidden">
            <motion.div animate={{ width: `${progress}%` }} className="h-full bg-teal-400" />
          </div>
          <motion.div style={{ rotate: rotation }} className="w-48 h-48 flex items-center justify-center">
            <UrbeLudoLogo className="w-40 h-40" style={{ color: auraColor }} />
          </motion.div>
          <p className="text-white/40 font-black uppercase text-[10px] tracking-widest animate-pulse">Sopre no Microfone!</p>
        </>
      )}
    </div>
  );
}

function VoiceGame({ onWin, auraColor }: { onWin: () => void, auraColor: string }) {
  const [active, setActive] = useState(false);
  const [volume, setVolume] = useState(0);
  const [progress, setProgress] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    const source = ctx.createMediaStreamSource(stream);
    analyserRef.current = ctx.createAnalyser();
    source.connect(analyserRef.current);
    setActive(true);
  };

  useEffect(() => {
    if (!active || !analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    const loop = () => {
      analyserRef.current!.getByteFrequencyData(data);
      const vol = data.reduce((a, b) => a + b) / data.length;
      setVolume(vol);
      if (vol > 40 && vol < 70) {
        setProgress(p => Math.min(100, p + 0.5));
      } else {
        setProgress(p => Math.max(0, p - 0.5));
      }
      requestAnimationFrame(loop);
    };
    loop();
  }, [active]);

  useEffect(() => {
    if (progress >= 100) {
      onWin();
    }
  }, [progress, onWin]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 p-8">
      {!active ? (
        <Button onClick={start} className="h-20 px-12 rounded-full bg-pink-500 font-black text-white">LIGAR ELEVADOR</Button>
      ) : (
        <div className="relative h-[400px] w-32 bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden">
          <div className="absolute top-[30%] h-[30%] w-full bg-green-500/20 border-y border-green-500/40" />
          <motion.div 
            animate={{ bottom: `${Math.min(100, volume * 1.5)}%` }}
            className="absolute left-1/2 -translate-x-1/2 w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center"
            style={{ backgroundColor: auraColor }}
          >
            <ArrowUp className="text-white" />
          </motion.div>
          <div className="absolute top-4 inset-x-0 text-center">
            <span className="text-[10px] font-black text-white">{Math.floor(progress)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

function PitchGame({ onWin, auraColor }: { onWin: () => void, auraColor: string }) {
  const [active, setActive] = useState(false);
  const [pitch, setPitch] = useState(50);
  const [progress, setProgress] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = ctx.createMediaStreamSource(stream);
    analyserRef.current = ctx.createAnalyser();
    source.connect(analyserRef.current);
    setActive(true);
  };

  useEffect(() => {
    if (!active || !analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    const loop = () => {
      analyserRef.current!.getByteFrequencyData(data);
      let maxVal = -1, maxIdx = -1;
      for (let i = 0; i < data.length; i++) {
        if (data[i] > maxVal) { maxVal = data[i]; maxIdx = i; }
      }
      if (maxVal > 30) {
        setPitch(Math.min(100, maxIdx * 2));
        setProgress(p => Math.min(100, p + 0.3));
      }
      requestAnimationFrame(loop);
    };
    loop();
  }, [active]);

  useEffect(() => {
    if (progress >= 100) {
      onWin();
    }
  }, [progress, onWin]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-black p-8 relative">
      {!active ? (
        <Button onClick={start} className="h-20 px-12 rounded-full bg-cyan-500 font-black text-white">LIGAR MONTANHA</Button>
      ) : (
        <div className="w-full h-[400px] relative">
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 0 50 Q 25 10, 50 50 T 100 50" fill="none" stroke="white" strokeWidth="1" />
          </svg>
          <motion.div 
            animate={{ bottom: `${pitch}%` }}
            className="absolute w-12 h-12 rounded-full shadow-2xl"
            style={{ backgroundColor: auraColor, left: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}