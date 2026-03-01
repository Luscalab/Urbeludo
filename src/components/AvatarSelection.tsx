
'use client';

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertCircle, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  FolderOpen,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarSelectionProps {
  initialAvatarId?: string;
  onSelect: (avatarId: string) => void;
}

/**
 * Seletor de Identidade de Alta Performance.
 * Utiliza framer-motion para interpretação fluida de qualquer arquivo em public/assets/avatars.
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
      if (!response.ok) throw new Error('API Inacessível');
      const files = await response.json();
      
      if (files && files.length > 0) {
        setAvatars(files);
        
        // Tenta encontrar o avatar inicial na lista dinâmica
        if (initialAvatarId) {
          const idx = files.indexOf(initialAvatarId);
          if (idx !== -1) setCurrentIndex(idx);
          else setCurrentIndex(0);
        }
      } else {
        setAvatars([]);
      }
    } catch (error) {
      console.warn("Aviso: Falha ao sincronizar heróis locais.", error);
      setAvatars([]);
    } finally {
      setIsLoadingList(false);
    }
  }, [initialAvatarId]);

  useEffect(() => {
    fetchAvatars();
  }, [fetchAvatars]);

  // Notifica o pai sobre a seleção
  useEffect(() => {
    if (avatars.length > 0) {
      onSelect(avatars[currentIndex]);
    }
  }, [currentIndex, avatars, onSelect]);

  const handleNext = () => {
    if (avatars.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % avatars.length);
  };

  const handlePrev = () => {
    if (avatars.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + avatars.length) % avatars.length);
  };

  if (isLoadingList) {
    return (
      <div className="w-full h-[400px] flex flex-col items-center justify-center bg-muted/10 rounded-[3rem] border-4 border-dashed border-primary/10">
        <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
        <span className="mt-4 text-[9px] font-black uppercase text-primary/40 tracking-[0.3em]">Varrendo Identidades...</span>
      </div>
    );
  }

  if (avatars.length === 0) {
    return (
      <div className="w-full h-[400px] flex flex-col items-center justify-center bg-background rounded-[3rem] border-4 border-dashed border-primary/10 p-10 text-center">
        <FolderOpen className="w-16 h-16 text-primary/20 mb-4" />
        <h3 className="text-xl font-black uppercase text-foreground/40 mb-2">Sem Heróis Ativos</h3>
        <p className="text-[10px] font-bold text-muted-foreground uppercase max-w-xs mx-auto mb-6">
          Coloque suas fotos (PNG, JPG, etc) na pasta: <br/> 
          <span className="text-primary font-mono select-all">public/assets/avatars</span>
        </p>
        <button onClick={fetchAvatars} className="flex items-center gap-2 text-[10px] font-black uppercase text-primary border-b border-primary">
          <RefreshCw className="w-3 h-3" /> Tentar Sincronizar
        </button>
      </div>
    );
  }

  const currentAvatar = avatars[currentIndex];
  const avatarPath = `/assets/avatars/${currentAvatar}`;

  return (
    <div className="w-full space-y-8 select-none">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-[8px] font-black uppercase text-primary tracking-widest">
            Identidade {currentIndex + 1} de {avatars.length}
          </span>
        </div>
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest truncate max-w-xs px-10">
          {currentAvatar}
        </p>
      </div>
      
      <div className="relative flex justify-center items-center h-[420px]">
        {/* Efeito de Aura de Fundo */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-72 h-72 rounded-full bg-gradient-to-r from-primary/20 via-accent/10 to-transparent blur-3xl"
        />

        {avatars.length > 1 && (
          <div className="absolute inset-x-0 flex justify-between items-center z-50 px-2 sm:px-10">
            <button onClick={handlePrev} className="bg-white p-4 rounded-full shadow-xl active:scale-90 transition-all border-2 border-primary/5">
              <ChevronLeft className="w-6 h-6 text-primary" />
            </button>
            <button onClick={handleNext} className="bg-white p-4 rounded-full shadow-xl active:scale-90 transition-all border-2 border-primary/5">
              <ChevronRight className="w-6 h-6 text-primary" />
            </button>
          </div>
        )}

        <div className="relative w-72 h-[400px] z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAvatar}
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full h-full rounded-[4rem] bg-white shadow-2xl flex items-center justify-center p-8 overflow-hidden border-4 border-white"
            >
              {loadError[currentAvatar] ? (
                <div className="flex flex-col items-center gap-2 opacity-20 text-center">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                  <span className="text-[8px] font-black uppercase">Falha na Foto</span>
                </div>
              ) : (
                <img 
                  src={avatarPath} 
                  onLoad={() => setLoadedImages(prev => ({ ...prev, [currentAvatar]: true }))}
                  onError={() => setLoadError(prev => ({ ...prev, [currentAvatar]: true }))}
                  className={cn(
                    "w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-all duration-500",
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
