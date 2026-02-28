
'use client';

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarSelectionProps {
  initialAvatarId?: string;
  onSelect: (avatarId: string) => void;
}

/**
 * Componente de Seleção de Avatar Otimizado.
 * Exibe um avatar gigante por vez, oculta nomes de arquivos e trata erros de carregamento.
 */
export function AvatarSelection({ initialAvatarId, onSelect }: AvatarSelectionProps) {
  const [avatars, setAvatars] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [loadErrors, setLoadErrors] = useState<Record<string, boolean>>({});

  // Busca a lista de arquivos da API dinâmica
  useEffect(() => {
    async function fetchAvatars() {
      try {
        const response = await fetch('/api/avatars');
        if (!response.ok) throw new Error('API indisponível');
        const files = await response.json();
        const validFiles = files.filter((f: string) => /\.(png|jpe?g|webp|svg)$/i.test(f));
        setAvatars(validFiles);
        
        if (initialAvatarId) {
          const idx = validFiles.indexOf(initialAvatarId);
          if (idx !== -1) setCurrentIndex(idx);
        }
      } catch (error) {
        console.error("Erro ao carregar lista de avatares:", error);
      } finally {
        setIsLoadingList(false);
      }
    }
    fetchAvatars();
  }, [initialAvatarId]);

  const handleNext = useCallback(() => {
    if (avatars.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % avatars.length);
  }, [avatars.length]);

  const handlePrev = useCallback(() => {
    if (avatars.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + avatars.length) % avatars.length);
  }, [avatars.length]);

  const handleImageLoad = (filename: string) => {
    setLoadedImages(prev => ({ ...prev, [filename]: true }));
    onSelect(filename); 
  };

  const handleImageError = (filename: string) => {
    setLoadErrors(prev => ({ ...prev, [filename]: true }));
  };

  if (isLoadingList) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-muted/10 rounded-[4rem] border-4 border-dashed border-primary/20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Sincronizando Heróis...</span>
        </div>
      </div>
    );
  }

  if (avatars.length === 0) {
     return (
      <div className="w-full h-[400px] flex items-center justify-center bg-muted/10 rounded-[4rem] border-4 border-dashed border-destructive/20">
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <span className="text-[12px] font-black uppercase tracking-widest text-destructive/60">Nenhum herói encontrado.</span>
          <p className="text-[8px] font-medium text-muted-foreground uppercase">Adicione fotos na pasta public/assets/avatars</p>
        </div>
      </div>
    );
  }

  const currentAvatar = avatars[currentIndex];

  return (
    <div className="w-full space-y-6 relative mx-auto overflow-hidden px-2">
      <div className="flex items-center justify-between px-4">
        <div className="flex flex-col">
          <h3 className="text-lg font-black uppercase text-foreground tracking-[0.2em] italic flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" /> Escolha sua Identidade
          </h3>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
            {currentIndex + 1} de {avatars.length} Identidades
          </p>
        </div>
      </div>
      
      <div className="relative flex justify-center items-center h-[500px]">
        {/* Navegação por Setas Gigantes */}
        <button 
          onClick={handlePrev}
          className="absolute left-0 z-50 bg-white/90 backdrop-blur-xl p-5 rounded-full shadow-2xl border-4 border-primary/10 text-primary hover:scale-110 active:scale-90 transition-all"
        >
          <ChevronLeft className="w-8 h-8 stroke-[4]" />
        </button>

        <button 
          onClick={handleNext}
          className="absolute right-0 z-50 bg-white/90 backdrop-blur-xl p-5 rounded-full shadow-2xl border-4 border-primary/10 text-primary hover:scale-110 active:scale-90 transition-all"
        >
          <ChevronRight className="w-8 h-8 stroke-[4]" />
        </button>

        {/* Exibidor Unitário Gigante */}
        <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAvatar}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={cn(
                "relative w-full h-full rounded-[5rem] border-8 flex flex-col items-center justify-center bg-white shadow-2xl overflow-hidden border-primary ring-[20px] ring-primary/5"
              )}
            >
              {/* Spinner de Loading */}
              {!loadedImages[currentAvatar] && !loadErrors[currentAvatar] && (
                <div className="absolute inset-0 z-20 bg-muted/20 backdrop-blur-md flex flex-col items-center justify-center">
                  <Loader2 className="w-16 h-16 animate-spin text-primary/40" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/40 mt-4">Sincronizando...</span>
                </div>
              )}

              {/* Imagem do Avatar */}
              {!loadErrors[currentAvatar] ? (
                <img 
                  src={`/assets/avatars/${currentAvatar}`} 
                  alt="Avatar UrbeLudo" 
                  onLoad={() => handleImageLoad(currentAvatar)}
                  onError={() => handleImageError(currentAvatar)}
                  className={cn(
                    "w-[95%] h-[95%] object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.4)] transition-all duration-700",
                    loadedImages[currentAvatar] ? "opacity-100 scale-105" : "opacity-0 scale-90"
                  )} 
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-destructive text-center p-8 bg-destructive/5 w-full h-full">
                  <AlertCircle className="w-16 h-16 mb-4" />
                  <span className="text-[12px] font-black uppercase tracking-widest">Erro de Sincronia</span>
                  <p className="text-[8px] font-medium text-muted-foreground uppercase mt-4">Este arquivo não pode ser carregado.</p>
                </div>
              )}

              {/* Selo de Seleção */}
              <div className="absolute top-8 right-8 bg-primary text-white rounded-full w-14 h-14 flex items-center justify-center border-4 border-white shadow-xl z-30">
                <Check className="w-7 h-7 stroke-[4]" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Indicadores de Página */}
      <div className="text-center pt-4">
        <div className="flex justify-center gap-2">
          {avatars.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, i) => (
             <div key={i} className={cn("h-2 rounded-full transition-all", i === 2 ? "w-12 bg-primary" : "w-2.5 bg-primary/20")} />
          ))}
        </div>
      </div>
    </div>
  );
}
