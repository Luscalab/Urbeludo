
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlacedItem } from '@/lib/types';
import { STUDIO_CATALOG } from '@/lib/studio-catalog';
import { Package, Coins, Sparkles, Move } from 'lucide-react';
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

/**
 * Componente individual de mobília com lógica de simulação avançada.
 */
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
          
          // Magnetismo de Grade
          const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
          const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;
          
          onUpdate(data.instanceId, snappedX, snappedY);
        }
      }}
      onClick={() => isEditing && setIsSelected(!isSelected)}
      initial={{ opacity: 0, scale: 0.5, y: -100 }}
      animate={{ 
        opacity: 1,
        scale: 1,
        x: data.position.x,
        y: data.position.y,
        zIndex: data.zIndex || Math.floor(data.position.y)
      }}
      exit={{ opacity: 0, scale: 0, transition: { duration: 0.2 } }}
      whileDrag={{ 
        scale: 1.15,
        filter: "drop-shadow(0px 60px 40px rgba(0,0,0,0.4))",
        zIndex: 99999
      }}
      className={cn(
        "absolute cursor-grab active:cursor-grabbing select-none pointer-events-auto touch-none",
        isEditing && isSelected && "ring-8 ring-primary/40 rounded-[3rem] ring-offset-8"
      )}
      style={{ 
        transform: 'translate(-50%, -50%)',
        left: 0,
        top: 0
      }}
    >
      <div className="relative group">
        {/* Sombra de Projeção Dinâmica */}
        <div 
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black/20 blur-2xl rounded-full -z-10 transition-all"
          style={{ 
            width: `${itemInfo.dimensions.width * 0.8}px`, 
            height: `${itemInfo.dimensions.height * 0.2}px`,
          }}
        />

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
            className="w-full h-full object-contain pointer-events-none drop-shadow-[0_20px_20px_rgba(0,0,0,0.1)]"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Object'; }}
          />

          {itemInfo.isAiGenerated && (
            <div className="absolute top-0 right-0 p-2 bg-accent text-white rounded-2xl shadow-xl animate-bounce">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Menu de Contexto (Bubble UI) */}
        <AnimatePresence>
          {isEditing && isSelected && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 20 }}
              className="absolute -top-24 left-1/2 -translate-x-1/2 flex gap-3 bg-zinc-900/95 backdrop-blur-2xl p-3 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] z-[100000] border border-white/10"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); onStore(data.instanceId); }}
                className="bg-white/10 text-white p-4 rounded-2xl flex items-center gap-2 hover:bg-white/20 transition-all active:scale-90"
              >
                <Package className="w-5 h-5 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">Guardar</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onSell(data.instanceId); }}
                className="bg-red-500/20 text-red-500 p-4 rounded-2xl flex items-center gap-2 hover:bg-red-500/30 transition-all active:scale-90"
              >
                <Coins className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Vender</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isEditing && !isSelected && (
          <div className="absolute -top-4 -right-4 bg-primary p-2 rounded-full text-white shadow-xl animate-pulse">
            <Move className="w-4 h-4" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
