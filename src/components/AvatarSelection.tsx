
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
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarSelectionProps {
  initialAvatarId?: string;
  onSelect: (avatarId: string) => void;
}

/**
 * Seletor de Avatar Gigante e Unitário.
 * Exibe apenas UMA foto por vez em tamanho máximo.
 * Sem nomes de arquivos, focado 100% na imagem.
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
      const validFiles = files.filter((f: string) => /\.(png|jpe?g|webp|svg)$/i.test(f));
      setAvatars(validFiles);
      
      if (initialAvatarId) {
        const idx = validFiles.indexOf(initialAvatarId);
        if (idx !== -1) setCurrentIndex(idx);
      }
    } catch (error) {
      console.warn("Navegação offline ativa");
      setAvatars(['1.png']); // Fallback
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
      <div className="w-full h-[500px] flex items-center justify-center bg-muted/10 rounded-[4rem] border-8 border-dashed border-primary/10">
        <Loader2 className="w-16 h-16 animate-spin text-primary/40" />
      </div>
    );
  }

  const currentAvatar = avatars[currentIndex] || '1.png';

  return (
    <div className="w-full space-y-10 relative">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest">
           <Sparkles className="w-3 h-3" /> Galeria de Heróis
        </div>
        <h3 className="text-3xl font-black uppercase italic tracking-tighter">Escolha seu Herói</h3>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
          Opção {currentIndex + 1} de {avatars.length}
        </p>
      </div>
      
      <div className="relative flex justify-center items-center h-[550px] group">
        {/* Setas Flutuantes Premium */}
        <button 
          onClick={handlePrev}
          className="absolute -left-4 z-[60] bg-white text-primary p-6 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-4 border-primary/5 hover:scale-110 active:scale-90 transition-all group-hover:left-2"
        >
          <ChevronLeft className="w-12 h-12 stroke-[4]" />
        </button>

        <button 
          onClick={handleNext}
          className="absolute -right-4 z-[60] bg-white text-primary p-6 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-4 border-primary/5 hover:scale-110 active:scale-90 transition-all group-hover:right-2"
        >
          <ChevronRight className="w-12 h-12 stroke-[4]" />
        </button>

        <div className="relative w-full max-w-sm aspect-[3/4]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAvatar}
              initial={{ opacity: 0, scale: 0.9, x: 100 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -100 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="relative w-full h-full rounded-[4.5rem] border-[12px] border-white bg-white shadow-[0_50px_100px_rgba(0,0,0,0.1)] overflow-hidden flex items-center justify-center p-6"
            >
              {/* Overlay de carregamento para fotos pesadas */}
              {(!loadedImages[currentAvatar] && !loadError[currentAvatar]) && (
                <div className="absolute inset-0 bg-muted/5 flex flex-col items-center justify-center z-10 backdrop-blur-md">
                  <Loader2 className="w-16 h-16 animate-spin text-primary/40" />
                  <span className="text-[9px] font-black uppercase text-primary/40 mt-6 tracking-widest">Sincronizando...</span>
                </div>
              )}

              {loadError[currentAvatar] ? (
                <div className="absolute inset-0 bg-destructive/5 flex flex-col items-center justify-center z-10 p-12 text-center">
                  <AlertCircle className="w-14 h-14 text-destructive/40 mb-6" />
                  <span className="text-[10px] font-black uppercase text-destructive/60 tracking-widest">Falha na materialização. Tente a próxima foto.</span>
                </div>
              ) : (
                <img 
                  src={`/assets/avatars/${currentAvatar}`} 
                  alt="Avatar Hero" 
                  onLoad={() => setLoadedImages(prev => ({ ...prev, [currentAvatar]: true }))}
                  onError={() => setLoadError(prev => ({ ...prev, [currentAvatar]: true }))}
                  className={cn(
                    "w-full h-full object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.3)] transition-all duration-1000",
                    loadedImages[currentAvatar] ? "opacity-100 scale-100" : "opacity-0 scale-90"
                  )} 
                />
              )}

              {/* Selo de Selecionado */}
              <div className="absolute top-8 right-8 bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center border-4 border-white shadow-2xl z-40">
                <Check className="w-9 h-9 stroke-[4]" />
              </div>

              {/* HUD Interno do Visor */}
              <div className="absolute bottom-10 left-10 flex items-center gap-3 text-[9px] font-black uppercase text-primary/30 tracking-[0.3em] z-40">
                 <ShieldCheck className="w-4 h-4" /> 2026_GEN_ID
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
