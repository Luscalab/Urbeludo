
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
  Cpu,
  FolderOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FALLBACK_AVATAR_SRC } from "@/lib/avatar-catalog";

interface AvatarSelectionProps {
  initialAvatarId?: string;
  onSelect: (avatarId: string) => void;
}

/**
 * Seletor de Avatar Dinâmico.
 * Aceita qualquer arquivo retornado pela API /api/avatars em public/assets/avatars
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
        setAvatars([]);
      }
    } catch (error) {
      console.warn("Erro ao buscar avatares dinâmicos:", error);
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
      <div className="w-full h-[450px] flex flex-col items-center justify-center bg-muted/10 rounded-[4rem] border-8 border-primary/5">
        <Loader2 className="w-12 h-12 animate-spin text-primary/40" />
      </div>
    );
  }

  // Estado caso a pasta public/assets/avatars esteja vazia
  if (avatars.length === 0) {
    return (
      <div className="w-full h-[450px] flex flex-col items-center justify-center bg-muted/5 rounded-[4rem] border-4 border-dashed border-primary/20 p-12 text-center space-y-4">
        <FolderOpen className="w-16 h-16 text-primary/20 mb-2" />
        <h3 className="text-xl font-black uppercase italic tracking-tighter text-foreground/40">Nenhum herói encontrado</h3>
        <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed max-w-xs mx-auto">
          Adicione suas fotos PNG ou JPG na pasta:<br/>
          <span className="text-primary mt-2 block font-mono">public/assets/avatars</span>
        </p>
        <button 
          onClick={fetchAvatars}
          className="mt-6 px-8 py-3 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
        >
          Tentar Novamente
        </button>
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
        {/* Aura Dinâmica de Fundo */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute w-[80%] aspect-square bg-gradient-to-tr from-primary via-accent to-secondary rounded-full blur-[120px] -z-10"
        />

        {/* Controles de Navegação */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between items-center z-50 px-2 pointer-events-none">
          <button 
            onClick={handlePrev} 
            className="pointer-events-auto bg-white/90 backdrop-blur-xl p-5 rounded-full shadow-2xl border-2 border-primary/10 active:scale-90 transition-all group"
          >
            <ChevronLeft className="w-8 h-8 text-primary stroke-[4] group-hover:-translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={handleNext} 
            className="pointer-events-auto bg-white/90 backdrop-blur-xl p-5 rounded-full shadow-2xl border-2 border-primary/10 active:scale-90 transition-all group"
          >
            <ChevronRight className="w-8 h-8 text-primary stroke-[4] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Visualização do Avatar */}
        <div className="relative w-full max-w-sm aspect-[4/5] z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAvatar}
              initial={{ opacity: 0, scale: 0.9, rotateY: -20 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: 20 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="relative w-full h-full rounded-[4rem] border-[12px] border-white bg-white/40 backdrop-blur-md shadow-2xl flex items-center justify-center p-8 overflow-hidden group"
            >
              {!loadedImages[currentAvatar] && !loadError[currentAvatar] && (
                <Cpu className="w-12 h-12 animate-pulse text-primary/30 absolute" />
              )}

              {loadError[currentAvatar] ? (
                <div className="flex flex-col items-center gap-4 opacity-20">
                  <AlertCircle className="w-16 h-16" />
                  <span className="text-[10px] font-black uppercase">Erro de Arquivo</span>
                </div>
              ) : (
                <img 
                  src={avatarPath} 
                  onLoad={() => setLoadedImages(prev => ({ ...prev, [currentAvatar]: true }))}
                  onError={() => setLoadError(prev => ({ ...prev, [currentAvatar]: true }))}
                  className={cn(
                    "w-full h-full object-contain drop-shadow-2xl transition-all duration-700",
                    loadedImages[currentAvatar] ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  )} 
                  alt="Avatar Selecionado"
                />
              )}

              {/* Overlay de Seleção */}
              <div className="absolute bottom-8 inset-x-8">
                 <div className="bg-primary/90 backdrop-blur-md text-white rounded-full py-4 text-center shadow-lg flex items-center justify-center gap-3 border border-white/20">
                    <Check className="w-4 h-4 stroke-[4]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{currentAvatar.split('.')[0]}</span>
                 </div>
              </div>

              {/* Detalhes de HUD Futurista */}
              <div className="absolute top-8 left-8 border-l-2 border-t-2 border-primary/20 w-8 h-8" />
              <div className="absolute top-8 right-8 border-r-2 border-t-2 border-primary/20 w-8 h-8" />
              <div className="absolute bottom-8 left-8 border-l-2 border-b-2 border-primary/20 w-8 h-8" />
              <div className="absolute bottom-8 right-8 border-r-2 border-b-2 border-primary/20 w-8 h-8" />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
