'use client';

import { useState, useEffect } from 'react';
import { LocalPersistence } from '@/lib/local-persistence';
import { PlacedItem, StudioState, UserProgress } from '@/lib/types';

export function useStudio() {
  const [studioState, setStudioState] = useState<StudioState>({
    unlockedItemIds: ['zen-rug'],
    placedItems: [],
    backgroundId: 'default'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStudio = async () => {
      const profile = await LocalPersistence.getProgress();
      if (profile?.studioState) {
        setStudioState(profile.studioState);
      }
      setIsLoading(false);
    };

    loadStudio();
    window.addEventListener('local-data-updated', loadStudio);
    return () => window.removeEventListener('local-data-updated', loadStudio);
  }, []);

  const updateItemPosition = async (instanceId: string, x: number, y: number) => {
    const updatedPlacedItems = studioState.placedItems.map(item => 
      item.instanceId === instanceId 
        ? { ...item, position: { x, y } } 
        : item
    );
    
    const newState = { ...studioState, placedItems: updatedPlacedItems };
    setStudioState(newState);
    await LocalPersistence.saveProgress({ studioState: newState });
  };

  const addItem = async (itemId: string) => {
    const newItem: PlacedItem = {
      instanceId: `inst-${Math.random().toString(36).substr(2, 9)}`,
      itemId,
      position: { x: 50, y: 50 },
      zIndex: studioState.placedItems.length + 1,
      rotation: 0
    };
    
    const newState = {
      ...studioState,
      unlockedItemIds: studioState.unlockedItemIds.includes(itemId) 
        ? studioState.unlockedItemIds 
        : [...studioState.unlockedItemIds, itemId],
      placedItems: [...studioState.placedItems, newItem]
    };
    
    setStudioState(newState);
    await LocalPersistence.saveProgress({ studioState: newState });
  };

  const removeItem = async (instanceId: string) => {
    const updatedPlacedItems = studioState.placedItems.filter(item => item.instanceId !== instanceId);
    const newState = { ...studioState, placedItems: updatedPlacedItems };
    setStudioState(newState);
    await LocalPersistence.saveProgress({ studioState: newState });
  };

  return { 
    studioState, 
    isLoading, 
    updateItemPosition, 
    addItem, 
    removeItem 
  };
}
