
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioProcessor } from '@/hooks/use-audio-processor';
import { cn } from '@/lib/utils';

interface ElevadorVozProps {
  onWin: (reward: number, type: string) => void;
  userName: string;
  onSuggestBreath: () => void;
}

const ASSETS_PATH = '/games/elevador/';

/**
 * ElevadorVoz 2026 - Versão Transparência Total & Mobile-First.
 * Otimizado para APK Android com assets transparentes nativos.
 */
export function ElevadorVoz({ onWin, userName, onSuggestBreath }: ElevadorVozProps) {
  const { volume, isSinging, error: audioError } = useAudioProcessor(true);
  const [position, setPosition] = useState(0); 
  const [stableTime, setStabilityTime] = useState(0);
  const [rewardId, setRewardId] = useState<number | null>(null);
  const [isStable, setIsStable] = useState(false);
  
  const stabilityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Lógica de Movimento: Volume (0-100) -> Altura do Elevador (0-100%)
  useEffect(() => {
    // Sensibilidade ajustada para crianças
    const targetPos = Math.min(100, volume * 1.4);
    setPosition(prev => (prev * 0.85) + (targetPos * 0.15)); 

    // Zona de Estabilidade Psicomotora (30% a 55%)
    const inZone = position >= 30 && position <= 55;
    setIsStable(inZone);
  }, [volume, position]);

  // Cronômetro de Fonação Sustentada
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
    <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center h-full w-full max-w-[430px] mx-auto border-x border-white/5 shadow-2xl">
      
      {/* 1. CAMADA DE FUNDO (1.png) */}
      <div className="absolute inset-0 z-0 bg-transparent">
        <img 
          src={`${ASSETS_PATH}1.png`} 
          className="w-full h-full object-cover opacity-20 pointer-events-none unoptimized" 
          alt="" 
        />
      </div>

      {/* 2. ESTRUTURA DA TORRE (4.png) - 70% da Altura */}
      <div className="relative h-[70vh] w-full z-10 flex items-center justify-center bg-transparent">
        <img 
          src={`${ASSETS_PATH}4.png`} 
          className="h-full w-auto object-contain pointer-events-none bg-transparent filter brightness-110" 
          alt="Torre Central" 
        />
        
        {/* INDICADOR DE ZONA ATIVA (Feedback Visual) */}
        <div className="absolute bottom-[30%] h-[25%] w-36 border-y-2 border-primary/20 bg-transparent pointer-events-none flex items-center justify-center">
           <span className="text-[8px] font-black text-primary/40 uppercase tracking-[0.4em] animate-pulse">Zona Ativa</span>
        </div>

        {/* 3. O ELEVADOR (Container da Cabine + Robô) */}
        <motion.div
          animate={{ bottom: `${position}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 25 }}
          className="absolute left-1/2 -translate-x-1/2 w-48 z-20 flex items-center justify-center bg-transparent"
          style={{ bottom: 0 }}
        >
          <div className="relative w-full aspect-square flex items-center justify-center bg-transparent">
            
            {/* CABINE (5.png) */}
            <img 
              src={`${ASSETS_PATH}5.png`} 
              className="w-full h-full object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.5)] pointer-events-none bg-transparent" 
              alt="Cabine" 
            />
            
            {/* ROBÔ (2.png ou 3.png) - Encapsulado no centro da cabine */}
            <div className="absolute inset-0 flex items-center justify-center pb-8 bg-transparent">
              <img 
                src={volume > 5 ? `${ASSETS_PATH}3.png` : `${ASSETS_PATH}2.png`} 
                className="w-[45%] h-auto object-contain transition-transform duration-150 pointer-events-none bg-transparent"
                alt="Piloto"
              />
            </div>

            {/* FEEDBACK DE RECOMPENSA (7-10.png) */}
            <AnimatePresence>
              {rewardId && (
                <motion.img
                  key={rewardId}
                  initial={{ opacity: 0, scale: 0, y: 0 }}
                  animate={{ opacity: 1, scale: 1.2, y: -120 }}
                  exit={{ opacity: 0, scale: 2 }}
                  src={`${ASSETS_PATH}${rewardId}.png`}
                  className="absolute z-50 w-16 pointer-events-none bg-transparent filter brightness-125"
                  alt="Prêmio"
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* 4. HUD DE TELEMETRIA (Interface de Usuário) */}
      
      {/* Esquerda: Medidor dB (6.png) */}
      <div className="absolute left-6 top-1/4 z-30 flex flex-col items-center gap-2 bg-transparent">
        <div className="relative bg-transparent">
          <img 
            src={`${ASSETS_PATH}6.png`} 
            className={cn(
              "w-14 h-auto transition-all duration-500 bg-transparent",
              isStable ? "brightness-150 drop-shadow-[0_0_20px_#9333ea]" : "opacity-30"
            )} 
            alt="dB Meter" 
          />
          <motion.div 
            animate={{ bottom: `${position}%` }}
            className="absolute left-1/2 -translate-x-1/2 w-8 h-1 bg-accent shadow-[0_0_15px_#f43f5e] rounded-full z-40"
          />
        </div>
        <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">DB Level</p>
      </div>

      {/* Direita: Cronômetro de Foco (Glassmorphism) */}
      <div className="absolute right-6 top-12 z-30 bg-transparent">
         <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 text-center shadow-2xl min-w-[120px]">
            <div className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Foco Ativo</div>
            <div className="text-4xl font-black text-white italic tracking-tighter tabular-nums">{stableTime}s</div>
            {isStable && (
              <div className="mt-2 flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                <span className="text-[8px] font-bold text-green-400 uppercase">Estável</span>
              </div>
            )}
         </div>
      </div>

      {/* Rodapé: Branding Técnico */}
      <footer className="absolute bottom-10 z-30 flex flex-col items-center gap-4 bg-transparent w-full px-10">
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
           <motion.div 
             className="h-full bg-primary shadow-[0_0_20px_rgba(147,51,234,0.8)]" 
             animate={{ width: `${volume}%` }} 
           />
        </div>
        <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.8em]">CORE SYSTEM SPSP 2026</p>
      </footer>

      {/* Tela de Erro de Áudio */}
      {audioError && (
        <div className="absolute inset-0 z-[100] bg-red-950/95 backdrop-blur-xl flex items-center justify-center p-12 text-center">
          <p className="text-white font-black text-[11px] uppercase tracking-widest leading-relaxed">
            {audioError}<br/><br/>
            <span className="text-white/40">Verifique as permissões de microfone do seu Android.</span>
          </p>
        </div>
      )}

    </div>
  );
}
