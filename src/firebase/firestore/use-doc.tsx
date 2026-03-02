'use client';
    
import { useState, useEffect } from 'react';
import { LocalPersistence } from '@/lib/local-persistence';

/**
 * Hook de Documento Offline.
 * Lê dados diretamente do Capacitor Preferences de forma reativa.
 */
export function useDoc<T = any>(ref: any): { data: T | null, isLoading: boolean, error: any } {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!ref) {
        setData(null);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      const profile = await LocalPersistence.getProgress();
      setData(profile);
      setIsLoading(false);
    };

    fetchData();

    window.addEventListener('local-data-updated', fetchData);
    return () => window.removeEventListener('local-data-updated', fetchData);
  }, [ref?.id, ref?.path]); // Reativo a mudanças na referência

  return { data, isLoading, error: null };
}
