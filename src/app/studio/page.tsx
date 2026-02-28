
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StudioItem } from '@/components/studio/StudioItem';
import { ShopDrawer } from '@/components/studio/ShopDrawer';
import { AiGeneratorDialog } from '@/components/studio/AiGeneratorDialog';
import { TutorialOverlay } from '@/components/studio/TutorialOverlay';
import { useStudio } from '@/hooks/use-studio';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { 
  ArrowLeft, 
  Edit3, 
  Check, 
  Smartphone,
  Zap,
  Coins,
  Sparkles,
  ShoppingBag,
  Navigation as NavIconIcon,
  Wand2,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function StudioPage() {
  const { user } = useUser();
  const { 
    studioState, 
    updateItemPosition, 
    updateAvatarPosition, 
    buyItem, 
    addCustomItem,
    placeItem, 
    storeItem, 
    sellItem 
  } = useStudio();
  
  const viewportRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'explore' | 'edit'>('explore');
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const userProgressRef = useMemoFirebase(() => user ? { id: user.uid, path: `user_progress/${user.uid}` } : null, [user]);
  const { data: profile } = useDoc(userProgressRef);

  useEffect(() => {
    if (profile && profile.hasSeenTutorial === false) {
      setShowTutorial(true);
    }
  }, [profile]);

  const handleFloorClick = (e: React.MouseEvent) => {
    if (mode === 'edit') return;
    
    const world = document.getElementById('studio-world');
    if (world) {
      const rect = world.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Limita movimento apenas na área do chão
      if (y > 480) {
        updateAvatarPosition(x, y);
      }
    }
  };

  const avatarFilename = profile?.avatar?.avatarId || '1.png';
  const avatarSrc = `/assets/avatars/${avatarFilename}`;
  const auraColor = profile?.dominantColor || '#9333ea';
  const avatarPos = studioState.avatar.lastPosition;
  const isSapient = profile?.displayName?.toLowerCase() === 'sapient';

  return (
    <div className="h-screen bg-zinc-950 overflow-hidden flex flex-col relative">
      <AnimatePresence>
        {showTutorial && profile && (
          <TutorialOverlay 
            userName={profile.displayName}
            avatarUrl={avatarSrc}
            onComplete={() => {
              setShowTutorial(false);
              if (userProgressRef) updateDocumentNonBlocking(userProgressRef, { hasSeenTutorial: true });
            }}
          />
        )}
      </AnimatePresence>

      <header className="px-6 h-24 flex items-center justify-between bg-white/95 backdrop-blur-2xl z-[150] border-b-4 border-primary/5">
        <Link href="/dashboard" className="p-3 bg-zinc-100 rounded-full shadow-sm shrink-0 hover:bg-white transition-colors">
          <ArrowLeft className="w-6 h-6 text-primary" />
        </Link>
        
        <div className="flex items-center gap-4">
          <div id="coin-counter" className="bg-primary/5 px-6 py-3 rounded-3xl flex items-center gap-3 border-2 border-primary/10 shadow-inner">
            <Coins className="w-5 h-5 text-yellow-600" />
            <span className="text-lg font-black tracking-tight">{isSapient ? '∞' : (profile?.ludoCoins || 0)}</span>
          </div>

          <Button 
            variant="outline"
            onClick={() => setIsGeneratorOpen(true)}
            className="rounded-3xl font-black uppercase text-[10px] gap-2 shadow-md h-14 px-6 border-primary/20 text-primary hover:bg-primary/5"
          >
            <Wand2 className="w-5 h-5" /> ARQUITETO IA
          </Button>
          
          <Button 
            variant={mode === 'edit' ? "default" : "outline"} 
            onClick={() => setMode(mode === 'explore' ? 'edit' : 'explore')}
            className={cn(
              "rounded-3xl font-black uppercase text-[10px] gap-2 shadow-md h-14 px-8 transition-all",
              mode === 'edit' ? "bg-primary text-white scale-105" : "bg-white text-primary border-primary/20"
            )}
          >
            {mode === 'edit' ? <><Check className="w-5 h-5" /> PRONTO</> : <><Edit3 className="w-5 h-5" /> DECORAR</>}
          </Button>
        </div>
      </header>

      <main 
        ref={viewportRef}
        className="flex-1 relative overflow-hidden bg-[#111] cursor-crosshair"
      >
        <motion.div
          id="studio-world"
          drag={mode === 'explore'}
          dragConstraints={viewportRef}
          onTap={handleFloorClick}
          className="w-[1500px] h-[1500px] relative bg-white flex flex-col shadow-[0_0_200px_rgba(0,0,0,0.8)]"
          initial={{ x: -500, y: -300 }} 
        >
          {/* Paredes Isométricas 2026 */}
          <div className="relative w-full h-[40%] flex" style={{ 
            background: `linear-gradient(135deg, ${auraColor}15, ${auraColor}30)` 
          }}>
            <div className="flex-1 border-r-8 border-white/20 relative overflow-hidden bg-muted/20" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 92%)' }}>
               <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:40px_40px]" />
               <div className="absolute bottom-10 left-10 w-40 h-80 bg-white/5 blur-3xl rounded-full" />
            </div>
            <div className="flex-1 relative overflow-hidden bg-muted/20" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 92%, 0 100%)' }}>
               <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:40px_40px]" />
               <div className="absolute bottom-10 right-10 w-40 h-80 bg-white/5 blur-3xl rounded-full" />
            </div>
          </div>

          {/* Rodapé e Transição */}
          <div className="relative z-10 w-full h-12 flex -mt-6">
             <div className="flex-1 bg-white shadow-xl border-b-8 border-zinc-200" style={{ clipPath: 'polygon(0 0, 100% 100%, 100% 100%, 0 100%)' }} />
             <div className="flex-1 bg-white shadow-xl border-b-8 border-zinc-200" style={{ clipPath: 'polygon(0 100%, 0 100%, 100% 0, 100% 100%)' }} />
          </div>

          {/* Chão com Grid de Neon Suave */}
          <div className="relative w-full h-[60%] bg-[#FAF9F6] overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ 
               backgroundImage: `linear-gradient(45deg, ${auraColor} 1px, transparent 1px), linear-gradient(-45deg, ${auraColor} 1px, transparent 1px)`,
               backgroundSize: '100px 100px',
               backgroundPosition: 'center'
            }} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent,rgba(0,0,0,0.05))]" />
          </div>

          {/* Itens e Mobília com Depth Sorting */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            <AnimatePresence>
              {studioState.placedItems.map(item => (
                <StudioItem 
                  key={item.instanceId} 
                  data={item} 
                  onUpdate={updateItemPosition}
                  onStore={storeItem}
                  onSell={sellItem}
                  isEditing={mode === 'edit'}
                  auraColor={auraColor}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Avatar com Shadow Projection */}
          <motion.div 
            id="studio-avatar"
            animate={{ 
              x: avatarPos.x - 64, 
              y: avatarPos.y - 160
            }}
            transition={{ type: "spring", stiffness: 80, damping: 25 }}
            className="absolute z-[200] pointer-events-none"
          >
            <div className="relative">
              {/* Sombra de pé */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-8 bg-black/20 blur-xl rounded-full -z-10" />
              
              <div className="w-32 h-56 flex items-center justify-center">
                <img 
                  src={avatarSrc} 
                  alt="Hero" 
                  className="w-full h-full object-contain drop-shadow-[0_40px_40px_rgba(0,0,0,0.5)]"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/assets/avatars/1.png'; }}
                />
              </div>
            </div>
            <div className="absolute -bottom-8 inset-x-0 flex justify-center">
              <span className="bg-white/95 backdrop-blur-xl text-primary text-[10px] font-black uppercase px-6 py-2.5 rounded-full shadow-2xl border-2 border-primary/5 tracking-[0.2em] whitespace-nowrap">
                {profile?.displayName || 'Explorador'}
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* HUD de Controle sims-style Inferior */}
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-[110] pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div 
              key={mode}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="bg-zinc-900/90 text-white text-[12px] font-black uppercase px-10 py-5 rounded-[2.5rem] flex items-center gap-5 backdrop-blur-2xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.4)]"
            >
              {mode === 'explore' ? (
                <><NavIconIcon className="w-6 h-6 text-accent rotate-45" /> Toque no chão para caminhar</>
              ) : (
                <><Smartphone className="w-6 h-6 text-primary animate-bounce" /> Arraste itens para decorar</>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Botões de Ação Dinâmicos */}
      <div className="fixed bottom-12 right-12 flex flex-col gap-8 z-[120]">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button id="btn-play" asChild className="rounded-full h-20 w-20 shadow-[0_25px_50px_rgba(255,0,255,0.2)] bg-accent hover:bg-accent/90 border-b-8 border-accent/70 transition-all">
            <Link href="/playground">
              <Zap className="w-10 h-10 text-white" />
            </Link>
          </Button>
        </motion.div>
        
        <motion.button 
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          id="btn-shop" 
          onClick={() => setIsShopOpen(true)}
          className="rounded-full h-20 w-20 shadow-[0_25px_50px_rgba(147,51,234,0.2)] bg-primary text-white flex items-center justify-center border-b-8 border-primary/70 transition-all"
        >
          <ShoppingBag className="w-10 h-10" />
        </motion.button>
      </div>

      <ShopDrawer 
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        userCoins={profile?.ludoCoins || 0}
        unlockedItemIds={studioState.unlockedItemIds}
        customItems={studioState.customItems}
        onBuyItem={buyItem}
        onPlaceItem={placeItem}
        onOpenGenerator={() => { setIsShopOpen(false); setIsGeneratorOpen(true); }}
        userName={profile?.displayName}
      />

      <AiGeneratorDialog 
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onItemGenerated={addCustomItem}
      />
    </div>
  );
}
