'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Hook de Processamento de Áudio para o UrbeLudo.
 * Utiliza a Web Audio API nativa para análise de volume em tempo real (RMS).
 * Projetado para funcionar 100% offline em exportações estáticas (APK).
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
      // Limpeza quando o jogo não está ativo
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      streamRef.current?.getTracks().forEach(track => track.stop());
      audioContextRef.current?.close();
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

        analyser.fftSize = 256; // Equilíbrio ideal entre precisão e performance
        analyser.smoothingTimeConstant = 0.8; 
        source.connect(analyser);
        
        audioContextRef.current = context;
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateVolume = () => {
          if (!analyserRef.current) return;
          
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Cálculo de RMS (Root Mean Square) para suavidade biomecânica
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i] * dataArray[i];
          }
          const rms = Math.sqrt(sum / bufferLength);
          
          // Normalização para escala 0-100 baseada na sensibilidade do microfone
          const normalizedVol = Math.min(100, (rms / 128) * 100 * 1.5);
          
          // Filtro Low-Pass via software para evitar trepidação da cabine
          setVolume(prev => (prev * 0.75) + (normalizedVol * 0.25)); 
          setIsSinging(rms > 2.5); // Limiar para detectar voz ativa (Ignora ruído de fundo)

          animationFrameRef.current = requestAnimationFrame(updateVolume);
        };

        updateVolume();
      } catch (err: any) {
        console.error("Erro no hardware de áudio:", err);
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError("Microfone não encontrado.");
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError("Acesso ao microfone negado.");
        } else {
          setError("Falha ao acessar o áudio.");
        }
      }
    };

    startAudio();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      streamRef.current?.getTracks().forEach(track => track.stop());
      audioContextRef.current?.close();
    };
  }, [isActive]);

  return { volume, isSinging, error };
};
