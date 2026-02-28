'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StudioItem } from '@/components/studio/StudioItem';
import { ShopDrawer } from '@/components/studio/ShopDrawer';
import { TutorialOverlay } from '@/components/studio/TutorialOverlay';
import { useStudio } from '@/hooks/use-studio';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { getAvatarById } from '@/lib/avatar-catalog';
import { 
  ArrowLeft, 
  Edit3, 
  Check, 
  Smartphone,
  Zap,
  Coins,
  Sparkles,
  ShoppingBag,
  Navigation as NavIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudioPage() {
  const { user } = useUser();
  const { 
    studioState, 
    updateItemPosition, 
    updateAvatarPosition, 
    buyItem, 
    placeItem, 
    storeItem, 
    sellItem 
  } = useStudio();
  
  const viewportRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'explore' | 'edit'>('explore');
  const [isShopOpen, setIsShopOpen] = useState(false);
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
      
      // Caminha se for na área do chão (y > 400 pixels na perspectiva isométrica)
      if (y > 400) {
        updateAvatarPosition(x, y);
      }
    }
  };

  const avatarInfo = getAvatarById(profile?.avatar?.avatarId || 'av-1');
  const auraColor = profile?.dominantColor || '#9333ea';
  const avatarPos = studioState.avatar.lastPosition;
  const isSapient = profile?.displayName?.toLowerCase() === 'sapient';

  return (
    <div className="h-screen bg-zinc-950 overflow-hidden flex flex-col relative">
      <AnimatePresence>
        {showTutorial && profile && (
          <TutorialOverlay 
            userName={profile.displayName}
            avatarUrl={avatarInfo.src}
            onComplete={() => {
              setShowTutorial(false);
              if (userProgressRef) updateDocumentNonBlocking(userProgressRef, { hasSeenTutorial: true });
            }}
          />
        )}
      </AnimatePresence>

      <header className="px-6 h-20 flex items-center justify-between bg-background/80 backdrop-blur-xl z-[150] border-b border-white/5">
        <Link href="/dashboard" className="p-2 bg-white rounded-full shadow-sm shrink-0">
          <ArrowLeft className="w-5 h-5 text-primary" />
        </Link>
        
        <div className="flex items-center gap-3">
          <div id="coin-counter" className="bg-primary/10 px-4 py-2 rounded-2xl flex items-center gap-2 border border-primary/20 shadow-inner">
            <Coins className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-black">{isSapient ? '∞' : (profile?.ludoCoins || 0)}</span>
          </div>
          
          <Button 
            variant={mode === 'edit' ? "default" : "outline"} 
            onClick={() => setMode(mode === 'explore' ? 'edit' : 'explore')}
            className="rounded-2xl font-black uppercase text-[10px] gap-2 shadow-sm h-11"
          >
            {mode === 'edit' ? <><Check className="w-4 h-4" /> Pronto</> : <><Edit3 className="w-4 h-4" /> Decorar</>}
          </Button>
        </div>
      </header>

      <main 
        ref={viewportRef}
        className="flex-1 relative overflow-hidden bg-zinc-900 cursor-crosshair"
      >
        <motion.div
          id="studio-world"
          drag={mode === 'explore'}
          dragConstraints={viewportRef}
          onTap={handleFloorClick}
          className="w-[1200px] h-[1200px] relative bg-white flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)]"
          initial={{ x: -400, y: -200 }} 
        >
          {/* Paredes Isométricas em V */}
          <div className="relative w-full h-[40%] flex" style={{ 
            background: `linear-gradient(to bottom, ${auraColor}20, ${auraColor}40)` 
          }}>
            <div className="flex-1 border-r border-white/20 relative overflow-hidden bg-muted/20" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 88%)' }}>
               <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px]" />
            </div>
            <div className="flex-1 relative overflow-hidden bg-muted/20" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 88%, 0 100%)' }}>
               <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px]" />
            </div>
          </div>

          {/* Rodapé e Transição */}
          <div className="relative z-10 w-full h-8 flex -mt-4">
             <div className="flex-1 bg-white shadow-lg border-b-4 border-zinc-200" style={{ clipPath: 'polygon(0 0, 100% 100%, 100% 100%, 0 100%)' }} />
             <div className="flex-1 bg-white shadow-lg border-b-4 border-zinc-200" style={{ clipPath: 'polygon(0 100%, 0 100%, 100% 0, 100% 100%)' }} />
          </div>

          {/* Chão Isométrico */}
          <div className="relative w-full h-[60%] bg-[#F5F2EC] overflow-hidden">
            <div className="absolute inset-0 opacity-15" style={{ 
               backgroundImage: `linear-gradient(45deg, #000 1px, transparent 1px), linear-gradient(-45deg, #000 1px, transparent 1px)`,
               backgroundSize: '80px 80px',
               backgroundPosition: 'center'
            }} />
          </div>

          {/* Itens do Estúdio */}
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

          {/* Personagem (Avatar de Corpo Inteiro) */}
          <motion.div 
            id="studio-avatar"
            animate={{ 
              x: avatarPos.x - 64, 
              y: avatarPos.y - 140
            }}
            transition={{ type: "spring", stiffness: 60, damping: 22 }}
            className="absolute z-[100] pointer-events-none"
          >
            <div className="relative">
              <div className="w-32 h-48 flex items-center justify-center">
                <img 
                  src={avatarInfo.src} 
                  alt="Avatar" 
                  className="w-full h-full object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.4)]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/avatars/1.png'; // Fallback absoluto
                  }}
                />
              </div>
            </div>
            <div className="absolute -bottom-4 inset-x-0 flex justify-center">
              <span className="bg-primary/95 backdrop-blur-xl text-white text-[9px] font-black uppercase px-5 py-2 rounded-full shadow-2xl border border-white/20 tracking-widest">
                {profile?.displayName || 'Explorador'}
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* HUD de Orientação */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[110] pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div 
              key={mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-black/90 text-white text-[11px] font-black uppercase px-8 py-4 rounded-full flex items-center gap-4 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              {mode === 'explore' ? (
                <><NavIcon className="w-5 h-5 text-accent rotate-45" /> Toque no chão para caminhar</>
              ) : (
                <><Smartphone className="w-5 h-5 text-primary animate-bounce" /> Arraste para decorar</>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Controles Flutuantes */}
      <div className="fixed bottom-10 right-10 flex flex-col gap-6 z-[120]">
        <Button id="btn-play" asChild className="rounded-full h-18 w-18 shadow-2xl bg-accent hover:scale-110 active:scale-90 transition-transform border-b-6 border-accent/80">
          <Link href="/playground">
            <Zap className="w-8 h-8 text-white" />
          </Link>
        </Button>
        <button 
          id="btn-shop" 
          onClick={() => setIsShopOpen(true)}
          className="rounded-full h-18 w-18 shadow-2xl bg-primary text-white flex items-center justify-center hover:scale-110 active:scale-90 transition-transform border-b-6 border-primary/80"
        >
          <ShoppingBag className="w-8 h-8" />
        </button>
      </div>

      <ShopDrawer 
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        userCoins={profile?.ludoCoins || 0}
        unlockedItemIds={studioState.unlockedItemIds}
        onBuyItem={buyItem}
        onPlaceItem={placeItem}
        userName={profile?.displayName}
      />
    </div>
  );
}
