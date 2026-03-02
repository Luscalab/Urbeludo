
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioProcessor } from '@/hooks/use-audio-processor';
import { askAuraHelper } from '@/ai/flows/aura-helper-flow';
import { AuraLogger } from '@/lib/logs/aura-logger';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ElevadorVozProps {
  onWin: (reward: number, type: string) => void;
  userName: string;
  onSuggestBreath: () => void;
}

const ASSETS_PATH = '/games/elevador/';

export function ElevadorVoz({ onWin, userName, onSuggestBreath }: ElevadorVozProps) {
  const { volume, isSinging } = useAudioProcessor(true);
  const [position, setPosition] = useState(0); // 0 a 100
  const [stableTime, setStabilityTime] = useState(0);
  const [rewardId, setRewardId] = useState<number | null>(null);
  const [isStable, setIsStable] = useState(false);
  const [oscillationCount, setOscillationCount] = useState(0);
  
  const lastVolumeRef = useRef(0);
  const stabilityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Lógica de Movimento e Sprites
  useEffect(() => {
    // Normalização: volume 0-100 mapeado para altura
    const targetPos = Math.min(100, volume * 1.2);
    setPosition(prev => (prev * 0.6) + (targetPos * 0.4)); // Suavização

    // Detecção de Oscilação (Tensão Muscular)
    const diff = Math.abs(volume - lastVolumeRef.current);
    if (diff > 25 && isSinging) {
      setOscillationCount(c => c + 1);
    }
    lastVolumeRef.current = volume;

    // Zona de Estabilidade (30% a 50%)
    const inZone = position >= 30 && position <= 50;
    setIsStable(inZone);
  }, [volume, isSinging, position]);

  // Sistema de Recompensas e Estabilidade
  useEffect(() => {
    if (isStable && isSinging) {
      if (!stabilityTimerRef.current) {
        stabilityTimerRef.current = setInterval(() => {
          setStabilityTime(t => {
            const next = t + 1;
            if (next === 5) setRewardId(7); // Presente
            if (next === 10) setRewardId(8); // Moeda
            if (next >= 20) {
               setRewardId(10); // Baú
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

  // Feedback IA Gemini 3 em caso de oscilação
  useEffect(() => {
    if (oscillationCount > 15) {
      setOscillationCount(0);
      askAuraHelper({
        question: "Dê um conselho curto para uma criança que está oscilando muito a voz no jogo do elevador.",
        context: "Exercício de Psicomotricidade / Elevador de Voz"
      }).then(res => {
        AuraLogger.info('IA_FEEDBACK', res.answer);
      });
    }
  }, [oscillationCount]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-950 overflow-hidden h-full relative">
      
      {/* HUD Medidor dB (6.png) */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50">
        <img 
          src={`${ASSETS_PATH}6.png`} 
          className={cn(
            "w-48 transition-all duration-300", 
            isStable ? "brightness-125 drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]" : "opacity-60"
          )} 
          alt="Medidor" 
        />
        {isStable && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-[10px] font-black uppercase animate-pulse">Zona Ativa: {stableTime}s</span>
          </div>
        )}
      </div>

      <div className="relative w-full max-w-sm h-[600px] flex items-end justify-center">
        
        {/* Fundo/Chão (1.png) */}
        <img src={`${ASSETS_PATH}1.png`} className="absolute bottom-0 w-full z-0 opacity-40" alt="Chão" />

        {/* Torre (4.png) */}
        <div className="relative h-full w-32 flex flex-col justify-end pb-10">
          <img src={`${ASSETS_PATH}4.png`} className="h-[90%] w-full object-contain" alt="Torre" />
          
          {/* Cabine (5.png) */}
          <motion.div 
            animate={{ bottom: `${position}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 15 }}
            className="absolute left-1/2 -translate-x-1/2 w-24 z-20"
          >
            <img src={`${ASSETS_PATH}5.png`} className="w-full drop-shadow-2xl" alt="Cabine" />
            
            {/* Recompensa flutuante */}
            <AnimatePresence>
              {rewardId && (
                <motion.img 
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: -60 }}
                  exit={{ opacity: 0, scale: 2 }}
                  src={`${ASSETS_PATH}${rewardId}.png`}
                  className="absolute -top-10 left-1/2 -translate-x-1/2 w-12"
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Robô (2.png ou 3.png) */}
        <div className="absolute bottom-10 right-4 w-32 z-30">
          <img 
            src={isSinging ? `${ASSETS_PATH}3.png` : `${ASSETS_PATH}2.png`} 
            className="w-full h-auto object-contain transition-all duration-100" 
            alt="Robô" 
          />
        </div>

      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center space-y-2">
        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Controle de Fonação SPSP 2026</p>
        {stableTime > 0 && <p className="text-primary font-bold text-xl uppercase italic">Foco Mantido!</p>}
      </div>

    </div>
  );
}
