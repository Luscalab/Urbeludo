
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
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
  Loader2,
  AlertTriangle,
  Eye
} from 'lucide-react';

import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useI18n } from '@/components/I18nProvider';
import { useAudioProcessor } from '@/hooks/use-audio-processor';
import { AuraLogger } from '@/lib/logs/aura-logger';
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
  roboParado: "/games/elevador/2.png",
  roboCantando: "/games/elevador/3.png",
};

const GameModeCard = React.memo(({ icon, title, desc, color, onClick }: any) => {
  return (
    <motion.div whileHover={{ scale: 1.02, x: 5 }} className="relative group w-full">
      <button onClick={onClick} className="p-5 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center gap-5 text-left transition-all hover:bg-white/10 w-full relative overflow-hidden active:scale-95">
        <div className={cn("w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shrink-0", color)}>
          {React.cloneElement(icon, { className: "w-8 h-8" })}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="text-sm font-black uppercase italic tracking-tighter text-white leading-tight">{title}</h3>
          <p className="text-[8px] text-white/40 font-bold uppercase leading-relaxed">{desc}</p>
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
  const [highContrast, setHighContrast] = useState(false);
  
  const userProgressRef = useMemoFirebase(() => user ? { id: user.uid, path: `user_progress/${user.uid}` } : null, [user]);
  const { data: profile } = useDoc(userProgressRef);

  const handleModeSelect = (mode: GameMode) => {
    setPendingMode(mode);
    setShowTutorial(true);
  };

  const handleWin = useCallback((reward: number = 30, type: string = 'Desafio Concluído') => {
    if (isWin) return;
    setIsWin(true);
    setRewardAmount(reward);
    
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
        history: newHistory
      });
      AuraLogger.info('Playground', `Vitória detectada no modo ${type}. Recompensa: ${reward} LC`);
    }
  }, [isWin, userProgressRef, profile]);

  if (isWin) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center text-white p-12 text-center">
        <Trophy className="w-40 h-40 text-yellow-400 mb-8 animate-bounce" />
        <h2 className="text-5xl font-black uppercase italic mb-8">Maestria!</h2>
        <Button onClick={() => router.push('/dashboard')} className="h-20 px-16 rounded-full bg-primary text-white font-black uppercase text-xl">
          Coletar +{rewardAmount} LC
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 flex flex-col relative overflow-hidden">
      {gameMode === 'select' ? (
        <div className="flex-1 p-8 flex flex-col items-center gap-10 overflow-y-auto no-scrollbar">
          <h2 className="text-4xl font-black uppercase italic text-white">Missões</h2>
          <div className="grid gap-4 w-full max-w-sm pb-10">
            <GameModeCard icon={<Move />} title="Equilíbrio" desc="Mantenha a bolha estável." color="bg-blue-500" onClick={() => handleModeSelect('balance')} />
            <GameModeCard icon={<Volume2 />} title="Elevador de Voz" desc="Use sua voz para subir." color="bg-pink-500" onClick={() => handleModeSelect('voice')} />
            <GameModeCard icon={<Wind />} title="Nuvem de Sopro" desc="Sopre para girar o moinho." color="bg-teal-500" onClick={() => handleModeSelect('breath')} />
            <GameModeCard icon={<Music />} title="Maestro de Fluxo" desc="Siga o ritmo da Aura." color="bg-purple-500" onClick={() => handleModeSelect('rhythm')} />
            <GameModeCard icon={<Fingerprint />} title="Caminho de Luz" desc="Trace as linhas do amanhã." color="bg-orange-500" onClick={() => handleModeSelect('path')} />
          </div>
        </div>
      ) : (
        <div className="flex-1 relative flex flex-col">
          <header className="absolute top-0 inset-x-0 p-8 flex items-center justify-between z-50">
            <Button variant="ghost" size="icon" onClick={() => setGameMode('select')} className="text-white/40 bg-white/5 rounded-2xl">
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setHighContrast(!highContrast)}
                className={cn("rounded-full border px-4 font-black text-[8px] uppercase", highContrast ? "bg-yellow-400 text-black border-black" : "text-white/40 border-white/10")}
              >
                <Eye className="w-3 h-3 mr-1" /> {highContrast ? 'Acessível ON' : 'Acessível OFF'}
              </Button>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {gameMode === 'voice' && (
              <VoiceGame 
                key="voice" 
                onWin={handleWin} 
                userName={profile?.displayName || "Explorador"} 
                highContrast={highContrast}
                onSuggestBreath={() => setGameMode('breath')}
              />
            )}
            {gameMode === 'balance' && <div className="flex-1 flex items-center justify-center text-white font-black uppercase pt-24">Modo Equilíbrio Ativo</div>}
            {gameMode === 'breath' && <div className="flex-1 flex items-center justify-center text-white font-black uppercase pt-24">Modo Sopro Ativo</div>}
            {gameMode === 'rhythm' && <div className="flex-1 flex items-center justify-center text-white font-black uppercase pt-24">Modo Maestro Ativo</div>}
            {gameMode === 'path' && <div className="flex-1 flex items-center justify-center text-white font-black uppercase pt-24">Modo Caminho Ativo</div>}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="max-w-md rounded-[3rem] bg-slate-900 text-white p-10 border-none">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black uppercase italic text-center">Missão Identificada</DialogTitle>
            <DialogDescription className="text-sm font-bold text-white/70 text-center uppercase mt-4">
              Prepare-se para o treino de Aura! Use seus sentidos para vencer.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => { setGameMode(pendingMode!); setShowTutorial(false); }} className="w-full h-20 rounded-full bg-primary font-black uppercase text-lg">Iniciar</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VoiceGame({ onWin, userName, highContrast, onSuggestBreath }: any) {
  const { volume } = useAudioProcessor(true);
  const [progress, setProgress] = useState(0);
  const [fails, setFails] = useState(0);
  const [isStable, setIsStable] = useState(false);
  const [showFailDialog, setShowFailDialog] = useState(false);

  const volumeRef = useRef(volume);
  const progressRef = useRef(progress);

  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { progressRef.current = progress; }, [progress]);

  useEffect(() => {
    const timer = setInterval(() => {
      const v = volumeRef.current;
      const p = progressRef.current;
      
      const stable = v > 30 && v < 70;
      setIsStable(stable);

      if (stable) {
        setProgress(prev => Math.min(100, prev + 1.5));
      } else if (v > 5) {
        setProgress(prev => Math.max(0, prev - 0.5));
      }

      if (v < 5 && p > 10 && p < 95) {
         setFails(f => {
           const newFails = f + 1;
           if (newFails >= 3) setShowFailDialog(true);
           return newFails;
         });
         setProgress(0);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      saveToSheets({ 
        paciente: userName, 
        volume: Math.round(volumeRef.current), 
        sustentacao: 10, 
        tentativas: 1, 
        feedback: "Maestria Vocal!", 
        relatorio: "Voz controlada com sucesso.", 
        fase: "Elevador 1" 
      });
      onWin(50, 'Mestre da Voz');
    }
  }, [progress, userName, onWin]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
      <div className="relative w-full max-w-xs h-80 bg-slate-900 rounded-[3rem] border-4 border-white/10 overflow-hidden flex flex-col justify-end">
        
        <div className={cn(
          "absolute left-0 right-0 h-32 transition-all duration-300 flex items-center justify-center",
          "bottom-[30%]",
          highContrast ? "bg-yellow-400/30 border-y-[6px] border-black" : "bg-green-500/20 border-y-2 border-green-500/50",
          isStable && (highContrast ? "bg-yellow-400 shadow-[0_0_40px_rgba(0,0,0,0.5)]" : "bg-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)]")
        )}>
          <span className={cn("text-[10px] font-black uppercase tracking-widest", highContrast ? "text-black" : "text-green-500")}>
            {isStable ? "ZONA ATIVA" : "MANTENHA AQUI"}
          </span>
        </div>

        <motion.div 
          animate={{ y: -progress * 2.5 }}
          className={cn(
            "w-24 h-24 mx-auto relative z-10 flex items-center justify-center rounded-[2rem]",
            highContrast ? "bg-white border-[6px] border-black" : "bg-pink-500 shadow-xl"
          )}
        >
          <img 
            src={volume > 30 ? VOICE_ASSETS.roboCantando : VOICE_ASSETS.roboParado} 
            className="w-16 h-16 object-contain" 
            alt="Robo"
          />
        </motion.div>
      </div>

      <div className="space-y-2 text-center">
        <div className="text-5xl font-black italic text-white">{Math.round(progress)}%</div>
        <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Sustentação Vocal</div>
      </div>

      <Dialog open={showFailDialog} onOpenChange={setShowFailDialog}>
        <DialogContent className="max-w-md rounded-[3rem] bg-slate-900 text-white p-10 border-none">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mb-4">
              <AlertTriangle className="text-black w-8 h-8" />
            </div>
            <DialogTitle className="text-2xl font-black uppercase text-center">Aura Cansada?</DialogTitle>
            <DialogDescription className="text-sm font-bold text-white/70 text-center uppercase mt-4 leading-relaxed">
              Percebi que está difícil subir o elevador. Que tal treinar sua respiração com a Nuvem de Sopro primeiro?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-6">
            <Button onClick={() => { onSuggestBreath(); setShowFailDialog(false); setFails(0); }} className="h-16 rounded-full bg-teal-500 font-black uppercase">Ir para Nuvem de Sopro</Button>
            <Button variant="ghost" onClick={() => { setShowFailDialog(false); setFails(0); }} className="text-white/40 font-black uppercase text-[10px]">Tentar Novamente</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
