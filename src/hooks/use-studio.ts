'use client';

import { useState, useEffect, useCallback } from 'react';
import { LocalPersistence } from '@/lib/local-persistence';
import { PlacedItem, StudioState } from '@/lib/types';
import { STUDIO_CATALOG } from '@/lib/studio-catalog';

const GRID_SIZE = 40; 
const WORLD_SIZE = 1200;

export function useStudio() {
  const [studioState, setStudioState] = useState<StudioState>({
    unlockedItemIds: ['foundation-sneakers'],
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

  const snapToGrid = (val: number) => Math.round(val / GRID_SIZE) * GRID_SIZE;

  const saveState = async (newState: StudioState) => {
    await LocalPersistence.saveProgress({ studioState: newState });
  };

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
      saveState(newState);
      return newState;
    });
  };

  const updateAvatarPosition = async (x: number, y: number) => {
    setStudioState(prev => {
      const newState = { ...prev, avatar: { ...prev.avatar, lastPosition: { x, y } } };
      saveState(newState);
      return newState;
    });
  };

  const addItem = async (itemId: string) => {
    setStudioState(prev => {
      const newItem: PlacedItem = {
        instanceId: `inst-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        itemId,
        position: { x: snapToGrid(WORLD_SIZE / 2), y: snapToGrid(WORLD_SIZE * 0.7) },
        zIndex: prev.placedItems.length + 10,
        rotation: 0
      };
      
      const newState = {
        ...prev,
        unlockedItemIds: prev.unlockedItemIds.includes(itemId) 
          ? prev.unlockedItemIds 
          : [...prev.unlockedItemIds, itemId],
        placedItems: [...prev.placedItems, newItem]
      };
      
      saveState(newState);
      return newState;
    });
  };

  const removeItem = async (instanceId: string) => {
    setStudioState(prev => {
      const updatedPlacedItems = prev.placedItems.filter(item => item.instanceId !== instanceId);
      const newState = { ...prev, placedItems: updatedPlacedItems };
      saveState(newState);
      return newState;
    });
  };

  const sellItem = async (instanceId: string, userName: string) => {
    const itemToSell = studioState.placedItems.find(i => i.instanceId === instanceId);
    if (!itemToSell) return;

    const catalogItem = STUDIO_CATALOG.find(i => i.id === itemToSell.itemId);
    const isSapient = userName?.toLowerCase() === 'sapient';
    
    const profile = await LocalPersistence.getProgress();
    const currentCoins = profile?.ludoCoins || 0;
    const refund = catalogItem ? catalogItem.price : 0;

    setStudioState(prev => {
      const updatedPlacedItems = prev.placedItems.filter(item => item.instanceId !== instanceId);
      // Remove do inventário também se for a última instância
      const remainingInstances = updatedPlacedItems.filter(i => i.itemId === itemToSell.itemId);
      const updatedUnlocked = remainingInstances.length === 0 
        ? prev.unlockedItemIds.filter(id => id !== itemToSell.itemId)
        : prev.unlockedItemIds;

      const newState = { ...prev, placedItems: updatedPlacedItems, unlockedItemIds: updatedUnlocked };
      
      // Reembolsa moedas (exceto sapient que tem infinitas)
      if (!isSapient) {
        LocalPersistence.saveProgress({ 
          ludoCoins: currentCoins + refund,
          studioState: newState 
        });
      } else {
        saveState(newState);
      }
      
      return newState;
    });
  };

  return { 
    studioState, 
    isLoading, 
    updateItemPosition, 
    updateAvatarPosition,
    addItem, 
    removeItem,
    sellItem
  };
}
