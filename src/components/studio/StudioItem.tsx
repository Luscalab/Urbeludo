
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlacedItem, StudioItem as StudioItemType } from '@/lib/types';
import { STUDIO_CATALOG } from '@/lib/studio-catalog';
import { Package, Coins, Sparkles } from 'lucide-react';
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
  
  // Buscar o item no catálogo ou nos itens customizados gerados por IA
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
          
          // Snap-to-Grid Magnético Isométrico
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
        zIndex: data.zIndex || Math.floor(data.position.y / 10)
      }}
      exit={{ 
        opacity: 0, 
        scale: 1.8, 
        filter: 'blur(20px)',
        transition: { duration: 0.4, ease: "circIn" } 
      }}
      whileDrag={{ 
        scale: 1.1,
        filter: "drop-shadow(0px 40px 30px rgba(0,0,0,0.5))",
        zIndex: 10000
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "absolute cursor-grab active:cursor-grabbing select-none pointer-events-auto touch-none",
        isEditing && isSelected && "ring-4 ring-primary ring-offset-8 rounded-[2rem]"
      )}
      style={{ 
        transform: 'translate(-50%, -50%)',
        left: 0,
        top: 0
      }}
    >
      <div className="relative group">
        <div 
          className="relative flex items-center justify-center"
          style={{ 
            width: `${itemInfo.dimensions.width}px`, 
            height: `${itemInfo.dimensions.height}px`,
          }}
        >
          {/* Sombra projetada no chão estilo Sims */}
          <div className="absolute bottom-2 inset-x-4 h-6 bg-black/10 blur-md rounded-full -z-10" />
          
          <img 
            src={itemInfo.assetPath} 
            alt={itemInfo.name}
            className="w-full h-full object-contain pointer-events-none drop-shadow-xl"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Item';
            }}
          />

          {itemInfo.isAiGenerated && (
            <div className="absolute top-0 right-0 p-1 bg-accent text-white rounded-full shadow-lg">
              <Sparkles className="w-3 h-3" />
            </div>
          )}
        </div>

        <AnimatePresence>
          {isEditing && isSelected && (
            <motion.div 
              initial={{ opacity: 0, y: 15, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.7 }}
              className="absolute -top-16 left-1/2 -translate-x-1/2 flex gap-2 bg-white p-2 rounded-2xl shadow-2xl z-[11000] border-2 border-primary/20 backdrop-blur-md"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); onStore(data.instanceId); }}
                className="bg-blue-50 text-blue-600 px-3 py-2 rounded-xl flex items-center gap-1.5 hover:bg-blue-100 transition-colors"
              >
                <Package className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase">Guardar</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onSell(data.instanceId); }}
                className="bg-red-50 text-red-600 px-3 py-2 rounded-xl flex items-center gap-1.5 hover:bg-red-100 transition-colors"
              >
                <Coins className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase">Vender</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
