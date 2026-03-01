
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

/**
 * Página do Estúdio - Simulador Social 2.5D Total (Cafeland & The Sims Style).
 * Mecânicas de Loja, Mochila e Depth Sorting reais.
 */
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
      // Impede caminhar nas paredes (topo da tela isométrica)
      if (y > 500) updateAvatarPosition(x, y);
    }
  };

  const avatarSrc = `/assets/avatars/${profile?.avatar?.avatarId || '1.png'}`;
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

      {/* Cafeland HUD - Cabeçalho de Recursos */}
      <header className="fixed top-0 inset-x-0 h-28 flex items-center justify-between px-6 z-[200] pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <Link href="/dashboard" className="p-4 bg-white rounded-full shadow-2xl border-b-4 border-zinc-200 active:border-b-0 active:translate-y-1 transition-all">
            <ArrowLeft className="w-6 h-6 text-primary" />
          </Link>
          <div className="bg-white/95 backdrop-blur-2xl px-6 py-3 rounded-full shadow-2xl border-b-4 border-zinc-200 flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center border-2 border-white shadow-lg">
                <Trophy className="w-5 h-5 text-white" />
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-muted-foreground leading-none">Nível</span>
                <span className="text-sm font-black text-primary">{profile?.psychomotorLevel || 1}</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <div id="coin-counter" className="bg-white/95 backdrop-blur-2xl px-6 py-2.5 rounded-full shadow-2xl border-b-4 border-zinc-200 flex items-center gap-3">
             <Coins className="w-5 h-5 text-yellow-500" />
             <span className="text-base font-black tracking-tight">{isSapient ? '∞' : (profile?.ludoCoins || 0)}</span>
          </div>
          <div className="bg-white/95 backdrop-blur-2xl px-6 py-2.5 rounded-full shadow-2xl border-b-4 border-zinc-200 flex items-center gap-3">
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
          className="w-[1800px] h-[1800px] relative bg-white flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.2)]"
          initial={{ x: -450, y: -500 }} 
        >
          {/* Paredes Estilizadas 2.5D */}
          <div className="relative w-full h-[40%] flex">
            <div className="flex-1 bg-gradient-to-br from-indigo-50 to-indigo-100 border-r-8 border-white/40" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 85%)' }} />
            <div className="flex-1 bg-gradient-to-bl from-indigo-50 to-indigo-100" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)' }} />
          </div>

          {/* Chão com Lajotas e Grid Magnético */}
          <div className="relative w-full h-[60%] bg-[#f4f7ff] overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ 
               backgroundImage: `linear-gradient(45deg, #000 1px, transparent 1px), linear-gradient(-45deg, #000 1px, transparent 1px)`,
               backgroundSize: '80px 80px',
               backgroundPosition: 'center'
            }} />
          </div>

          {/* Itens com Depth Sorting Dinâmico */}
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

          {/* Avatar (Oclusão Dinâmica baseada em Y) */}
          <motion.div 
            id="studio-avatar"
            animate={{ x: avatarPos.x - 64, y: avatarPos.y - 140 }}
            transition={{ type: "spring", stiffness: 90, damping: 20 }}
            className="absolute pointer-events-none"
            style={{ zIndex: Math.floor(avatarPos.y) }}
          >
            <div className="relative">
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 h-6 bg-black/10 blur-xl rounded-full -z-10" />
              <div className="w-32 h-48 flex items-center justify-center">
                <img src={avatarSrc} alt="Character" className="w-full h-full object-contain drop-shadow-2xl" />
              </div>
            </div>
            <div className="absolute -bottom-6 inset-x-0 flex justify-center">
               <span className="bg-primary text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-full shadow-xl border-2 border-white whitespace-nowrap">
                  {profile?.displayName || 'Explorador'}
               </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Cafeland Bottom Menu - Controles de Jogo */}
        <div className="fixed bottom-12 inset-x-0 flex justify-center items-end gap-6 z-[250] pointer-events-none">
           <div className="flex items-center gap-4 bg-white/80 backdrop-blur-3xl p-4 rounded-[3.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] border-b-8 border-zinc-200 pointer-events-auto">
              <button 
                onClick={() => setMode(mode === 'explore' ? 'edit' : 'explore')}
                className={cn(
                  "w-20 h-20 rounded-full flex flex-col items-center justify-center gap-1 transition-all shadow-xl border-b-4 active:border-b-0 active:translate-y-1",
                  mode === 'edit' ? "bg-green-500 text-white border-green-700" : "bg-white text-primary border-zinc-200"
                )}
              >
                {mode === 'edit' ? <Check className="w-8 h-8" /> : <Edit3 className="w-8 h-8" />}
                <span className="text-[8px] font-black uppercase">{mode === 'edit' ? 'Salvar' : 'Decorar'}</span>
              </button>

              <button 
                id="btn-shop"
                onClick={() => setIsShopOpen(true)}
                className="w-24 h-24 rounded-full bg-primary text-white flex flex-col items-center justify-center gap-1 shadow-2xl border-b-8 border-primary/70 active:border-b-0 active:translate-y-2 transition-all hover:scale-105"
              >
                <ShoppingBag className="w-10 h-10" />
                <span className="text-[10px] font-black uppercase">Mercado</span>
              </button>
           </div>

           <Link href="/playground" id="btn-play" className="pointer-events-auto">
             <div className="w-24 h-24 rounded-full bg-secondary text-white flex flex-col items-center justify-center gap-1 shadow-2xl border-b-8 border-secondary/70 active:border-b-0 active:translate-y-2 transition-all hover:scale-105">
                <Zap className="w-10 h-10" />
                <span className="text-[10px] font-black uppercase">Explorar</span>
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
