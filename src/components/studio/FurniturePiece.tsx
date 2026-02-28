'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PlacedItem } from '@/lib/types';
import { STUDIO_CATALOG } from '@/lib/studio-catalog';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FurniturePieceProps {
  data: PlacedItem;
  onUpdate: (instanceId: string, x: number, y: number) => void;
  onRemove: (instanceId: string) => void;
  isEditing: boolean;
  auraColor: string;
  worldSize: number;
}

export function FurniturePiece({ data, onUpdate, onRemove, isEditing, auraColor, worldSize }: FurniturePieceProps) {
  const itemInfo = STUDIO_CATALOG.find(i => i.id === data.itemId);
  
  if (!itemInfo) return null;

  return (
    <motion.div
      drag={isEditing}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        const world = document.getElementById('studio-world');
        if (world) {
          const rect = world.getBoundingClientRect();
          // Calcula posição absoluta em pixels dentro do mundo de 1200px
          const x = info.point.x - rect.left;
          const y = info.point.y - rect.top;
          
          // O hook useStudio cuidará do Snap-to-Grid
          onUpdate(data.instanceId, x, y);
        }
      }}
      initial={false}
      animate={{ 
        scale: isEditing ? 1.1 : 1, 
        x: data.position.x,
        y: data.position.y,
        zIndex: data.zIndex
      }}
      className={cn(
        "absolute cursor-grab active:cursor-grabbing select-none pointer-events-auto touch-none",
        isEditing && "ring-2 ring-primary/40 ring-offset-4 rounded-3xl"
      )}
      style={{ 
        transform: 'translate(-50%, -50%)',
        left: 0, // Posicionamento via animate.x/y para evitar conflitos de estilo
        top: 0
      }}
    >
      <div className="relative group">
        <div 
          className="filter drop-shadow-2xl flex items-center justify-center bg-white/20 rounded-[2.5rem] backdrop-blur-md border-4 border-white shadow-xl"
          style={{ 
            width: `${itemInfo.dimensions.width * 1.5}px`, 
            height: `${itemInfo.dimensions.height * 1.5}px`,
            fontSize: `${itemInfo.dimensions.width}px`,
            borderColor: itemInfo.category === 'Especial' ? auraColor : 'white' 
          }}
        >
          {itemInfo.assetPath}
          {itemInfo.category === 'Especial' && (
            <div 
              className="absolute inset-0 rounded-[2rem] opacity-30 blur-2xl animate-pulse"
              style={{ backgroundColor: auraColor }}
            />
          )}
        </div>

        {isEditing && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(data.instanceId);
            }}
            className="absolute -top-4 -right-4 bg-destructive text-white p-3 rounded-full shadow-2xl z-50 pointer-events-auto border-4 border-white"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
