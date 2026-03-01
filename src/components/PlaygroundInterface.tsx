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
  Wind,
  Volume2,
  Loader2
} from 'lucide-react';

import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useI18n } from '@/components/I18nProvider';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';
import { useAudioProcessor } from '@/hooks/use-audio-processor';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { saveToSheets } from '@/lib/sheets';

type GameMode = 'select' | 'balance' | 'rhythm' | 'path' | 'breath' | 'voice';

const VOICE_ASSETS = {
  fundo: "/games/elevador/1.png",
  roboParado: "/games/elevador/2.png",
  roboCantando: "/games/elevador/3.png",
  torre: "/games/elevador/4.png",
  cabine: "/games/elevador/5.png",
  medidor: "/games/elevador/6.png",
  caixaFechada: "/games/elevador/7.png",
  ludocoin: "/games/elevador/8.png",
  pilhaMoedas: "/games/elevador/9.png",
  caixaAberta: "/games/elevador/10.png"
};

const GameModeCard = React.memo(({ icon, title, desc, goal, color, onClick }: any) => {
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
            <span className="text-[7px] font-black uppercase text-primary/60 tracking-widest">Meta: {goal.split(' ')[0]}</span>
          </div>
        </div>
      </button>
    </motion.div>
  );
});
GameModeCard.displayName = 'GameModeCard';

export function PlaygroundInterface({ debugMode = false }: { debugMode?: boolean }) {
  const router = useRouter();
  const { user } = useUser();
  const { t } = useI18n();
  
  const [gameMode, setGameMode] = useState<GameMode>('select');
  const [isWin, setIsWin] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
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

  const handleWin = useCallback((reward: number = 30, type: string = 'Desafio Concluído') => {
    if (isWin) return;
    setIsWin(true);
    setRewardAmount(reward);
    speak("Incrível! Sua aura está brilhando!");
    
    if (userProgressRef && profile) {
      const history = profile.history || [];
      const completedCount = profile.totalChallengesCompleted || 0;
      const newHistory = [{
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        score: 100,
        earnedCoins: reward,
        type: type
      }, ...history].slice(0, 5);
      
      updateDocumentNonBlocking(userProgressRef, { 
        ludoCoins: (profile.ludoCoins || 0) + reward,
        totalChallengesCompleted: completedCount + 1,
        history: newHistory,
        psychomotorLevel: Math.floor((completedCount + 1) / 5) + 1
      });
    }
  }, [isWin, userProgressRef, profile, speak]);

  if (isWin) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center text-white p-12 text-center">
        <Trophy className="w-40 h-40 text-yellow-400 mb-8 animate-bounce relative z-10" />
        <h2 className="text-5xl font-black uppercase italic mb-8 relative z-10">{t('playground.winTitle')}</h2>
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[3rem] mb-10 border-4 border-white/20 relative z-10">
           <span className="text-6xl font-black text-white">+{rewardAmount} LC</span>
        </div>
        <Button onClick={() => router.push('/dashboard')} className="h-20 px-16 rounded-full bg-primary text-white font-black uppercase shadow-2xl text-xl relative z-10 border-b-8 border-primary/70">
          {t('playground.collectCoins')}
        </Button>
      </motion.div>
    );
  }

  if (gameMode === 'select') {
    return (
      <div className="flex-1 bg-slate-950 p-8 flex flex-col items-center justify-start gap-10 relative overflow-y-auto no-scrollbar">
        <AccessibilityToolbar />
        <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Centro de Treino</h2>
        <div className="grid gap-4 w-full max-w-sm pb-10">
          <GameModeCard icon={<Move />} title={t('playground.modes.balance.title')} desc={t('playground.modes.balance.desc')} goal={t('playground.modes.balance.goal')} color="bg-blue-500" onClick={() => handleModeSelect('balance')} />
          <GameModeCard icon={<Music />} title={t('playground.modes.rhythm.title')} desc={t('playground.modes.rhythm.desc')} goal={t('playground.modes.rhythm.goal')} color="bg-primary" onClick={() => handleModeSelect('rhythm')} />
          <GameModeCard icon={<Fingerprint />} title={t('playground.modes.path.title')} desc={t('playground.modes.path.desc')} goal={t('playground.modes.path.goal')} color="bg-accent" onClick={() => handleModeSelect('path')} />
          <GameModeCard icon={<Wind />} title={t('playground.modes.breath.title')} desc={t('playground.modes.breath.desc')} goal={t('playground.modes.breath.goal')} color="bg-teal-500" onClick={() => handleModeSelect('breath')} />
          <GameModeCard icon={<Volume2 />} title={t('playground.modes.voice.title')} desc={t('playground.modes.voice.desc')} goal={t('playground.modes.voice.goal')} color="bg-pink-500" onClick={() => handleModeSelect('voice')} />
        </div>
        
        <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
          <DialogContent className="max-w-md rounded-[3rem] border-8 border-primary/20 bg-slate-900 text-white p-10">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black uppercase italic text-white text-center">Preparar Missão!</DialogTitle>
              <DialogDescription className="text-sm font-bold text-white/70 uppercase text-center mt-4">
                {pendingMode ? t(`playground.modes.${pendingMode}.info`) : t('playground.selectGame')}
              </DialogDescription>
            </DialogHeader>
            <Button onClick={() => { setGameMode(pendingMode!); setShowTutorial(false); }} className="w-full h-20 rounded-full bg-primary text-white font-black uppercase text-lg border-b-8 border-primary/70 active:translate-y-2 transition-all">Iniciar Desafio</Button>
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
        <span className="text-[10px] font-black uppercase tracking-widest text-white">{t(`playground.modes.${gameMode}.title`)}</span>
        <div className="w-10" />
      </header>

      <AnimatePresence mode="wait">
        {gameMode === 'balance' && <BalanceGame key="balance" onWin={handleWin} auraColor={auraColor} />}
        {gameMode === 'voice' && <VoiceGame key="voice" onWin={handleWin} auraColor={auraColor} ludoCoins={profile?.ludoCoins || 0} userName={profile?.displayName || "Explorador"} />}
      </AnimatePresence>
    </div>
  );
}

