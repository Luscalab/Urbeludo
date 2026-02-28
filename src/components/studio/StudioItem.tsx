'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PlacedItem } from '@/lib/types';
import { STUDIO_CATALOG } from '@/lib/studio-catalog';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudioItemProps {
  data: PlacedItem;
  onUpdate: (instanceId: string, x: number, y: number) => void;
  onRemove: (instanceId: string) => void;
  isEditing: boolean;
  auraColor: string;
}

/**
 * StudioItem: Renderiza imagens PNG transparentes extraídas da pasta studio update.
 * Implementa arrasto magnético (Snap-to-Grid de 40px) e física de elevação.
 */
export function StudioItem({ data, onUpdate, onRemove, isEditing, auraColor }: StudioItemProps) {
  const itemInfo = STUDIO_CATALOG.find(i => i.id === data.itemId);
  
  if (!itemInfo) return null;

  const GRID_SIZE = 40;

  return (
    <motion.div
      drag={isEditing}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        const world = document.getElementById('studio-world');
        if (world) {
          const rect = world.getBoundingClientRect();
          // Posição absoluta em pixels dentro do mundo gigante
          const x = info.point.x - rect.left;
          const y = info.point.y - rect.top;
          
          // Alinhamento ao grid para manter a harmonia visual
          const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
          const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;
          
          onUpdate(data.instanceId, snappedX, snappedY);
        }
      }}
      initial={false}
      animate={{ 
        x: data.position.x,
        y: data.position.y,
        // zIndex dinâmico baseado na altura (Y) para simular profundidade real
        zIndex: data.zIndex || Math.floor(data.position.y / 10)
      }}
      whileDrag={{ 
        scale: 1.1,
        filter: "drop-shadow(0px 30px 20px rgba(0,0,0,0.4))",
        zIndex: 2000 // Sempre no topo durante o arrasto
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "absolute cursor-grab active:cursor-grabbing select-none pointer-events-auto touch-none",
        isEditing && "ring-2 ring-primary/30 ring-offset-4 rounded-2xl"
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
          <img 
            src={itemInfo.assetPath} 
            alt={itemInfo.name}
            className="w-full h-full object-contain pointer-events-none"
            onError={(e) => {
              // Fallback visual caso a imagem PNG ainda não exista no diretório
              e.currentTarget.style.display = 'none';
              const span = e.currentTarget.parentElement?.querySelector('.fallback-emoji');
              if (span) (span as HTMLElement).style.display = 'block';
            }}
          />
          
          <span className="fallback-emoji hidden text-4xl drop-shadow-md select-none">
            {itemInfo.category === 'Ativo' ? '🧘' : itemInfo.category === 'Essencial' ? '🛏️' : '🌿'}
          </span>
          
          {/* Efeito de Iluminação para itens Especiais baseados na Aura */}
          {itemInfo.category === 'Especial' && (
            <div 
              className="absolute inset-0 opacity-20 blur-2xl animate-pulse pointer-events-none rounded-full"
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
            className="absolute -top-4 -right-4 bg-destructive text-white p-2.5 rounded-full shadow-2xl z-[2100] pointer-events-auto border-4 border-white active:scale-90 transition-transform"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
