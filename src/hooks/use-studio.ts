'use client';

import { useState, useEffect } from 'react';
import { LocalPersistence } from '@/lib/local-persistence';
import { StudioFurniture, UserProgress } from '@/lib/types';

export function useStudio() {
  const [furniture, setFurniture] = useState<StudioFurniture[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStudio = async () => {
      const profile = await LocalPersistence.getProgress();
      if (profile?.studioFurniture) {
        setFurniture(profile.studioFurniture);
      }
      setIsLoading(false);
    };

    loadStudio();
    window.addEventListener('local-data-updated', loadStudio);
    return () => window.removeEventListener('local-data-updated', loadStudio);
  }, []);

  const updateFurniturePosition = async (id: string, x: number, y: number) => {
    const updated = furniture.map(f => f.id === id ? { ...f, x, y } : f);
    setFurniture(updated);
    await LocalPersistence.saveProgress({ studioFurniture: updated });
  };

  const addFurniture = async (itemId: string) => {
    const newItem: StudioFurniture = {
      id: `f-${Math.random().toString(36).substr(2, 9)}`,
      itemId,
      x: 50,
      y: 50,
      rotation: 0
    };
    const updated = [...furniture, newItem];
    setFurniture(updated);
    await LocalPersistence.saveProgress({ studioFurniture: updated });
  };

  const removeFurniture = async (id: string) => {
    const updated = furniture.filter(f => f.id !== id);
    setFurniture(updated);
    await LocalPersistence.saveProgress({ studioFurniture: updated });
  };

  return { furniture, isLoading, updateFurniturePosition, addFurniture, removeFurniture };
}
