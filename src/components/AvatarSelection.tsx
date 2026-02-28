'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { AVATAR_CATALOG } from "@/lib/avatar-catalog";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarSelectionProps {
  initialAvatarId?: string;
  onSelect: (avatarId: string) => void;
}

export function AvatarSelection({ initialAvatarId, onSelect }: AvatarSelectionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(initialAvatarId || null);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelect(id);
  };

  return (
    <div className="w-full space-y-4">
      <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] px-2 text-center sm:text-left">
        Escolha seu Personagem
      </h3>
      
      <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x no-scrollbar -mx-6 px-6">
        {AVATAR_CATALOG.map((avatar) => {
          const isSelected = selectedId === avatar.id;

          return (
            <motion.div
              key={avatar.id}
              onClick={() => handleSelect(avatar.id)}
              className={cn(
                "relative flex-shrink-0 w-28 h-28 rounded-[2.5rem] border-4 cursor-pointer snap-center flex items-center justify-center transition-all bg-white shadow-sm",
                isSelected 
                  ? "border-primary bg-primary/5 shadow-lg scale-105" 
                  : "border-muted/30 opacity-60 hover:opacity-100"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img 
                src={avatar.src} 
                alt={avatar.name} 
                className={cn(
                  "w-20 h-20 object-contain drop-shadow-md transition-all",
                  isSelected ? "scale-110" : "scale-100"
                )} 
                onError={(e) => {
                  // Fallback se a imagem falhar
                  (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Avatar';
                }}
              />
              
              {isSelected && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center border-4 border-white shadow-lg z-10"
                >
                  <Check className="w-4 h-4 stroke-[4]" />
                </motion.div>
              )}

              <div className="absolute -bottom-2 inset-x-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[7px] font-black uppercase bg-black text-white px-2 py-0.5 rounded-full whitespace-nowrap">{avatar.name}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
