
'use client';

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  AlertCircle, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Maximize2,
  Zap,
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FALLBACK_AVATAR_SRC } from "@/lib/avatar-catalog";

interface AvatarSelectionProps {
  initialAvatarId?: string;
  onSelect: (avatarId: string) => void;
}

/**
 * Seletor de Avatar Dinâmico.
 * Aceita qualquer arquivo retornado pela API /api/avatars
 */
export function AvatarSelection({ initialAvatarId, onSelect }: AvatarSelectionProps) {
  const [avatars, setAvatars] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [loadError, setLoadError] = useState<Record<string, boolean>>({});

  const fetchAvatars = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const response = await fetch('/api/avatars');
      if (!response.ok) throw new Error('API Indisponível');
      const files = await response.json();
      
      if (files && files.length > 0) {
        setAvatars(files);
        if (initialAvatarId) {
          const idx = files.indexOf(initialAvatarId);
          if (idx !== -1) setCurrentIndex(idx);
        }
      } else {
        setAvatars([]); // Deixa vazio para mostrar erro amigável
      }
    } catch (error) {
      console.warn("Erro ao buscar avatares dinâmicos.");
      setAvatars([]);
    } finally {
      setIsLoadingList(false);
    }
  }, [initialAvatarId]);

  useEffect(() => {
    fetchAvatars();
  }, [fetchAvatars]);

  const handleNext = () => {
    if (avatars.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % avatars.length);
  };

  const handlePrev = () => {
    if (avatars.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + avatars.length) % avatars.length);
  };

  useEffect(() => {
    if (avatars.length > 0) {
      onSelect(avatars[currentIndex]);
    }
  }, [currentIndex, avatars, onSelect]);

  if (isLoadingList) {
    return (
      <div className="w-full h-[400px] flex flex-col items-center justify-center bg-muted/20 rounded-[4rem] border-8 border-primary/5">
        <Loader2 className="w-12 h-12 animate-spin text-primary/40" />
      </div>
    );
  }

  if (avatars.length === 0) {
    return (
      <div className="w-full h-[400px] flex flex-col items-center justify-center bg-destructive/5 rounded-[4rem] border-8 border-destructive/10 p-8 text-center">
        <AlertCircle className="w-12 h-12 text-destructive/40 mb-4" />
        <p className="text-[10px] font-black uppercase text-destructive/60">Nenhum herói encontrado em public/assets/avatars</p>
      </div>
    );
  }

  const currentAvatar = avatars[currentIndex];
  const avatarPath = `/assets/avatars/${currentAvatar}`;

  return (
    <div className="w-full space-y-8 relative select-none max-w-2xl mx-auto">
      <div className="flex flex-col items-center text-center space-y-2">
        <h3 className="text-3xl font-black uppercase italic tracking-tighter text-foreground">
          Sua <span className="text-primary">Identidade</span>
        </h3>
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40">
          Herói {currentIndex + 1} de {avatars.length}
        </p>
      </div>
      
      <div className="relative flex justify-center items-center h-[450px] sm:h-[550px]">
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute w-[70%] aspect-square bg-primary rounded-full blur-[100px] -z-10"
        />

        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between items-center z-50 px-2">
          <button onClick={handlePrev} className="bg-white/80 backdrop-blur-xl p-4 rounded-full shadow-xl border-2 border-primary/10 active:scale-90 transition-all">
            <ChevronLeft className="w-8 h-8 text-primary stroke-[4]" />
          </button>
          <button onClick={handleNext} className="bg-white/80 backdrop-blur-xl p-4 rounded-full shadow-xl border-2 border-primary/10 active:scale-90 transition-all">
            <ChevronRight className="w-8 h-8 text-primary stroke-[4]" />
          </button>
        </div>

        <div className="relative w-full max-w-sm aspect-[4/5] z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAvatar}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full h-full rounded-[4rem] border-[12px] border-white bg-white/40 backdrop-blur-md shadow-2xl flex items-center justify-center p-8 overflow-hidden"
            >
              {!loadedImages[currentAvatar] && !loadError[currentAvatar] && (
                <Cpu className="w-12 h-12 animate-pulse text-primary/30 absolute" />
              )}

              {loadError[currentAvatar] ? (
                <img src={FALLBACK_AVATAR_SRC} className="w-full h-full object-contain opacity-20" alt="fallback" />
              ) : (
                <img 
                  src={avatarPath} 
                  onLoad={() => setLoadedImages(prev => ({ ...prev, [currentAvatar]: true }))}
                  onError={() => setLoadError(prev => ({ ...prev, [currentAvatar]: true }))}
                  className={cn(
                    "w-full h-full object-contain drop-shadow-2xl transition-all duration-500",
                    loadedImages[currentAvatar] ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  )} 
                  alt="Avatar"
                />
              )}

              <div className="absolute bottom-6 inset-x-6">
                 <div className="bg-primary/90 backdrop-blur-md text-white rounded-full py-3 text-center shadow-lg flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 stroke-[4]" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Selecionado</span>
                 </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
