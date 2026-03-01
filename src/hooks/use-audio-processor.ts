
'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Hook de Processamento de Áudio para o UrbeLudo.
 * Utiliza a Web Audio API nativa para análise de volume em tempo real (RMS).
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
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      streamRef.current?.getTracks().forEach(track => track.stop());
      audioContextRef.current?.close().catch(() => {});
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

        analyser.fftSize = 512; 
        analyser.smoothingTimeConstant = 0.4; 
        source.connect(analyser);
        
        audioContextRef.current = context;
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateVolume = () => {
          if (!analyserRef.current) return;
          
          analyserRef.current.getByteTimeDomainData(dataArray);
          
          // Cálculo de RMS (Root Mean Square) para detecção precisa de amplitude vocal
          let sumSquares = 0.0;
          for (let i = 0; i < bufferLength; i++) {
            const normalized = (dataArray[i] - 128) / 128;
            sumSquares += normalized * normalized;
          }
          const rms = Math.sqrt(sumSquares / bufferLength);
          
          // Mapeamento logarítmico para escala 0-100 mais natural ao ouvido humano
          const normalizedVol = Math.min(100, rms * 500);
          
          setVolume(prev => (prev * 0.4) + (normalizedVol * 0.6)); 
          setIsSinging(rms > 0.02); 

          animationFrameRef.current = requestAnimationFrame(updateVolume);
        };

        updateVolume();
      } catch (err: any) {
        console.error("Erro no hardware de áudio:", err);
        setError("Microfone não encontrado ou acesso negado.");
      }
    };

    startAudio();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      streamRef.current?.getTracks().forEach(track => track.stop());
      audioContextRef.current?.close().catch(() => {});
    };
  }, [isActive]);

  return { volume, isSinging, error };
};
