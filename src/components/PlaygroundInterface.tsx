
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
  Wind,
  ArrowUp,
  ShieldCheck,
  Sparkles,
  Info,
  Play,
  Volume2,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  BookOpen,
  Star
} from 'lucide-react';

import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useI18n } from '@/components/I18nProvider';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

type GameMode = 'select' | 'balance' | 'rhythm' | 'path' | 'jump' | 'twister' | 'radar' | 'breath' | 'voice';

// Helper robusto para carregar assets de jogos
const getGameAsset = (game: string, file: string) => `assets/images/games/${game}/${file}`;

export function PlaygroundInterface({ debugMode = false }: { debugMode?: boolean }) {
  const router = useRouter();
  const { user } = useUser();
  const { t } = useI18n();
  
  const [gameMode, setGameMode] = useState<GameMode>('select');
  const [isWin, setIsWin] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [activeInfoMode, setActiveInfoMode] = useState<GameMode | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [pendingMode, setPendingMode] = useState<GameMode | null>(null);
  
  const userProgressRef = useMemoFirebase(() => user ? { id: user.uid, path: `user_progress/${user.uid}` } : null, [user]);
  const { data: profile } = useDoc(userProgressRef);
  const auraColor = profile?.dominantColor || '#9333ea';

  const speak = useCallback((text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const handleModeSelect = (mode: GameMode) => {
    setPendingMode(mode);
    setShowTutorial(true);
    const tutorialText = t(`playground.modes.${mode}.info`);
    speak(tutorialText);
  };

  const startPendingGame = () => {
    if (pendingMode) {
      setGameMode(pendingMode);
      setShowTutorial(false);
      setPendingMode(null);
    }
  };

  const handleWin = useCallback((reward: number = 30, type: string = 'Desafio Concluído') => {
    if (isWin) return;
    setIsWin(true);
    setRewardAmount(reward);
    speak("Incrível! Sua aura está brilhando!");
    
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
  }, [isWin, userProgressRef, profile, speak]);

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
          className="h-20 px-16 rounded-full bg-primary text-white font-black uppercase shadow-2xl transition-all text-xl relative z-10 border-b-8 border-primary/70"
        >
          {t('playground.collectCoins')}
        </Button>
      </motion.div>
    );
  }

  if (gameMode === 'select') {
    return (
      <div className="flex-1 bg-slate-950 p-8 flex flex-col items-center justify-start gap-10 relative overflow-y-auto no-scrollbar">
        <AccessibilityToolbar />
        
        <div className="text-center space-y-4 pt-4">
           <div className="flex items-center justify-center gap-2 mb-2">
             <div className="px-3 py-1 bg-primary/20 rounded-full border border-primary/30 flex items-center gap-2">
               <ShieldCheck className="w-3 h-3 text-primary" />
               <span className="text-[8px] font-black uppercase text-primary tracking-widest">IA de Borda: 100% Offline</span>
             </div>
           </div>
           <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Laboratório de Movimento</h2>
           <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Sincronia Biomecânica de 2026</p>
        </div>

        <div className="grid gap-4 w-full max-w-sm pb-10">
          <GameModeCard icon={<Move />} mode="balance" title={t('playground.modes.balance.title')} desc={t('playground.modes.balance.desc')} goal={t('playground.modes.balance.goal')} color="bg-blue-500" onClick={() => handleModeSelect('balance')} onInfo={() => setActiveInfoMode('balance')} />
          <GameModeCard icon={<Music />} mode="rhythm" title={t('playground.modes.rhythm.title')} desc={t('playground.modes.rhythm.desc')} goal={t('playground.modes.rhythm.goal')} color="bg-primary" onClick={() => handleModeSelect('rhythm')} onInfo={() => setActiveInfoMode('rhythm')} />
          <GameModeCard icon={<Fingerprint />} mode="path" title={t('playground.modes.path.title')} desc={t('playground.modes.path.desc')} goal={t('playground.modes.path.goal')} color="bg-accent" onClick={() => handleModeSelect('path')} onInfo={() => setActiveInfoMode('path')} />
          
          <div className="w-full border-t border-white/10 pt-4 mt-2">
            <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em] mb-4 text-center">Fonoaudiologia e Respiração</p>
          </div>

          <GameModeCard icon={<Wind />} mode="breath" title={t('playground.modes.breath.title')} desc={t('playground.modes.breath.desc')} goal={t('playground.modes.breath.goal')} color="bg-teal-500" onClick={() => handleModeSelect('breath')} onInfo={() => setActiveInfoMode('breath')} />
          <GameModeCard icon={<Volume2 />} mode="voice" title={t('playground.modes.voice.title')} desc={t('playground.modes.voice.desc')} goal={t('playground.modes.voice.goal')} color="bg-pink-500" onClick={() => handleModeSelect('voice')} onInfo={() => setActiveInfoMode('voice')} />
        </div>
        
        <Link href="/dashboard" className="text-[10px] font-black uppercase text-white/40 hover:text-white transition-colors tracking-widest mt-auto pb-4 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> {t('common.back')}
        </Link>

        {/* Tutorial Dialog */}
        <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
          <DialogContent className="max-w-md rounded-[3rem] border-8 border-primary/20 bg-slate-900 text-white p-10 overflow-hidden">
            <div className="absolute inset-0 bg-mesh-game opacity-20 pointer-events-none" />
            <div className="relative space-y-8 text-center">
               <DialogHeader>
                  <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 rounded-[2rem] bg-white/10 border-4 border-primary flex items-center justify-center text-primary shadow-2xl animate-pulse">
                      <BookOpen className="w-12 h-12" />
                    </div>
                  </div>
                  <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter text-white">Preparar Missão!</DialogTitle>
                  <DialogDescription className="text-sm font-bold text-white/70 uppercase leading-relaxed mt-4">
                    {pendingMode ? t(`playground.modes.${pendingMode}.info`) : ''}
                  </DialogDescription>
               </DialogHeader>
               
               <DialogFooter className="flex flex-col gap-3 mt-8">
                  <Button onClick={startPendingGame} className="w-full h-20 rounded-full bg-primary text-white font-black uppercase text-lg border-b-8 border-primary/70 active:border-b-0 active:translate-y-2 transition-all shadow-xl">
                    Vamos Lá
                  </Button>
                  <Button variant="ghost" onClick={() => setShowTutorial(false)} className="text-[10px] font-black uppercase text-white/40 hover:text-white">
                    Talvez Depois
                  </Button>
               </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Info Dialog */}
        <Dialog open={!!activeInfoMode} onOpenChange={() => setActiveInfoMode(null)}>
          <DialogContent className="max-w-md rounded-[3rem] border-4 border-white/20 bg-slate-900 text-white p-8 overflow-hidden">
            <div className="absolute inset-0 bg-mesh-game opacity-20 pointer-events-none" />
            {activeInfoMode && (
              <div className="relative space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter text-white">
                    {t(`playground.modes.${activeInfoMode}.title`)}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-bold text-white/60 uppercase tracking-widest leading-relaxed mt-2">
                    {t(`playground.modes.${activeInfoMode}.info`)}
                  </DialogDescription>
                </DialogHeader>

                <div className="p-5 bg-white/5 rounded-[2rem] border border-white/10 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-500 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black uppercase text-yellow-500 tracking-widest">Segurança</h4>
                    <p className="text-[9px] font-medium leading-relaxed opacity-80">{t(`playground.modes.${activeInfoMode}.warning`)}</p>
                  </div>
                </div>

                <Button onClick={() => setActiveInfoMode(null)} className="w-full h-16 rounded-full bg-white text-slate-900 font-black uppercase text-[10px] tracking-widest border-b-4 border-slate-200">
                  Fechar
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
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
        </div>
        <div className="w-10" />
      </header>

      <AnimatePresence mode="wait">
        {gameMode === 'balance' && <BalanceGame key="balance" onWin={(reward, name) => handleWin(reward, name)} auraColor={auraColor} />}
        {gameMode === 'rhythm' && <RhythmGame key="rhythm" onWin={(reward, name) => handleWin(reward, name)} auraColor={auraColor} />}
        {gameMode === 'path' && <PathGame key="path" onWin={(reward, name) => handleWin(reward, name)} auraColor={auraColor} />}
        {gameMode === 'breath' && <BreathGame key="breath" onWin={() => handleWin(40, 'Mestre do Sopro')} auraColor={auraColor} />}
        {gameMode === 'voice' && <VoiceGame key="voice" onWin={(reward, name) => handleWin(reward, name)} auraColor={auraColor} />}
      </AnimatePresence>
    </div>
  );
}

function GameModeCard({ icon, title, desc, goal, color, onClick, onInfo }: any) {
  return (
    <motion.div whileHover={{ scale: 1.02, x: 5 }} className="relative group w-full">
      <button onClick={onClick} className="p-5 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center gap-5 text-left transition-all hover:bg-white/10 w-full relative overflow-hidden active:scale-95">
        <div className={cn("w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl group-hover:rotate-6 transition-transform shrink-0", color)}>
          {React.cloneElement(icon, { className: "w-8 h-8" })}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="text-sm font-black uppercase italic tracking-tighter text-white leading-tight">{title}</h3>
          <p className="text-[8px] text-white/40 font-bold uppercase leading-relaxed">{desc}</p>
          <div className="flex items-center gap-1.5 pt-1">
            <Info className="w-2.5 h-2.5 text-primary/60" />
            <span className="text-[7px] font-black uppercase text-primary/60 tracking-widest">Meta: {goal.split(' ')[0]}</span>
          </div>
        </div>
      </button>
      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onInfo(); }} className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/5 hover:bg-white/20 text-white/40 hover:text-white z-20">
        <Info className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}

