
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
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarSelectionProps {
  initialAvatarId?: string;
  onSelect: (avatarId: string) => void;
}

/**
 * Seletor de Identidade Totalmente Dinâmico.
 * Varre a pasta 'public/assets/avatars' e aceita qualquer imagem lá colocada.
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
        // Sincroniza o índice com o avatar inicial se fornecido
        if (initialAvatarId) {
          const idx = files.indexOf(initialAvatarId);
          if (idx !== -1) setCurrentIndex(idx);
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
        <h3 className="text-xl font-black uppercase text-foreground/40 mb-2">Sem Heróis na Pasta</h3>
        <p className="text-[10px] font-bold text-muted-foreground uppercase max-w-xs mx-auto">
          Adicione arquivos PNG em: <br/> 
          <span className="text-primary font-mono select-all">public/assets/avatars</span>
        </p>
      </div>
    );
  }

  const currentAvatar = avatars[currentIndex];
  const avatarPath = `/assets/avatars/${currentAvatar}`;

  return (
    <div className="w-full space-y-8 select-none">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-[8px] font-black uppercase text-primary">Detecção Dinâmica</span>
        </div>
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
          Herói {currentIndex + 1} de {avatars.length}
        </p>
      </div>
      
      <div className="relative flex justify-center items-center h-[400px]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"
        />

        <div className="absolute inset-x-0 flex justify-between items-center z-50">
          <button onClick={handlePrev} className="bg-white p-4 rounded-full shadow-xl active:scale-90 transition-all">
            <ChevronLeft className="w-6 h-6 text-primary" />
          </button>
          <button onClick={handleNext} className="bg-white p-4 rounded-full shadow-xl active:scale-90 transition-all">
            <ChevronRight className="w-6 h-6 text-primary" />
          </button>
        </div>

        <div className="relative w-64 h-80 z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAvatar}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full h-full rounded-[3rem] bg-white shadow-2xl flex items-center justify-center p-8 overflow-hidden"
            >
              {loadError[currentAvatar] ? (
                <AlertCircle className="w-12 h-12 text-red-500 opacity-20" />
              ) : (
                <img 
                  src={avatarPath} 
                  onLoad={() => setLoadedImages(prev => ({ ...prev, [currentAvatar]: true }))}
                  onError={() => setLoadError(prev => ({ ...prev, [currentAvatar]: true }))}
                  className={cn(
                    "w-full h-full object-contain drop-shadow-xl transition-all duration-500",
                    loadedImages[currentAvatar] ? "opacity-100" : "opacity-0"
                  )} 
                  alt={`Herói ${currentAvatar}`}
                />
              )}
              
              <div className="absolute bottom-4 inset-x-4">
                 <div className="bg-primary/90 text-white rounded-xl py-2 text-center text-[10px] font-black uppercase">
                    {currentAvatar.split('.')[0]}
                 </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
