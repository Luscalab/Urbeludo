
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
  const [position, setPosition] = useState(0); // 0 a 100
  const [stableTime, setStabilityTime] = useState(0);
  const [rewardId, setRewardId] = useState<number | null>(null);
  const [isStable, setIsStable] = useState(false);
  const [oscillationCount, setOscillationCount] = useState(0);
  
  const lastVolumeRef = useRef(0);
  const stabilityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Lógica de Movimento e Suavização Biomecânica
  useEffect(() => {
    // Normalização: O volume (0-100) dita a altura na torre
    const targetPos = Math.min(95, volume * 1.3);
    setPosition(prev => (prev * 0.7) + (targetPos * 0.3)); 

    // Detecção de instabilidade (Esforço excessivo ou tremulação)
    const diff = Math.abs(volume - lastVolumeRef.current);
    if (diff > 22 && isSinging) {
      setOscillationCount(c => c + 1);
    }
    lastVolumeRef.current = volume;

    // Zona de Estabilidade (Meta terapêutica entre 35% e 55%)
    const inZone = position >= 35 && position <= 55;
    setIsStable(inZone);
  }, [volume, isSinging, position]);

  // Sistema de Gamificação e Feedback de Tempo
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

  // IA Aura - Intervenção gemini-3-flash-preview
  useEffect(() => {
    if (oscillationCount > 25) {
      setOscillationCount(0);
      askAuraHelper({
        question: "Como posso estabilizar minha voz para o elevador não balançar tanto?",
        context: "SPSP 2026 - Exercício de Controle Fonatório"
      }).then(res => {
        AuraLogger.info('Aura_Clinical', res.answer);
      });
    }
  }, [oscillationCount]);

  return (
    <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center h-full w-full">
      
      {/* 1.png: Fundo do Cenário */}
      <img 
        src={`${ASSETS_PATH}1.png`} 
        className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen pointer-events-none" 
        alt="Ambiente" 
      />

      <div className="relative w-full max-w-2xl h-[85vh] flex items-center justify-center">
        
        {/* 6.png: HUD Medidor Whisper (Lado Esquerdo) */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-center z-50">
          <div className="relative">
            <img 
              src={`${ASSETS_PATH}6.png`} 
              className={cn(
                "w-36 h-auto transition-all duration-700 mix-blend-screen",
                isStable ? "brightness-150 drop-shadow-[0_0_20px_rgba(147,51,234,0.6)]" : "opacity-40 grayscale"
              )} 
              alt="Whisper Meter" 
            />
            {/* Cursor Reativo no Medidor */}
            <motion.div 
              animate={{ bottom: `${position}%` }}
              className="absolute left-1/2 -translate-x-1/2 w-6 h-1.5 bg-accent shadow-[0_0_15px_#f43f5e] rounded-full z-[60]"
            />
          </div>
          <p className="mt-4 text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">dB Level</p>
        </div>

        {/* COMPOSIÇÃO DA TORRE CENTRAL */}
        <div className="relative h-[90%] w-64 flex items-center justify-center">
          
          {/* 4.png: Estrutura da Torre */}
          <img 
            src={`${ASSETS_PATH}4.png`} 
            className="h-full w-full object-contain mix-blend-screen opacity-90" 
            alt="Tower" 
          />

          {/* Indicador Visual da Zona Alvo */}
          <div className="absolute bottom-[35%] h-[20%] w-full bg-primary/5 border-y border-primary/20 pointer-events-none flex items-center justify-center">
             <div className="text-[8px] font-black text-primary/40 uppercase tracking-widest">Zona de Foco</div>
          </div>

          {/* 5.png: CABINE + ROBÔ (Unidade de Movimento) */}
          <motion.div
            animate={{ bottom: `${position}%` }}
            transition={{ type: "spring", stiffness: 40, damping: 12 }}
            className="absolute left-1/2 -translate-x-1/2 w-40 z-40"
          >
            <div className="relative w-full aspect-square flex items-center justify-center">
              
              {/* Imagem da Cabine */}
              <img 
                src={`${ASSETS_PATH}5.png`} 
                className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] mix-blend-screen" 
                alt="Cabin" 
              />
              
              {/* 2.png/3.png: Robô dentro da Cabine */}
              <div className="absolute inset-0 flex items-center justify-center pt-2">
                <img 
                  src={volume > 8 ? `${ASSETS_PATH}3.png` : `${ASSETS_PATH}2.png`} 
                  className="w-20 h-20 object-contain mix-blend-screen transition-all duration-100"
                  alt="Robot"
                />
              </div>

              {/* Animação de Recompensa */}
              <AnimatePresence>
                {rewardId && (
                  <motion.img
                    key={rewardId}
                    initial={{ opacity: 0, scale: 0, y: 0 }}
                    animate={{ opacity: 1, scale: 1.5, y: -100 }}
                    exit={{ opacity: 0, scale: 3 }}
                    src={`${ASSETS_PATH}${rewardId}.png`}
                    className="absolute z-[100] w-16 mix-blend-screen"
                    alt="Prize"
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* PAINEL DE TELEMETRIA (Lado Direito) */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 space-y-4">
           <div className="bg-white/5 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/10 text-center shadow-2xl min-w-[120px]">
              <div className="text-[9px] font-black text-primary uppercase tracking-widest mb-2">Foco Ativo</div>
              <div className="text-3xl font-black text-white italic tracking-tighter tabular-nums">{stableTime}s</div>
           </div>
           
           {isStable && (
             <motion.div 
               initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
               className="bg-green-500/20 px-4 py-2 rounded-full border border-green-500/40 flex items-center gap-2"
             >
               <div className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
               <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">Sincronizado</span>
             </motion.div>
           )}
        </div>

      </div>

      {/* FOOTER INFO */}
      <footer className="absolute bottom-10 flex flex-col items-center gap-2">
        <div className="h-1 w-32 bg-white/5 rounded-full overflow-hidden">
           <motion.div 
             className="h-full bg-primary" 
             animate={{ width: `${position}%` }} 
           />
        </div>
        <p className="text-[10px] font-black text-white/15 uppercase tracking-[0.6em]">Core System SPSP 2026</p>
      </footer>

    </div>
  );
}
