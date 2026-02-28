
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
  ShieldCheck,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarSelectionProps {
  initialAvatarId?: string;
  onSelect: (avatarId: string) => void;
}

/**
 * Seletor de Avatar Gigante e Síncrono.
 * Otimizado para visualização unitária de heróis sem nomes de arquivos.
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
      console.warn("Modo Offline Ativo");
      setAvatars(['1.png']); // Fallback resiliente
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
      <div className="w-full h-[500px] flex items-center justify-center bg-muted/20 rounded-[4rem] border-8 border-dashed border-primary/10">
        <Loader2 className="w-12 h-12 animate-spin text-primary/30" />
      </div>
    );
  }

  const currentAvatar = avatars[currentIndex] || '1.png';

  return (
    <div className="w-full space-y-12 relative select-none">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border-2 border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
           <Sparkles className="w-3 h-3" /> Galeria de Heróis
        </div>
        <h3 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Escolha sua Identidade</h3>
        <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40">
          Explorador {currentIndex + 1} de {avatars.length}
        </p>
      </div>
      
      <div className="relative flex justify-center items-center h-[600px] group px-12">
        {/* Setas Flutuantes Mobile-First */}
        <button 
          onClick={handlePrev}
          className="absolute left-0 z-[100] bg-white text-primary p-6 rounded-full shadow-[0_30px_60px_rgba(0,0,0,0.15)] border-4 border-primary/10 hover:scale-110 active:scale-90 transition-all"
        >
          <ChevronLeft className="w-12 h-12 stroke-[4]" />
        </button>

        <button 
          onClick={handleNext}
          className="absolute right-0 z-[100] bg-white text-primary p-6 rounded-full shadow-[0_30px_60px_rgba(0,0,0,0.15)] border-4 border-primary/10 hover:scale-110 active:scale-90 transition-all"
        >
          <ChevronRight className="w-12 h-12 stroke-[4]" />
        </button>

        <div className="relative w-full max-w-lg aspect-[4/5]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAvatar}
              initial={{ opacity: 0, scale: 0.8, rotateY: 45 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateY: -45 }}
              transition={{ type: "spring", stiffness: 150, damping: 20 }}
              className="relative w-full h-full rounded-[5rem] border-[16px] border-white bg-white shadow-[0_60px_120px_rgba(0,0,0,0.2)] overflow-hidden flex items-center justify-center p-8"
            >
              {(!loadedImages[currentAvatar] && !loadError[currentAvatar]) && (
                <div className="absolute inset-0 bg-muted/5 flex flex-col items-center justify-center z-10 backdrop-blur-xl">
                  <Loader2 className="w-20 h-20 animate-spin text-primary/20" />
                  <span className="text-[10px] font-black uppercase text-primary/40 mt-10 tracking-[0.5em] animate-pulse">Materializando...</span>
                </div>
              )}

              {loadError[currentAvatar] ? (
                <div className="absolute inset-0 bg-destructive/5 flex flex-col items-center justify-center z-10 p-16 text-center">
                  <AlertCircle className="w-20 h-20 text-destructive/30 mb-8" />
                  <span className="text-[12px] font-black uppercase text-destructive/60 tracking-widest leading-relaxed">Erro no Sensor. Tente outro perfil.</span>
                </div>
              ) : (
                <img 
                  src={`/assets/avatars/${currentAvatar}`} 
                  alt="Avatar Hero" 
                  onLoad={() => setLoadedImages(prev => ({ ...prev, [currentAvatar]: true }))}
                  onError={() => setLoadError(prev => ({ ...prev, [currentAvatar]: true }))}
                  className={cn(
                    "w-full h-full object-contain drop-shadow-[0_50px_80px_rgba(0,0,0,0.4)] transition-all duration-1000",
                    loadedImages[currentAvatar] ? "opacity-100 scale-100" : "opacity-0 scale-90"
                  )} 
                />
              )}

              {/* HUD do Visor 2026 */}
              <div className="absolute inset-0 border-[2px] border-primary/10 rounded-[4.5rem] pointer-events-none" />
              <div className="absolute top-10 left-10 p-4 bg-black/5 rounded-3xl backdrop-blur-md">
                 <ShieldCheck className="w-6 h-6 text-primary/40" />
              </div>
              <div className="absolute top-10 right-10 p-4 bg-black/5 rounded-3xl backdrop-blur-md">
                 <Maximize2 className="w-6 h-6 text-primary/40" />
              </div>

              {/* Selo de Selecionado Sims Style */}
              <div className="absolute bottom-12 right-12 bg-primary text-white rounded-[2rem] px-8 py-4 flex items-center gap-3 shadow-[0_20px_40px_rgba(0,0,0,0.3)] border-4 border-white z-50">
                <Check className="w-8 h-8 stroke-[5]" />
                <span className="text-sm font-black uppercase">Pronto</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
