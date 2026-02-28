'use client';

import { useState, useEffect, useCallback } from 'react';
import { LocalPersistence } from '@/lib/local-persistence';
import { PlacedItem, StudioState, UserProgress } from '@/lib/types';

/**
 * Hook para gerenciamento atômico do Estúdio.
 * Lida com a persistência imediata no armazenamento local do Capacitor.
 */
export function useStudio() {
  const [studioState, setStudioState] = useState<StudioState>({
    unlockedItemIds: ['zen-rug'],
    placedItems: [],
    backgroundId: 'default'
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadStudio = useCallback(async () => {
    const profile = await LocalPersistence.getProgress();
    if (profile?.studioState) {
      setStudioState(profile.studioState);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadStudio();
    window.addEventListener('local-data-updated', loadStudio);
    return () => window.removeEventListener('local-data-updated', loadStudio);
  }, [loadStudio]);

  const updateItemPosition = async (instanceId: string, x: number, y: number) => {
    setStudioState(prev => {
      const updatedPlacedItems = prev.placedItems.map(item => 
        item.instanceId === instanceId 
          ? { ...item, position: { x, y } } 
          : item
      );
      
      const newState = { ...prev, placedItems: updatedPlacedItems };
      // Salvamento Atômico Offline
      LocalPersistence.saveProgress({ studioState: newState });
      return newState;
    });
  };

  const addItem = async (itemId: string) => {
    setStudioState(prev => {
      const newItem: PlacedItem = {
        instanceId: `inst-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        itemId,
        position: { x: 50, y: 50 },
        zIndex: prev.placedItems.length + 1,
        rotation: 0
      };
      
      const newState = {
        ...prev,
        unlockedItemIds: prev.unlockedItemIds.includes(itemId) 
          ? prev.unlockedItemIds 
          : [...prev.unlockedItemIds, itemId],
        placedItems: [...prev.placedItems, newItem]
      };
      
      LocalPersistence.saveProgress({ studioState: newState });
      return newState;
    });
  };

  const removeItem = async (instanceId: string) => {
    setStudioState(prev => {
      const updatedPlacedItems = prev.placedItems.filter(item => item.instanceId !== instanceId);
      const newState = { ...prev, placedItems: updatedPlacedItems };
      LocalPersistence.saveProgress({ studioState: newState });
      return newState;
    });
  };

  return { 
    studioState, 
    isLoading, 
    updateItemPosition, 
    addItem, 
    removeItem 
  };
}