function BalanceGame({ onWin, auraColor }: { onWin: (reward: number, type: string) => void, auraColor: string }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  const [showPhaseTransition, setShowPhaseTransition] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const BALANCE_PHASES = [
    { name: 'Ninho de Luz', threshold: 50, targetSize: 100, ballSize: 80, reward: 20, benefit: "Sinta seu corpo no espaço com leveza." },
    { name: 'Pulo do Gato', threshold: 40, targetSize: 90, ballSize: 75, reward: 30, benefit: "Controle postural e estabilidade básica." },
    { name: 'Mestre da Árvore', threshold: 30, targetSize: 80, ballSize: 70, reward: 50, benefit: "Precisão absoluta e foco meditativo." }
  ];

  const currentPhase = BALANCE_PHASES[phaseIdx];

  const start = async () => {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    audioContextRef.current = new AC();
    if (audioContextRef.current?.state === 'suspended') await audioContextRef.current.resume();
    
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    oscRef.current = osc;
    gainRef.current = gain;

    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      const res = await (DeviceOrientationEvent as any).requestPermission();
      if (res === 'granted') setActive(true);
    } else setActive(true);
  };

  useEffect(() => {
    if (!active || showPhaseTransition) return;
    const handleOrientation = (e: DeviceOrientationEvent) => {
      setTilt({ x: (e.gamma || 0), y: ((e.beta || 0) - 45) });
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [active, showPhaseTransition]);

  useEffect(() => {
    if (!active || showPhaseTransition || !gainRef.current || !oscRef.current) return;
    const dist = Math.sqrt(Math.pow(tilt.x - targetPos.x, 2) + Math.pow(tilt.y - targetPos.y, 2));
    const proximity = Math.max(0, 1 - (dist / 100));
    
    gainRef.current.gain.setTargetAtTime(proximity * 0.1, audioContextRef.current!.currentTime, 0.1);
    oscRef.current.frequency.setTargetAtTime(220 + (proximity * 220), audioContextRef.current!.currentTime, 0.1);

    const isInside = dist < currentPhase.threshold;

    const timer = setInterval(() => {
      if (isInside) setProgress(prev => Math.min(100, prev + 3)); 
      else setProgress(prev => Math.max(0, prev - 1)); 
    }, 100);
    return () => clearInterval(timer);
  }, [active, showPhaseTransition, tilt, targetPos, currentPhase.threshold]);

  useEffect(() => {
    if (progress >= 100) {
      if (phaseIdx < BALANCE_PHASES.length - 1) {
        setShowPhaseTransition(true);
        setProgress(0);
      } else {
        if (oscRef.current) { oscRef.current.stop(); oscRef.current = null; }
        onWin(currentPhase.reward, 'Mestre do Equilíbrio');
      }
    }
  }, [progress, phaseIdx, onWin, currentPhase.reward, BALANCE_PHASES.length]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-950 relative">
      {!active ? (
        <div className="flex flex-col items-center gap-8 text-center max-w-xs">
          <div className="w-24 h-24 rounded-[2rem] bg-blue-500/20 border-4 border-blue-500 flex items-center justify-center text-blue-500 mb-4 animate-pulse"><Move className="w-12 h-12" /></div>
          <h3 className="text-3xl font-black uppercase italic text-white tracking-tighter">Equilibrista</h3>
          <Button onClick={start} className="h-20 px-16 rounded-full bg-primary text-white font-black uppercase shadow-2xl flex gap-3 text-lg border-b-8 border-primary/70">Começar</Button>
        </div>
      ) : (
        <>
          <div className="absolute top-32 w-full max-w-xs px-12 space-y-4">
             <div className="flex justify-between items-end text-white">
                <span className="text-[10px] font-black uppercase tracking-widest">{currentPhase.name}</span>
                <span className="text-xl font-black">{Math.round(progress)}%</span>
             </div>
             <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/5">
                <motion.div animate={{ width: `${progress}%` }} className="h-full bg-primary" />
             </div>
          </div>
          <div className="relative w-80 h-80 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute rounded-full border-4 border-dashed border-white/10"
              style={{ width: currentPhase.targetSize * 2.5, height: currentPhase.targetSize * 2.5 }}
            />
            <motion.div animate={{ x: tilt.x * 4, y: tilt.y * 4 }} transition={{ type: "spring", stiffness: 150 }} className="rounded-full border-4 border-white shadow-2xl z-20" style={{ backgroundColor: auraColor, width: currentPhase.ballSize * 1.5, height: currentPhase.ballSize * 1.5 }} />
          </div>
          <AnimatePresence>
            {showPhaseTransition && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[110] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8 text-white">
                <div className="p-6 bg-green-500/20 rounded-[3rem] border-4 border-green-500 text-green-500 mb-8"><CheckCircle2 className="w-16 h-16" /></div>
                <h2 className="text-4xl font-black uppercase italic mb-10">Sensacional!</h2>
                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 max-w-xs mb-10">
                   <p className="text-[11px] font-medium leading-relaxed opacity-90">{currentPhase.benefit}</p>
                </div>
                <Button onClick={() => { setPhaseIdx(prev => prev + 1); setShowPhaseTransition(false); }} className="h-16 px-12 rounded-full bg-primary text-white font-black uppercase text-lg border-b-4 border-primary/70">Próximo Andar</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

function RhythmGame({ onWin, auraColor }: any) {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState(0);
  const [hits, setHits] = useState(0);
  const [pulse, setPulse] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const canHitRef = useRef(true);

  const PHASES = [
    { name: 'Brisa Leve', bpm: 50, reward: 30, goal: 3 },
    { name: 'Eco Harmônico', bpm: 70, reward: 50, goal: 5 }
  ];
  const currentPhase = PHASES[phase] || PHASES[0];

  useEffect(() => {
    if (hits >= currentPhase.goal) {
      if (phase < PHASES.length - 1) { setPhase(p => p + 1); setHits(0); }
      else onWin(currentPhase.reward, 'Maestro do Ritmo');
    }
  }, [hits, phase, onWin, currentPhase.goal, currentPhase.reward]);

  const playNote = useCallback(() => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(261.63 * Math.pow(2, hits / 12), now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(now + 0.9);
  }, [hits]);

  const start = async () => {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    audioContextRef.current = new AC();
    if (audioContextRef.current?.state === 'suspended') await audioContextRef.current.resume();
    setActive(true);
  };

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setPulse(true); canHitRef.current = true;
      setTimeout(() => setPulse(false), 300); 
    }, (60 / currentPhase.bpm) * 1000);

    const handleMotion = (e: DeviceMotionEvent) => {
      const accel = Math.sqrt((e.accelerationIncludingGravity?.x || 0) ** 2 + (e.accelerationIncludingGravity?.y || 0) ** 2 + (e.accelerationIncludingGravity?.z || 0) ** 2);
      if (accel > 15 && canHitRef.current && pulse) {
        setHits(h => h + 1); canHitRef.current = false; playNote();
      }
    };
    window.addEventListener('devicemotion', handleMotion);
    return () => { clearInterval(interval); window.removeEventListener('devicemotion', handleMotion); };
  }, [active, currentPhase.bpm, pulse, playNote]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950">
      {!active ? (
        <Button onClick={start} className="h-24 px-12 rounded-[2.5rem] bg-primary text-white font-black uppercase shadow-2xl text-xl flex gap-4"><Music className="w-8 h-8" /> Iniciar Concerto</Button>
      ) : (
        <div className="flex flex-col items-center gap-12 text-center text-white">
           <h3 className="text-5xl font-black uppercase italic tracking-tighter">{currentPhase.name}</h3>
           <motion.div animate={{ scale: pulse ? 1.2 : 1, opacity: pulse ? 1 : 0.4 }} className="w-48 h-48 rounded-[4rem] border-8 flex items-center justify-center shadow-2xl" style={{ backgroundColor: pulse ? auraColor : 'transparent', borderColor: 'white' }}>
             <Music className="w-20 h-20" />
           </motion.div>
           <div className="w-64 h-4 bg-white/10 rounded-full overflow-hidden p-1"><motion.div animate={{ width: `${(hits/currentPhase.goal)*100}%` }} className="h-full bg-primary rounded-full" /></div>
        </div>
      )}
    </div>
  );
}

function PathGame({ onWin, auraColor }: any) {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const PHASES = [
    { name: 'Linha Reta', path: 'M 50,450 L 50,50', reward: 30 },
    { name: 'Zig Zag Lúdico', path: 'M 50,450 L 150,350 L 50,250 L 150,150 L 50,50', reward: 50 }
  ];
  const currentPhase = PHASES[phase] || PHASES[0];

  useEffect(() => {
    if (progress >= 0.98) {
      if (phase < PHASES.length - 1) { setPhase(p => p + 1); setProgress(0); }
      else onWin(currentPhase.reward, 'Mestre da Precisão');
    }
  }, [progress, phase, onWin, currentPhase.reward]);

  const handleTouch = (e: React.TouchEvent) => {
    if (!pathRef.current || !svgRef.current) return;
    const touch = e.touches[0];
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 200; 
    const y = ((touch.clientY - rect.top) / rect.height) * 500;
    const path = pathRef.current;
    const length = path.getTotalLength();
    let bestDist = Infinity; let bestProg = 0;
    for (let i = 0; i <= 100; i += 5) {
      const p = path.getPointAtLength((i / 100) * length);
      const dist = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2);
      if (dist < bestDist) { bestDist = dist; bestProg = i / 100; }
    }
    if (bestDist < 70 && bestProg > progress - 0.15) setProgress(Math.max(progress, bestProg));
  };

  const currentPoint = pathRef.current ? pathRef.current.getPointAtLength(progress * pathRef.current.getTotalLength()) : { x: 50, y: 450 };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950">
      <div className="relative w-full max-w-xs aspect-[2/5] bg-white/5 rounded-[3rem] border-4 border-white/10 overflow-hidden">
        <svg ref={svgRef} viewBox="0 0 200 500" className="w-full h-full touch-none" onTouchMove={handleTouch}>
          <path ref={pathRef} d={currentPhase.path} fill="none" stroke="white" strokeWidth="45" strokeLinecap="round" strokeOpacity="0.05" />
          <path d={currentPhase.path} fill="none" stroke={auraColor} strokeWidth="45" strokeLinecap="round" strokeDasharray="1000" strokeDashoffset={1000 - (progress * 1000)} />
          <circle cx={currentPoint.x} cy={currentPoint.y} r="25" fill="white" className="filter drop-shadow-lg" />
        </svg>
      </div>
    </div>
  );
}

