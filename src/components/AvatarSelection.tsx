
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

export function AvatarSelection({ initialAvatarId, onSelect, debugMode = false }: AvatarSelectionProps) {
  const [avatars, setAvatars] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialAvatarId || null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadErrors, setLoadErrors] = useState<Record<string, boolean>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const handleImageError = (filename: string) => {
    setLoadErrors(prev => ({ ...prev, [filename]: true }));
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      // Tamanho de um item (w-64 = 256px) + gap-10 (40px) = 296px
      // 3 itens = 296 * 3 = 888px
      const scrollAmount = 888; 
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-muted/10 rounded-[3rem] border-2 border-dashed border-primary/20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <span className="text-[12px] font-black uppercase tracking-widest text-primary/60">Sincronizando Galeria...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 relative">
      <div className="flex items-center justify-between px-4">
        <div className="flex flex-col">
          <h3 className="text-[16px] font-black uppercase text-foreground tracking-[0.2em] italic flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" /> Selecione seu Avatar
          </h3>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total na pasta: {avatars.length} fotos</p>
        </div>
        {debugMode && (
          <Badge variant="outline" className="text-[10px] font-black uppercase bg-accent/10 border-accent/30 text-accent animate-pulse">
            Inspetor Ativo
          </Badge>
        )}
      </div>
      
      <div className="relative group/nav px-2">
        {/* Setas Gigantes de Navegação */}
        {avatars.length > 3 && (
          <>
            <button 
              onClick={() => scroll('left')}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-40 bg-white/95 backdrop-blur-md p-5 rounded-full shadow-2xl border-4 border-primary/20 text-primary hover:scale-110 active:scale-90 transition-all flex items-center justify-center"
              aria-label="Página Anterior"
            >
              <ChevronLeft className="w-10 h-10 stroke-[4]" />
            </button>

            <button 
              onClick={() => scroll('right')}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-40 bg-white/95 backdrop-blur-md p-5 rounded-full shadow-2xl border-4 border-primary/20 text-primary hover:scale-110 active:scale-90 transition-all flex items-center justify-center"
              aria-label="Próxima Página"
            >
              <ChevronRight className="w-10 h-10 stroke-[4]" />
            </button>
          </>
        )}

        {/* Container de Scroll por Blocos */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-10 overflow-x-auto pb-12 px-12 snap-x no-scrollbar -mx-10"
        >
          {avatars.length === 0 ? (
            <div className="w-full py-24 text-center border-4 border-dashed rounded-[4rem] border-muted-foreground/10 bg-muted/5">
              <Search className="w-16 h-16 mx-auto text-muted-foreground/30 mb-6" />
              <p className="text-[12px] font-black uppercase text-muted-foreground">Adicione fotos em public/assets/avatars</p>
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
                    "relative flex-shrink-0 w-64 h-64 rounded-[4rem] border-8 cursor-pointer snap-center flex flex-col items-center justify-center transition-all bg-white shadow-2xl overflow-hidden",
                    isSelected 
                      ? "border-primary bg-primary/5 ring-12 ring-primary/10 scale-105 z-10" 
                      : "border-muted/10 opacity-70 hover:opacity-100 hover:border-primary/30"
                  )}
                  whileHover={{ scale: 1.05, y: -10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {!hasError ? (
                    <img 
                      src={src} 
                      alt={filename} 
                      onError={() => handleImageError(filename)}
                      className={cn(
                        "w-56 h-56 object-contain drop-shadow-2xl transition-all duration-500",
                        isSelected ? "scale-110 rotate-2" : "scale-100"
                      )} 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-destructive text-center p-6">
                      <AlertCircle className="w-12 h-12 mb-3" />
                      <span className="text-[10px] font-black uppercase">Asset Errado</span>
                      <span className="text-[8px] font-mono mt-2 opacity-70">{filename}</span>
                    </div>
                  )}
                  
                  {debugMode && (
                    <div className="absolute bottom-4 bg-black/80 text-white text-[8px] px-4 py-2 rounded-full font-mono max-w-[90%] truncate border border-white/20">
                      {filename}
                    </div>
                  )}

                  <AnimatePresence>
                    {isSelected && (
                      <motion.div 
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 45 }}
                        className="absolute top-4 right-4 bg-primary text-white rounded-full w-14 h-14 flex items-center justify-center border-6 border-white shadow-2xl z-30"
                      >
                        <Check className="w-8 h-8 stroke-[5]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">
          Arraste para o lado ou use as setas laterais
        </p>
      </div>
    </div>
  );
}
