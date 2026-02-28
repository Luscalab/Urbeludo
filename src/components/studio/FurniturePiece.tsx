'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { StudioFurniture, CatalogItem } from '@/lib/types';
import { STUDIO_CATALOG } from '@/lib/studio-catalog';
import { Trash2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FurniturePieceProps {
  data: StudioFurniture;
  onUpdate: (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
  isEditing: boolean;
  auraColor: string;
}

export function FurniturePiece({ data, onUpdate, onRemove, isEditing, auraColor }: FurniturePieceProps) {
  const itemInfo = STUDIO_CATALOG.find(i => i.id === data.itemId);
  
  if (!itemInfo) return null;

  return (
    <motion.div
      drag={isEditing}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        // Calcular posição relativa em porcentagem para manter responsividade
        const container = document.getElementById('studio-grid');
        if (container) {
          const rect = container.getBoundingClientRect();
          const x = ((info.point.x - rect.left) / rect.width) * 100;
          const y = ((info.point.y - rect.top) / rect.height) * 100;
          onUpdate(data.id, x, y);
        }
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        x: `${data.x}%`,
        y: `${data.y}%`,
        left: 0,
        top: 0
      }}
      className={cn(
        "absolute cursor-grab active:cursor-grabbing z-30 select-none touch-none",
        isEditing && "ring-2 ring-primary/40 ring-offset-2 rounded-xl"
      )}
      style={{ 
        transform: 'translate(-50%, -50%)',
        position: 'absolute'
      }}
    >
      <div className="relative group">
        <div 
          className="text-6xl filter drop-shadow-lg flex items-center justify-center w-20 h-20 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/20"
          style={{ borderColor: itemInfo.category === 'aura' ? auraColor : undefined }}
        >
          {itemInfo.icon}
          {itemInfo.category === 'aura' && (
            <div 
              className="absolute inset-0 rounded-3xl opacity-20 blur-xl animate-pulse"
              style={{ backgroundColor: auraColor }}
            />
          )}
        </div>

        {isEditing && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => onRemove(data.id)}
            className="absolute -top-3 -right-3 bg-destructive text-white p-1.5 rounded-full shadow-lg z-50"
          >
            <Trash2 className="w-3 h-3" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
