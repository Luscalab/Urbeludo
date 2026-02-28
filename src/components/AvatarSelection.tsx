'use client';

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarSelectionProps {
  initialAvatarId?: string;
  onSelect: (avatarId: string) => void;
}

/**
 * Seletor de Avatar Gigante (1 por vez).
 * Otimizado para máxima visibilidade e performance offline.
 */
export function AvatarSelection({ initialAvatarId, onSelect }: AvatarSelectionProps) {
  const [avatars, setAvatars] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const fetchAvatars = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const response = await fetch('/api/avatars');
      if (!response.ok) throw new Error('API Indisponível');
      const files = await response.json();
      const validFiles = files.filter((f: string) => /\.(png|jpe?g|webp|svg)$/i.test(f));
      setAvatars(validFiles);
      
      if (initialAvatarId) {
        const idx = validFiles.indexOf(initialAvatarId);
        if (idx !== -1) setCurrentIndex(idx);
      }
    } catch (error) {
      console.warn("Navegação offline ativa");
      setAvatars(['1.png']); // Fallback básico
    } finally {
      setIsLoadingList(false);
    }
  }, [initialAvatarId]);

  useEffect(() => {
    fetchAvatars();
  }, [fetchAvatars]);

  const handleNext = () => {
    if (avatars.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % avatars.length);
  };

  const handlePrev = () => {
    if (avatars.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + avatars.length) % avatars.length);
  };

  useEffect(() => {
    if (avatars[currentIndex]) {
      onSelect(avatars[currentIndex]);
    }
  }, [currentIndex, avatars, onSelect]);

  if (isLoadingList) {
    return (
      <div className="w-full h-[450px] flex items-center justify-center bg-muted/5 rounded-[4rem] border-4 border-dashed border-primary/20">
        <Loader2 className="w-12 h-12 animate-spin text-primary/40" />
      </div>
    );
  }

  const currentAvatar = avatars[currentIndex] || '1.png';

  return (
    <div className="w-full space-y-8 relative mx-auto">
      <div className="flex flex-col items-center text-center">
        <h3 className="text-2xl font-black uppercase text-foreground tracking-[0.2em] italic flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-accent" /> Escolha seu Herói
        </h3>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50 mt-2">
          Opção {currentIndex + 1} de {avatars.length}
        </p>
      </div>
      
      <div className="relative flex justify-center items-center h-[550px]">
        {/* Setas de Navegação Ultra-Visíveis */}
        <button 
          onClick={handlePrev}
          className="absolute left-0 z-50 bg-white/95 backdrop-blur-xl p-6 rounded-full shadow-2xl border-4 border-primary/10 text-primary hover:scale-110 active:scale-90 transition-all"
        >
          <ChevronLeft className="w-12 h-12 stroke-[4]" />
        </button>

        <button 
          onClick={handleNext}
          className="absolute right-0 z-50 bg-white/95 backdrop-blur-xl p-6 rounded-full shadow-2xl border-4 border-primary/10 text-primary hover:scale-110 active:scale-90 transition-all"
        >
          <ChevronRight className="w-12 h-12 stroke-[4]" />
        </button>

        <div className="relative w-full max-w-sm aspect-[3/4] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAvatar}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative w-full h-full rounded-[4.5rem] border-[10px] border-primary ring-[20px] ring-primary/5 bg-white shadow-[0_40px_100px_rgba(0,0,0,0.1)] overflow-hidden flex items-center justify-center p-8"
            >
              {!loadedImages[currentAvatar] && (
                <div className="absolute inset-0 bg-muted/20 flex flex-col items-center justify-center z-10">
                  <Loader2 className="w-12 h-12 animate-spin text-primary/40" />
                  <span className="text-[9px] font-black uppercase text-primary/40 mt-4 tracking-widest">Ajustando Visor...</span>
                </div>
              )}

              <img 
                src={`/assets/avatars/${currentAvatar}`} 
                alt="Avatar" 
                onLoad={() => setLoadedImages(prev => ({ ...prev, [currentAvatar]: true }))}
                className={cn(
                  "w-full h-full object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.4)] transition-all duration-700",
                  loadedImages[currentAvatar] ? "opacity-100 scale-100" : "opacity-0 scale-95"
                )} 
              />

              <div className="absolute top-8 right-8 bg-primary text-white rounded-full w-14 h-14 flex items-center justify-center border-4 border-white shadow-2xl z-30">
                <Check className="w-8 h-8 stroke-[4]" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
