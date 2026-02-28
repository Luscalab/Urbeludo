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
 * Seletor de Avatar Gigante e Resiliente (1 por vez).
 * Otimizado para não travar com fotos pesadas e ocultar nomes de arquivos.
 */
export function AvatarSelection({ initialAvatarId, onSelect }: AvatarSelectionProps) {
  const [avatars, setAvatars] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [loadErrors, setLoadErrors] = useState<Record<string, boolean>>({});

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
      console.error("Erro na busca de avatares:", error);
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

  const handleImageLoad = (filename: string) => {
    setLoadedImages(prev => ({ ...prev, [filename]: true }));
    onSelect(filename); 
  };

  const handleImageError = (filename: string) => {
    setLoadErrors(prev => ({ ...prev, [filename]: true }));
  };

  if (isLoadingList) {
    return (
      <div className="w-full h-[450px] flex items-center justify-center bg-muted/5 rounded-[4rem] border-4 border-dashed border-primary/20">
        <Loader2 className="w-12 h-12 animate-spin text-primary/40" />
      </div>
    );
  }

  if (avatars.length === 0) {
     return (
      <div className="w-full h-[450px] flex flex-col items-center justify-center bg-destructive/5 rounded-[4rem] border-4 border-dashed border-destructive/20 p-8 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <span className="text-[10px] font-black uppercase text-destructive tracking-widest">Nenhuma foto detectada</span>
        <button onClick={fetchAvatars} className="mt-4 h-10 px-6 rounded-full bg-destructive text-white text-[9px] font-black uppercase flex items-center"><RefreshCw className="w-4 h-4 mr-2" /> Tentar Novamente</button>
      </div>
    );
  }

  const currentAvatar = avatars[currentIndex];

  return (
    <div className="w-full space-y-6 relative mx-auto overflow-hidden">
      <div className="flex flex-col items-center text-center">
        <h3 className="text-xl font-black uppercase text-foreground tracking-[0.2em] italic flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" /> Escolha seu Herói
        </h3>
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-50">
          Opção {currentIndex + 1} de {avatars.length}
        </p>
      </div>
      
      <div className="relative flex justify-center items-center h-[520px]">
        {/* Setas de Navegação Laterais Ultra-Visíveis */}
        <button 
          onClick={handlePrev}
          className="absolute left-0 z-50 bg-white/90 backdrop-blur-xl p-5 rounded-full shadow-2xl border-4 border-primary/10 text-primary hover:scale-110 active:scale-90 transition-all"
        >
          <ChevronLeft className="w-10 h-10 stroke-[4]" />
        </button>

        <button 
          onClick={handleNext}
          className="absolute right-0 z-50 bg-white/90 backdrop-blur-xl p-5 rounded-full shadow-2xl border-4 border-primary/10 text-primary hover:scale-110 active:scale-90 transition-all"
        >
          <ChevronRight className="w-10 h-10 stroke-[4]" />
        </button>

        {/* Display Unitário Gigante */}
        <div className="relative w-full max-w-sm aspect-[3/4] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAvatar}
              initial={{ opacity: 0, scale: 0.8, rotateY: 45 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateY: -45 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative w-full h-full rounded-[4rem] border-8 border-primary ring-[15px] ring-primary/5 bg-white shadow-2xl overflow-hidden flex items-center justify-center"
            >
              {!loadedImages[currentAvatar] && !loadErrors[currentAvatar] && (
                <div className="absolute inset-0 bg-muted/20 flex flex-col items-center justify-center z-10">
                  <Loader2 className="w-12 h-12 animate-spin text-primary/40" />
                  <span className="text-[8px] font-black uppercase text-primary/40 mt-4 tracking-widest">Processando Foto...</span>
                </div>
              )}

              {!loadErrors[currentAvatar] ? (
                <img 
                  src={`/assets/avatars/${currentAvatar}`} 
                  alt="Avatar" 
                  onLoad={() => handleImageLoad(currentAvatar)}
                  onError={() => handleImageError(currentAvatar)}
                  className={cn(
                    "w-[95%] h-[95%] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-500",
                    loadedImages[currentAvatar] ? "opacity-100 scale-100" : "opacity-0 scale-90"
                  )} 
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-destructive p-8 text-center bg-destructive/5 w-full h-full">
                  <AlertCircle className="w-16 h-16 mb-4" />
                  <span className="text-[10px] font-black uppercase italic tracking-tighter">Erro ao carregar arquivo</span>
                </div>
              )}

              {/* Selo de Seleção Ativa */}
              {loadedImages[currentAvatar] && (
                <div className="absolute top-6 right-6 bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center border-4 border-white shadow-xl z-30">
                  <Check className="w-7 h-7 stroke-[4]" />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