function BreathGame({ onWin, auraColor }: any) {
  const [active, setActive] = useState(false);
  const [level, setLevel] = useState(0);
  const rotationRef = useRef(0);
  const requestRef = useRef<number>(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser(); analyser.fftSize = 256;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const update = () => {
        analyser.getByteFrequencyData(data);
        let average = data.reduce((a, b) => a + b) / data.length;
        if (average > 15) { 
          rotationRef.current += average / 2.5; 
          setLevel(prev => Math.min(100, prev + 1)); 
        } else {
          setLevel(prev => Math.max(0, prev - 0.4));
        }
        const wheel = document.getElementById('sopro-wheel');
        if (wheel) wheel.style.transform = `rotate(${rotationRef.current}deg)`;
        if (level >= 99) { onWin(); return; }
        requestRef.current = requestAnimationFrame(update);
      };
      setActive(true); update();
    } catch (e) {}
  };
  useEffect(() => () => { if(requestRef.current) cancelAnimationFrame(requestRef.current); }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950">
      {!active ? (
        <Button onClick={start} className="h-20 px-12 rounded-full bg-teal-500 text-white font-black uppercase text-lg border-b-8 border-teal-700">Ativar Sopro</Button>
      ) : (
        <div className="space-y-12 flex flex-col items-center">
          <div id="sopro-wheel" className="w-48 h-48 flex items-center justify-center"><Wind className="w-40 h-40 text-white" /></div>
          <div className="w-64 h-4 bg-white/10 rounded-full overflow-hidden"><motion.div animate={{ width: `${level}%` }} className="h-full bg-teal-400" /></div>
        </div>
      )}
    </div>
  );
}

