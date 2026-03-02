
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
  const { volume, isSinging, error: audioError } = useAudioProcessor(true);
  const [position, setPosition] = useState(0); 
  const [stableTime, setStabilityTime] = useState(0);
  const [rewardId, setRewardId] = useState<number | null>(null);
  const [isStable, setIsStable] = useState(false);
  const [oscillationCount, setOscillationCount] = useState(0);
  
  const lastVolumeRef = useRef(0);
  const stabilityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Lógica de Movimento: Volume (0-100) -> Altura (0-95%)
  useEffect(() => {
    // Normalização do volume para o movimento da cabine
    const targetPos = Math.min(95, volume * 1.2);
    setPosition(prev => (prev * 0.8) + (targetPos * 0.2)); 

    // Detecção de instabilidade (Psicomotricidade)
    const diff = Math.abs(volume - lastVolumeRef.current);
    if (diff > 30 && isSinging) {
      setOscillationCount(c => c + 1);
      if (oscillationCount > 10) {
        AuraLogger.warn('Elevador', 'Alta oscilação detectada. Possível fadiga vocal.');
      }
    }
    lastVolumeRef.current = volume;

    // Zona de Estabilidade (Meta Clínica)
    const inZone = position >= 30 && position <= 55;
    setIsStable(inZone);
  }, [volume, isSinging, position, oscillationCount]);

  // Cronômetro de Estabilidade e Recompensas
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
               onWin(50, 'Mestre da Fonação');
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
        setRewardId(null);
      }
    }
    return () => { if (stabilityTimerRef.current) clearInterval(stabilityTimerRef.current); };
  }, [isStable, isSinging, onWin]);

  return (
    <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center h-full w-full max-w-md mx-auto shadow-2xl border-x border-white/5">
      
      {/* CAMADA 0: FUNDO (1.png) */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${ASSETS_PATH}1.png`} 
          className="w-full h-full object-cover opacity-40" 
          alt="Cenário" 
        />
      </div>

      {/* CAMADA 10: TORRE CENTRAL (4.png) */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-full max-h-[90vh] z-10 flex items-center justify-center">
        <img 
          src={`${ASSETS_PATH}4.png`} 
          className="h-full w-auto object-contain mix-blend-multiply brightness-[1.2] contrast-[1.1]" 
          alt="Torre" 
        />
        
        {/* ZONA DE FOCO INDICADOR */}
        <div className="absolute bottom-[30%] h-[25%] w-32 bg-primary/5 border-y-2 border-primary/20 pointer-events-none flex items-center justify-center">
           <span className="text-[7px] font-black text-primary/40 uppercase tracking-[0.3em] animate-pulse">Zona Ativa</span>
        </div>
      </div>

      {/* CAMADA 20: CONTAINER DO ELEVADOR (CABINE + ROBÔ) */}
      <motion.div
        animate={{ bottom: `${position}%` }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
        className="absolute left-1/2 -translate-x-1/2 w-40 z-20 flex items-center justify-center"
      >
        <div className="relative w-full aspect-square flex items-center justify-center">
          
          {/* CABINE (5.png) */}
          <img 
            src={`${ASSETS_PATH}5.png`} 
            className="w-full h-full object-contain mix-blend-multiply brightness-[1.2] contrast-[1.1] drop-shadow-2xl" 
            alt="Cabine" 
          />
          
          {/* ROBÔ (2.png ou 3.png) */}
          <div className="absolute inset-0 flex items-center justify-center pb-6">
            <img 
              src={volume > 5 ? `${ASSETS_PATH}3.png` : `${ASSETS_PATH}2.png`} 
              className="w-[45%] h-auto object-contain mix-blend-multiply brightness-[1.3] contrast-[1.2] transition-transform duration-150"
              alt="Piloto"
            />
          </div>

          {/* EFEITOS DE RECOMPENSA (7.png e outros) */}
          <AnimatePresence>
            {rewardId && (
              <motion.img
                key={rewardId}
                initial={{ opacity: 0, scale: 0, y: 0 }}
                animate={{ opacity: 1, scale: 1.2, y: -80 }}
                exit={{ opacity: 0, scale: 2 }}
                src={`${ASSETS_PATH}${rewardId}.png`}
                className="absolute z-50 w-12 mix-blend-multiply brightness-125"
                alt="Prêmio"
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* CAMADA 30: HUD MOBILE */}
      
      {/* MEDIDOR DB ESQUERDA (6.png) */}
      <div className="absolute left-4 top-1/4 z-30 flex flex-col items-center gap-2">
        <div className="relative">
          <img 
            src={`${ASSETS_PATH}6.png`} 
            className={cn(
              "w-10 h-auto transition-all duration-500",
              isStable ? "brightness-150 drop-shadow-[0_0_10px_#9333ea]" : "opacity-30 grayscale"
            )} 
            alt="dB Meter" 
          />
          <motion.div 
            animate={{ bottom: `${position}%` }}
            className="absolute left-1/2 -translate-x-1/2 w-6 h-0.5 bg-accent shadow-[0_0_10px_#f43f5e] rounded-full z-40"
          />
        </div>
        <p className="text-[7px] font-black text-white/30 uppercase tracking-widest">DB Level</p>
      </div>

      {/* PAINEL DE FOCO DIREITA (GLASSMORPHISM) */}
      <div className="absolute right-4 top-10 z-30">
         <div className="bg-white/5 backdrop-blur-xl p-4 rounded-[2rem] border border-white/10 text-center shadow-xl min-w-[100px]">
            <div className="text-[8px] font-black text-primary uppercase tracking-widest mb-1">Foco Ativo</div>
            <div className="text-3xl font-black text-white italic tracking-tighter tabular-nums">{stableTime}s</div>
            {isStable && (
              <div className="mt-1 flex items-center justify-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                <span className="text-[7px] font-bold text-green-400 uppercase">Estável</span>
              </div>
            )}
         </div>
      </div>

      {/* RODAPÉ TÉCNICO */}
      <footer className="absolute bottom-6 z-30 flex flex-col items-center gap-3">
        <div className="h-1 w-32 bg-white/5 rounded-full overflow-hidden">
           <motion.div 
             className="h-full bg-primary shadow-[0_0_10px_rgba(147,51,234,0.8)]" 
             animate={{ width: `${volume}%` }} 
           />
        </div>
        <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.6em]">CORE SYSTEM SPSP 2026</p>
      </footer>

      {audioError && (
        <div className="absolute inset-0 z-[100] bg-red-950/90 backdrop-blur-md flex items-center justify-center p-8 text-center">
          <p className="text-white font-bold text-xs uppercase tracking-widest">{audioError}</p>
        </div>
      )}

    </div>
  );
}