function BalanceGame({ onWin, auraColor }: any) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-white space-y-4">
      <Move className="w-20 h-20 text-blue-500 animate-pulse" />
      <p className="text-[10px] font-black uppercase tracking-widest">Equilíbrio Ativo</p>
    </div>
  );
}

function VoiceGame({ onWin, auraColor, ludoCoins, userName }: any) {
  const { volume, isSinging } = useAudioProcessor(true);
  const [progress, setProgress] = useState(0);
  const [chestOpen, setChestOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (volume > 20) setProgress(p => {
        if (p >= 100) {
          if (!chestOpen) {
            setChestOpen(true);
            saveToSheets({ 
              paciente: userName, 
              volume: Math.round(volume), 
              sustentacao: 10, 
              tentativas: 1, 
              feedback: "Aura Forte!", 
              relatorio: "Estabilidade fonatória ok.", 
              fase: "Andar 1" 
            });
            setTimeout(() => onWin(50, 'Maestro da Voz'), 2000);
          }
          return 100;
        }
        return p + 1;
      });
      else setProgress(p => Math.max(0, p - 0.5));
    }, 100);
    return () => clearInterval(timer);
  }, [volume, chestOpen, onWin, userName]);

  return (
    <div className="flex-1 relative flex flex-col items-center justify-center">
      <img src={VOICE_ASSETS.fundo} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-40" />
      <div className="relative z-10 w-full max-w-xs space-y-8">
        <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/5">
          <motion.div animate={{ width: `${progress}%` }} className="h-full bg-pink-500 shadow-[0_0_20px_pink]" />
        </div>
        <div className="flex flex-col items-center gap-4">
           <img src={isSinging ? VOICE_ASSETS.roboCantando : VOICE_ASSETS.roboParado} loading="lazy" className="w-32 h-32 object-contain" />
           <p className="text-white font-black uppercase italic tracking-widest">{Math.round(progress)}%</p>
        </div>
      </div>
    </div>
  );
}
