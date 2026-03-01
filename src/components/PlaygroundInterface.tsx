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

type GameMode = 'select' | 'balance' | 'rhythm' | 'path' | 'jump' | 'twister' | 'radar' | 'breath' | 'voice' | 'pitch';

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

  const vibrate = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

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
    vibrate([100, 50, 100]);
    speak("Parabéns! Sua aura está brilhando!");
    
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
                    Entendi! Vamos Lá
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
            {activeInfoMode ? (
              <div className="relative space-y-6">
                <DialogHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-primary/20 rounded-2xl border border-primary/30">
                       <UrbeLudoLogo className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
                      {t(`playground.modes.${activeInfoMode}.title`)}
                    </DialogTitle>
                  </div>
                  <DialogDescription className="text-xs font-bold text-white/60 uppercase tracking-widest leading-relaxed">
                    {t(`playground.modes.${activeInfoMode}.info`)}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="p-5 bg-white/5 rounded-[2rem] border border-white/10 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-500 shrink-0">
                       <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase text-yellow-500 tracking-widest">{t('common.safety')}</h4>
                      <p className="text-[9px] font-medium leading-relaxed opacity-80">{t(`playground.modes.${activeInfoMode}.warning`)}</p>
                    </div>
                  </div>
                </div>

                <Button onClick={() => setActiveInfoMode(null)} className="w-full h-16 rounded-full bg-white text-slate-900 font-black uppercase text-[10px] tracking-widest border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 transition-all">
                  {t('common.close')}
                </Button>
              </div>
            ) : (
              <DialogHeader className="sr-only">
                <DialogTitle>Informações do Jogo</DialogTitle>
                <DialogDescription>Detalhes sobre os modos de jogo psicomotores.</DialogDescription>
              </DialogHeader>
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
           <span className="text-[7px] font-bold text-white/40 uppercase tracking-widest mt-0.5">
             {t(`playground.modes.${gameMode}.goal`)}
           </span>
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
            <span className="text-[7px] font-black uppercase text-primary/60 tracking-widest">Foco: {goal.split(' ')[0]}</span>
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
    { name: 'Ninho de Luz', threshold: 45, targetSize: 100, ballSize: 75, reward: 20, benefit: "Calibração inicial: sinta seu corpo no espaço." },
    { name: 'Pulo do Gato', threshold: 35, targetSize: 90, ballSize: 70, reward: 25, benefit: "Estabilidade básica e controle postural." },
    { name: 'Equilíbrio na Árvore', threshold: 30, targetSize: 85, ballSize: 65, reward: 30, benefit: "Foco prolongado e ajustes milimétricos." }
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
    
    const proximity = Math.max(0, 1 - (dist / 80));
    gainRef.current.gain.setTargetAtTime(proximity * 0.15, audioContextRef.current!.currentTime, 0.1);
    oscRef.current.frequency.setTargetAtTime(220 + (proximity * 220), audioContextRef.current!.currentTime, 0.1);

    const isInside = dist < currentPhase.threshold;

    const timer = setInterval(() => {
      if (isInside) setProgress(prev => Math.min(100, prev + 2.5)); 
      else setProgress(prev => Math.max(0, prev - 1.2)); 
    }, 100);
    return () => clearInterval(timer);
  }, [active, showPhaseTransition, tilt, targetPos, currentPhase.threshold]);

  useEffect(() => {
    if (progress >= 100) {
      if (phaseIdx < BALANCE_PHASES.length - 1) {
        setShowPhaseTransition(true);
        setProgress(0);
      } else {
        if (oscRef.current) {
          oscRef.current.stop();
          oscRef.current = null;
        }
        onWin(currentPhase.reward, 'Mestre do Equilíbrio');
      }
    }
  }, [progress, phaseIdx, onWin, currentPhase.reward, BALANCE_PHASES.length]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-900 relative">
      {!active ? (
        <div className="flex flex-col items-center gap-8 text-center max-w-xs">
          <div className="w-24 h-24 rounded-[2rem] bg-blue-500/20 border-4 border-blue-500 flex items-center justify-center text-blue-500 mb-4 animate-pulse"><Move className="w-12 h-12" /></div>
          <h3 className="text-3xl font-black uppercase italic text-white tracking-tighter">Equilibrista</h3>
          <Button onClick={start} className="h-20 px-16 rounded-full bg-primary text-white font-black uppercase shadow-2xl flex gap-3 text-lg border-b-8 border-primary/70 active:border-b-0 active:translate-y-2"><Play /> Começar Missão</Button>
        </div>
      ) : (
        <>
          <div className="absolute top-32 w-full max-w-xs px-12 space-y-4">
             <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-primary tracking-widest">{currentPhase.name}</span>
                  <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Nível {phaseIdx + 1}</span>
                </div>
                <span className="text-xl font-black text-white">{Math.round(progress)}%</span>
             </div>
             <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/5">
                <motion.div animate={{ width: `${progress}%` }} className="h-full bg-primary shadow-[0_0_20px_rgba(147,51,234,0.5)]" />
             </div>
          </div>
          <div className="relative w-80 h-80 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute rounded-full border-4 border-dashed"
              style={{ width: currentPhase.targetSize * 2.5, height: currentPhase.targetSize * 2.5, borderColor: 'rgba(255,255,255,0.2)' }}
            />
            <motion.div animate={{ x: tilt.x * 4, y: tilt.y * 4 }} transition={{ type: "spring", stiffness: 150 }} className="rounded-full border-4 border-white shadow-[0_0_50px_rgba(0,0,0,0.5)] z-20" style={{ backgroundColor: auraColor, width: currentPhase.ballSize * 1.5, height: currentPhase.ballSize * 1.5 }} />
          </div>
          <AnimatePresence>
            {showPhaseTransition && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="absolute inset-0 z-[110] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8">
                <div className="p-6 bg-green-500/20 rounded-[3rem] border-4 border-green-500 text-green-500 mb-8"><CheckCircle2 className="w-16 h-16" /></div>
                <h2 className="text-4xl font-black uppercase italic text-white mb-2">Incrível!</h2>
                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 max-w-xs mb-10">
                   <Lightbulb className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
                   <h4 className="text-[10px] font-black uppercase text-yellow-500 tracking-widest mb-2">Ganhos Pedagógicos</h4>
                   <p className="text-[11px] font-medium leading-relaxed text-white/90">{currentPhase.benefit}</p>
                </div>
                <Button onClick={() => { setPhaseIdx(prev => prev + 1); setShowPhaseTransition(false); }} className="h-16 px-12 rounded-full bg-primary text-white font-black uppercase shadow-2xl flex gap-3 text-lg border-b-4 border-primary/70 active:border-b-0 active:translate-y-1">Próxima Fase <ArrowUp className="w-5 h-5 rotate-90" /></Button>
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
    { name: 'Brilhante', bpm: 50, reward: 30, goal: 3 },
    { name: 'Harmônico', bpm: 70, reward: 45, goal: 5 }
  ];
  const currentPhase = PHASES[phase] || PHASES[0];

  useEffect(() => {
    if (hits >= currentPhase.goal) {
      if (phase < PHASES.length - 1) { setPhase(p => p + 1); setHits(0); }
      else onWin(currentPhase.reward, 'Maestro Supremo');
    }
  }, [hits, phase, onWin, currentPhase.goal, currentPhase.reward]);

  const playNote = useCallback(() => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.frequency.setValueAtTime(261.63 * Math.pow(2, hits / 12), now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1);
    osc1.connect(gain);
    gain.connect(ctx.destination);
    osc1.start(); osc1.stop(now + 1.1);
  }, [hits]);

  const start = async () => {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    audioContextRef.current = new AC();
    if (audioContextRef.current?.state === 'suspended') await audioContextRef.current.resume();
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      const res = await (DeviceOrientationEvent as any).requestPermission();
      if (res === 'granted') setActive(true);
    } else setActive(true);
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
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900">
      {!active ? (
        <Button onClick={start} className="h-24 px-12 rounded-[2.5rem] bg-primary text-white font-black uppercase shadow-2xl flex gap-4 text-xl"><Music className="w-8 h-8" /> Iniciar Concerto</Button>
      ) : (
        <div className="flex flex-col items-center gap-12 text-center">
           <h3 className="text-5xl font-black uppercase italic text-white tracking-tighter">{currentPhase.name}</h3>
           <motion.div animate={{ scale: pulse ? 1.2 : 1, opacity: pulse ? 1 : 0.4 }} className="w-48 h-48 rounded-[4rem] border-8 flex items-center justify-center shadow-2xl" style={{ backgroundColor: pulse ? auraColor : 'transparent', borderColor: 'white' }}>
             <Music className="w-20 h-20 text-white" />
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
    { name: 'Voo do Beija-Flor', path: 'M 50,450 L 50,50', reward: 30 },
    { name: 'Zig Zag', path: 'M 50,450 L 150,350 L 50,250 L 150,150 L 50,50', reward: 45 }
  ];
  const currentPhase = PHASES[phase] || PHASES[0];

  useEffect(() => {
    if (progress >= 0.98) {
      if (phase < PHASES.length - 1) { setPhase(p => p + 1); setProgress(0); }
      else onWin(currentPhase.reward, 'Mestre do Caminho');
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
    if (bestDist < 60 && bestProg > progress - 0.1) setProgress(Math.max(progress, bestProg));
  };

  const currentPoint = pathRef.current ? pathRef.current.getPointAtLength(progress * pathRef.current.getTotalLength()) : { x: 50, y: 450 };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900">
      <div className="relative w-full max-w-xs aspect-[2/5] bg-white/5 rounded-[3rem] border-4 border-white/10 overflow-hidden">
        <svg ref={svgRef} viewBox="0 0 200 500" className="w-full h-full touch-none" onTouchMove={handleTouch}>
          <path ref={pathRef} d={currentPhase.path} fill="none" stroke="white" strokeWidth="40" strokeLinecap="round" strokeOpacity="0.1" />
          <path d={currentPhase.path} fill="none" stroke={auraColor} strokeWidth="40" strokeLinecap="round" strokeDasharray="1000" strokeDashoffset={1000 - (progress * 1000)} />
          <circle cx={currentPoint.x} cy={currentPoint.y} r="20" fill="white" />
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
        if (average > 20) { rotationRef.current += average / 3; setLevel(prev => Math.min(100, prev + 0.8)); }
        else setLevel(prev => Math.max(0, prev - 0.3));
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
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900">
      {!active ? (
        <Button onClick={start} className="h-20 px-12 rounded-full bg-teal-500 text-white font-black uppercase text-lg">Ativar Sopro</Button>
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
 * --- JOGO: O ELEVADOR DE VOZ (IMERSIVO) ---
 * Implementação fiel ao guia "O Elevador de Voz".
 * Utiliza sistema de camadas visuais e biofeedback em tempo real.
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
  
  const analyserRef = useRef<AnalyserNode | null>(null);
  const requestRef = useRef<number>(null);

  const VOICE_LEVELS = [
    { 
      name: 'Andar 1: Brisa Suave', 
      duration: 6, 
      range: { min: 12, max: 40 }, 
      reward: 30, 
      benefit: "Sustentação básica de sopro e voz.",
      towerHeight: 500 
    },
    { 
      name: 'Andar 2: Eco da Montanha', 
      duration: 10, 
      range: { min: 20, max: 55 }, 
      reward: 50, 
      benefit: "Fortalecimento da musculatura vocal.",
      towerHeight: 600
    },
    { 
      name: 'Andar 3: Canto do Herói', 
      duration: 15, 
      range: { min: 35, max: 75 }, 
      reward: 80, 
      benefit: "Controle preciso de intensidade e fôlego.",
      towerHeight: 700
    }
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
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const update = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        
        // Normalização e Filtro de Suavização (Low Pass Filter Simulado)
        setVolume(average);
        setSmoothedVolume(prev => prev * 0.9 + average * 0.1);
        setIsSinging(average > 10);

        const isInRange = average > currentLevel.range.min && average < currentLevel.range.max;
        
        if (isInRange) {
          setProgress(p => {
            const next = p + (100 / (currentLevel.duration * 60));
            if (next >= 100) {
              handleLevelComplete();
              return 100;
            }
            return next;
          });
        } else {
          setProgress(p => Math.max(0, p - 0.4));
        }

        if (progress < 100) {
          requestRef.current = requestAnimationFrame(update);
        }
      };
      setActive(true);
      setChestOpen(false);
      update();
    } catch (e) {
      console.error("Hardware de áudio inacessível", e);
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
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-slate-900">
      {/* CENÁRIO BASE (1.png) */}
      <div className="absolute inset-0 z-0">
        <img src="/assets/images/games/elevador/1.png" alt="Cenário" className="w-full h-full object-cover opacity-60" />
      </div>

      {!active ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-50 text-center space-y-8 p-12 bg-black/40 backdrop-blur-xl rounded-[4rem] border-4 border-white/10"
        >
          <div className="w-32 h-32 mx-auto bg-pink-500/20 rounded-[2.5rem] flex items-center justify-center text-pink-500 border-4 border-pink-500 shadow-2xl animate-pulse">
            <Volume2 className="w-16 h-16" />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Elevador de Voz</h2>
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
              Use sua voz para subir os andares da torre de cristal. Mantenha o tom estável para ganhar!
            </p>
          </div>
          <Button onClick={start} className="h-20 px-16 rounded-full bg-pink-600 text-white font-black uppercase text-xl shadow-[0_15px_30px_rgba(219,39,119,0.4)] border-b-8 border-pink-800 active:translate-y-2 transition-all">
            Iniciar Missão
          </Button>
          <div className="flex items-center gap-2 justify-center text-[8px] font-black uppercase text-white/30 tracking-widest">
            <ShieldCheck className="w-3 h-3" /> Hardware Local & Privado
          </div>
        </motion.div>
      ) : (
        <div className="relative w-full max-w-lg h-full flex items-center justify-center py-20">
          
          {/* ARQUITETURA DA TORRE (4.png) */}
          <div className="absolute inset-y-10 w-64 z-10">
             <img src="/assets/images/games/elevador/4.png" alt="Torre" className="w-full h-full object-contain drop-shadow-2xl" />
             
             {/* Target Zone (Visualização da Faixa Segura) */}
             <motion.div 
               animate={{ y: 200 - (phaseIdx * 20) }}
               className="absolute inset-x-8 h-32 bg-green-500/10 border-y-2 border-green-500/40 backdrop-blur-sm flex items-center justify-center"
             >
                <div className="text-[8px] font-black text-green-500 uppercase tracking-widest animate-pulse">Sintonizar Aqui</div>
             </motion.div>
          </div>

          {/* CABINE E HERÓI (5.png, 2.png, 3.png) */}
          <motion.div 
            animate={{ y: 300 - (smoothedVolume * 5.5) }} 
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
            className="absolute w-40 h-64 z-20 flex flex-col items-center justify-center"
          >
             {/* Cabine (5.png) */}
             <div className="absolute inset-0 flex items-center justify-center">
                <img src="/assets/images/games/elevador/5.png" alt="Cabine" className="w-full h-full object-contain drop-shadow-2xl" />
             </div>

             {/* Robô (2.png ou 3.png) */}
             <div className="relative z-30 w-24 h-24 mb-6">
                <img 
                  src={isSinging ? "/assets/images/games/elevador/3.png" : "/assets/images/games/elevador/2.png"} 
                  alt="Herói" 
                  className="w-full h-full object-contain" 
                />
             </div>
          </motion.div>

          {/* BIOFEEDBACK LATERAL (6.png) */}
          <div className="absolute right-10 bottom-40 w-12 h-64 z-30 bg-black/20 rounded-full border-2 border-white/10 overflow-hidden">
             <motion.div 
               animate={{ height: `${volume}%` }}
               className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-pink-600 to-accent"
             >
                <img src="/assets/images/games/elevador/6.png" alt="Meter" className="w-full h-full object-cover mix-blend-overlay" />
             </motion.div>
          </div>

          {/* CAIXA DE RECOMPENSA NO TOPO (7.png ou 10.png) */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 z-40 w-24 h-24">
             <AnimatePresence mode="wait">
               {!chestOpen ? (
                 <motion.img 
                   key="closed"
                   initial={{ scale: 0.8 }} 
                   animate={{ scale: 1 }} 
                   exit={{ scale: 1.2, opacity: 0 }}
                   src="/assets/images/games/elevador/7.png" 
                   className="w-full h-full object-contain"
                 />
               ) : (
                 <motion.div 
                   key="open" 
                   initial={{ y: 20, opacity: 0 }} 
                   animate={{ y: 0, opacity: 1 }}
                   className="relative w-full h-full"
                 >
                    <img src="/assets/images/games/elevador/10.png" className="w-full h-full object-contain" />
                    {/* Moedas Saltando (8.png, 9.png) */}
                    <motion.img 
                      initial={{ y: 0, opacity: 1 }}
                      animate={{ y: -60, opacity: 0 }}
                      transition={{ duration: 1 }}
                      src="/assets/images/games/elevador/8.png" 
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10" 
                    />
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          {/* HUD DE PROGRESSO */}
          <div className="absolute bottom-20 inset-x-10 z-50 flex flex-col gap-3">
             <div className="flex justify-between items-end px-4">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-white uppercase tracking-tighter">{currentLevel.name}</span>
                   <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Nível de Sincronia</span>
                </div>
                <div className="text-2xl font-black text-white italic">{Math.round(progress)}%</div>
             </div>
             <div className="h-4 bg-white/10 rounded-full border border-white/5 overflow-hidden p-1">
                <motion.div 
                  animate={{ width: `${progress}%` }} 
                  className="h-full bg-pink-500 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.6)]" 
                />
             </div>
          </div>
        </div>
      )}

      {/* DIÁLOGO DE TRANSIÇÃO PEDAGÓGICA */}
      <AnimatePresence>
        {showTransition && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            className="absolute inset-0 z-[100] flex items-center justify-center p-8 bg-slate-900/80"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[4rem] p-10 max-w-sm w-full text-center space-y-8 shadow-[0_50px_100px_rgba(0,0,0,0.5)] border-8 border-pink-500/20"
            >
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-full h-full bg-white rounded-[2rem] border-4 border-green-500 flex items-center justify-center text-green-500">
                  <Trophy className="w-12 h-12" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">Andar Superado!</h3>
                <div className="inline-flex items-center gap-2 px-6 py-2 bg-yellow-100 rounded-full border border-yellow-200">
                   <img src="/assets/images/games/elevador/8.png" className="w-5 h-5" />
                   <span className="text-xl font-black text-yellow-800">+{currentLevel.reward} LC</span>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-3">
                 <Lightbulb className="w-6 h-6 text-yellow-500 mx-auto" />
                 <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ganhos de Maestria</h4>
                 <p className="text-[11px] font-medium leading-relaxed text-slate-600 italic">
                   "{currentLevel.benefit}"
                 </p>
              </div>

              <Button 
                onClick={nextLevel}
                className="w-full h-20 rounded-full bg-pink-600 text-white font-black uppercase shadow-2xl border-b-8 border-pink-800 active:translate-y-2 transition-all text-lg flex items-center justify-center gap-3"
              >
                {phaseIdx === VOICE_LEVELS.length - 1 ? 'Finalizar Maestro' : 'Subir Mais'} <Rocket className="w-6 h-6" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}