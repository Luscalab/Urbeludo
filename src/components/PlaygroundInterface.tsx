
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
import { ElevadorVoz } from '@/components/ElevadorVoz';

type GameMode = 'select' | 'balance' | 'rhythm' | 'path' | 'breath' | 'voice';

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
              <ElevadorVoz 
                key="voice" 
                onWin={handleWin} 
                userName={profile?.displayName || "Explorador"} 
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
