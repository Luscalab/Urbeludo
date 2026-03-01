
'use client';

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertCircle, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  FolderOpen,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STATIC_AVATAR_LIST } from "@/lib/avatar-catalog";

interface AvatarSelectionProps {
  initialAvatarId?: string;
  onSelect: (avatarId: string) => void;
}

/**
 * Seletor de Identidade Estático.
 * Utiliza o catálogo local para garantir compatibilidade com exportação APK.
 */
export function AvatarSelection({ initialAvatarId, onSelect }: AvatarSelectionProps) {
  const [avatars, setAvatars] = useState<string[]>(STATIC_AVATAR_LIST);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [loadError, setLoadError] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialAvatarId) {
      const idx = avatars.indexOf(initialAvatarId);
      if (idx !== -1) setCurrentIndex(idx);
    }
  }, [initialAvatarId, avatars]);

  // Sempre que o índice ou a lista mudar, notifica o componente pai
  useEffect(() => {
    if (avatars.length > 0) {
      onSelect(avatars[currentIndex]);
    }
  }, [currentIndex, avatars, onSelect]);

  const handleNext = () => {
    if (avatars.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % avatars.length);
  };

  const handlePrev = () => {
    if (avatars.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + avatars.length) % avatars.length);
  };

  if (isLoadingList) {
    return (
      <div className="w-full h-[380px] flex flex-col items-center justify-center bg-muted/10 rounded-[3rem] border-4 border-dashed border-primary/10">
        <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
        <span className="mt-4 text-[9px] font-black uppercase text-primary/40 tracking-[0.3em]">Buscando Heróis...</span>
      </div>
    );
  }

  if (avatars.length === 0) {
    return (
      <div className="w-full h-[380px] flex flex-col items-center justify-center bg-background rounded-[3rem] border-4 border-dashed border-primary/10 p-10 text-center">
        <FolderOpen className="w-16 h-16 text-primary/20 mb-4" />
        <h3 className="text-xl font-black uppercase text-foreground/40 mb-2">Pasta de Heróis Vazia</h3>
        <p className="text-[9px] font-bold text-muted-foreground uppercase max-w-xs mx-auto mb-6">
          Verifique o catálogo estático em:<br/>
          <span className="text-primary select-all lowercase font-mono">src/lib/avatar-catalog.ts</span>
        </p>
      </div>
    );
  }

  const currentAvatar = avatars[currentIndex];
  const avatarPath = `/assets/avatars/${currentAvatar}`;

  return (
    <div className="w-full space-y-6 select-none">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-[8px] font-black uppercase text-primary tracking-widest">
            Identidade {currentIndex + 1} de {avatars.length}
          </span>
        </div>
      </div>
      
      <div className="relative flex justify-center items-center h-[380px]">
        {avatars.length > 1 && (
          <div className="absolute inset-x-0 flex justify-between items-center z-50 px-2 sm:px-4">
            <button onClick={handlePrev} className="bg-white p-4 rounded-full shadow-xl active:scale-90 transition-all border-2 border-primary/5">
              <ChevronLeft className="w-6 h-6 text-primary" />
            </button>
            <button onClick={handleNext} className="bg-white p-4 rounded-full shadow-xl active:scale-90 transition-all border-2 border-primary/5">
              <ChevronRight className="w-6 h-6 text-primary" />
            </button>
          </div>
        )}

        <div className="relative w-64 h-[350px] z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAvatar}
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full h-full rounded-[4rem] bg-white shadow-2xl flex items-center justify-center p-8 overflow-hidden border-4 border-white"
            >
              {loadError[currentAvatar] ? (
                <div className="flex flex-col items-center gap-2 opacity-20 text-center">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                  <span className="text-[8px] font-black uppercase">Imagem Inválida</span>
                </div>
              ) : (
                <img 
                  src={avatarPath} 
                  onLoad={() => setLoadedImages(prev => ({ ...prev, [currentAvatar]: true }))}
                  onError={() => setLoadError(prev => ({ ...prev, [currentAvatar]: true }))}
                  className={cn(
                    "w-full h-full object-contain drop-shadow-2xl transition-all duration-500",
                    loadedImages[currentAvatar] ? "opacity-100 scale-100" : "opacity-0 scale-90"
                  )} 
                  alt={`Herói ${currentAvatar}`}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
