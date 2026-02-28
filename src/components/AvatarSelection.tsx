
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
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AvatarSelectionProps {
  initialAvatarId?: string;
  onSelect: (avatarId: string) => void;
  debugMode?: boolean;
}

/**
 * Componente de Seleção de Avatar Otimizado 2026.
 * Exibe um avatar gigante por vez com carregamento sob demanda para performance.
 */
export function AvatarSelection({ initialAvatarId, onSelect, debugMode = false }: AvatarSelectionProps) {
  const [avatars, setAvatars] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [loadErrors, setLoadErrors] = useState<Record<string, boolean>>({});

  // Busca a lista de arquivos da API
  useEffect(() => {
    async function fetchAvatars() {
      try {
        const response = await fetch('/api/avatars');
        const files = await response.json();
        const validFiles = files.filter((f: string) => /\.(png|jpe?g|webp|svg)$/i.test(f));
        setAvatars(validFiles);
        
        // Tenta encontrar o índice do avatar inicial
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
    setCurrentIndex((prev) => (prev + 1) % avatars.length);
  }, [avatars.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + avatars.length) % avatars.length);
  }, [avatars.length]);

  const handleImageLoad = (filename: string) => {
    setLoadedImages(prev => ({ ...prev, [filename]: true }));
    onSelect(filename); // Seleciona automaticamente ao visualizar
  };

  const handleImageError = (filename: string) => {
    setLoadErrors(prev => ({ ...prev, [filename]: true }));
  };

  if (isLoadingList) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-muted/10 rounded-[4rem] border-4 border-dashed border-primary/20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <span className="text-[12px] font-black uppercase tracking-widest text-primary/60">Sincronizando Galeria...</span>
        </div>
      </div>
    );
  }

  const currentAvatar = avatars[currentIndex];

  return (
    <div className="w-full space-y-8 relative mx-auto overflow-hidden">
      <div className="flex items-center justify-between px-8">
        <div className="flex flex-col">
          <h3 className="text-xl font-black uppercase text-foreground tracking-[0.2em] italic flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent" /> Seu Herói
          </h3>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {currentIndex + 1} de {avatars.length} Identidades Detectadas
          </p>
        </div>
        {debugMode && (
          <Badge variant="outline" className="text-[10px] font-black uppercase bg-accent/10 border-accent/30 text-accent animate-pulse">
            DEBUG: ON
          </Badge>
        )}
      </div>
      
      <div className="relative flex justify-center items-center px-4 h-[450px]">
        {/* Navegação */}
        {avatars.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-4 z-50 bg-white/90 backdrop-blur-xl p-5 rounded-full shadow-2xl border-4 border-primary/10 text-primary hover:scale-110 active:scale-90 transition-all"
            >
              <ChevronLeft className="w-10 h-10 stroke-[4]" />
            </button>

            <button 
              onClick={handleNext}
              className="absolute right-4 z-50 bg-white/90 backdrop-blur-xl p-5 rounded-full shadow-2xl border-4 border-primary/10 text-primary hover:scale-110 active:scale-90 transition-all"
            >
              <ChevronRight className="w-10 h-10 stroke-[4]" />
            </button>
          </>
        )}

        {/* Exibidor Único Gigante */}
        <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center">
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
              {/* Overlay de Loading Local para esta Imagem */}
              {!loadedImages[currentAvatar] && !loadErrors[currentAvatar] && (
                <div className="absolute inset-0 z-20 bg-muted/20 backdrop-blur-md flex flex-col items-center justify-center">
                  <Loader2 className="w-16 h-16 animate-spin text-primary/40" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/40 mt-4">Processando...</span>
                </div>
              )}

              {!loadErrors[currentAvatar] ? (
                <img 
                  src={`/assets/avatars/${currentAvatar}`} 
                  alt={currentAvatar} 
                  onLoad={() => handleImageLoad(currentAvatar)}
                  onError={() => handleImageError(currentAvatar)}
                  className={cn(
                    "w-[85%] h-[85%] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-700",
                    loadedImages[currentAvatar] ? "opacity-100 scale-110" : "opacity-0 scale-90"
                  )} 
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-destructive text-center p-8 bg-destructive/5 w-full h-full">
                  <AlertCircle className="w-16 h-16 mb-4" />
                  <span className="text-[12px] font-black uppercase">Erro de Asset</span>
                  <span className="text-[8px] font-mono mt-4 opacity-70 break-all">{currentAvatar}</span>
                </div>
              )}

              {/* Selo de Selecionado */}
              <div className="absolute top-8 right-8 bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center border-4 border-white shadow-xl z-30">
                <Check className="w-8 h-8 stroke-[4]" />
              </div>

              {/* Indicador de Nome (Opcional/Debug) */}
              <div className="absolute bottom-6 bg-black/80 text-white text-[9px] px-4 py-2 rounded-full font-mono max-w-[80%] truncate border border-white/20">
                {currentAvatar}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-[0.4em] animate-pulse">
          Use as setas para navegar entre as identidades
        </p>
        <div className="flex justify-center gap-1.5">
          {avatars.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, i) => (
             <div key={i} className={cn("h-1 rounded-full transition-all", i === 2 ? "w-8 bg-primary" : "w-2 bg-primary/20")} />
          ))}
        </div>
      </div>
    </div>
  );
}
