
'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Hook de Processamento de Áudio para o UrbeLudo 2026.
 * Utiliza a Web Audio API nativa para análise de volume em tempo real (RMS).
 * Otimizado para baixa latência em dispositivos móveis (Android/APK).
 */
export const useAudioProcessor = (isActive: boolean) => {
  const [volume, setVolume] = useState(0);
  const [isSinging, setIsSinging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      cleanup();
      return;
    }

    const startAudio = async () => {
      setError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        const context = new AudioContextClass();
        const source = context.createMediaStreamSource(stream);
        const analyser = context.createAnalyser();

        // Configuração para voz humana
        analyser.fftSize = 512; 
        analyser.smoothingTimeConstant = 0.3; // Suavização equilibrada para biofeedback
        source.connect(analyser);
        
        audioContextRef.current = context;
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateVolume = () => {
          if (!analyserRef.current) return;
          
          analyserRef.current.getByteTimeDomainData(dataArray);
          
          // Cálculo de RMS (Root Mean Square) para detecção estável de amplitude vocal
          let sumSquares = 0.0;
          for (let i = 0; i < bufferLength; i++) {
            const normalized = (dataArray[i] - 128) / 128;
            sumSquares += normalized * normalized;
          }
          const rms = Math.sqrt(sumSquares / bufferLength);
          
          // Mapeamento logarítmico para escala 0-100 intuitiva
          const normalizedVol = Math.min(100, rms * 600);
          
          // Suavização exponencial para evitar trepidação no elevador
          setVolume(prev => (prev * 0.3) + (normalizedVol * 0.7)); 
          setIsSinging(rms > 0.015); 

          animationFrameRef.current = requestAnimationFrame(updateVolume);
        };

        updateVolume();
      } catch (err: any) {
        console.error("Erro no hardware de áudio:", err);
        setError("Microfone não encontrado ou acesso negado.");
      }
    };

    startAudio();

    return cleanup;
  }, [isActive]);

  const cleanup = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
  };

  return { volume, isSinging, error };
};
