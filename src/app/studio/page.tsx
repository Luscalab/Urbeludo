'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StudioItem } from '@/components/studio/StudioItem';
import { ShopDrawer } from '@/components/studio/ShopDrawer';
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
  Navigation,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudioPage() {
  const { user } = useUser();
  const { studioState, updateItemPosition, updateAvatarPosition, addItem, removeItem } = useStudio();
  
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
      // O clique deve ser dentro do mundo gigante
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Limita o movimento para a área de chão (abaixo do rodapé)
      // No cenário 2.5D, o chão começa em 40% da altura do mundo (1200 * 0.4 = 480)
      if (y > 480) {
        updateAvatarPosition(x, y);
      }
    }
  };

  const handleBuy = (itemId: string, price: number) => {
    if (userProgressRef && profile) {
      const isSapient = profile.displayName?.toLowerCase() === 'sapient';
      addItem(itemId);
      if (!isSapient) {
        updateDocumentNonBlocking(userProgressRef, {
          ludoCoins: profile.ludoCoins - price
        });
      }
    }
  };

  const avatarUrl = profile?.avatar?.equippedItems?.[0] || 'https://picsum.photos/seed/ludo/400';
  const auraColor = profile?.dominantColor || '#9333ea';
  const avatarPos = studioState.avatar.lastPosition;
  const isSapient = profile?.displayName?.toLowerCase() === 'sapient';

  return (
    <div className="h-screen bg-zinc-950 overflow-hidden flex flex-col relative">
      <AnimatePresence>
        {showTutorial && profile && (
          <TutorialOverlay 
            userName={profile.displayName}
            avatarUrl={avatarUrl}
            onComplete={() => {
              setShowTutorial(false);
              if (userProgressRef) updateDocumentNonBlocking(userProgressRef, { hasSeenTutorial: true });
            }}
          />
        )}
      </AnimatePresence>

      <header className="px-6 h-20 flex items-center justify-between bg-background/60 backdrop-blur-xl z-[150] border-b border-white/5">
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
          dragElastic={0.1}
          dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
          onTap={handleFloorClick}
          className="w-[1200px] h-[1200px] relative bg-white flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)]"
          initial={{ x: -400, y: -200 }} 
        >
          {/* 1. PAREDE (Área Superior) */}
          <div className="relative w-full h-[40%] overflow-hidden" style={{ 
            background: `linear-gradient(to bottom, ${auraColor}15, ${auraColor}30)` 
          }}>
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
            
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-48 h-60 bg-blue-50 rounded-t-full border-8 border-white shadow-2xl overflow-hidden flex flex-col justify-end">
                <div className="absolute inset-0 bg-gradient-to-t from-blue-200/50 to-transparent"></div>
                <div className="w-full h-2 bg-white absolute top-1/2"></div>
                <div className="w-2 h-full bg-white absolute left-1/2"></div>
            </div>
          </div>

          <div className="relative z-10 w-full h-6 bg-white border-b border-gray-200 shadow-lg"></div>

          {/* 2. CHÃO (Área de Movimento) */}
          <div className="relative w-full h-[60%] bg-[#F4F1EA]">
            <div className="absolute inset-0 opacity-30 flex flex-col justify-evenly">
                {[...Array(30)].map((_, i) => (
                  <div key={i} className="w-full h-[1px] bg-gray-400"></div>
                ))}
            </div>
            <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:40px_40px]"></div>
          </div>

          {/* ITENS POSICIONADOS */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {studioState.placedItems.map(item => (
              <StudioItem 
                key={item.instanceId} 
                data={item} 
                onUpdate={updateItemPosition}
                onRemove={removeItem}
                isEditing={mode === 'edit'}
                auraColor={auraColor}
              />
            ))}
          </div>

          {/* AVATAR DO EXPLORADOR */}
          <motion.div 
            id="studio-avatar"
            animate={{ 
              x: avatarPos.x - 64, 
              y: avatarPos.y - 128
            }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
            className="absolute z-[90] pointer-events-none"
          >
            <div className="relative">
              <div className="w-32 h-32 rounded-[3.5rem] overflow-hidden border-4 border-primary shadow-2xl bg-white">
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 bg-accent text-white p-2 rounded-full shadow-lg border-2 border-white"
              >
                <Zap className="w-4 h-4" />
              </motion.div>
            </div>
            <div className="absolute -bottom-2 inset-x-0 flex justify-center">
              <span className="bg-primary text-white text-[8px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg">
                {profile?.displayName || 'Explorador'}
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* HUD DE MODO */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[110] pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div 
              key={mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-black/80 text-white text-[10px] font-black uppercase px-6 py-3 rounded-full flex items-center gap-3 backdrop-blur-md border border-white/10 shadow-2xl"
            >
              {mode === 'explore' ? (
                <><Navigation className="w-4 h-4 text-accent rotate-45" /> Toque no chão para andar</>
              ) : (
                <><Smartphone className="w-4 h-4 text-primary animate-bounce" /> Arraste itens para o grid</>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-[120]">
        <Button id="btn-play" asChild className="rounded-full h-16 w-16 shadow-2xl bg-accent hover:scale-110 transition-transform border-b-4 border-accent/80">
          <Link href="/playground">
            <Zap className="w-7 h-7 text-white" />
          </Link>
        </Button>
        <button 
          id="btn-shop" 
          onClick={() => setIsShopOpen(true)}
          className="rounded-full h-16 w-16 shadow-2xl bg-primary text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-transform border-b-4 border-primary/80"
        >
          <ShoppingBag className="w-7 h-7" />
        </button>
      </div>

      <ShopDrawer 
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        userCoins={profile?.ludoCoins || 0}
        unlockedItemIds={studioState.unlockedItemIds}
        onBuyItem={handleBuy}
        userName={profile?.displayName}
      />
    </div>
  );
}