/**
 * --- JOGO: O ELEVADOR DE VOZ (IMERSIVO 2026) ---
 * Implementação baseada no Guia Técnico: Camadas Visuais e Biofeedback.
 */
function VoiceGame({ onWin, auraColor }: { onWin: (reward: number, name: string) => void, auraColor: string }) {
  const [active, setActive] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [volume, setVolume] = useState(0);
  const [smoothedVolume, setSmoothedVolume] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showTransition, setShowTransition] = useState(false);
  const [isSinging, setIsSinging] = useState(false);
  const [chestOpen, setChestOpen] = useState(false);
  const [isExplorationMode, setIsExplorationMode] = useState(false);
  
  const analyserRef = useRef<AnalyserNode | null>(null);
  const requestRef = useRef<number>(null);

  // Mapeamento de Ativos Estáticos (Relativos para maior compatibilidade)
  const getPath = (file: string) => `assets/images/games/elevador/${file}`;

  const VOICE_LEVELS = [
    { name: 'Nível 1: Brisa Suave', duration: 5, range: { min: 10, max: 45 }, reward: 30, benefit: "Sustentação básica e controle respiratório." },
    { name: 'Nível 2: Eco da Torre', duration: 8, range: { min: 20, max: 60 }, reward: 50, benefit: "Fortalecimento da musculatura vocal." },
    { name: 'Nível 3: Maestro Ludo', duration: 12, range: { min: 35, max: 80 }, reward: 80, benefit: "Controle preciso de intensidade e fôlego." }
  ];

  const currentLevel = VOICE_LEVELS[phaseIdx];

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.85; // Suavização nativa do Analyser
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const update = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        
        setVolume(average);
        // Filtro de Suavização via Código
        setSmoothedVolume(prev => prev * 0.88 + average * 0.12);
        setIsSinging(average > 12);

        const isInRange = average > currentLevel.range.min && average < currentLevel.range.max;
        
        if (isInRange) {
          setProgress(p => {
            const next = p + (100 / (currentLevel.duration * 60));
            if (next >= 100) { handleLevelComplete(); return 100; }
            return next;
          });
        } else if (!isExplorationMode) {
          setProgress(p => Math.max(0, p - 0.3));
        }

        if (progress < 100) {
          requestRef.current = requestAnimationFrame(update);
        }
      };
      setActive(true);
      setChestOpen(false);
      update();
    } catch (e) {
      console.error("Hardware de áudio bloqueado", e);
    }
  };

  const handleLevelComplete = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    setChestOpen(true);
    setTimeout(() => setShowTransition(true), 1500);
  };

  const nextLevel = () => {
    if (phaseIdx < VOICE_LEVELS.length - 1) {
      setPhaseIdx(p => p + 1);
      setProgress(0);
      setShowTransition(false);
      setChestOpen(false);
      start();
    } else {
      onWin(currentLevel.reward, 'Maestro da Voz');
    }
  };

  useEffect(() => {
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-slate-950">
      {/* 1. Cenário Base */}
      <div className="absolute inset-0 z-0">
        <img src={getPath('1.png')} alt="" className="w-full h-full object-cover opacity-50" />
      </div>

      {!active ? (
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
          className="relative z-50 text-center space-y-10 p-12 bg-black/60 backdrop-blur-2xl rounded-[4rem] border-4 border-white/10 max-w-sm"
        >
          <div className="w-32 h-32 mx-auto bg-pink-500/20 rounded-[2.5rem] flex items-center justify-center text-pink-500 border-4 border-pink-500 animate-pulse shadow-2xl">
            <Volume2 className="w-16 h-16" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Elevador de Voz</h2>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-[9px] font-bold text-white/60 uppercase tracking-widest leading-relaxed">
              Mantenha o tom estável para subir na torre de cristal. Atividade fonoaudiológica de 2026.
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Button onClick={start} className="h-20 px-12 rounded-full bg-pink-600 text-white font-black uppercase text-xl shadow-2xl border-b-8 border-pink-800 active:translate-y-2 transition-all">
              Iniciar Missão
            </Button>
            <button onClick={() => setIsExplorationMode(!isExplorationMode)} className={cn("text-[9px] font-black uppercase tracking-widest transition-colors", isExplorationMode ? "text-green-400" : "text-white/30")}>
              {isExplorationMode ? "Modo Explorador: Ativo" : "Ativar Modo Explorador (Sem Erros)"}
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="relative w-full max-w-lg h-full flex items-center justify-center">
          
          {/* 4. Arquitetura da Torre */}
          <div className="absolute inset-y-10 w-72 z-10 flex items-center justify-center">
             <img src={getPath('4.png')} alt="" className="w-full h-full object-contain filter drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]" />
             
             {/* Faixa de Sincronia Biomecânica */}
             <motion.div 
               animate={{ y: 200 - (phaseIdx * 25) }}
               className="absolute inset-x-12 h-36 bg-green-500/5 border-y-2 border-green-500/30 backdrop-blur-sm flex items-center justify-center rounded-2xl"
             >
                <div className="text-[7px] font-black text-green-500/50 uppercase tracking-[0.4em] animate-pulse">Zona de Estabilidade</div>
             </motion.div>
          </div>

          {/* 5, 2, 3. Cabine e Herói */}
          <motion.div 
            animate={{ y: 320 - (smoothedVolume * 5.8) }} 
            transition={{ type: "spring", stiffness: 50, damping: 18 }}
            className="absolute w-44 h-72 z-20 flex flex-col items-center justify-center"
          >
             <div className="absolute inset-0">
                <img src={getPath('5.png')} alt="" className="w-full h-full object-contain filter drop-shadow-2xl" />
             </div>
             <div className="relative z-30 w-24 h-24 mb-6">
                <img 
                  src={isSinging ? getPath('3.png') : getPath('2.png')} 
                  alt="" 
                  className="w-full h-full object-contain" 
                />
             </div>
          </motion.div>

          {/* 6. Feedback Lateral */}
          <div className="absolute right-12 bottom-40 w-14 h-72 z-30 bg-black/40 rounded-full border-2 border-white/10 overflow-hidden shadow-2xl">
             <motion.div 
               animate={{ height: `${volume}%` }}
               className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-pink-600 to-accent"
             >
                <img src={getPath('6.png')} alt="" className="w-full h-full object-cover mix-blend-overlay" />
             </motion.div>
          </div>

          {/* 7, 10, 8. Recompensa */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 z-40 w-28 h-28">
             <AnimatePresence mode="wait">
               {!chestOpen ? (
                 <motion.img 
                   key="closed"
                   initial={{ scale: 0.9 }} animate={{ scale: 1 }} 
                   src={getPath('7.png')} 
                   className="w-full h-full object-contain filter drop-shadow-2xl"
                 />
               ) : (
                 <motion.div 
                   key="open" 
                   initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                   className="relative w-full h-full"
                 >
                    <img src={getPath('10.png')} className="w-full h-full object-contain" />
                    <motion.img 
                      initial={{ y: 0, opacity: 1 }} animate={{ y: -70, opacity: 0 }}
                      transition={{ duration: 1.5 }}
                      src={getPath('8.png')} 
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12" 
                    />
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          {/* HUD de Progresso e Moedas (9.png) */}
          <div className="absolute bottom-20 inset-x-12 z-50 flex flex-col gap-4">
             <div className="flex justify-between items-center bg-black/40 backdrop-blur-xl p-4 rounded-[2rem] border border-white/10">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                      <img src={getPath('9.png')} className="w-6 h-6" alt="Saldo" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white uppercase tracking-tighter">{currentLevel.name}</span>
                      <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Sincronia Biomecânica</span>
                   </div>
                </div>
                <div className="text-2xl font-black text-white italic">{Math.round(progress)}%</div>
             </div>
             <div className="h-5 bg-white/5 rounded-full border border-white/5 overflow-hidden p-1">
                <motion.div 
                  animate={{ width: `${progress}%` }} 
                  className="h-full bg-pink-500 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.5)]" 
                />
             </div>
          </div>
        </div>
      )}

      {/* Transição Pedagógica */}
      <AnimatePresence>
        {showTransition && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 z-[100] flex items-center justify-center p-8 bg-slate-950/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[4rem] p-10 max-w-sm w-full text-center space-y-8 shadow-2xl border-8 border-pink-500/10"
            >
              <div className="w-24 h-24 mx-auto bg-green-500/10 rounded-[2.5rem] border-4 border-green-500 flex items-center justify-center text-green-500">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="space-y-3">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">Andar Superado!</h3>
                <div className="flex items-center justify-center gap-3 bg-yellow-100 px-6 py-2 rounded-full w-fit mx-auto border border-yellow-200">
                   <img src={getPath('8.png')} className="w-5 h-5" />
                   <span className="text-xl font-black text-yellow-800">+{currentLevel.reward} LC</span>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                 <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Ganhos Pedagógicos</h4>
                 <p className="text-[11px] font-medium leading-relaxed text-slate-600 italic">"{currentLevel.benefit}"</p>
              </div>

              <Button onClick={nextLevel} className="w-full h-20 rounded-full bg-pink-600 text-white font-black uppercase shadow-2xl border-b-8 border-pink-800 active:translate-y-2 transition-all text-lg flex items-center justify-center gap-3">
                {phaseIdx === VOICE_LEVELS.length - 1 ? 'Finalizar Maestro' : 'Subir na Torre'} <Rocket className="w-6 h-6" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
