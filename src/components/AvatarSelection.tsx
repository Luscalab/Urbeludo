
'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarSelectionProps {
  initialAvatarId?: string;
  onSelect: (avatarId: string) => void;
  debugMode?: boolean;
}

export function AvatarSelection({ initialAvatarId, onSelect, debugMode = false }: AvatarSelectionProps) {
  const [avatars, setAvatars] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialAvatarId || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAvatars() {
      try {
        const response = await fetch('/api/avatars');
        const files = await response.json();
        setAvatars(files);
        if (files.length > 0 && !selectedId) {
          setSelectedId(files[0]);
          onSelect(files[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar lista de avatares:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAvatars();
  }, [onSelect, selectedId]);

  const handleSelect = (filename: string) => {
    setSelectedId(filename);
    onSelect(filename);
  };

  if (isLoading) {
    return (
      <div className="w-full h-32 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">
          Seletor de Herói ({avatars.length})
        </h3>
        {debugMode && (
          <span className="text-[8px] font-bold bg-accent/20 text-accent px-2 py-0.5 rounded-full uppercase animate-pulse">
            Scanner de Arquivos Ativo
          </span>
        )}
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-8 px-2 snap-x no-scrollbar -mx-6 px-6">
        {avatars.length === 0 ? (
          <div className="w-full py-10 text-center border-2 border-dashed rounded-[2rem] border-muted-foreground/20">
            <p className="text-[10px] font-black uppercase text-muted-foreground">Nenhuma foto em /assets/avatars/</p>
          </div>
        ) : (
          avatars.map((filename) => {
            const isSelected = selectedId === filename;
            const src = `/assets/avatars/${filename}`;

            return (
              <motion.div
                key={filename}
                onClick={() => handleSelect(filename)}
                className={cn(
                  "relative flex-shrink-0 w-32 h-32 rounded-[2.5rem] border-4 cursor-pointer snap-center flex flex-col items-center justify-center transition-all bg-white shadow-sm overflow-hidden",
                  isSelected 
                    ? "border-primary bg-primary/5 shadow-xl scale-110 z-10" 
                    : "border-muted/20 opacity-70 hover:opacity-100 hover:border-primary/40"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img 
                  src={src} 
                  alt={filename} 
                  className={cn(
                    "w-24 h-24 object-contain drop-shadow-md transition-all",
                    isSelected ? "scale-110" : "scale-100"
                  )} 
                />
                
                {debugMode && (
                  <div className="absolute bottom-1 bg-black/80 text-white text-[6px] px-1.5 py-0.5 rounded-sm font-mono max-w-[90%] truncate">
                    {filename}
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
          })
        )}
      </div>
    </div>
  );
}
