'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle, Loader2, Sparkles, Search } from "lucide-react";
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
  const [loadErrors, setLoadErrors] = useState<Record<string, boolean>>({});

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

  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-muted/10 rounded-[3rem] border-2 border-dashed border-primary/20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Sincronizando Galeria...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center justify-between px-2">
        <div className="flex flex-col">
          <h3 className="text-[12px] font-black uppercase text-foreground tracking-[0.2em] italic flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" /> Escolha seu Herói
          </h3>
          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Ativos detectados: {avatars.length}</p>
        </div>
        {debugMode && (
          <Badge variant="outline" className="text-[8px] font-black uppercase bg-accent/10 border-accent/30 text-accent animate-pulse">
            Scanner em Tempo Real
          </Badge>
        )}
      </div>
      
      <div className="flex gap-6 overflow-x-auto pb-10 px-2 snap-x no-scrollbar -mx-6 px-8">
        {avatars.length === 0 ? (
          <div className="w-full py-16 text-center border-4 border-dashed rounded-[3rem] border-muted-foreground/10 bg-muted/5">
            <Search className="w-10 h-10 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-[10px] font-black uppercase text-muted-foreground">Nenhuma foto em /assets/avatars/</p>
            <p className="text-[8px] font-medium text-muted-foreground/60 mt-1 italic">Adicione arquivos .png na pasta para vê-los aqui.</p>
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
                  "relative flex-shrink-0 w-44 h-44 rounded-[3.5rem] border-4 cursor-pointer snap-center flex flex-col items-center justify-center transition-all bg-white shadow-xl overflow-hidden",
                  isSelected 
                    ? "border-primary bg-primary/5 ring-8 ring-primary/10 scale-110 z-10" 
                    : "border-muted/20 opacity-80 hover:opacity-100 hover:border-primary/40"
                )}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Efeito de Scanner para personalização */}
                {isSelected && (
                  <motion.div 
                    initial={{ y: -100 }}
                    animate={{ y: 200 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-x-0 h-1 bg-primary/30 blur-[2px] z-20"
                  />
                )}

                {!hasError ? (
                  <img 
                    src={src} 
                    alt={filename} 
                    onError={() => handleImageError(filename)}
                    className={cn(
                      "w-36 h-36 object-contain drop-shadow-2xl transition-all duration-500",
                      isSelected ? "scale-110 rotate-3" : "scale-100"
                    )} 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-destructive text-center p-4">
                    <AlertCircle className="w-8 h-8 mb-2" />
                    <span className="text-[8px] font-black uppercase">Erro de Asset</span>
                    {debugMode && <span className="text-[6px] font-mono mt-1 opacity-70">{filename}</span>}
                  </div>
                )}
                
                {/* Debug Tooltip Personalizado */}
                {debugMode && (
                  <div className="absolute bottom-2 bg-black/80 text-white text-[7px] px-3 py-1 rounded-full font-mono max-w-[85%] truncate border border-white/20">
                    {filename}
                  </div>
                )}

                <AnimatePresence>
                  {isSelected && (
                    <motion.div 
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 45 }}
                      className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center border-4 border-white shadow-2xl z-30"
                    >
                      <Check className="w-6 h-6 stroke-[4]" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Glow de seleção */}
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/5 animate-pulse-soft pointer-events-none" />
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

function Badge({ className, variant, children }: any) {
  return (
    <div className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border", className)}>
      {children}
    </div>
  );
}
