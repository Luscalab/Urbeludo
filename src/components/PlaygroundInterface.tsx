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
  Volume2
} from 'lucide-react';

import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useI18n } from '@/components/I18nProvider';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';

type GameMode = 'select' | 'balance' | 'rhythm' | 'path';

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
        
        <Link href="/dashboard" className="text-[10px] font-black uppercase text-white/40 hover:text-white transition-colors tracking-widest">{t('common.back')}</Link>
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

// --- JOGO 2: MAESTRO ORQUESTRAL (RITMO) ---

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
  { id: 2, name: "Andante: Cordas d'Água", bpm: 90, soundType: 'triangle', reward: 35, targetScore: 12 },
  { id: 3, name: "Allegro: Metais de Ouro", bpm: 120, soundType: 'sawtooth', reward: 50, targetScore: 16 },
  { id: 4, name: "Presto: Orquestra Galáctica", bpm: 145, soundType: 'square', reward: 75, targetScore: 20 },
];

function RhythmGame({ onWin, auraColor }: { onWin: (reward: number, name: string) => void, auraColor: string }) {
  const [active, setActive] = useState(false);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [beat, setBeat] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  
  const lastShakeRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const level = RHYTHM_LEVELS[currentLevelIdx];

  // Função Audível Robusta de Orquestra
  const playOrchestraNote = (freqIndex: number) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    // Resume o contexto se estiver suspenso (exigência mobile)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const now = ctx.currentTime;
    const freq = ORCHESTRA_SCALE[freqIndex % ORCHESTRA_SCALE.length];

    // Cria um som rico de orquestra com múltiplos harmônicos
    [0, 0.01, -0.01].forEach((detune, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = level.soundType;
      // Frequência fundamental e leves desafinações para efeito de chorus
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detune * 100, now);
      
      gain.gain.setValueAtTime(0, now);
      // Envelope de Volume Suave (Simula um instrumento de corda/sopro)
      gain.gain.linearRampToValueAtTime(i === 0 ? 0.3 : 0.1, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.5);
    });
  };

  const start = async () => {
    // Solicita permissão de acelerômetro
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const res = await (DeviceMotionEvent as any).requestPermission();
        if (res !== 'granted') return;
      } catch (e) {
        console.warn("Permissão de movimento negada ou erro:", e);
      }
    }

    // Inicializa Áudio via Gesto do Usuário
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;
    if (ctx.state === 'suspended') await ctx.resume();

    // Som de ativação
    const warmOsc = ctx.createOscillator();
    const warmGain = ctx.createGain();
    warmGain.gain.setValueAtTime(0.05, ctx.currentTime);
    warmGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    warmOsc.connect(warmGain);
    warmGain.connect(ctx.destination);
    warmOsc.start();
    warmOsc.stop(ctx.currentTime + 0.2);

    setActive(true);
  };

  useEffect(() => {
    if (!active) return;

    const intervalMs = (60 / level.bpm) * 1000;
    
    // Loop de batida visual e temporal
    intervalRef.current = setInterval(() => {
      setBeat(true);
      setTimeout(() => setBeat(false), 400); // Janela de batida
    }, intervalMs);

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      
      // Cálculo de aceleração total (Tonicidade)
      const totalAcc = Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs(acc.z || 0);
      
      // Detecção de pico de movimento com limitador (throttle)
      const now = Date.now();
      if (totalAcc > 22 && now - lastShakeRef.current > (60000 / level.bpm) * 0.5) {
        lastShakeRef.current = now;
        checkRhythm();
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [active, level]);

  const checkRhythm = () => {
    if (beat) {
      setScore(s => {
        const nextScore = s + 1;
        // Toca a nota orquestral correspondente
        playOrchestraNote(nextScore);
        setFeedback('EXCELENTE!');
        
        if (nextScore >= level.targetScore) {
          if (currentLevelIdx < RHYTHM_LEVELS.length - 1) {
            setFeedback('FASE CONCLUÍDA!');
            setTimeout(() => {
              setCurrentLevelIdx(v => v + 1);
              setScore(0);
            }, 1200);
          } else {
            onWin(level.reward, `Grande Maestro Orquestral`);
          }
        }
        return nextScore;
      });
    } else {
      setFeedback('OPS!');
    }
    setTimeout(() => setFeedback(''), 500);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900 gap-12">
      {!active ? (
        <div className="text-center space-y-8">
           <div className="w-32 h-32 bg-accent/10 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-accent/30 animate-pulse">
             <Music className="w-12 h-12 text-accent" />
           </div>
           <div className="space-y-2">
             <h3 className="text-xl font-black uppercase italic text-white tracking-tighter">Maestro de Auras</h3>
             <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest max-w-[240px] mx-auto">Balance o celular no ritmo da música para reger a orquestra.</p>
           </div>
           <Button onClick={start} className="h-20 px-16 rounded-full bg-accent text-white font-black uppercase shadow-2xl text-lg border-b-8 border-accent/70 active:translate-y-2 active:border-b-0 transition-all">Iniciar Concerto</Button>
        </div>
      ) : (
        <>
          <div className="text-center space-y-4 w-full">
             <div className="flex items-center justify-center gap-4">
                <Volume2 className="w-5 h-5 text-accent animate-pulse" />
                <h2 className="text-2xl font-black uppercase italic text-white tracking-tighter">{level.name}</h2>
             </div>
             <div className="flex justify-center gap-4">
                {RHYTHM_LEVELS.map((l, i) => (
                  <div key={l.id} className={`h-2 w-12 rounded-full transition-all duration-500 ${i <= currentLevelIdx ? 'bg-accent' : 'bg-white/10'}`} />
                ))}
             </div>
          </div>

          <div className="relative w-80 h-80 flex items-center justify-center">
             <AnimatePresence>
               {beat && (
                 <motion.div 
                   initial={{ scale: 0.8, opacity: 0 }}
                   animate={{ scale: 1.8, opacity: 0.2 }}
                   exit={{ opacity: 0 }}
                   className="absolute inset-0 bg-accent rounded-full blur-3xl"
                 />
               )}
             </AnimatePresence>
             
             <motion.div 
               animate={{ 
                 scale: beat ? 1.25 : 1, 
                 borderColor: beat ? 'rgba(236, 72, 153, 0.9)' : 'rgba(255, 255, 255, 0.1)',
                 boxShadow: beat ? '0 0 60px rgba(236, 72, 153, 0.4)' : '0 0 0px rgba(0,0,0,0)'
               }}
               className="w-64 h-64 rounded-[4rem] border-8 flex flex-col items-center justify-center gap-6 bg-white/5 backdrop-blur-md shadow-2xl transition-all relative z-10"
             >
                <div className="flex flex-col items-center gap-2">
                   <Music className={`w-16 h-16 ${beat ? 'text-accent' : 'text-white/10'}`} />
                   <div className="text-5xl font-black text-white tracking-tighter">{score} <span className="text-sm opacity-30">/ {level.targetScore}</span></div>
                </div>
                <div className="text-[10px] font-black uppercase text-accent/60 tracking-[0.3em]">{level.bpm} BPM</div>
             </motion.div>

             <AnimatePresence>
                {feedback && (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0, y: 0 }}
                    animate={{ scale: 3.5, opacity: 1, y: -160 }}
                    exit={{ opacity: 0 }}
                    className={`absolute font-black text-7xl italic ${feedback === 'OPS!' ? 'text-red-500' : 'text-accent'} pointer-events-none z-50 whitespace-nowrap`}
                  >
                    {feedback}
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
          
          <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 text-center">
             <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Siga o pulso da luz com firmeza!</p>
          </div>
        </>
      )}
    </div>
  );
}

// --- JOGO 3: CAMINHO DE LUZ (COORDENAÇÃO FINA) ---

interface PathLevel {
  id: number;
  name: string;
  path: string; 
  reward: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

const PATH_LEVELS: PathLevel[] = [
  {
    id: 1,
    name: "O Voo do Beija-Flor",
    path: "M 100 450 L 100 50",
    reward: 20,
    difficulty: 'easy'
  },
  {
    id: 2,
    name: "O Deslize da Serpente",
    path: "M 100 450 C 200 350, 0 150, 100 50",
    reward: 35,
    difficulty: 'medium'
  },
  {
    id: 3,
    name: "Montanhas de Cristal",
    path: "M 50 450 L 150 350 L 50 250 L 150 150 L 100 50",
    reward: 50,
    difficulty: 'hard'
  },
  {
    id: 4,
    name: "O Portal do Zen",
    path: "M 100 450 C 300 450, 300 50, 100 50 C -100 50, -100 450, 100 450 L 100 250",
    reward: 70,
    difficulty: 'expert'
  }
];

function PathGame({ onWin, auraColor }: { onWin: (reward: number, name: string) => void, auraColor: string }) {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [progress, setProgress] = useState(0); 
  const [isOffPath, setIsOffPath] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const level = PATH_LEVELS[currentLevelIdx];

  const initAudio = () => {
    if (audioCtxRef.current) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    gain.gain.setValueAtTime(0, ctx.currentTime);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    
    audioCtxRef.current = ctx;
    oscillatorRef.current = osc;
    gainRef.current = gain;
  };

  const handleTouch = (e: React.TouchEvent) => {
    if (!isStarted) {
      initAudio();
      setIsStarted(true);
    }

    if (!pathRef.current || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const touchX = (e.touches[0].clientX - rect.left) * (200 / rect.width);
    const touchY = (e.touches[0].clientY - rect.top) * (500 / rect.height);
    
    const pathLength = pathRef.current.getTotalLength();
    
    let bestDist = Infinity;
    let bestT = 0;
    const precision = 60; 
    
    for (let i = 0; i <= precision; i++) {
      const t = i / precision;
      const point = pathRef.current.getPointAtLength(t * pathLength);
      const dist = Math.sqrt((point.x - touchX)**2 + (point.y - touchY)**2);
      if (dist < bestDist) {
        bestDist = dist;
        bestT = t;
      }
    }

    const tolerance = 35;
    if (bestDist < tolerance) {
      setIsOffPath(false);
      if (bestT >= progress && bestT <= progress + 0.15) {
        setProgress(bestT);
        updateAudio(true, bestT);
        if (bestT > 0.98) {
          stopAudio();
          onWin(level.reward, `Mestre de ${level.name}`);
        }
      }
    } else {
      setIsOffPath(true);
      updateAudio(false, progress);
    }
  };

  const updateAudio = (onPath: boolean, t: number) => {
    if (!oscillatorRef.current || !gainRef.current || !audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    
    const freq = onPath ? 280 + t * 450 : 140;
    const volume = onPath ? 0.2 : 0.05;
    
    oscillatorRef.current.frequency.setTargetAtTime(freq, now, 0.1);
    gainRef.current.gain.setTargetAtTime(volume, now, 0.1);
  };

  const stopAudio = () => {
    if (gainRef.current && audioCtxRef.current) {
      gainRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.1);
    }
  };

  useEffect(() => {
    return () => {
      if (oscillatorRef.current) oscillatorRef.current.stop();
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const pointOnPath = pathRef.current ? pathRef.current.getPointAtLength(progress * pathRef.current.getTotalLength()) : { x: 100, y: 450 };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-black gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-4">
           <Button 
             variant="ghost" 
             size="icon" 
             disabled={currentLevelIdx === 0}
             onClick={() => { setCurrentLevelIdx(v => v - 1); setProgress(0); stopAudio(); }}
             className="text-white/40"
           >
             <ChevronLeft className="w-8 h-8" />
           </Button>
           <h2 className="text-2xl font-black uppercase italic text-white tracking-tighter">{level.name}</h2>
           <Button 
             variant="ghost" 
             size="icon" 
             disabled={currentLevelIdx === PATH_LEVELS.length - 1}
             onClick={() => { setCurrentLevelIdx(v => v + 1); setProgress(0); stopAudio(); }}
             className="text-white/40"
           >
             <ChevronRight className="w-8 h-8" />
           </Button>
        </div>
        <div className="flex items-center gap-2">
           {[...Array(4)].map((_, i) => (
             <Star key={i} className={`w-4 h-4 ${i <= currentLevelIdx ? 'text-yellow-400 fill-current' : 'text-white/20'}`} />
           ))}
        </div>
      </div>

      <div className="relative w-full max-w-[320px] aspect-[2/5] bg-white/5 rounded-[3rem] border-4 border-white/10 overflow-hidden">
        <svg 
          ref={svgRef}
          viewBox="0 0 200 500" 
          className="w-full h-full touch-none"
          onTouchMove={handleTouch}
          onTouchEnd={() => { setIsOffPath(false); stopAudio(); }}
        >
          <path 
            ref={pathRef}
            d={level.path}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="35"
            strokeLinecap="round"
          />
          
          <path 
            d={level.path}
            fill="none"
            stroke={auraColor}
            strokeWidth="35"
            strokeLinecap="round"
            opacity="0.1"
          />

          <path 
            d={level.path}
            fill="none"
            stroke={auraColor}
            strokeWidth="8"
            strokeDasharray="1 12"
            strokeLinecap="round"
            opacity="0.4"
          />

          <motion.circle 
            cx={pointOnPath.x}
            cy={pointOnPath.y}
            r={isOffPath ? 12 : 24}
            fill={isOffPath ? '#ef4444' : auraColor}
            initial={false}
            animate={{ 
              r: isOffPath ? 12 : 24,
              opacity: isOffPath ? 0.6 : 1
            }}
            className="drop-shadow-[0_0_20px_rgba(147,51,234,0.8)]"
          />
          
          <circle cx="100" cy="50" r="15" fill="none" stroke="white" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
        </svg>

        <AnimatePresence>
          {isOffPath && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-red-500/10 pointer-events-none flex items-center justify-center"
            >
              <div className="text-[10px] font-black uppercase text-red-500 tracking-[0.5em] animate-bounce">Volte ao Caminho</div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute top-4 right-4 bg-white/10 px-3 py-1 rounded-full text-[8px] font-black uppercase text-white/60 tracking-widest">
           {Math.round(progress * 100)}%
        </div>
      </div>

      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] max-w-[200px] text-center leading-relaxed">
        {t('playground.modes.path.desc')}
      </p>
    </div>
  );
}
