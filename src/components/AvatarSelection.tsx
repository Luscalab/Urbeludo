
'use client';

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarSelectionProps {
  initialAvatarId?: string;
  onSelect: (avatarId: string) => void;
}

/**
 * Componente de Seleção de Avatar Dinâmico e Resiliente.
 * Exibe um avatar gigante por vez, oculta nomes de arquivos e gerencia falhas de carregamento.
 */
export function AvatarSelection({ initialAvatarId, onSelect }: AvatarSelectionProps) {
  const [avatars, setAvatars] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [loadErrors, setLoadErrors] = useState<Record<string, boolean>>({});

  // Busca a lista de arquivos da API dinâmica que escaneia a pasta public/assets/avatars
  useEffect(() => {
    async function fetchAvatars() {
      try {
        const response = await fetch('/api/avatars');
        if (!response.ok) throw new Error('API de arquivos indisponível');
        const files = await response.json();
        const validFiles = files.filter((f: string) => /\.(png|jpe?g|webp|svg)$/i.test(f));
        setAvatars(validFiles);
        
        if (initialAvatarId) {
          const idx = validFiles.indexOf(initialAvatarId);
          if (idx !== -1) setCurrentIndex(idx);
        }
      } catch (error) {
        console.error("Erro ao carregar lista de avatares:", error);
      } finally {
        setIsLoadingList(false);
      }
    }
    fetchAvatars();
  }, [initialAvatarId]);

  const handleNext = useCallback(() => {
    if (avatars.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % avatars.length);
  }, [avatars.length]);

  const handlePrev = useCallback(() => {
    if (avatars.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + avatars.length) % avatars.length);
  }, [avatars.length]);

  const handleImageLoad = (filename: string) => {
    setLoadedImages(prev => ({ ...prev, [filename]: true }));
    onSelect(filename); 
  };

  const handleImageError = (filename: string) => {
    console.warn(`Falha crítica ao carregar imagem: ${filename}`);
    setLoadErrors(prev => ({ ...prev, [filename]: true }));
  };

  if (isLoadingList) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-muted/5 rounded-[4rem] border-4 border-dashed border-primary/10">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">Sincronizando Heróis...</span>
        </div>
      </div>
    );
  }

  if (avatars.length === 0) {
     return (
      <div className="w-full h-[500px] flex items-center justify-center bg-muted/10 rounded-[4rem] border-4 border-dashed border-destructive/20">
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <span className="text-[12px] font-black uppercase tracking-widest text-destructive/60">Galeria Vazia</span>
          <p className="text-[8px] font-medium text-muted-foreground uppercase">Certifique-se de que há PNGs na pasta public/assets/avatars</p>
        </div>
      </div>
    );
  }

  const currentAvatar = avatars[currentIndex];

  return (
    <div className="w-full space-y-8 relative mx-auto overflow-hidden px-2">
      <div className="flex flex-col items-center text-center space-y-2">
        <h3 className="text-xl font-black uppercase text-foreground tracking-[0.2em] italic flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" /> Escolha sua Identidade
        </h3>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
          Herói {currentIndex + 1} de {avatars.length}
        </p>
      </div>
      
      <div className="relative flex justify-center items-center h-[550px]">
        {/* Setas de Navegação Laterais Ultra-Visíveis */}
        <button 
          onClick={handlePrev}
          className="absolute left-4 z-50 bg-white/90 backdrop-blur-2xl p-6 rounded-full shadow-2xl border-4 border-primary/10 text-primary hover:scale-110 active:scale-90 transition-all"
        >
          <ChevronLeft className="w-10 h-10 stroke-[4]" />
        </button>

        <button 
          onClick={handleNext}
          className="absolute right-4 z-50 bg-white/90 backdrop-blur-2xl p-6 rounded-full shadow-2xl border-4 border-primary/10 text-primary hover:scale-110 active:scale-90 transition-all"
        >
          <ChevronRight className="w-10 h-10 stroke-[4]" />
        </button>

        {/* Exibidor Unitário Gigante (30% maior) */}
        <div className="relative w-full max-w-xl aspect-square flex items-center justify-center px-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAvatar}
              initial={{ opacity: 0, x: 100, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, x: -100, scale: 0.8, rotate: 5 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              className={cn(
                "relative w-full h-full rounded-[6rem] border-8 flex flex-col items-center justify-center bg-white shadow-2xl overflow-hidden border-primary ring-[30px] ring-primary/5"
              )}
            >
              {/* Overlay de Carregamento e Segurança */}
              {!loadedImages[currentAvatar] && !loadErrors[currentAvatar] && (
                <div className="absolute inset-0 z-20 bg-muted/20 backdrop-blur-md flex flex-col items-center justify-center">
                  <Loader2 className="w-20 h-20 animate-spin text-primary/40" />
                  <span className="text-[12px] font-black uppercase tracking-widest text-primary/40 mt-6">Acessando Lente...</span>
                </div>
              )}

              {/* Imagem do Avatar (Sem Nome de Arquivo) */}
              {!loadErrors[currentAvatar] ? (
                <img 
                  src={`/assets/avatars/${currentAvatar}`} 
                  alt="Herói UrbeLudo" 
                  onLoad={() => handleImageLoad(currentAvatar)}
                  onError={() => handleImageError(currentAvatar)}
                  className={cn(
                    "w-[98%] h-[98%] object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.5)] transition-all duration-700",
                    loadedImages[currentAvatar] ? "opacity-100 scale-100" : "opacity-0 scale-90"
                  )} 
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-destructive text-center p-12 bg-destructive/5 w-full h-full">
                  <AlertCircle className="w-20 h-20 mb-6" />
                  <span className="text-[14px] font-black uppercase tracking-widest">Arquivo Denied</span>
                  <p className="text-[9px] font-medium text-muted-foreground uppercase mt-4">Este avatar não pode ser exibido no visor.</p>
                </div>
              )}

              {/* Selo de Seleção Ativa */}
              <div className="absolute top-10 right-10 bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center border-4 border-white shadow-2xl z-30">
                <Check className="w-9 h-9 stroke-[4]" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Indicadores de Progresso de Galeria */}
      <div className="flex justify-center gap-3 pt-2 pb-6">
        {avatars.length > 1 && Array.from({ length: Math.min(avatars.length, 10) }).map((_, i) => (
           <div 
             key={i} 
             className={cn(
               "h-2 rounded-full transition-all duration-500", 
               Math.floor(currentIndex / (avatars.length / 10)) === i ? "w-16 bg-primary shadow-lg" : "w-3 bg-primary/10"
             )} 
           />
        ))}
      </div>
    </div>
  );
}
