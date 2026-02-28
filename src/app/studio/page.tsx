'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FurniturePiece } from '@/components/studio/FurniturePiece';
import { ShopDrawer } from '@/components/studio/ShopDrawer';
import { TutorialOverlay } from '@/components/studio/TutorialOverlay';
import { useStudio } from '@/hooks/use-studio';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { 
  ArrowLeft, 
  Edit3, 
  Check, 
  Smartphone,
  Zap,
  Coins,
  Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STUDIO_CATALOG } from '@/lib/studio-catalog';

export default function StudioPage() {
  const { user } = useUser();
  const { studioState, updateItemPosition, updateAvatarPosition, addItem, removeItem } = useStudio();
  
  const viewportRef = useRef<HTMLDivElement>(null);
  
  const [mode, setMode] = useState<'explore' | 'edit'>('explore');
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
      
      // Limita o movimento para a área de chão
      if (y > 480) {
        updateAvatarPosition(x, y);
      }
    }
  };

  const activeItemsCount = useMemo(() => {
    return studioState.placedItems.filter(pi => {
      const catalogItem = STUDIO_CATALOG.find(ci => ci.id === pi.itemId);
      return catalogItem?.category === 'Ativo';
    }).length;
  }, [studioState.placedItems]);

  const avatarUrl = profile?.avatar?.equippedItems?.[0] || 'https://picsum.photos/seed/ludo/400';
  const auraColor = profile?.dominantColor || '#9333ea';
  const avatarPos = studioState.avatar.lastPosition;

  return (
    <div className="h-screen bg-zinc-950 overflow-hidden flex flex-col relative">
      <AnimatePresence>
        {showTutorial && profile && (
          <TutorialOverlay 
            userName={profile.displayName}
            avatarUrl={avatarUrl}
            onComplete={() => setShowTutorial(false)}
          />
        )}
      </AnimatePresence>

      <header className="px-6 h-20 flex items-center justify-between bg-background/60 backdrop-blur-xl z-[100] border-b border-white/5">
        <Link href="/dashboard" className="p-2 bg-white rounded-full shadow-sm shrink-0">
          <ArrowLeft className="w-5 h-5 text-primary" />
        </Link>
        
        <div className="flex items-center gap-3">
          <div id="coin-counter" className="bg-primary/10 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-primary/20">
            <Coins className="w-3 h-3 text-yellow-600" />
            <span className="text-xs font-black">{profile?.ludoCoins || 0}</span>
          </div>
          
          <Button 
            variant={mode === 'edit' ? "default" : "outline"} 
            onClick={() => setMode(mode === 'explore' ? 'edit' : 'explore')}
            className="rounded-2xl font-black uppercase text-[10px] gap-2 shadow-sm"
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
          {/* 1. PAREDE */}
          <div className="relative w-full h-[40%] overflow-hidden" style={{ 
            background: `linear-gradient(to bottom, ${auraColor}10, ${auraColor}25)` 
          }}>
            <div className="absolute inset-0 opacity-5" style={{ 
              backgroundImage: `radial-gradient(${auraColor} 2px, transparent 2px)`,
              backgroundSize: '40px 40px' 
            }} />
            
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-48 h-60 bg-blue-50 rounded-t-full border-8 border-white shadow-2xl overflow-hidden flex flex-col justify-end">
                <div className="absolute inset-0 bg-gradient-to-t from-blue-200/50 to-transparent"></div>
                <div className="w-full h-2 bg-white absolute top-1/2"></div>
                <div className="w-2 h-full bg-white absolute left-1/2"></div>
            </div>
          </div>

          <div className="relative z-10 w-full h-6 bg-white border-b border-gray-200 shadow-lg"></div>

          {/* 2. CHÃO */}
          <div className="relative w-full h-[60%] bg-[#F4F1EA]">
            <div className="absolute inset-0 opacity-30 flex flex-col justify-evenly">
                {[...Array(30)].map((_, i) => (
                  <div key={i} className="w-full h-[1px] bg-gray-400"></div>
                ))}
            </div>
            {/* Grid Visual - Snapping indicator */}
            <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:40px_40px]"></div>
          </div>

          {/* ITENS POSICIONADOS */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {studioState.placedItems.map(item => (
              <FurniturePiece 
                key={item.instanceId} 
                data={item} 
                onUpdate={updateItemPosition}
                onRemove={removeItem}
                isEditing={mode === 'edit'}
                auraColor={auraColor}
                worldSize={1200}
              />
            ))}
          </div>

          {/* AVATAR */}
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
              {activeItemsCount > 0 && mode === 'explore' && (
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-2 -right-2 bg-accent text-white p-2 rounded-full shadow-lg border-2 border-white"
                >
                  <Zap className="w-4 h-4" />
                </motion.div>
              )}
            </div>
            <div className="absolute -bottom-2 inset-x-0 flex justify-center">
              <span className="bg-primary text-white text-[8px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg">
                {profile?.displayName || 'Explorador'}
              </span>
            </div>
          </motion.div>
        </motion.div>

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
                <><Smartphone className="w-4 h-4 text-primary animate-bounce" /> Arraste os itens para alinhar ao grid</>
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
        <div id="btn-shop">
          <ShopDrawer onBuy={addItem} unlockedItemIds={studioState.unlockedItemIds} />
        </div>
      </div>
    </div>
  );
}
