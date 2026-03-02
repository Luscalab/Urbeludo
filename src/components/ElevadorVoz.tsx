
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioProcessor } from '@/hooks/use-audio-processor';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ElevadorVozProps {
  onWin: (reward: number, type: string) => void;
  userName: string;
  onSuggestBreath: () => void;
}

const ASSETS_PATH = '/games/elevador/';

/**
 * ElevadorVoz 2026 - Versão Transparência Total & Mobile-First.
 * Otimizado para APK Android com limpeza profunda de backgrounds e blending de segurança.
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
    // Normalização para o movimento na torre de 60vh
    const targetPos = Math.min(100, volume * 1.5);
    setPosition(prev => (prev * 0.8) + (targetPos * 0.2)); 

    // Zona de Estabilidade Psicomotora (30% a 50%)
    const inZone = position >= 30 && position <= 50;
    setIsStable(inZone);
  }, [volume, position]);

  // Cronômetro de Fonação Sustentada
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
    <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center h-full w-full max-w-[430px] mx-auto !bg-transparent border-none shadow-none">
      
      {/* 1. CAMADA DE FUNDO (1.png) - 100% da Tela */}
      <div className="absolute inset-0 z-0 !bg-transparent pointer-events-none border-none">
        <Image 
          src={`${ASSETS_PATH}1.png`} 
          alt="Cenário"
          fill
          unoptimized
          className="object-cover opacity-40 !bg-transparent border-none shadow-none" 
        />
      </div>

      {/* 2. ESTRUTURA DA TORRE (4.png) - Centralizada em 60vh */}
      <div className="relative h-[60vh] w-full z-10 flex items-center justify-center !bg-transparent border-none">
        <div className="relative h-full w-auto aspect-[1/4] !bg-transparent border-none shadow-none">
          <Image 
            src={`${ASSETS_PATH}4.png`} 
            alt="Torre"
            fill
            unoptimized
            className="object-contain !bg-transparent border-none shadow-none mix-blend-multiply" 
          />
        </div>
        
        {/* INDICADOR DE ZONA ATIVA */}
        <div className="absolute bottom-[30%] h-[20%] w-32 border-y-2 border-primary/30 bg-primary/5 pointer-events-none flex items-center justify-center rounded-xl">
           <span className="text-[8px] font-black text-primary/60 uppercase tracking-[0.2em] animate-pulse">Meta</span>
        </div>

        {/* 3. CONTAINER DO ELEVADOR (Cabine 5.png + Robô 2/3.png) */}
        <motion.div
          animate={{ bottom: `${position}%` }}
          transition={{ type: "spring", stiffness: 70, damping: 25 }}
          className="absolute left-1/2 -translate-x-1/2 w-40 z-30 flex items-center justify-center !bg-transparent border-none"
          style={{ bottom: 0 }}
        >
          <div className="relative w-full aspect-square !bg-transparent border-none">
            
            {/* CABINE (5.png) */}
            <div className="absolute inset-0 z-10 !bg-transparent border-none shadow-none">
              <Image 
                src={`${ASSETS_PATH}5.png`} 
                alt="Cabine"
                fill
                unoptimized
                className="object-contain !bg-transparent border-none shadow-none mix-blend-multiply" 
              />
            </div>
            
            {/* ROBÔ (2.png ou 3.png) - Z-Index Superior e Absoluto */}
            <div className="absolute inset-0 z-20 flex items-center justify-center pb-6 !bg-transparent border-none">
              <div className="relative w-[40%] h-[40%] !bg-transparent border-none">
                <Image 
                  src={volume > 5 ? `${ASSETS_PATH}3.png` : `${ASSETS_PATH}2.png`} 
                  alt="Robô"
                  fill
                  unoptimized
                  className="object-contain !bg-transparent border-none shadow-none mix-blend-multiply"
                />
              </div>
            </div>

            {/* FEEDBACK DE RECOMPENSA */}
            <AnimatePresence>
              {rewardId && (
                <motion.div
                  key={rewardId}
                  initial={{ opacity: 0, scale: 0, y: 0 }}
                  animate={{ opacity: 1, scale: 1, y: -100 }}
                  exit={{ opacity: 0, scale: 1.5 }}
                  className="absolute z-50 left-1/2 -translate-x-1/2 top-0 w-16 h-16 !bg-transparent"
                >
                  <Image 
                    src={`${ASSETS_PATH}${rewardId}.png`}
                    alt="Prêmio"
                    fill
                    unoptimized
                    className="object-contain !bg-transparent drop-shadow-xl"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* 4. HUD DE TELEMETRIA (MOBILE-FIRST) */}
      
      {/* Esquerda: Medidor dB Reduzido */}
      <div className="absolute left-4 top-1/3 z-40 flex flex-col items-center gap-2 !bg-transparent border-none">
        <div className="relative w-10 h-32 !bg-transparent border-none">
          <Image 
            src={`${ASSETS_PATH}6.png`} 
            alt="Medidor"
            fill
            unoptimized
            className={cn(
              "object-contain !bg-transparent shadow-none mix-blend-multiply",
              isStable ? "brightness-125" : "opacity-50"
            )} 
          />
          <motion.div 
            animate={{ bottom: `${position}%` }}
            className="absolute left-1/2 -translate-x-1/2 w-6 h-1 bg-accent shadow-[0_0_8px_#f43f5e] rounded-full z-50"
          />
        </div>
        <p className="text-[7px] font-black text-white/40 uppercase tracking-widest">DB</p>
      </div>

      {/* Direita: Cronômetro Compacto */}
      <div className="absolute right-4 top-10 z-40 !bg-transparent border-none">
         <div className="bg-black/20 backdrop-blur-lg px-4 py-3 rounded-2xl border border-white/5 text-center shadow-none min-w-[90px] !bg-transparent">
            <div className="text-[7px] font-black text-primary uppercase tracking-widest mb-0.5">Foco</div>
            <div className="text-3xl font-black text-white italic tracking-tighter tabular-nums">{stableTime}s</div>
            {isStable && (
              <div className="mt-1 flex items-center justify-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                <span className="text-[7px] font-bold text-green-400 uppercase">Estável</span>
              </div>
            )}
         </div>
      </div>

      {/* Rodapé: Assinatura Técnica */}
      <footer className="absolute bottom-10 z-40 flex flex-col items-center gap-3 !bg-transparent w-full px-10 border-none">
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
           <motion.div 
             className="h-full bg-primary shadow-[0_0_15px_rgba(147,51,234,0.6)]" 
             animate={{ width: `${volume}%` }} 
           />
        </div>
        <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">CORE SYSTEM SPSP 2026</p>
      </footer>

      {/* Tela de Erro de Áudio */}
      {audioError && (
        <div className="absolute inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-10 text-center">
          <p className="text-white font-black text-[10px] uppercase tracking-widest leading-relaxed">
            {audioError}<br/><br/>
            <span className="text-white/40">Permita o microfone no Android.</span>
          </p>
        </div>
      )}

    </div>
  );
}
