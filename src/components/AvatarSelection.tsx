'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { AVATAR_CATALOG } from "@/lib/avatar-catalog";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarSelectionProps {
  initialAvatarId?: string;
  onSelect: (avatarId: string) => void;
  debugMode?: boolean;
}

export function AvatarSelection({ initialAvatarId, onSelect, debugMode = false }: AvatarSelectionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(initialAvatarId || null);
  const [loadErrors, setLoadErrors] = useState<Record<string, boolean>>({});

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelect(id);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">
          Seletor de Herói
        </h3>
        {debugMode && (
          <span className="text-[8px] font-bold bg-accent/20 text-accent px-2 py-0.5 rounded-full uppercase animate-pulse">
            Inspetor Ativo
          </span>
        )}
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-8 px-2 snap-x no-scrollbar -mx-6 px-6">
        {AVATAR_CATALOG.map((avatar) => {
          const isSelected = selectedId === avatar.id;
          const hasError = loadErrors[avatar.id];

          return (
            <motion.div
              key={avatar.id}
              onClick={() => handleSelect(avatar.id)}
              className={cn(
                "relative flex-shrink-0 w-32 h-32 rounded-[2.5rem] border-4 cursor-pointer snap-center flex flex-col items-center justify-center transition-all bg-white shadow-sm overflow-hidden",
                isSelected 
                  ? "border-primary bg-primary/5 shadow-xl scale-110 z-10" 
                  : "border-muted/20 opacity-70 hover:opacity-100 hover:border-primary/40"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {hasError ? (
                <div className="flex flex-col items-center justify-center text-destructive p-4 text-center">
                  <AlertCircle className="w-6 h-6 mb-1" />
                  <span className="text-[8px] font-black uppercase leading-none">Erro 404</span>
                  {debugMode && <span className="text-[6px] mt-1 font-mono break-all">{avatar.src}</span>}
                </div>
              ) : (
                <img 
                  src={avatar.src} 
                  alt={avatar.name} 
                  className={cn(
                    "w-24 h-24 object-contain drop-shadow-md transition-all",
                    isSelected ? "scale-110" : "scale-100"
                  )} 
                  onError={() => setLoadErrors(prev => ({ ...prev, [avatar.id]: true }))}
                />
              )}
              
              {debugMode && (
                <div className="absolute bottom-1 bg-black/80 text-white text-[6px] px-1.5 py-0.5 rounded-sm font-mono max-w-[90%] truncate">
                  {avatar.src.split('/').pop()}
                </div>
              )}

              {isSelected && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center border-4 border-white shadow-lg z-20"
                >
                  <Check className="w-4 h-4 stroke-[4]" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
