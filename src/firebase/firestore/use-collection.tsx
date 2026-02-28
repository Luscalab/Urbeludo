
'use client';

import { useState, useEffect } from 'react';
import { LocalPersistence } from '@/lib/local-persistence';

/**
 * Hook de Coleção Offline.
 * Retorna o histórico de atividades salvo localmente.
 */
export function useCollection<T = any>(query: any): { data: T[] | null, isLoading: boolean, error: any } {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const activities = await LocalPersistence.getActivities();
      setData(activities);
      setIsLoading(false);
    };

    fetchData();

    window.addEventListener('local-data-updated', fetchData);
    return () => window.removeEventListener('local-data-updated', fetchData);
  }, []);

  return { data, isLoading, error: null };
}
