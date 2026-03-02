
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
 * Otimizado para APK Android com limpeza profunda de backgrounds.
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
    <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center h-full w-full max-w-[480px] mx-auto border-none shadow-none !bg-transparent">
      
      {/* 1. CAMADA DE FUNDO (1.png) */}
      <div className="absolute inset-0 z-0 !bg-transparent pointer-events-none border-none">
        <Image 
          src={`${ASSETS_PATH}1.png`} 
          alt="Cenário de Fundo"
          fill
          unoptimized
          className="object-cover opacity-30 !bg-transparent border-none shadow-none" 
        />
      </div>

      {/* 2. ESTRUTURA DA TORRE (4.png) */}
      <div className="relative h-[80vh] w-full z-10 flex items-center justify-center !bg-transparent border-none">
        <div className="relative h-full w-auto aspect-[1/3] !bg-transparent border-none shadow-none">
          <Image 
            src={`${ASSETS_PATH}4.png`} 
            alt="Torre Central"
            fill
            unoptimized
            className="object-contain !bg-transparent border-none shadow-none" 
          />
        </div>
        
        {/* INDICADOR DE ZONA ATIVA */}
        <div className="absolute bottom-[30%] h-[25%] w-48 border-y-2 border-primary/20 bg-transparent pointer-events-none flex items-center justify-center">
           <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em] animate-pulse">Zona de Foco</span>
        </div>

        {/* 3. O ELEVADOR (Container da Cabine + Robô) */}
        <motion.div
          animate={{ bottom: `${position}%` }}
          transition={{ type: "spring", stiffness: 60, damping: 20 }}
          className="absolute left-1/2 -translate-x-1/2 w-56 z-30 flex items-center justify-center !bg-transparent border-none"
          style={{ bottom: 0 }}
        >
          <div className="relative w-full aspect-square !bg-transparent border-none">
            
            {/* CABINE (5.png) */}
            <div className="absolute inset-0 z-10 !bg-transparent border-none shadow-none">
              <Image 
                src={`${ASSETS_PATH}5.png`} 
                alt="Cabine do Elevador"
                fill
                unoptimized
                className="object-contain !bg-transparent border-none shadow-none" 
              />
            </div>
            
            {/* ROBÔ (2.png ou 3.png) - Z-Index Superior para Transparência Real */}
            <div className="absolute inset-0 z-20 flex items-center justify-center pb-10 !bg-transparent border-none">
              <div className="relative w-[45%] h-[45%] !bg-transparent border-none">
                <Image 
                  src={volume > 5 ? `${ASSETS_PATH}3.png` : `${ASSETS_PATH}2.png`} 
                  alt="Avatar do Robô"
                  fill
                  unoptimized
                  className="object-contain transition-transform duration-150 !bg-transparent border-none shadow-none"
                />
              </div>
            </div>

            {/* FEEDBACK DE RECOMPENSA */}
            <AnimatePresence>
              {rewardId && (
                <motion.div
                  key={rewardId}
                  initial={{ opacity: 0, scale: 0, y: 0 }}
                  animate={{ opacity: 1, scale: 1.2, y: -140 }}
                  exit={{ opacity: 0, scale: 2 }}
                  className="absolute z-50 left-1/2 -translate-x-1/2 top-0 w-20 h-20 !bg-transparent"
                >
                  <Image 
                    src={`${ASSETS_PATH}${rewardId}.png`}
                    alt="Prêmio"
                    fill
                    unoptimized
                    className="object-contain !bg-transparent filter brightness-125 shadow-none"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* 4. HUD DE TELEMETRIA */}
      
      {/* Esquerda: Medidor dB */}
      <div className="absolute left-6 top-1/4 z-40 flex flex-col items-center gap-3 !bg-transparent border-none">
        <div className="relative w-16 h-44 !bg-transparent border-none">
          <Image 
            src={`${ASSETS_PATH}6.png`} 
            alt="Medidor dB"
            fill
            unoptimized
            className={cn(
              "object-contain transition-all duration-500 !bg-transparent shadow-none",
              isStable ? "brightness-150 drop-shadow-[0_0_15px_#9333ea]" : "opacity-40"
            )} 
          />
          <motion.div 
            animate={{ bottom: `${position}%` }}
            className="absolute left-1/2 -translate-x-1/2 w-10 h-1.5 bg-accent shadow-[0_0_10px_#f43f5e] rounded-full z-50"
          />
        </div>
        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">DB Level</p>
      </div>

      {/* Direita: Cronômetro de Foco */}
      <div className="absolute right-6 top-16 z-40 !bg-transparent border-none">
         <div className="bg-white/5 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/10 text-center shadow-none min-w-[130px] !bg-transparent">
            <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Foco Ativo</div>
            <div className="text-5xl font-black text-white italic tracking-tighter tabular-nums">{stableTime}s</div>
            {isStable && (
              <div className="mt-2 flex items-center justify-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping" />
                <span className="text-[10px] font-bold text-green-400 uppercase">Estável</span>
              </div>
            )}
         </div>
      </div>

      {/* Rodapé: Branding Técnico */}
      <footer className="absolute bottom-12 z-40 flex flex-col items-center gap-5 !bg-transparent w-full px-12 border-none">
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
           <motion.div 
             className="h-full bg-primary shadow-[0_0_20px_rgba(147,51,234,0.8)]" 
             animate={{ width: `${volume}%` }} 
           />
        </div>
        <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.6em]">CORE SYSTEM SPSP 2026</p>
      </footer>

      {/* Tela de Erro de Áudio */}
      {audioError && (
        <div className="absolute inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-12 text-center">
          <p className="text-white font-black text-[12px] uppercase tracking-widest leading-relaxed">
            {audioError}<br/><br/>
            <span className="text-white/40">Verifique as permissões de microfone do seu Android.</span>
          </p>
        </div>
      )}

    </div>
  );
}
