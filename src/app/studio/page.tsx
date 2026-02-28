
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
  Navigation as NavIcon,
  Wand2,
  Maximize2,
  Trophy,
  Battery
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
      if (y > 400) updateAvatarPosition(x, y);
    }
  };

  const avatarFilename = profile?.avatar?.avatarId || '1.png';
  const avatarSrc = `/assets/avatars/${avatarFilename}`;
  const auraColor = profile?.dominantColor || '#9333ea';
  const avatarPos = studioState.avatar.lastPosition;
  const isSapient = profile?.displayName?.toLowerCase() === 'sapient';

  return (
    <div className="h-screen bg-sky-100 overflow-hidden flex flex-col relative font-sans">
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

      {/* Cafeland Top HUD */}
      <header className="fixed top-0 inset-x-0 h-24 flex items-center justify-between px-6 z-[200] pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <Link href="/dashboard" className="p-4 bg-white rounded-full shadow-lg border-b-4 border-zinc-200 active:border-b-0 active:translate-y-1 transition-all">
            <ArrowLeft className="w-6 h-6 text-primary" />
          </Link>
          <div className="bg-white/95 backdrop-blur-xl px-6 py-3 rounded-full shadow-xl border-b-4 border-zinc-200 flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-white shadow-sm">
                <Trophy className="w-5 h-5 text-white" />
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-muted-foreground leading-none">Nível</span>
                <span className="text-sm font-black text-primary">{profile?.psychomotorLevel || 1}</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-xl px-6 py-2 rounded-full shadow-xl border-b-4 border-zinc-200 flex items-center gap-3">
             <Coins className="w-5 h-5 text-yellow-500" />
             <span className="text-base font-black tracking-tight">{isSapient ? '∞' : (profile?.ludoCoins || 0)}</span>
          </div>
          <div className="bg-white/95 backdrop-blur-xl px-6 py-2 rounded-full shadow-xl border-b-4 border-zinc-200 flex items-center gap-3">
             <Battery className="w-5 h-5 text-green-500" />
             <span className="text-base font-black tracking-tight">{profile?.avatar?.energy ?? 100}%</span>
          </div>
        </div>
      </header>

      <main 
        ref={viewportRef}
        className="flex-1 relative overflow-hidden bg-sky-200"
      >
        <motion.div
          id="studio-world"
          drag={mode === 'explore'}
          dragConstraints={viewportRef}
          onTap={handleFloorClick}
          className="w-[1800px] h-[1800px] relative bg-white flex flex-col shadow-2xl"
          initial={{ x: -600, y: -400 }} 
        >
          {/* Walls with Cafeland Gradient */}
          <div className="relative w-full h-[35%] flex">
            <div className="flex-1 bg-gradient-to-br from-purple-100 to-purple-200 border-r-8 border-white/40" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 85%)' }} />
            <div className="flex-1 bg-gradient-to-bl from-purple-100 to-purple-200" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)' }} />
          </div>

          {/* Floor Grid (Cafeland Style Tiles) */}
          <div className="relative w-full h-[65%] bg-[#f8f9ff] overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ 
               backgroundImage: `linear-gradient(45deg, #ddd 1px, transparent 1px), linear-gradient(-45deg, #ddd 1px, transparent 1px)`,
               backgroundSize: '80px 80px',
               backgroundPosition: 'center'
            }} />
          </div>

          {/* Items Container */}
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

          {/* Avatar Sims Character */}
          <motion.div 
            id="studio-avatar"
            animate={{ x: avatarPos.x - 64, y: avatarPos.y - 140 }}
            transition={{ type: "spring", stiffness: 90, damping: 20 }}
            className="absolute z-[300] pointer-events-none"
          >
            <div className="relative">
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 h-6 bg-black/10 blur-lg rounded-full -z-10" />
              <div className="w-32 h-48 flex items-center justify-center">
                <img src={avatarSrc} alt="Character" className="w-full h-full object-contain drop-shadow-xl" />
              </div>
            </div>
            <div className="absolute -bottom-6 inset-x-0 flex justify-center">
               <span className="bg-primary text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg border-2 border-white whitespace-nowrap">
                  {profile?.displayName || 'Explorador'}
               </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Cafeland Bottom Navigation */}
        <div className="fixed bottom-10 inset-x-0 flex justify-center items-end gap-6 z-[250] pointer-events-none">
           <div className="flex items-center gap-4 bg-white/80 backdrop-blur-2xl p-4 rounded-[3rem] shadow-2xl border-b-8 border-zinc-200 pointer-events-auto">
              <button 
                onClick={() => setMode(mode === 'explore' ? 'edit' : 'explore')}
                className={cn(
                  "w-20 h-20 rounded-full flex flex-col items-center justify-center gap-1 transition-all shadow-lg border-b-4 active:border-b-0 active:translate-y-1",
                  mode === 'edit' ? "bg-green-500 text-white border-green-700" : "bg-white text-primary border-zinc-200"
                )}
              >
                {mode === 'edit' ? <Check className="w-8 h-8" /> : <Edit3 className="w-8 h-8" />}
                <span className="text-[8px] font-black uppercase">{mode === 'edit' ? 'Pronto' : 'Decorar'}</span>
              </button>

              <button 
                onClick={() => setIsShopOpen(true)}
                className="w-24 h-24 rounded-full bg-primary text-white flex flex-col items-center justify-center gap-1 shadow-2xl border-b-8 border-primary/70 active:border-b-0 active:translate-y-2 transition-all"
              >
                <ShoppingBag className="w-10 h-10" />
                <span className="text-[10px] font-black uppercase">Mercado</span>
              </button>

              <button 
                onClick={() => setIsGeneratorOpen(true)}
                className="w-20 h-20 rounded-full bg-accent text-white flex flex-col items-center justify-center gap-1 shadow-lg border-b-4 border-accent/70 active:border-b-0 active:translate-y-1 transition-all"
              >
                <Wand2 className="w-8 h-8" />
                <span className="text-[8px] font-black uppercase">IA</span>
              </button>
           </div>

           <Link href="/playground" className="pointer-events-auto">
             <div className="w-24 h-24 rounded-full bg-secondary text-white flex flex-col items-center justify-center gap-1 shadow-2xl border-b-8 border-secondary/70 active:border-b-0 active:translate-y-2 transition-all">
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

