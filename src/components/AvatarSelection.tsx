'use client';

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  AlertCircle, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  FolderOpen,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarSelectionProps {
  initialAvatarId?: string;
  onSelect: (avatarId: string) => void;
}

/**
 * Seletor de Identidade Dinâmico.
 * Exibe qualquer arquivo de imagem encontrado em 'public/assets/avatars'.
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
      if (!response.ok) throw new Error('API Desconectada');
      const files = await response.json();
      
      if (files && files.length > 0) {
        setAvatars(files);
        
        // Tenta sincronizar com o avatar inicial salvo no perfil
        if (initialAvatarId) {
          const idx = files.indexOf(initialAvatarId);
          if (idx !== -1) {
            setCurrentIndex(idx);
          }
        }
      }
    } catch (error) {
      console.warn("Aviso: Falha ao listar heróis locais.", error);
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

  // Notifica o componente pai sempre que o avatar selecionado muda
  useEffect(() => {
    if (avatars.length > 0) {
      onSelect(avatars[currentIndex]);
    }
  }, [currentIndex, avatars, onSelect]);

  if (isLoadingList) {
    return (
      <div className="w-full h-[400px] flex flex-col items-center justify-center bg-muted/10 rounded-[3rem]">
        <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
      </div>
    );
  }

  if (avatars.length === 0) {
    return (
      <div className="w-full h-[400px] flex flex-col items-center justify-center bg-background rounded-[3rem] border-4 border-dashed border-primary/10 p-10 text-center">
        <FolderOpen className="w-16 h-16 text-primary/20 mb-4" />
        <h3 className="text-xl font-black uppercase text-foreground/40 mb-2">Pasta de Heróis Vazia</h3>
        <p className="text-[10px] font-bold text-muted-foreground uppercase max-w-xs mx-auto mb-6">
          Adicione suas fotos em: <br/> 
          <span className="text-primary font-mono select-all">public/assets/avatars</span>
        </p>
        <button onClick={fetchAvatars} className="flex items-center gap-2 text-[10px] font-black uppercase text-primary border-b border-primary">
          <RefreshCw className="w-3 h-3" /> Tentar Novamente
        </button>
      </div>
    );
  }

  const currentAvatar = avatars[currentIndex];
  const avatarPath = `/assets/avatars/${currentAvatar}`;

  return (
    <div className="w-full space-y-8 select-none">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
          <span className="text-[8px] font-black uppercase text-primary tracking-widest">Câmara de Identidade</span>
        </div>
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
          {currentAvatar} ({currentIndex + 1}/{avatars.length})
        </p>
      </div>
      
      <div className="relative flex justify-center items-center h-[400px]">
        {avatars.length > 1 && (
          <div className="absolute inset-x-0 flex justify-between items-center z-50 px-2 sm:px-10">
            <button onClick={handlePrev} className="bg-white p-4 rounded-full shadow-xl active:scale-90 transition-all border border-muted">
              <ChevronLeft className="w-6 h-6 text-primary" />
            </button>
            <button onClick={handleNext} className="bg-white p-4 rounded-full shadow-xl active:scale-90 transition-all border border-muted">
              <ChevronRight className="w-6 h-6 text-primary" />
            </button>
          </div>
        )}

        <div className="relative w-64 h-80 z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAvatar}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full h-full rounded-[3rem] bg-white shadow-2xl flex items-center justify-center p-8 overflow-hidden border-2 border-primary/5"
            >
              {loadError[currentAvatar] ? (
                <div className="flex flex-col items-center gap-2 opacity-20">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                  <span className="text-[8px] font-black uppercase">Erro de Arquivo</span>
                </div>
              ) : (
                <img 
                  src={avatarPath} 
                  onLoad={() => setLoadedImages(prev => ({ ...prev, [currentAvatar]: true }))}
                  onError={() => setLoadError(prev => ({ ...prev, [currentAvatar]: true }))}
                  className={cn(
                    "w-full h-full object-contain drop-shadow-2xl transition-all duration-500",
                    loadedImages[currentAvatar] ? "opacity-100 scale-100" : "opacity-0 scale-90"
                  )} 
                  alt={`Herói ${currentAvatar}`}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
