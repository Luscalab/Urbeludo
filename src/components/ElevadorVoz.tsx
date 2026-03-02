
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioProcessor } from '@/hooks/use-audio-processor';
import { askAuraHelper } from '@/ai/flows/aura-helper-flow';
import { AuraLogger } from '@/lib/logs/aura-logger';
import { cn } from '@/lib/utils';

interface ElevadorVozProps {
  onWin: (reward: number, type: string) => void;
  userName: string;
  onSuggestBreath: () => void;
}

const ASSETS_PATH = '/games/elevador/';

export function ElevadorVoz({ onWin, userName, onSuggestBreath }: ElevadorVozProps) {
  const { volume, isSinging } = useAudioProcessor(true);
  const [position, setPosition] = useState(0); 
  const [stableTime, setStabilityTime] = useState(0);
  const [rewardId, setRewardId] = useState<number | null>(null);
  const [isStable, setIsStable] = useState(false);
  const [oscillationCount, setOscillationCount] = useState(0);
  
  const lastVolumeRef = useRef(0);
  const stabilityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Lógica de Movimento: Volume (0-100) -> Altura (0-95%)
  useEffect(() => {
    const targetPos = Math.min(95, volume * 1.3);
    setPosition(prev => (prev * 0.7) + (targetPos * 0.3)); 

    // Detecção de instabilidade para intervenção da Aura
    const diff = Math.abs(volume - lastVolumeRef.current);
    if (diff > 25 && isSinging) {
      setOscillationCount(c => c + 1);
    }
    lastVolumeRef.current = volume;

    // Zona Alvo: 35% a 55% da torre
    const inZone = position >= 35 && position <= 55;
    setIsStable(inZone);
  }, [volume, isSinging, position]);

  // Cronômetro de Estabilidade
  useEffect(() => {
    if (isStable && isSinging) {
      if (!stabilityTimerRef.current) {
        stabilityTimerRef.current = setInterval(() => {
          setStabilityTime(t => {
            const next = t + 1;
            if (next === 5) setRewardId(7); 
            if (next === 10) setRewardId(8); 
            if (next >= 20) {
               setRewardId(10); 
               onWin(50, 'Mestre da Torre');
            }
            return next;
          });
        }, 1000);
      }
    } else {
      if (stabilityTimerRef.current) {
        clearInterval(stabilityTimerRef.current);
        stabilityTimerRef.current = null;
        setStabilityTime(0);
      }
    }
    return () => { if (stabilityTimerRef.current) clearInterval(stabilityTimerRef.current); };
  }, [isStable, isSinging, onWin]);

  return (
    <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center h-full w-full">
      
      {/* CAMADA 0: FUNDO AMBIENTE */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${ASSETS_PATH}1.png`} 
          className="w-full h-full object-cover opacity-30 mix-blend-screen" 
          alt="Ambiente" 
        />
      </div>

      {/* CAMADA 10: TRILHO DA TORRE (CENTRAL) */}
      <div className="absolute left-1/2 -translate-x-1/2 h-[85vh] w-64 z-10 flex items-center justify-center">
        <img 
          src={`${ASSETS_PATH}4.png`} 
          className="h-full w-full object-contain mix-blend-screen opacity-80" 
          alt="Torre Trilho" 
        />
        
        {/* INDICADOR DE ZONA DE FOCO */}
        <div className="absolute bottom-[35%] h-[20%] w-full bg-primary/10 border-y border-primary/30 pointer-events-none flex items-center justify-center">
           <span className="text-[8px] font-black text-primary/60 uppercase tracking-[0.4em] animate-pulse">Zona de Foco</span>
        </div>
      </div>

      {/* CAMADA 20: CONTAINER DO ELEVADOR (MÓVEL) */}
      <motion.div
        animate={{ bottom: `${position}%` }}
        transition={{ type: "spring", stiffness: 45, damping: 15 }}
        className="absolute left-1/2 -translate-x-1/2 w-48 z-20 flex items-center justify-center"
      >
        <div className="relative w-full aspect-square flex items-center justify-center">
          
          {/* CABINE */}
          <img 
            src={`${ASSETS_PATH}5.png`} 
            className="w-full h-full object-contain mix-blend-screen drop-shadow-[0_0_30px_rgba(147,51,234,0.4)]" 
            alt="Cabine" 
          />
          
          {/* ROBÔ (DENTRO DA CABINE) */}
          <div className="absolute inset-0 flex items-center justify-center pb-4">
            <img 
              src={volume > 10 ? `${ASSETS_PATH}3.png` : `${ASSETS_PATH}2.png`} 
              className="w-24 h-24 object-contain mix-blend-screen transition-all duration-150"
              alt="Piloto"
            />
          </div>

          {/* EFEITOS DE RECOMPENSA */}
          <AnimatePresence>
            {rewardId && (
              <motion.img
                key={rewardId}
                initial={{ opacity: 0, scale: 0, y: 0 }}
                animate={{ opacity: 1, scale: 1.2, y: -120 }}
                exit={{ opacity: 0, scale: 2 }}
                src={`${ASSETS_PATH}${rewardId}.png`}
                className="absolute z-50 w-16 mix-blend-screen"
                alt="Prêmio"
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* CAMADA 30: HUD (INTERFACE) */}
      
      {/* MEDIDOR dB (ESQUERDA) */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center">
        <div className="relative group">
          <img 
            src={`${ASSETS_PATH}6.png`} 
            className={cn(
              "w-32 h-auto transition-all duration-500 mix-blend-screen",
              isStable ? "brightness-150 drop-shadow-[0_0_20px_#9333ea]" : "opacity-40 grayscale"
            )} 
            alt="dB Meter" 
          />
          <motion.div 
            animate={{ bottom: `${position}%` }}
            className="absolute left-1/2 -translate-x-1/2 w-8 h-1 bg-accent shadow-[0_0_15px_#f43f5e] rounded-full z-40"
          />
        </div>
        <p className="mt-4 text-[9px] font-black text-white/40 uppercase tracking-widest">DB Level</p>
      </div>

      {/* PAINEL DE FOCO (DIREITA) */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-30 space-y-4">
         <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/10 text-center shadow-2xl min-w-[140px] flex flex-col items-center gap-2">
            <div className="text-[10px] font-black text-primary uppercase tracking-widest">Foco Ativo</div>
            <div className="text-4xl font-black text-white italic tracking-tighter tabular-nums">{stableTime}s</div>
            {isStable && (
              <div className="mt-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                <span className="text-[8px] font-bold text-green-400 uppercase">Sincronizado</span>
              </div>
            )}
         </div>
      </div>

      {/* RODAPÉ TÉCNICO */}
      <footer className="absolute bottom-10 z-30 flex flex-col items-center gap-4">
        <div className="h-1.5 w-48 bg-white/5 rounded-full overflow-hidden border border-white/5">
           <motion.div 
             className="h-full bg-primary shadow-[0_0_15px_rgba(147,51,234,0.8)]" 
             animate={{ width: `${position}%` }} 
           />
        </div>
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.8em]">Core System SPSP 2026</p>
      </footer>

    </div>
  );
}
