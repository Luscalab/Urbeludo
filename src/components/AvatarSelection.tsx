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
  Maximize2,
  Zap,
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarSelectionProps {
  initialAvatarId?: string;
  onSelect: (avatarId: string) => void;
}

/**
 * Seletor de Avatar Gigante e Imersivo.
 * Otimizado para visualização de "Heróis Ludo" com estética Cyber-Orgânica.
 * Busca assets diretamente de /studio/avatares/
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
      
      // Filtra apenas arquivos de imagem válidos
      const validFiles = files.filter((f: string) => /\.(png|jpe?g|webp|svg)$/i.test(f));
      
      if (validFiles.length > 0) {
        setAvatars(validFiles);
        
        // Sincroniza índice inicial se fornecido
        if (initialAvatarId) {
          const idx = validFiles.indexOf(initialAvatarId);
          if (idx !== -1) setCurrentIndex(idx);
        }
      } else {
        // Fallback local se a pasta estiver vazia
        setAvatars(['1.png']);
      }
    } catch (error) {
      console.warn("Modo Offline ou Erro de API - Usando fallback 1.png");
      setAvatars(['1.png']); 
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

  // Notifica o componente pai sempre que o índice muda
  useEffect(() => {
    if (avatars.length > 0 && avatars[currentIndex]) {
      onSelect(avatars[currentIndex]);
    }
  }, [currentIndex, avatars, onSelect]);

  if (isLoadingList) {
    return (
      <div className="w-full h-[500px] flex flex-col items-center justify-center bg-background rounded-[4rem] border-8 border-primary/5">
        <Loader2 className="w-16 h-16 animate-spin text-primary/40 mb-6" />
        <span className="text-[10px] font-black uppercase text-primary/40 tracking-[0.5em] animate-pulse">Sincronizando Galeria...</span>
      </div>
    );
  }

  const currentAvatar = avatars[currentIndex] || '1.png';
  // O caminho absoluto para o asset no Next.js (pasta public)
  const avatarPath = `/studio/avatares/${currentAvatar}`;

  return (
    <div className="w-full space-y-12 relative select-none max-w-2xl mx-auto">
      {/* Cabeçalho da Identidade */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary/10 border-2 border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-primary/5">
           <Zap className="w-3 h-3 animate-pulse" /> Câmara de Identidade 2026
        </div>
        <h3 className="text-4xl sm:text-6xl font-black uppercase italic tracking-tighter leading-none text-foreground">
          Crie seu <span className="text-primary">Herói</span>
        </h3>
        <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40">
          Explorador Ludo #{currentIndex + 1} de {avatars.length}
        </p>
      </div>
      
      {/* Display do Avatar */}
      <div className="relative flex justify-center items-center h-[500px] sm:h-[650px] group px-4">
        
        {/* Aura de Fundo Animada */}
        <motion.div 
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute w-[80%] aspect-square bg-gradient-to-tr from-primary via-accent to-secondary rounded-full blur-[80px] -z-10"
        />

        {/* Setas de Navegação Futuristas */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between items-center z-50 pointer-events-none px-2 sm:px-0">
          <button 
            onClick={handlePrev}
            className="pointer-events-auto bg-white/80 backdrop-blur-xl text-primary p-4 sm:p-6 rounded-full shadow-2xl border-4 border-primary/10 hover:scale-110 active:scale-90 transition-all group/btn"
          >
            <ChevronLeft className="w-8 h-8 sm:w-12 sm:h-12 stroke-[4] group-hover/btn:-translate-x-1 transition-transform" />
          </button>

          <button 
            onClick={handleNext}
            className="pointer-events-auto bg-white/80 backdrop-blur-xl text-primary p-4 sm:p-6 rounded-full shadow-2xl border-4 border-primary/10 hover:scale-110 active:scale-90 transition-all group/btn"
          >
            <ChevronRight className="w-8 h-8 sm:w-12 sm:h-12 stroke-[4] group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Moldura do Avatar */}
        <div className="relative w-full max-w-sm aspect-[4/5] z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAvatar}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="relative w-full h-full rounded-[4rem] sm:rounded-[6rem] border-[12px] sm:border-[20px] border-white bg-white/40 backdrop-blur-md shadow-[0_60px_120px_rgba(0,0,0,0.15)] overflow-hidden flex items-center justify-center p-6 sm:p-12"
            >
              {/* Efeito de Scanner */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.03)_1px,transparent_1px)] bg-[size:100%_8px] pointer-events-none" />
              
              {(!loadedImages[currentAvatar] && !loadError[currentAvatar]) && (
                <div className="absolute inset-0 bg-muted/20 flex flex-col items-center justify-center z-10 backdrop-blur-3xl">
                  <Cpu className="w-16 h-16 animate-pulse text-primary/30" />
                  <span className="text-[9px] font-black uppercase text-primary/40 mt-8 tracking-[0.4em] animate-pulse">Materializando...</span>
                </div>
              )}

              {loadError[currentAvatar] ? (
                <div className="absolute inset-0 bg-destructive/5 flex flex-col items-center justify-center z-10 p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-destructive/30 mb-6" />
                  <span className="text-[10px] font-black uppercase text-destructive/60 tracking-widest leading-relaxed">Erro de Sensor.<br/>Tente outro perfil.</span>
                  <button 
                    onClick={() => {
                      setLoadError(prev => ({ ...prev, [currentAvatar]: false }));
                      fetchAvatars();
                    }}
                    className="mt-4 text-[8px] font-black uppercase text-primary underline"
                  >
                    Tentar Novamente
                  </button>
                </div>
              ) : (
                <img 
                  src={avatarPath} 
                  alt="Avatar Hero" 
                  onLoad={() => setLoadedImages(prev => ({ ...prev, [currentAvatar]: true }))}
                  onError={() => setLoadError(prev => ({ ...prev, [currentAvatar]: true }))}
                  className={cn(
                    "w-full h-full object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.3)] transition-all duration-700",
                    loadedImages[currentAvatar] ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-90 rotate-3"
                  )} 
                />
              )}

              {/* HUD do Visor Ludo */}
              <div className="absolute inset-8 border-2 border-primary/5 rounded-[4rem] pointer-events-none" />
              <div className="absolute top-10 left-10 opacity-40">
                 <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div className="absolute top-10 right-10 opacity-40">
                 <Maximize2 className="w-6 h-6 text-primary" />
              </div>

              {/* Botão de Status Estilizado */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute bottom-10 inset-x-10 bg-primary text-white rounded-[2.5rem] py-4 flex items-center justify-center gap-3 shadow-2xl border-b-8 border-primary/70 active:border-b-0 active:translate-y-2 transition-all"
              >
                <Check className="w-6 h-6 stroke-[4]" />
                <span className="text-xs font-black uppercase tracking-widest">Identidade Selecionada</span>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Miniaturas de Navegação (Dots) */}
      <div className="flex justify-center gap-2 px-8 overflow-x-auto no-scrollbar py-2">
         {avatars.map((_, i) => (
           <div 
            key={i} 
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              i === currentIndex ? "w-10 bg-primary" : "w-1.5 bg-primary/20"
            )}
           />
         ))}
      </div>
    </div>
  );
}
