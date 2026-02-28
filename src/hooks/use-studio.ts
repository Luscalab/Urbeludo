'use client';

import { useState, useEffect, useCallback } from 'react';
import { LocalPersistence } from '@/lib/local-persistence';
import { PlacedItem, StudioState } from '@/lib/types';

const GRID_SIZE = 40; // Pixels para o Snap-to-Grid
const WORLD_SIZE = 1200;

/**
 * Hook para gerenciamento atômico do Estúdio.
 * Implementa Snap-to-Grid e Save Game persistente.
 */
export function useStudio() {
  const [studioState, setStudioState] = useState<StudioState>({
    unlockedItemIds: ['zen-rug'],
    placedItems: [],
    backgroundId: 'default',
    worldConfig: {
      width: WORLD_SIZE,
      height: WORLD_SIZE,
      theme: 'minimalist-purple'
    },
    avatar: {
      lastPosition: { x: 600, y: 800 }
    }
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

  // Lógica de Snap-to-Grid
  const snapToGrid = (val: number) => Math.round(val / GRID_SIZE) * GRID_SIZE;

  const updateItemPosition = async (instanceId: string, x: number, y: number) => {
    const snappedX = snapToGrid(x);
    const snappedY = snapToGrid(y);

    setStudioState(prev => {
      const updatedPlacedItems = prev.placedItems.map(item => 
        item.instanceId === instanceId 
          ? { ...item, position: { x: snappedX, y: snappedY } } 
          : item
      );
      
      const newState = { ...prev, placedItems: updatedPlacedItems };
      LocalPersistence.saveProgress({ studioState: newState });
      return newState;
    });
  };

  const updateAvatarPosition = async (x: number, y: number) => {
    setStudioState(prev => {
      const newState = { ...prev, avatar: { ...prev.avatar, lastPosition: { x, y } } };
      LocalPersistence.saveProgress({ studioState: newState });
      return newState;
    });
  };

  const addItem = async (itemId: string) => {
    setStudioState(prev => {
      const newItem: PlacedItem = {
        instanceId: `inst-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        itemId,
        position: { x: snapToGrid(WORLD_SIZE / 2), y: snapToGrid(WORLD_SIZE / 2) },
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
    updateAvatarPosition,
    addItem, 
    removeItem 
  };
}
