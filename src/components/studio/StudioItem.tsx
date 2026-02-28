
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlacedItem } from '@/lib/types';
import { STUDIO_CATALOG } from '@/lib/studio-catalog';
import { Package, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const itemInfo = STUDIO_CATALOG.find(i => i.id === data.itemId);
  
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
          
          // Snap-to-Grid Magnético (Habbo Style)
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
        scale: 1.5, 
        filter: 'blur(10px)',
        transition: { duration: 0.4, ease: "backIn" } 
      }}
      whileDrag={{ 
        scale: 1.1,
        filter: "drop-shadow(0px 30px 20px rgba(0,0,0,0.4))",
        zIndex: 2000
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "absolute cursor-grab active:cursor-grabbing select-none pointer-events-auto touch-none",
        isEditing && isSelected && "ring-4 ring-primary ring-offset-4 rounded-3xl"
      )}
      style={{ 
        transform: 'translate(-50%, -50%)',
        left: 0,
        top: 0
      }}
    >
      <div className="relative group">
        {/* Renderização do PNG Isométrico */}
        <div 
          className="relative flex items-center justify-center"
          style={{ 
            width: `${itemInfo.dimensions.width}px`, 
            height: `${itemInfo.dimensions.height}px`,
          }}
        >
          <img 
            src={itemInfo.assetPath} 
            alt={itemInfo.name}
            className="w-full h-full object-contain pointer-events-none drop-shadow-md"
          />
        </div>

        {/* Menu de Ação com Efeito Poof */}
        <AnimatePresence>
          {isEditing && isSelected && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              className="absolute -top-16 left-1/2 -translate-x-1/2 flex gap-2 bg-white p-2 rounded-2xl shadow-2xl z-[2100] border-2 border-primary/20"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); onStore(data.instanceId); }}
                className="bg-blue-50 text-blue-600 p-2 rounded-xl flex items-center gap-1.5 hover:bg-blue-100 transition-colors"
              >
                <Package className="w-4 h-4" />
                <span className="text-[9px] font-black uppercase">Guardar</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onSell(data.instanceId); }}
                className="bg-red-50 text-red-600 p-2 rounded-xl flex items-center gap-1.5 hover:bg-red-100 transition-colors"
              >
                <Coins className="w-4 h-4" />
                <span className="text-[9px] font-black uppercase">Vender</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
