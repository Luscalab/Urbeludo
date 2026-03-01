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
  Play,
  Volume2,
  AlertTriangle,
  Lightbulb,
  X,
  CheckCircle2,
  Bomb,
  Package,
  Ghost,
  Flame,
  DoorOpen,
  Gamepad2,
  BookOpen
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
              /* Titulo Invisível para Acessibilidade quando não há modo ativo (evita erro de montagem) */
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
        {gameMode === 'voice' && <VoiceGame key="voice" onWin={() => handleWin(50, 'Maestro Vocal')} auraColor={auraColor} />}
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

// --- JOGO 1: EQUILIBRISTA (Ajustado para crianças) ---
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
    { name: 'Ninho de Luz', threshold: 35, targetSize: 95, ballSize: 70, reward: 20, moveFrequency: 0, benefit: "Calibração inicial: sinta seu corpo no espaço." },
    { name: 'Pulo do Gato', threshold: 30, targetSize: 85, ballSize: 65, reward: 25, moveFrequency: 0, benefit: "Estabilidade básica." },
    { name: 'Equilíbrio na Árvore', threshold: 25, targetSize: 75, ballSize: 60, reward: 30, moveFrequency: 7000, benefit: "Atenção em movimento suave." },
    { name: 'Vento de Verão', threshold: 22, targetSize: 70, ballSize: 55, reward: 35, moveFrequency: 6000, benefit: "Ajustes posturais guiados." },
    { name: 'Ponte de Cristal', threshold: 20, targetSize: 65, ballSize: 50, reward: 40, moveFrequency: 5500, benefit: "Foco e precisão visomotora." }
  ];

  const currentPhase = BALANCE_PHASES[phaseIdx];

  const start = async () => {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    audioContextRef.current = new AC();
    if (audioContextRef.current?.state === 'suspended') await audioContextRef.current.resume();
    
    // Configura som ambiente de feedback harmônico
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
    
    const proximity = Math.max(0, 1 - (dist / 60));
    gainRef.current.gain.setTargetAtTime(proximity * 0.1, audioContextRef.current!.currentTime, 0.1);
    oscRef.current.frequency.setTargetAtTime(220 + (proximity * 220), audioContextRef.current!.currentTime, 0.1);

    const isInside = dist < currentPhase.threshold;

    const timer = setInterval(() => {
      if (isInside) setProgress(prev => Math.min(100, prev + 3.0)); 
      else setProgress(prev => Math.max(0, prev - 1.0)); 
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
              animate={{ x: targetPos.x * 4, y: targetPos.y * 4, scale: [1, 1.05, 1] }}
              transition={{ x: { type: "spring", stiffness: 80 }, y: { type: "spring", stiffness: 80 }, scale: { duration: 2, repeat: Infinity } }}
              className="absolute rounded-full border-4 border-dashed"
              style={{ width: currentPhase.targetSize * 2.5, height: currentPhase.targetSize * 2.5, borderColor: progress > 10 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)' }}
            />
            <motion.div animate={{ x: tilt.x * 4, y: tilt.y * 4 }} transition={{ type: "spring", stiffness: 150 }} className="rounded-full border-4 border-white shadow-[0_0_50px_rgba(0,0,0,0.5)] z-20" style={{ backgroundColor: auraColor, width: currentPhase.ballSize * 2, height: currentPhase.ballSize * 2 }} />
          </div>
          <AnimatePresence>
            {showPhaseTransition && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="absolute inset-0 z-[110] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8">
                <div className="p-6 bg-green-500/20 rounded-[3rem] border-4 border-green-500 text-green-500 mb-8"><CheckCircle2 className="w-16 h-16" /></div>
                <h2 className="text-4xl font-black uppercase italic text-white mb-2">Incrível!</h2>
                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 max-w-xs mb-10">
                   <Lightbulb className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
                   <h4 className="text-[10px] font-black uppercase text-yellow-500 tracking-widest mb-2">Aprendizado</h4>
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

// --- JOGO 2: MAESTRO (Áudio Orquestral) ---
function RhythmGame({ onWin, auraColor }: any) {
  const { t } = useI18n();
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState(0);
  const [hits, setHits] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const canHitRef = useRef(true);
  const currentAccelRef = useRef(0);
  const wasMovingBeforePulseRef = useRef(false);

  const PHASES = [
    { name: 'Brilhante', bpm: 55, reward: 30, goal: 4 },
    { name: 'Harmônico', bpm: 75, reward: 45, goal: 6 },
    { name: 'Vibrante', bpm: 95, reward: 60, goal: 8 },
    { name: 'Maestro', bpm: 115, reward: 80, goal: 10 }
  ];
  const currentPhase = PHASES[phase] || PHASES[0];

  useEffect(() => {
    if (hits >= currentPhase.goal) {
      if (phase < PHASES.length - 1) { setPhase(p => p + 1); setHits(0); }
      else onWin(currentPhase.reward, 'Maestro Supremo');
    }
  }, [hits, phase, onWin, currentPhase.goal, currentPhase.reward]);

  const showFeedback = (msgKey: string) => {
    setFeedback(t(`playground.modes.rhythm.${msgKey}`));
    setTimeout(() => setFeedback(null), 800);
  };

  const playNote = useCallback(() => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const baseFreq = 261.63 * Math.pow(2, hits / 12);

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc2.detune.setValueAtTime(5, now); 

    osc1.frequency.setValueAtTime(baseFreq, now);
    osc2.frequency.setValueAtTime(baseFreq * 2, now); 

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(); osc1.stop(now + 1.3);
    osc2.start(); osc2.stop(now + 1.3);
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
      wasMovingBeforePulseRef.current = currentAccelRef.current > 12;
      setPulse(true); canHitRef.current = true;
      setTimeout(() => setPulse(false), 250); 
    }, (60 / currentPhase.bpm) * 1000);

    const handleMotion = (e: DeviceMotionEvent) => {
      const accel = Math.sqrt((e.accelerationIncludingGravity?.x || 0) ** 2 + (e.accelerationIncludingGravity?.y || 0) ** 2 + (e.accelerationIncludingGravity?.z || 0) ** 2);
      currentAccelRef.current = accel;
      if (accel > 18 && canHitRef.current) {
        if (!pulse) showFeedback('tooEarly');
        else if (wasMovingBeforePulseRef.current) showFeedback('dontShake');
        else { setHits(h => h + 1); canHitRef.current = false; playNote(); }
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
           <motion.div animate={{ scale: pulse ? 1.3 : 1, opacity: pulse ? 1 : 0.4 }} className="w-48 h-48 rounded-[4rem] border-8 flex items-center justify-center shadow-2xl transition-colors" style={{ backgroundColor: pulse ? auraColor : 'transparent', borderColor: pulse ? 'white' : 'rgba(255,255,255,0.1)' }}>
             <Music className={cn("w-20 h-20", pulse ? "text-white" : "text-white/20")} />
           </motion.div>
           <div className="w-64 space-y-4">
              <div className="flex justify-between text-[9px] font-black uppercase text-white/40"><span>Harmonia</span><span>{hits}/{currentPhase.goal}</span></div>
              <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/5 p-1"><motion.div animate={{ width: `${(hits/currentPhase.goal)*100}%` }} className="h-full bg-primary rounded-full" /></div>
           </div>
           <AnimatePresence>{feedback && (<motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1.2 }} exit={{ opacity: 0 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"><span className="bg-red-500 text-white px-6 py-2 rounded-full font-black uppercase text-[10px]">{feedback}</span></motion.div>)}</AnimatePresence>
        </div>
      )}
    </div>
  );
}

// --- JOGO 3: CAMINHO ---
function PathGame({ onWin, auraColor }: any) {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const PHASES = [
    { name: 'Voo do Beija-Flor', path: 'M 50,450 L 50,50', reward: 30 },
    { name: 'Deslize da Serpente', path: 'M 50,450 C 150,350 -50,150 50,50', reward: 45 },
    { name: 'Zig Zag', path: 'M 50,450 L 150,350 L 50,250 L 150,150 L 50,50', reward: 60 }
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
    for (let i = 0; i <= 100; i += 2) {
      const p = path.getPointAtLength((i / 100) * length);
      const dist = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2);
      if (dist < bestDist) { bestDist = dist; bestProg = i / 100; }
    }
    if (bestDist < 50 && bestProg > progress - 0.08) setProgress(Math.max(progress, bestProg));
  };

  const currentPoint = pathRef.current ? pathRef.current.getPointAtLength(progress * pathRef.current.getTotalLength()) : { x: 50, y: 450 };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900">
      <div className="relative w-full max-w-xs aspect-[2/5] bg-white/5 rounded-[3rem] border-4 border-white/10 overflow-hidden">
        <svg ref={svgRef} viewBox="0 0 200 500" className="w-full h-full touch-none" onTouchMove={handleTouch}>
          <path ref={pathRef} d={currentPhase.path} fill="none" stroke="white" strokeWidth="30" strokeLinecap="round" strokeOpacity="0.1" />
          <path d={currentPhase.path} fill="none" stroke={auraColor} strokeWidth="30" strokeLinecap="round" strokeDasharray="1000" strokeDashoffset={1000 - (progress * 1000)} />
          <circle cx={currentPoint.x} cy={currentPoint.y} r="15" fill="white" />
        </svg>
      </div>
    </div>
  );
}

// --- JOGO 4: SOPRO ---
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
        if (average > 25) { rotationRef.current += average / 4; setLevel(prev => Math.min(100, prev + 0.6)); }
        else setLevel(prev => Math.max(0, prev - 0.2));
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

// --- JOGO 5: ELEVADOR DE VOZ ---
function VoiceGame({ onWin, auraColor }: { onWin: (reward: number, name: string) => void, auraColor: string }) {
  const [active, setActive] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [volume, setVolume] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showTransition, setShowTransition] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const requestRef = useRef<number>(null);

  const VOICE_LEVELS = Array.from({ length: 20 }, (_, i) => ({
    name: `Andar ${i + 1}`,
    duration: 3 + (i * 0.4), 
    range: { min: 20 - (i * 0.4), max: 60 + (i * 0.4) }, 
    targetFloor: 40 + (i * 2),
    reward: 50 + (i * 5),
    benefit: i === 0 ? "Controle inicial de fôlego e fluxo vocal." : `Sustentação avançada no nível ${i + 1}.`
  }));

  const currentLevel = VOICE_LEVELS[phaseIdx];

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const update = () => {
        analyser.getByteFrequencyData(dataArray);
        let average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVolume(average);

        const isInRange = average > currentLevel.range.min && average < currentLevel.range.max;
        
        if (isInRange) {
          setProgress(p => Math.min(100, p + (100 / (currentLevel.duration * 60))));
        } else {
          setProgress(p => Math.max(0, p - 0.4));
        }

        if (progress < 99) {
          requestRef.current = requestAnimationFrame(update);
        } else {
          handleLevelComplete();
        }
      };
      setActive(true);
      update();
    } catch (e) {
      console.error("Microfone bloqueado", e);
    }
  };

  const handleLevelComplete = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    setShowTransition(true);
  };

  const nextLevel = () => {
    setIsExploding(true);
    setTimeout(() => {
      if (phaseIdx < VOICE_LEVELS.length - 1) {
        setPhaseIdx(p => p + 1);
        setProgress(0);
        setShowTransition(false);
        setIsExploding(false);
        start();
      } else {
        onWin(currentLevel.reward, 'Mestre do Elevador');
      }
    }, 1500);
  };

  useEffect(() => {
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900 relative overflow-hidden">
      {!active ? (
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="w-24 h-24 rounded-[2.5rem] bg-pink-500/20 border-4 border-pink-500 flex items-center justify-center text-pink-500 mb-4 animate-pulse">
            <Volume2 className="w-12 h-12" />
          </div>
          <h3 className="text-3xl font-black uppercase italic text-white tracking-tighter">Elevador de Voz</h3>
          <Button onClick={start} className="h-20 px-16 rounded-full bg-pink-500 text-white font-black uppercase shadow-2xl border-b-8 border-pink-700 active:border-b-0 active:translate-y-2"><Play /> Subir Agora</Button>
        </div>
      ) : (
        <div className="relative w-full max-w-sm h-full flex flex-col items-center">
          <div className="absolute inset-y-10 w-40 bg-slate-800/50 rounded-3xl border-x-4 border-white/5 overflow-hidden">
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 2px, transparent 2px)', backgroundSize: '100% 40px' }} />
             
             <motion.div 
               animate={{ y: 200 - (phaseIdx * 5) }} 
               className="absolute inset-x-0 h-24 bg-green-500/20 border-y-2 border-green-500/50 flex items-center justify-center"
             >
                <div className="text-[8px] font-black text-green-500 uppercase tracking-widest animate-pulse">Zona Segura</div>
             </motion.div>

             <motion.div 
               animate={{ y: 400 - (volume * 4) }} 
               transition={{ type: "spring", stiffness: 100 }}
               className="absolute inset-x-4 h-16 rounded-2xl flex items-center justify-center shadow-2xl z-20"
               style={{ backgroundColor: auraColor }}
             >
               <Volume2 className="w-6 h-6 text-white" />
             </motion.div>
          </div>

          <div className="absolute top-20 left-4 right-4 flex flex-col gap-2">
             <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase text-pink-500">{currentLevel.name}</span>
                <span className="text-sm font-black text-white">{Math.round(progress)}%</span>
             </div>
             <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
                <motion.div animate={{ width: `${progress}%` }} className="h-full bg-pink-500" />
             </div>
          </div>

          <AnimatePresence>
            {showTransition && (
              <motion.div 
                initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center text-center p-8 bg-slate-900/80"
              >
                {!isExploding ? (
                  <>
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                      className="p-8 bg-white rounded-[3rem] border-8 border-pink-500 shadow-2xl mb-8"
                    >
                      <Package className="w-20 h-20 text-pink-500" />
                    </motion.div>
                    <h2 className="text-3xl font-black text-white uppercase italic italic mb-2">Piso Alcançado!</h2>
                    <Button 
                      onClick={nextLevel}
                      className="h-16 px-12 rounded-full bg-green-500 text-white font-black uppercase shadow-2xl flex gap-3 text-lg border-b-8 border-green-700 active:border-b-0 active:translate-y-2"
                    >
                      Próximo Andar <Rocket className="w-6 h-6" />
                    </Button>
                  </>
                ) : (
                  <motion.div 
                    initial={{ scale: 1 }} 
                    animate={{ scale: [1, 2, 0], opacity: [1, 1, 0] }}
                    className="flex flex-col items-center"
                  >
                    <Bomb className="w-32 h-32 text-red-500 animate-bounce" />
                    <div className="text-4xl font-black text-red-500 uppercase italic">BOOOOM!</div>
                    <Flame className="w-20 h-20 text-orange-500" />
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
