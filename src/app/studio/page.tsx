
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit3, 
  Check, 
  Zap,
  Coins,
  ShoppingBag,
  Trophy,
  Battery
} from 'lucide-react';

import { useStudio } from '@/hooks/use-studio';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { StudioItem } from '@/components/studio/StudioItem';
import { ShopDrawer } from '@/components/studio/ShopDrawer';
import { TutorialOverlay } from '@/components/studio/TutorialOverlay';
import { cn } from '@/lib/utils';
import { STUDIO_CATALOG } from '@/lib/studio-catalog';

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
      if (y > 400) updateAvatarPosition(x, y);
    }
  };

  const avatarSrc = `/assets/avatars/${profile?.avatar?.avatarId || '1.png'}`;
  const auraColor = profile?.dominantColor || '#9333ea';
  const avatarPos = studioState.avatar.lastPosition;
  const isSapient = profile?.displayName?.toLowerCase() === 'sapient';

  const currentWallpaper = STUDIO_CATALOG.find(i => i.id === studioState.wallpaperId);
  const currentFloor = STUDIO_CATALOG.find(i => i.id === studioState.floorId);

  return (
    <div className="h-screen bg-sky-200 overflow-hidden flex flex-col relative font-sans bg-mesh-game">
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

      <header className="fixed top-0 inset-x-0 h-24 flex items-center justify-between px-6 z-[200] pointer-events-none pt-4">
        <div className="flex items-center gap-4 pointer-events-auto">
          <Link href="/dashboard" className="p-4 game-pill flex items-center justify-center">
            <ArrowLeft className="w-6 h-6 text-primary" />
          </Link>
          <div className="game-pill px-6 py-2.5 flex items-center gap-4">
             <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center border-2 border-white shadow-md">
                <Trophy className="w-4 h-4 text-white" />
             </div>
             <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase text-muted-foreground leading-none">Nível</span>
                <span className="text-sm font-black text-primary leading-tight">{profile?.psychomotorLevel || 1}</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <div id="coin-counter" className="game-pill px-5 py-2 flex items-center gap-3">
             <Coins className="w-5 h-5 text-yellow-500" />
             <span className="text-base font-black tracking-tighter">{isSapient ? '∞' : (profile?.ludoCoins || 0)}</span>
          </div>
          <div className="game-pill px-5 py-2 flex items-center gap-3">
             <Battery className="w-5 h-5 text-green-500" />
             <span className="text-base font-black tracking-tighter">{profile?.avatar?.energy ?? 100}%</span>
          </div>
        </div>
      </header>

      <main ref={viewportRef} className="flex-1 relative overflow-hidden">
        <motion.div
          id="studio-world"
          drag={mode === 'explore'}
          dragConstraints={viewportRef}
          onTap={handleFloorClick}
          className="w-[1800px] h-[1800px] relative bg-white flex flex-col shadow-[0_0_150px_rgba(0,0,0,0.1)]"
          initial={{ x: -450, y: -450 }} 
        >
          <div className="relative w-full h-[35%] flex">
            <div 
              className="flex-1 border-r-4 border-white/20 transition-all duration-700"
              style={{ 
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 88%)',
                backgroundImage: currentWallpaper ? `url(${currentWallpaper.assetPath})` : 'linear-gradient(to bottom, #f3f4f6, #e5e7eb)',
                backgroundSize: '300px'
              }} 
            />
            <div 
              className="flex-1 transition-all duration-700"
              style={{ 
                clipPath: 'polygon(0 0, 100% 0, 100% 88%, 0 100%)',
                backgroundImage: currentWallpaper ? `url(${currentWallpaper.assetPath})` : 'linear-gradient(to bottom, #f3f4f6, #e5e7eb)',
                backgroundSize: '300px'
              }} 
            />
          </div>

          <div className="relative w-full h-[65%] overflow-hidden transition-all duration-700"
            style={{ 
              backgroundImage: currentFloor ? `url(${currentFloor.assetPath})` : 'none',
              backgroundColor: currentFloor ? 'transparent' : '#f9fafb',
              backgroundSize: '250px'
            }}
          >
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ 
               backgroundImage: `linear-gradient(45deg, #000 1px, transparent 1px), linear-gradient(-45deg, #000 1px, transparent 1px)`,
               backgroundSize: '80px 80px',
               backgroundPosition: 'center'
            }} />
          </div>

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
                  userName={profile?.displayName}
                />
              ))}
            </AnimatePresence>
          </div>

          <motion.div 
            id="studio-avatar"
            animate={{ x: avatarPos.x - 64, y: avatarPos.y - 160 }}
            transition={{ type: "spring", stiffness: 80, damping: 25 }}
            className="absolute pointer-events-none"
            style={{ zIndex: Math.floor(avatarPos.y) }}
          >
            <div className="relative group">
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black/10 blur-xl rounded-full -z-10" />
              <div className="w-32 h-48 flex items-center justify-center">
                <img src={avatarSrc} alt="Char" className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]" />
              </div>
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-2xl border-2 border-primary shadow-xl">
                   <span className="text-[10px] font-black uppercase text-primary tracking-widest">{profile?.displayName}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="fixed bottom-10 inset-x-0 flex justify-center items-end gap-6 z-[250] pointer-events-none">
           <div className="flex items-center gap-4 bg-white/80 backdrop-blur-2xl p-4 rounded-[3.5rem] shadow-2xl border-b-8 border-zinc-200 pointer-events-auto">
              <button 
                onClick={() => setMode(mode === 'explore' ? 'edit' : 'explore')}
                className={cn(
                  "w-20 h-20 rounded-full flex flex-col items-center justify-center gap-1 transition-all shadow-xl border-b-4 active:border-b-0 active:translate-y-1",
                  mode === 'edit' ? "bg-green-500 text-white border-green-700" : "bg-white text-primary border-zinc-100"
                )}
              >
                {mode === 'edit' ? <Check className="w-8 h-8" /> : <Edit3 className="w-8 h-8" />}
                <span className="text-[8px] font-black uppercase">{mode === 'edit' ? 'Salvar' : 'Mudar'}</span>
              </button>

              <button 
                id="btn-shop"
                onClick={() => setIsShopOpen(true)}
                className="w-24 h-24 rounded-full bg-primary text-white flex flex-col items-center justify-center gap-1 shadow-2xl border-b-8 border-primary/70 active:border-b-0 active:translate-y-2 transition-all hover:scale-110"
              >
                <ShoppingBag className="w-10 h-10" />
                <span className="text-[10px] font-black uppercase">Loja</span>
              </button>
           </div>

           <Link href="/playground" id="btn-play" className="pointer-events-auto">
             <div className="w-24 h-24 rounded-full bg-accent text-white flex flex-col items-center justify-center gap-1 shadow-2xl border-b-8 border-accent/70 active:border-b-0 active:translate-y-2 transition-all hover:scale-110">
                <Zap className="w-10 h-10" />
                <span className="text-[10px] font-black uppercase">Play</span>
             </div>
           </Link>
        </div>
      </main>

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
