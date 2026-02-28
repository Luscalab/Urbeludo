
'use client';

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  Search, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AvatarSelectionProps {
  initialAvatarId?: string;
  onSelect: (avatarId: string) => void;
  debugMode?: boolean;
}

/**
 * Componente de Seleção de Avatar 2026.
 * Exibe um avatar gigante por vez com navegação lateral.
 */
export function AvatarSelection({ initialAvatarId, onSelect, debugMode = false }: AvatarSelectionProps) {
  const [avatars, setAvatars] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialAvatarId || null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadErrors, setLoadErrors] = useState<Record<string, boolean>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Tamanho do card (w-96 = 384px) + Gap (40px)
  const ITEM_WIDTH = 384 + 40; 

  useEffect(() => {
    async function fetchAvatars() {
      try {
        const response = await fetch('/api/avatars');
        const files = await response.json();
        // Filtra para garantir que temos apenas imagens válidas
        const validFiles = files.filter((f: string) => /\.(png|jpe?g|webp|svg)$/i.test(f));
        setAvatars(validFiles);
        if (validFiles.length > 0 && !selectedId) {
          setSelectedId(validFiles[0]);
          onSelect(validFiles[0]);
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

  const handleImageError = (filename: string) => {
    setLoadErrors(prev => ({ ...prev, [filename]: true }));
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -ITEM_WIDTH : ITEM_WIDTH,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-muted/10 rounded-[4rem] border-4 border-dashed border-primary/20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <span className="text-[12px] font-black uppercase tracking-widest text-primary/60">Sincronizando Identidades...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 relative mx-auto overflow-hidden">
      <div className="flex items-center justify-between px-8">
        <div className="flex flex-col">
          <h3 className="text-xl font-black uppercase text-foreground tracking-[0.2em] italic flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent" /> Seu Avatar
          </h3>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {avatars.length} arquivos detectados em /assets/avatars
          </p>
        </div>
        {debugMode && (
          <Badge variant="outline" className="text-[10px] font-black uppercase bg-accent/10 border-accent/30 text-accent animate-pulse">
            DEBUG: ON
          </Badge>
        )}
      </div>
      
      <div className="relative flex justify-center items-center px-4">
        {/* Setas Ultra-Visíveis */}
        {avatars.length > 1 && (
          <>
            <button 
              onClick={() => scroll('left')}
              className="absolute left-4 z-50 bg-white/90 backdrop-blur-xl p-5 rounded-full shadow-2xl border-4 border-primary/10 text-primary hover:scale-110 active:scale-90 transition-all"
            >
              <ChevronLeft className="w-10 h-10 stroke-[4]" />
            </button>

            <button 
              onClick={() => scroll('right')}
              className="absolute right-4 z-50 bg-white/90 backdrop-blur-xl p-5 rounded-full shadow-2xl border-4 border-primary/10 text-primary hover:scale-110 active:scale-90 transition-all"
            >
              <ChevronRight className="w-10 h-10 stroke-[4]" />
            </button>
          </>
        )}

        {/* Container que exibe um por vez */}
        <div className="max-w-[420px] w-full overflow-hidden">
          <div 
            ref={scrollContainerRef}
            className="flex gap-10 overflow-x-auto pb-12 snap-x snap-mandatory no-scrollbar px-[18px]"
          >
            {avatars.length === 0 ? (
              <div className="w-full py-24 text-center border-4 border-dashed rounded-[4rem] border-muted-foreground/10 bg-muted/5">
                <Search className="w-16 h-16 mx-auto text-muted-foreground/30 mb-6" />
                <p className="text-[12px] font-black uppercase text-muted-foreground px-10 leading-relaxed">Nenhuma foto encontrada em public/assets/avatars</p>
              </div>
            ) : (
              avatars.map((filename) => {
                const isSelected = selectedId === filename;
                const hasError = loadErrors[filename];
                const src = `/assets/avatars/${filename}`;

                return (
                  <motion.div
                    key={filename}
                    onClick={() => handleSelect(filename)}
                    className={cn(
                      "relative flex-shrink-0 w-96 h-96 rounded-[5rem] border-8 cursor-pointer snap-center flex flex-col items-center justify-center transition-all bg-white shadow-2xl overflow-hidden",
                      isSelected 
                        ? "border-primary ring-[20px] ring-primary/5 scale-100 z-10" 
                        : "border-muted/10 opacity-40 scale-90"
                    )}
                    whileHover={!isSelected ? { opacity: 0.8, scale: 0.92 } : {}}
                    whileTap={{ scale: 0.98 }}
                  >
                    {!hasError ? (
                      <img 
                        src={src} 
                        alt={filename} 
                        onError={() => handleImageError(filename)}
                        className={cn(
                          "w-80 h-80 object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-700",
                          isSelected ? "scale-110" : "scale-100 grayscale-[50%]"
                        )} 
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-destructive text-center p-8 bg-destructive/5 w-full h-full">
                        <AlertCircle className="w-16 h-16 mb-4" />
                        <span className="text-[12px] font-black uppercase">Falha no Asset</span>
                        {debugMode && <span className="text-[8px] font-mono mt-4 opacity-70 break-all">{filename}</span>}
                      </div>
                    )}
                    
                    {debugMode && (
                      <div className="absolute bottom-6 bg-black/80 text-white text-[9px] px-4 py-2 rounded-full font-mono max-w-[90%] truncate border border-white/20">
                        {filename}
                      </div>
                    )}

                    <AnimatePresence>
                      {isSelected && (
                        <motion.div 
                          initial={{ scale: 0, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0, y: 20 }}
                          className="absolute top-10 right-10 bg-primary text-white rounded-full w-20 h-20 flex items-center justify-center border-8 border-white shadow-2xl z-30"
                        >
                          <Check className="w-12 h-12 stroke-[5]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-[0.4em] animate-pulse">
          Arraste ou use as setas para navegar
        </p>
      </div>
    </div>
  );
}
