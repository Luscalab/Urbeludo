
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
  Eye,
  Info
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
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { saveToSheets } from '@/lib/sheets';

type GameMode = 'select' | 'balance' | 'rhythm' | 'path' | 'breath' | 'voice';

const VOICE_ASSETS = {
  roboParado: "https://picsum.photos/seed/robo-quiet/200/200",
  roboCantando: "https://picsum.photos/seed/robo-singing/200/200",
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
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ type: "spring", damping: 12 }}
        >
          <Trophy className="w-40 h-40 text-yellow-400 mb-8" />
        </motion.div>
        <h2 className="text-5xl font-black uppercase italic mb-8">Maestria!</h2>
        <Button onClick={() => router.push('/dashboard')} className="h-20 px-16 rounded-full bg-primary text-white font-black uppercase text-xl shadow-[0_20px_40px_rgba(147,51,234,0.4)] border-b-8 border-primary/70 active:border-b-0 active:translate-y-2 transition-all">
          Coletar +{rewardAmount} LC
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 flex flex-col relative overflow-hidden min-h-screen">
      {gameMode === 'select' ? (
        <div className="flex-1 p-8 flex flex-col items-center gap-10 overflow-y-auto no-scrollbar">
          <div className="flex flex-col items-center text-center space-y-2 mt-4">
            <h2 className="text-4xl font-black uppercase italic text-white leading-none">Missões 2026</h2>
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Laboratório Psicomotor</p>
          </div>
          
          <div className="grid gap-4 w-full max-w-sm pb-24">
            <GameModeCard icon={<Volume2 />} title="Elevador de Voz" desc="Controle vocal e estabilidade." color="bg-pink-500" onClick={() => handleModeSelect('voice')} />
            <GameModeCard icon={<Move />} title="Equilíbrio" desc="Mantenha a bolha estável." color="bg-blue-500" onClick={() => handleModeSelect('balance')} />
            <GameModeCard icon={<Wind />} title="Nuvem de Sopro" desc="Sopre para limpar a Aura." color="bg-teal-500" onClick={() => handleModeSelect('breath')} />
            <GameModeCard icon={<Music />} title="Maestro de Fluxo" desc="Siga o ritmo da Aura." color="bg-purple-500" onClick={() => handleModeSelect('rhythm')} />
            <GameModeCard icon={<Fingerprint />} title="Caminho de Luz" desc="Trace as linhas do amanhã." color="bg-orange-500" onClick={() => handleModeSelect('path')} />
          </div>
        </div>
      ) : (
        <div className="flex-1 relative flex flex-col h-full">
          <header className="absolute top-0 inset-x-0 p-8 flex items-center justify-between z-50 pointer-events-none">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setGameMode('select')} 
              className="text-white/40 bg-white/5 rounded-2xl pointer-events-auto h-12 w-12"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-2 pointer-events-auto">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setHighContrast(!highContrast)}
                className={cn("rounded-full border px-4 font-black text-[8px] uppercase h-10", highContrast ? "bg-yellow-400 text-black border-black" : "text-white/40 border-white/10")}
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
            {gameMode === 'balance' && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex-1 flex flex-col items-center justify-center text-white p-10 text-center gap-6">
                <div className="w-32 h-32 rounded-full border-4 border-blue-500 flex items-center justify-center animate-pulse">
                  <Move className="w-16 h-16 text-blue-500" />
                </div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Equilíbrio Ativo</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 max-w-xs">Mantenha a postura para estabilizar a Aura Biomecânica.</p>
                <Button onClick={() => handleWin(40, 'Mestre do Equilíbrio')} className="h-16 px-10 bg-blue-600 rounded-full font-black uppercase tracking-widest shadow-xl border-b-4 border-blue-800">Finalizar Treino</Button>
              </motion.div>
            )}
            {gameMode === 'breath' && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex-1 flex flex-col items-center justify-center text-white p-10 text-center gap-6">
                <div className="w-32 h-32 rounded-full border-4 border-teal-500 flex items-center justify-center animate-spin-slow">
                  <Wind className="w-16 h-16 text-teal-500" />
                </div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Nuvem de Sopro</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 max-w-xs">Controle sua respiração para limpar a névoa da tela.</p>
                <Button onClick={() => handleWin(35, 'Mestre do Sopro')} className="h-16 px-10 bg-teal-600 rounded-full font-black uppercase tracking-widest shadow-xl border-b-4 border-teal-800">Finalizar Treino</Button>
              </motion.div>
            )}
            {gameMode === 'rhythm' && <div className="flex-1 flex items-center justify-center text-white font-black uppercase italic tracking-tighter pt-24">Modo Maestro Ativo</div>}
            {gameMode === 'path' && <div className="flex-1 flex items-center justify-center text-white font-black uppercase italic tracking-tighter pt-24">Modo Caminho Ativo</div>}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="max-w-md rounded-[3rem] bg-slate-900 text-white p-10 border-none shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
          <DialogHeader>
            <div className="mx-auto w-20 h-20 bg-primary/20 rounded-[2rem] flex items-center justify-center mb-6 border border-primary/30">
              <Zap className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <DialogTitle className="text-3xl font-black uppercase italic text-center tracking-tighter">Missão Identificada</DialogTitle>
            <DialogDescription className="text-sm font-bold text-white/50 text-center uppercase mt-4 tracking-widest leading-relaxed">
              Prepare-se para o treino de Aura 2026. Use seus sentidos e consciência corporal para vencer.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => { setGameMode(pendingMode!); setShowTutorial(false); }} className="w-full h-20 rounded-full bg-primary text-white font-black uppercase text-lg shadow-xl border-b-8 border-primary/70 mt-6 active:border-b-0 active:translate-y-2 transition-all">Iniciar Missão</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * COMPONENTE: VoiceGame (Elevador de Voz)
 * Lógica Clínica: Estabilidade fonatória + Intervenção Proativa
 */
