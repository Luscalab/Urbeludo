
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlacedItem } from '@/lib/types';
import { STUDIO_CATALOG } from '@/lib/studio-catalog';
import { Package, Trash2, Move, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudio } from '@/hooks/use-studio';

interface StudioItemProps {
  data: PlacedItem;
  onUpdate: (instanceId: string, x: number, y: number) => void;
  onStore: (instanceId: string) => void;
  onSell: (instanceId: string, userName?: string) => void;
  isEditing: boolean;
  auraColor: string;
  userName?: string;
}

/**
 * Item Individual do Estúdio com Profundidade 2.5D e Menu de Contexto.
 */
export function StudioItem({ data, onUpdate, onStore, onSell, isEditing, auraColor, userName }: StudioItemProps) {
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
        scale: isEditing && isSelected ? 1.05 : 1,
        x: data.position.x,
        y: data.position.y,
        zIndex: data.zIndex || Math.floor(data.position.y)
      }}
      exit={{ opacity: 0, scale: 0.5 }}
      whileDrag={{ scale: 1.1, zIndex: 100000 }}
      className={cn(
        "absolute cursor-grab active:cursor-grabbing select-none pointer-events-auto touch-none transition-shadow",
        isEditing && isSelected && "ring-8 ring-primary/30 rounded-[3rem] ring-offset-8"
      )}
      style={{ transform: 'translate(-50%, -50%)', left: 0, top: 0 }}
    >
      <div className="relative group">
        {/* Sombra Isométrica */}
        <div 
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/15 blur-xl rounded-full -z-10"
          style={{ 
            width: `${itemInfo.dimensions.width * 0.7}px`, 
            height: `${itemInfo.dimensions.height * 0.2}px`,
          }}
        />

        <div 
          className="relative flex items-center justify-center"
          style={{ width: `${itemInfo.dimensions.width}px`, height: `${itemInfo.dimensions.height}px` }}
        >
          <img 
            src={itemInfo.assetPath} 
            alt={itemInfo.name}
            className="w-full h-full object-contain pointer-events-none drop-shadow-2xl"
          />
        </div>

        {/* Bubble Menu - Cafeland Style */}
        <AnimatePresence>
          {isEditing && isSelected && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.5 }}
              className="absolute -top-24 left-1/2 -translate-x-1/2 flex gap-4 bg-white/95 backdrop-blur-xl p-3 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.2)] z-[100001] border-b-8 border-zinc-200"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); onStore(data.instanceId); }}
                className="bg-primary text-white p-4 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all border-b-4 border-primary/70"
                title="Guardar na Mochila"
              >
                <Package className="w-5 h-5" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onSell(data.instanceId, userName); }}
                className="bg-red-500 text-white p-4 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all border-b-4 border-red-700"
                title="Vender Item"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isEditing && !isSelected && (
          <div className="absolute -top-4 -right-4 bg-white p-2.5 rounded-full text-primary shadow-2xl border-2 border-primary animate-bounce-subtle">
            <Move className="w-4 h-4" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
