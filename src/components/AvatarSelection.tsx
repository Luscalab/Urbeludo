
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
  Cpu,
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
        // Tenta selecionar o herói atual se ele ainda existir na pasta
        if (initialAvatarId) {
          const idx = files.indexOf(initialAvatarId);
          if (idx !== -1) setCurrentIndex(idx);
        }
      } else {
        setAvatars([]);
      }
    } catch (error) {
      console.warn("Aviso: Falha ao listar heróis locais.", error);
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
      <div className="w-full h-[500px] flex flex-col items-center justify-center bg-muted/10 rounded-[4rem] border-8 border-primary/5">
        <Loader2 className="w-12 h-12 animate-spin text-primary/40" />
        <p className="mt-4 text-[10px] font-black uppercase text-primary/40 tracking-widest">Varrendo Galeria...</p>
      </div>
    );
  }

  // Se a pasta 'public/assets/avatars' estiver vazia
  if (avatars.length === 0) {
    return (
      <div className="w-full h-[500px] flex flex-col items-center justify-center bg-background rounded-[4rem] border-4 border-dashed border-primary/20 p-12 text-center space-y-6">
        <FolderOpen className="w-20 h-20 text-primary/20" />
        <div className="space-y-2">
          <h3 className="text-2xl font-black uppercase italic tracking-tighter text-foreground/40">Câmara de Heróis Vazia</h3>
          <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed max-w-xs mx-auto">
            Adicione suas imagens (PNG, JPG, SVG) na pasta do projeto:<br/>
            <span className="text-primary mt-2 block font-mono bg-primary/5 p-2 rounded-lg">public/assets/avatars</span>
          </p>
        </div>
        <button 
          onClick={fetchAvatars}
          className="px-10 py-4 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
        >
          Recarregar Galeria
        </button>
      </div>
    );
  }

  const currentAvatar = avatars[currentIndex];
  // No Next.js, caminhos de /public são mapeados para a raiz
  const avatarPath = `/assets/avatars/${currentAvatar}`;

  return (
    <div className="w-full space-y-10 relative select-none max-w-2xl mx-auto">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-1 rounded-full border border-primary/20">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-[9px] font-black uppercase text-primary tracking-widest">Detecção Dinâmica Ativa</span>
        </div>
        <h3 className="text-4xl font-black uppercase italic tracking-tighter text-foreground">
          Sua <span className="text-primary">Identidade</span>
        </h3>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40">
          Herói {currentIndex + 1} de {avatars.length}
        </p>
      </div>
      
      <div className="relative flex justify-center items-center h-[500px] sm:h-[600px]">
        {/* Aura Animada de Fundo */}
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.25, 0.1],
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-[85%] aspect-square bg-gradient-to-tr from-primary via-accent to-secondary rounded-full blur-[140px] -z-10"
        />

        {/* Botões de Navegação Flutuantes */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between items-center z-50 px-2 pointer-events-none">
          <button 
            onClick={handlePrev} 
            className="pointer-events-auto bg-white/95 backdrop-blur-xl p-6 rounded-full shadow-2xl border-2 border-primary/10 active:scale-90 transition-all group"
          >
            <ChevronLeft className="w-10 h-10 text-primary stroke-[4] group-hover:-translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={handleNext} 
            className="pointer-events-auto bg-white/95 backdrop-blur-xl p-6 rounded-full shadow-2xl border-2 border-primary/10 active:scale-90 transition-all group"
          >
            <ChevronRight className="w-10 h-10 text-primary stroke-[4] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Visualização Central do Avatar */}
        <div className="relative w-full max-w-sm aspect-[4/5] z-10 px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAvatar}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: "spring", stiffness: 120, damping: 25 }}
              className="relative w-full h-full rounded-[4.5rem] border-[12px] border-white bg-white/50 backdrop-blur-md shadow-[0_50px_100px_rgba(0,0,0,0.1)] flex items-center justify-center p-10 overflow-hidden group"
            >
              {!loadedImages[currentAvatar] && !loadError[currentAvatar] && (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-16 h-16 animate-spin text-primary/20" />
                  <span className="text-[8px] font-black uppercase text-primary/20 tracking-widest">Carregando Asset...</span>
                </div>
              )}

              {loadError[currentAvatar] ? (
                <div className="flex flex-col items-center gap-4 opacity-30">
                  <AlertCircle className="w-16 h-16 text-red-500" />
                  <span className="text-[9px] font-black uppercase text-red-500">Erro no Arquivo: {currentAvatar}</span>
                </div>
              ) : (
                <img 
                  src={avatarPath} 
                  onLoad={() => setLoadedImages(prev => ({ ...prev, [currentAvatar]: true }))}
                  onError={() => setLoadError(prev => ({ ...prev, [currentAvatar]: true }))}
                  className={cn(
                    "w-full h-full object-contain drop-shadow-[0_35px_60px_rgba(0,0,0,0.3)] transition-all duration-1000",
                    loadedImages[currentAvatar] ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  )} 
                  alt={`Herói ${currentAvatar}`}
                />
              )}

              {/* HUD Inferior de Nome do Arquivo */}
              <div className="absolute bottom-10 inset-x-10">
                 <div className="bg-primary/90 backdrop-blur-xl text-white rounded-2xl py-5 text-center shadow-2xl flex flex-col items-center gap-1 border border-white/20">
                    <Check className="w-4 h-4 stroke-[4] mb-1" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{currentAvatar.split('.')[0]}</span>
                    <span className="text-[7px] font-bold uppercase opacity-60 tracking-widest">{currentAvatar.split('.').pop()} Sincronizado</span>
                 </div>
              </div>

              {/* Detalhes de HUD nos Cantos */}
              <div className="absolute top-10 left-10 border-l-4 border-t-4 border-primary/20 w-10 h-10 rounded-tl-3xl" />
              <div className="absolute top-10 right-10 border-r-4 border-t-4 border-primary/20 w-10 h-10 rounded-tr-3xl" />
              <div className="absolute bottom-10 left-10 border-l-4 border-b-4 border-primary/20 w-10 h-10 rounded-bl-3xl" />
              <div className="absolute bottom-10 right-10 border-r-4 border-b-4 border-primary/20 w-10 h-10 rounded-br-3xl" />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
