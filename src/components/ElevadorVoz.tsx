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
 * Otimizado para APK Android com reset de background forçado e física de camadas.
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
    <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center h-[90vh] w-full max-w-[430px] mx-auto !bg-transparent">
      {/* RESET DE BACKGROUND FORÇADO PARA ESSE COMPONENTE */}
      <style dangerouslySetInnerHTML={{ __html: `
        .elevador-root div, .elevador-root img { 
          background-color: transparent !important; 
          background: none !important; 
          border: none !important; 
          box-shadow: none !important; 
        }
      `}} />

      <div className="elevador-root relative w-full h-full flex flex-col items-center justify-center">
        
        {/* 1. CAMADA DE FUNDO (1.png) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image 
            src={`${ASSETS_PATH}1.png`} 
            alt="Cenário"
            fill
            unoptimized
            className="object-cover opacity-40 mix-blend-normal" 
          />
        </div>

        {/* 2. ESTRUTURA DA TORRE (4.png) */}
        <div className="relative h-[70vh] w-full z-10 flex items-center justify-center">
          <div className="relative h-full w-auto aspect-[1/4]">
            <Image 
              src={`${ASSETS_PATH}4.png`} 
              alt="Torre"
              fill
              unoptimized
              className="object-contain mix-blend-normal" 
            />
          </div>
          
          {/* INDICADOR DE ZONA ATIVA */}
          <div className="absolute bottom-[30%] h-[20%] w-32 border-y-2 border-primary/20 bg-primary/5 pointer-events-none flex items-center justify-center rounded-xl">
             <span className="text-[8px] font-black text-primary/40 uppercase tracking-[0.2em] animate-pulse">Zona Ativa</span>
          </div>

          {/* 3. CONTAINER DO ELEVADOR (Cabine 5.png + Robô 2/3.png) */}
          <motion.div
            animate={{ bottom: `${position}%` }}
            transition={{ type: "spring", stiffness: 70, damping: 25 }}
            className="absolute left-1/2 -translate-x-1/2 w-40 z-30 flex items-center justify-center"
            style={{ bottom: 0 }}
          >
            <div className="relative w-full aspect-square">
              
              {/* CABINE (5.png) */}
              <div className="absolute inset-0 z-10">
                <Image 
                  src={`${ASSETS_PATH}5.png`} 
                  alt="Cabine"
                  fill
                  unoptimized
                  className="object-contain mix-blend-normal" 
                />
              </div>
              
              {/* ROBÔ (2.png ou 3.png) - Z-Index 50 (Prioridade Máxima) */}
              <div className="absolute inset-0 z-50 flex items-center justify-center pb-6">
                <div className="relative w-[40%] h-[40%]">
                  <Image 
                    src={volume > 10 ? `${ASSETS_PATH}3.png` : `${ASSETS_PATH}2.png`} 
                    alt="Robô"
                    fill
                    unoptimized
                    className="object-contain mix-blend-normal"
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
                    className="absolute z-[60] left-1/2 -translate-x-1/2 top-0 w-16 h-16"
                  >
                    <Image 
                      src={`${ASSETS_PATH}${rewardId}.png`}
                      alt="Prêmio"
                      fill
                      unoptimized
                      className="object-contain drop-shadow-2xl"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* 4. HUD DE TELEMETRIA */}
        
        {/* Esquerda: Medidor dB */}
        <div className="absolute left-4 top-1/3 z-40 flex flex-col items-center gap-2">
          <div className="relative w-10 h-32">
            <Image 
              src={`${ASSETS_PATH}6.png`} 
              alt="Medidor"
              fill
              unoptimized
              className={cn(
                "object-contain mix-blend-normal transition-all duration-500",
                isStable ? "brightness-150 drop-shadow-[0_0_10px_#9333ea]" : "opacity-40"
              )} 
            />
            <motion.div 
              animate={{ bottom: `${position}%` }}
              className="absolute left-1/2 -translate-x-1/2 w-6 h-1 bg-accent shadow-[0_0_8px_#f43f5e] rounded-full z-50"
            />
          </div>
          <p className="text-[7px] font-black text-white/40 uppercase tracking-widest">DB</p>
        </div>

        {/* Direita: Cronômetro */}
        <div className="absolute right-4 top-10 z-40">
           <div className="bg-black/40 backdrop-blur-xl px-4 py-3 rounded-2xl border border-white/10 text-center min-w-[90px]">
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

        {/* Rodapé: Assinatura */}
        <footer className="absolute bottom-6 z-40 flex flex-col items-center gap-3 w-full px-10">
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-primary shadow-[0_0_15px_rgba(147,51,234,0.6)]" 
               animate={{ width: `${volume}%` }} 
             />
          </div>
          <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">CORE SYSTEM SPSP 2026</p>
        </footer>

        {/* Erro de Hardware */}
        {audioError && (
          <div className="absolute inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-10 text-center">
            <p className="text-white font-black text-[10px] uppercase tracking-widest leading-relaxed">
              {audioError}<br/><br/>
              <span className="text-white/40">Permita o microfone no dispositivo.</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
