
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlacedItem } from '@/lib/types';
import { STUDIO_CATALOG } from '@/lib/studio-catalog';
import { Package, Coins, Sparkles, Move, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudio } from '@/hooks/use-studio';

interface StudioItemProps {
  data: PlacedItem;
  onUpdate: (instanceId: string, x: number, y: number) => void;
  onStore: (instanceId: string) => void;
  onSell: (instanceId: string) => void;
  isEditing: boolean;
  auraColor: string;
}

export function StudioItem({ data, onUpdate, onStore, onSell, isEditing, auraColor }: StudioItemProps) {
  const [isSelected, setIsSelected] = useState(false);
  const { studioState } = useStudio();
  
  const allItems = [...STUDIO_CATALOG, ...(studioState.customItems || [])];
  const itemInfo = allItems.find(i => i.id === data.itemId);
  
  if (!itemInfo) return null;

  const GRID_SIZE = 40;

  return (
    <motion.div
      layoutId={data.instanceId}
      drag={isEditing}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        const world = document.getElementById('studio-world');
        if (world) {
          const rect = world.getBoundingClientRect();
          const x = info.point.x - rect.left;
          const y = info.point.y - rect.top;
          const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
          const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;
          onUpdate(data.instanceId, snappedX, snappedY);
        }
      }}
      onClick={() => isEditing && setIsSelected(!isSelected)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1,
        scale: 1,
        x: data.position.x,
        y: data.position.y,
        zIndex: data.zIndex || Math.floor(data.position.y)
      }}
      exit={{ opacity: 0, scale: 0.5 }}
      whileDrag={{ scale: 1.1, zIndex: 100000 }}
      className={cn(
        "absolute cursor-grab active:cursor-grabbing select-none pointer-events-auto touch-none",
        isEditing && isSelected && "ring-8 ring-primary/30 rounded-[2.5rem] ring-offset-4"
      )}
      style={{ transform: 'translate(-50%, -50%)', left: 0, top: 0 }}
    >
      <div className="relative group">
        {/* Dynamic Shadow Projection */}
        <div 
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/10 blur-xl rounded-full -z-10"
          style={{ 
            width: `${itemInfo.dimensions.width * 0.7}px`, 
            height: `${itemInfo.dimensions.height * 0.15}px`,
          }}
        />

        <div 
          className="relative flex items-center justify-center transition-transform"
          style={{ width: `${itemInfo.dimensions.width}px`, height: `${itemInfo.dimensions.height}px` }}
        >
          <img 
            src={itemInfo.assetPath} 
            alt={itemInfo.name}
            className="w-full h-full object-contain pointer-events-none drop-shadow-lg"
          />
        </div>

        {/* Bubble Context Menu (Cafeland Style) */}
        <AnimatePresence>
          {isEditing && isSelected && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.5 }}
              className="absolute -top-24 left-1/2 -translate-x-1/2 flex gap-3 bg-white p-3 rounded-full shadow-2xl z-[100001] border-b-4 border-zinc-200"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); onStore(data.instanceId); }}
                className="bg-primary text-white p-4 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all"
              >
                <Package className="w-5 h-5" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onSell(data.instanceId); }}
                className="bg-red-500 text-white p-4 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isEditing && !isSelected && (
          <div className="absolute -top-4 -right-4 bg-white p-2 rounded-full text-primary shadow-xl border-2 border-primary animate-bounce-subtle">
            <Move className="w-4 h-4" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

