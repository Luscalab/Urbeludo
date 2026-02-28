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
 * StudioItem: O componente fundamental de decoração do UrbeLudo.
 * Implementa arrasto com Snap-to-Grid (40px) e física de mola.
 */
export function StudioItem({ data, onUpdate, onRemove, isEditing, auraColor }: StudioItemProps) {
  const itemInfo = STUDIO_CATALOG.find(i => i.id === data.itemId);
  
  if (!itemInfo) return null;

  // Tamanho do grid para alinhamento perfeito
  const GRID_SIZE = 40;

  return (
    <motion.div
      // Drag habilitado apenas no modo edição
      drag={isEditing}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        const world = document.getElementById('studio-world');
        if (world) {
          const rect = world.getBoundingClientRect();
          // Calcula posição absoluta em pixels dentro do mundo de 1200x1200px
          const x = info.point.x - rect.left;
          const y = info.point.y - rect.top;
          
          // O hook useStudio aplicará o snap final, mas aqui já prevemos o comportamento
          onUpdate(data.instanceId, x, y);
        }
      }}
      initial={false}
      animate={{ 
        x: data.position.x,
        y: data.position.y,
        zIndex: data.zIndex
      }}
      // Efeito de "levantar" o móvel ao arrastar
      whileDrag={{ 
        scale: 1.1,
        filter: "drop-shadow(0px 20px 15px rgba(0,0,0,0.3))",
        zIndex: 1000
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "absolute cursor-grab active:cursor-grabbing select-none pointer-events-auto touch-none",
        isEditing && "ring-2 ring-primary/20 ring-offset-4 rounded-[2rem]"
      )}
      style={{ 
        transform: 'translate(-50%, -50%)',
        left: 0,
        top: 0
      }}
    >
      <div className="relative group">
        {/* Visual do Móvel (SVG/Emoji) */}
        <div 
          className="filter flex items-center justify-center bg-white/40 rounded-[2rem] backdrop-blur-md border-4 border-white shadow-xl overflow-hidden"
          style={{ 
            width: `${itemInfo.dimensions.width}px`, 
            height: `${itemInfo.dimensions.height}px`,
            fontSize: `${itemInfo.dimensions.width / 2}px`,
            borderColor: itemInfo.category === 'Especial' ? auraColor : 'white' 
          }}
        >
          <span className="drop-shadow-sm select-none">{itemInfo.assetPath}</span>
          
          {/* Brilho da Aura para itens especiais */}
          {itemInfo.category === 'Especial' && (
            <div 
              className="absolute inset-0 opacity-20 blur-xl animate-pulse"
              style={{ backgroundColor: auraColor }}
            />
          )}
        </div>

        {/* Botão de Remover (Aparece apenas em modo edição) */}
        {isEditing && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(data.instanceId);
            }}
            className="absolute -top-4 -right-4 bg-destructive text-white p-3 rounded-full shadow-2xl z-[1100] pointer-events-auto border-4 border-white active:scale-90 transition-transform"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
