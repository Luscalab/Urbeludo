'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PlacedItem } from '@/lib/types';
import { STUDIO_CATALOG } from '@/lib/studio-catalog';
import { Trash2, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FurniturePieceProps {
  data: PlacedItem;
  onUpdate: (instanceId: string, x: number, y: number) => void;
  onRemove: (instanceId: string) => void;
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
        const container = document.getElementById('studio-grid');
        if (container) {
          const rect = container.getBoundingClientRect();
          const x = ((info.point.x - rect.left) / rect.width) * 100;
          const y = ((info.point.y - rect.top) / rect.height) * 100;
          onUpdate(data.instanceId, x, y);
        }
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isEditing ? 1.05 : 1, 
        opacity: 1,
        x: `${data.position.x}%`,
        y: `${data.position.y}%`,
        left: 0,
        top: 0,
        zIndex: data.zIndex
      }}
      className={cn(
        "absolute cursor-grab active:cursor-grabbing select-none touch-none",
        isEditing && "ring-2 ring-primary/40 ring-offset-2 rounded-xl"
      )}
      style={{ 
        transform: 'translate(-50%, -50%)',
        position: 'absolute'
      }}
    >
      <div className="relative group">
        <div 
          className="filter drop-shadow-xl flex items-center justify-center bg-white/10 rounded-3xl backdrop-blur-sm border border-white/20"
          style={{ 
            width: `${itemInfo.dimensions.width}px`, 
            height: `${itemInfo.dimensions.height}px`,
            fontSize: `${itemInfo.dimensions.width * 0.6}px`,
            borderColor: itemInfo.category === 'Especial' ? auraColor : undefined 
          }}
        >
          {itemInfo.assetPath}
          {itemInfo.category === 'Especial' && (
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
            onClick={() => onRemove(data.instanceId)}
            className="absolute -top-3 -right-3 bg-destructive text-white p-1.5 rounded-full shadow-lg z-50"
          >
            <Trash2 className="w-3 h-3" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