function VoiceGame({ onWin, userName, highContrast, onSuggestBreath }: any) {
  const { volume } = useAudioProcessor(true);
  const [progress, setProgress] = useState(0);
  const [fails, setFails] = useState(0);
  const [isStable, setIsStable] = useState(false);
  const [showFailDialog, setShowFailDialog] = useState(false);
  const [maxFailsReached, setMaxFailsReached] = useState(false);

  const volumeRef = useRef(volume);
  const progressRef = useRef(progress);
  const stabilityCounter = useRef(0);

  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { progressRef.current = progress; }, [progress]);

  useEffect(() => {
    const timer = setInterval(() => {
      const v = volumeRef.current;
      const p = progressRef.current;
      
      // LÓGICA CLÍNICA: Zona de Estabilidade (30% a 70% de amplitude)
      // Fora dessa zona indica ou falta de sustentação ou excesso de tensão muscular.
      const stable = v > 30 && v < 70;
      setIsStable(stable);

      if (stable) {
        setProgress(prev => Math.min(100, prev + 1.2)); // Ganho de progresso na zona ativa
        stabilityCounter.current += 1;
      } else if (v > 5) {
        setProgress(prev => Math.max(0, prev - 0.8)); // Penalidade suave por instabilidade
      }

      // Detecção de Falha: Som parou bruscamente no meio do exercício
      if (v < 5 && p > 15 && p < 95) {
         setFails(f => {
           const newFails = f + 1;
           if (newFails >= 3) {
             setShowFailDialog(true);
             setMaxFailsReached(true);
           }
           return newFails;
         });
         setProgress(0); // Reseta o elevador
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      // REGISTRO DE TELEMETRIA
      saveToSheets({ 
        paciente: userName, 
        volume: Math.round(volumeRef.current), 
        sustentacao: Math.round(stabilityCounter.current / 10), 
        tentativas: fails + 1, 
        feedback: "Maestria Vocal!", 
        relatorio: `Exercício concluído com ${fails} falhas. Estabilidade atingida.`, 
        fase: "Elevador 2026" 
      });
      onWin(50, 'Mestre da Voz');
    }
  }, [progress, userName, onWin, fails]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12 h-full">
      <div className="relative w-full max-w-xs h-[450px] bg-slate-900 rounded-[4rem] border-8 border-white/5 overflow-hidden flex flex-col justify-end shadow-2xl">
        
        {/* ZONA DE ESTABILIDADE (BIOFEEDBACK VISUAL) */}
        <div className={cn(
          "absolute left-0 right-0 h-40 transition-all duration-500 flex items-center justify-center",
          "bottom-[35%]",
          highContrast ? "bg-yellow-400/20 border-y-[8px] border-black" : "bg-green-500/10 border-y-4 border-green-500/30",
          isStable && (highContrast ? "bg-yellow-400/40 shadow-[0_0_60px_rgba(0,0,0,0.6)]" : "bg-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.3)]")
        )}>
          <div className="flex flex-col items-center">
            <span className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-1", highContrast ? "text-yellow-400" : "text-green-500")}>
              {isStable ? "ZONA ATIVA" : "MANTENHA AQUI"}
            </span>
            {isStable && <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }}><Zap className={cn("w-4 h-4", highContrast ? "text-yellow-400" : "text-green-500")} /></motion.div>}
          </div>
        </div>

        {/* O ELEVADOR (AVATAR) */}
        <motion.div 
          animate={{ y: -progress * 3.5 }}
          transition={{ type: "spring", stiffness: 60, damping: 20 }}
          className={cn(
            "w-28 h-28 mx-auto relative z-10 flex items-center justify-center rounded-[2.5rem] mb-10 transition-colors duration-300",
            highContrast ? "bg-white border-[8px] border-black" : (isStable ? "bg-green-500 shadow-[0_0_50px_rgba(34,197,94,0.6)]" : "bg-pink-500 shadow-xl")
          )}
        >
          <img 
            src={volume > 20 ? VOICE_ASSETS.roboCantando : VOICE_ASSETS.roboParado} 
            className="w-20 h-20 object-contain" 
            alt="Elevador Robot"
          />
          
          {/* Rastro de Aura */}
          <AnimatePresence>
            {isStable && (
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute inset-0 rounded-[2.5rem] border-4 border-white animate-ping opacity-20" 
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Gradiente de Fundo Dinâmico */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>

      <div className="space-y-4 text-center">
        <div className="flex items-center justify-center gap-4">
           <div className="w-12 h-1 bg-white/10 rounded-full" />
           <div className="text-6xl font-black italic text-white tracking-tighter tabular-nums">{Math.round(progress)}%</div>
           <div className="w-12 h-1 bg-white/10 rounded-full" />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Sustentação Vocal</span>
          {fails > 0 && <span className="text-[8px] font-bold text-red-500/60 uppercase mt-2">Falhas de Estabilidade: {fails}/3</span>}
        </div>
      </div>

      {/* INTERVENÇÃO DA AURA (3 FALHAS) */}
      <Dialog open={showFailDialog} onOpenChange={setShowFailDialog}>
        <DialogContent className="max-w-md rounded-[3rem] bg-slate-900 text-white p-10 border-none shadow-2xl">
          <DialogHeader>
            <div className="mx-auto w-20 h-20 bg-yellow-400 rounded-[2rem] flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(250,204,21,0.4)]">
              <AlertTriangle className="text-black w-10 h-10" />
            </div>
            <DialogTitle className="text-3xl font-black uppercase italic text-center tracking-tighter">Aura Cansada?</DialogTitle>
            <DialogDescription className="text-sm font-bold text-white/60 text-center uppercase mt-4 leading-relaxed tracking-widest">
              Detectei instabilidade na sua vibração vocal. Que tal treinar sua respiração com a <span className="text-teal-400">Nuvem de Sopro</span> primeiro para relaxar?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-8">
            <Button 
              onClick={() => { onSuggestBreath(); setShowFailDialog(false); }} 
              className="h-20 rounded-full bg-teal-500 text-white font-black uppercase text-sm shadow-xl border-b-8 border-teal-700 active:border-b-0 active:translate-y-2 transition-all"
            >
              Mudar para Nuvem de Sopro
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => { setShowFailDialog(false); setFails(0); }} 
              className="text-white/40 font-black uppercase text-[10px] h-12"
            >
              Tentar Novamente (Mais Suave)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
