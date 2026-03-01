
'use client';

import { useState, useEffect, useCallback } from 'react';
import { LocalPersistence } from '@/lib/local-persistence';
import { PlacedItem, StudioState, StudioItem } from '@/lib/types';
import { STUDIO_CATALOG } from '@/lib/studio-catalog';

const GRID_SIZE = 40; 
const WORLD_SIZE = 1500;

/**
 * Hook de Gerenciamento do Estúdio (Engine Estilo Cafeland/Sims).
 * Lida com posicionamento isométrico, inventário e persistência local.
 */
export function useStudio() {
  const [studioState, setStudioState] = useState<StudioState>({
    unlockedItemIds: [],
    placedItems: [],
    customItems: [],
    backgroundId: 'default',
    worldConfig: {
      width: WORLD_SIZE,
      height: WORLD_SIZE,
      theme: 'minimalist-purple'
    },
    avatar: {
      lastPosition: { x: 750, y: 1000 }
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadStudio = useCallback(async () => {
    const profile = await LocalPersistence.getProgress();
    if (profile?.studioState) {
      setStudioState(prev => ({
        ...prev,
        ...profile.studioState
      }));
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
          ? { 
              ...item, 
              position: { x: snappedX, y: snappedY }, 
              zIndex: Math.floor(snappedY) 
            } 
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

  const buyItem = async (itemId: string, price: number, userName?: string) => {
    const isSapient = userName?.toLowerCase() === 'sapient';
    const profile = await LocalPersistence.getProgress();
    const currentCoins = profile?.ludoCoins || 0;

    if (!isSapient && currentCoins < price) return false;

    setStudioState(prev => {
      const newState = {
        ...prev,
        unlockedItemIds: [...prev.unlockedItemIds, itemId]
      };
      
      const updatedCoins = isSapient ? currentCoins : currentCoins - price;
      LocalPersistence.saveProgress({ 
        ludoCoins: updatedCoins,
        studioState: newState 
      });
      
      return newState;
    });
    return true;
  };

  const addCustomItem = async (item: StudioItem) => {
    setStudioState(prev => {
      const newState = {
        ...prev,
        customItems: [...(prev.customItems || []), item],
        unlockedItemIds: [...prev.unlockedItemIds, item.id]
      };
      saveState(newState);
      return newState;
    });
  };

  const placeItem = async (itemId: string) => {
    setStudioState(prev => {
      const index = prev.unlockedItemIds.indexOf(itemId);
      if (index === -1) return prev;

      const yPos = snapToGrid(WORLD_SIZE * 0.6);
      const xPos = snapToGrid(WORLD_SIZE / 2);
      
      const newItem: PlacedItem = {
        instanceId: `inst-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        itemId,
        position: { x: xPos, y: yPos },
        zIndex: Math.floor(yPos),
        rotation: 0
      };

      const newUnlocked = [...prev.unlockedItemIds];
      newUnlocked.splice(index, 1);

      const newState = {
        ...prev,
        unlockedItemIds: newUnlocked,
        placedItems: [...prev.placedItems, newItem]
      };
      
      saveState(newState);
      return newState;
    });
  };

  const storeItem = async (instanceId: string) => {
    setStudioState(prev => {
      const itemToStore = prev.placedItems.find(i => i.instanceId === instanceId);
      if (!itemToStore) return prev;

      const updatedPlacedItems = prev.placedItems.filter(item => item.instanceId !== instanceId);
      const newState = {
        ...prev,
        placedItems: updatedPlacedItems,
        unlockedItemIds: [...prev.unlockedItemIds, itemToStore.itemId]
      };
      saveState(newState);
      return newState;
    });
  };

  const sellItem = async (instanceId: string, userName?: string) => {
    const itemToSell = studioState.placedItems.find(i => i.instanceId === instanceId);
    if (!itemToSell) return;

    const allItems = [...STUDIO_CATALOG, ...(studioState.customItems || [])];
    const catalogItem = allItems.find(i => i.id === itemToSell.itemId);
    const isSapient = userName?.toLowerCase() === 'sapient';
    
    const profile = await LocalPersistence.getProgress();
    const currentCoins = profile?.ludoCoins || 0;
    const refund = catalogItem ? Math.floor(catalogItem.price * 0.5) : 0;

    setStudioState(prev => {
      const updatedPlacedItems = prev.placedItems.filter(item => item.instanceId !== instanceId);
      const newState = { ...prev, placedItems: updatedPlacedItems };
      
      const updatedCoins = isSapient ? currentCoins : currentCoins + refund;
      LocalPersistence.saveProgress({ 
        ludoCoins: updatedCoins,
        studioState: newState 
      });
      
      return newState;
    });
  };

  return { 
    studioState, 
    isLoading, 
    updateItemPosition, 
    updateAvatarPosition,
    buyItem,
    addCustomItem,
    placeItem,
    storeItem, 
    sellItem
  };
}
