
'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Sparkles,
  Zap,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { STUDIO_CATALOG } from '@/lib/studio-catalog';
import { cn } from '@/lib/utils';

export default function StudioPage() {
  const { user } = useUser();
  const { studioState, updateItemPosition, addItem, removeItem } = useStudio();
  const [isEditing, setIsEditing] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const userProgressRef = useMemoFirebase(() => user ? { id: user.uid, path: `user_progress/${user.uid}` } : null, [user]);
  const { data: profile, isLoading } = useDoc(userProgressRef);

  useEffect(() => {
    if (profile && profile.hasSeenTutorial === false) {
      setShowTutorial(true);
    }
  }, [profile]);

  // Observador de Itens Ativos (Gatilho Pedagógico)
  const activeItemsCount = useMemo(() => {
    return studioState.placedItems.filter(pi => {
      const catalogItem = STUDIO_CATALOG.find(ci => ci.id === pi.itemId);
      return catalogItem?.category === 'Ativo';
    }).length;
  }, [studioState.placedItems]);

  const avatarUrl = profile?.avatar?.equippedItems?.[0] || 'https://picsum.photos/seed/ludo/400';
  const auraColor = profile?.dominantColor || '#9333ea';

  return (
    <div className="min-h-screen bg-background overflow-hidden flex flex-col relative">
      <div className="absolute inset-0 bg-mesh-purple opacity-30 pointer-events-none" />
      
      <AnimatePresence>
        {showTutorial && profile && (
          <TutorialOverlay 
            userName={profile.displayName}
            avatarUrl={avatarUrl}
            onComplete={() => setShowTutorial(false)}
          />
        )}
      </AnimatePresence>

      <header className="px-6 h-20 flex items-center justify-between border-b bg-background/60 backdrop-blur-xl z-[100]">
        <Link href="/dashboard" className="p-2 bg-white rounded-full shadow-sm">
          <ArrowLeft className="w-5 h-5 text-primary" />
        </Link>
        <div className="flex items-center gap-2">
          <UrbeLudoLogo className="w-8 h-8 text-primary" />
          <span className="text-sm font-black uppercase italic tracking-tighter">Meu Estúdio</span>
        </div>
        <div className="flex items-center gap-3">
          <div id="coin-counter" className="bg-primary/10 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-primary/20">
            <Coins className="w-3 h-3 text-yellow-600" />
            <span className="text-xs font-black">{profile?.ludoCoins || 0}</span>
          </div>
          <Button 
            variant={isEditing ? "default" : "outline"} 
            onClick={() => setIsEditing(!isEditing)}
            className="rounded-2xl font-black uppercase text-[10px] gap-2 shadow-sm"
          >
            {isEditing ? <><Check className="w-4 h-4" /> Pronto</> : <><Edit3 className="w-4 h-4" /> Editar</>}
          </Button>
        </div>
      </header>

      <main className="flex-1 relative p-4 flex items-center justify-center">
        {/* Container do Quarto 2.5D */}
        <div 
          id="studio-grid"
          className="w-full h-full max-w-lg aspect-[4/5] bg-white rounded-[3rem] border-4 border-white shadow-2xl relative overflow-hidden flex flex-col"
        >
          {/* 1. PAREDE (60% do espaço) */}
          <div className="relative w-full h-[60%] overflow-hidden transition-colors duration-700" style={{ 
            background: `linear-gradient(to bottom, ${auraColor}15, ${auraColor}30)` 
          }}>
            {/* Papel de parede sutil */}
            <div className="absolute inset-0 opacity-10" style={{ 
              backgroundImage: `radial-gradient(${auraColor} 1px, transparent 1px)`,
              backgroundSize: '20px 20px' 
            }} />
            
            {/* Janela Minimalista */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-32 h-40 bg-blue-50 rounded-t-full border-4 border-white shadow-inner overflow-hidden flex flex-col justify-end">
                {/* Vidro / Céu */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-200/50 to-transparent"></div>
                {/* Detalhe da esquadria */}
                <div className="w-full h-1 bg-white absolute top-1/2"></div>
                <div className="w-1 h-full bg-white absolute left-1/2"></div>
                
                {/* Vaso de planta minimalista */}
                <div className="relative z-10 w-8 h-8 mx-auto mb-2">
                    <div className="absolute bottom-0 w-full h-4 bg-orange-200 rounded-b-sm border border-orange-300"></div>
                    <div className="absolute bottom-3 left-1 w-6 h-6 bg-green-400 rounded-full"></div>
                    <div className="absolute bottom-4 left-3 w-4 h-4 bg-green-300 rounded-full"></div>
                </div>
            </div>
          </div>

          {/* 2. RODAPÉ */}
          <div className="relative z-10 w-full h-4 bg-white border-b border-gray-100 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]"></div>

          {/* 3. CHÃO (40% do espaço) */}
          <div className="relative w-full h-[40%] bg-[#F4F1EA] shadow-[inset_0_15px_25px_-15px_rgba(0,0,0,0.1)]">
            {/* Linhas de tábua corrida */}
            <div className="absolute inset-0 opacity-20 flex flex-col justify-evenly">
                <div className="w-full h-[1px] bg-gray-400"></div>
                <div className="w-full h-[1px] bg-gray-400"></div>
                <div className="w-full h-[1px] bg-gray-400"></div>
                <div className="w-full h-[1px] bg-gray-400"></div>
            </div>
          </div>

          {/* Renderização de Móveis sobre o cenário */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {studioState.placedItems.map(item => (
              <FurniturePiece 
                key={item.instanceId} 
                data={item} 
                onUpdate={updateItemPosition}
                onRemove={removeItem}
                isEditing={isEditing}
                auraColor={auraColor}
              />
            ))}
          </div>

          {/* Avatar com Feedback de Itens Ativos */}
          <motion.div 
            id="studio-avatar"
            animate={{ 
              y: [0, -10, 0],
              scale: isEditing ? 0.8 : 1
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[90]"
          >
            <div className="relative">
              <div className="w-32 h-32 rounded-[3.5rem] overflow-hidden border-4 border-primary shadow-2xl bg-muted">
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              {activeItemsCount > 0 && !isEditing && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-accent text-white p-2 rounded-full shadow-lg border-2 border-white"
                >
                  <Zap className="w-4 h-4 animate-pulse" />
                </motion.div>
              )}
            </div>
            <div className="absolute -bottom-2 inset-x-0 flex justify-center">
              <span className="bg-primary text-white text-[8px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg border border-white/20">
                {profile?.displayName || 'Explorador'}
              </span>
            </div>
          </motion.div>

          <AnimatePresence>
            {isEditing && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-8 inset-x-0 flex justify-center z-[110]"
              >
                <div className="bg-black/80 text-white text-[9px] font-black uppercase px-6 py-3 rounded-full flex items-center gap-3 backdrop-blur-md shadow-2xl border border-white/10">
                  <Smartphone className="w-4 h-4 text-primary animate-bounce" />
                  Arraste os itens para decorar
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {activeItemsCount > 0 && !isEditing && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute bottom-32 right-8 z-[100]"
            >
              <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-primary/10 max-w-[140px]">
                <p className="text-[9px] font-bold text-primary leading-tight">
                  Seu estúdio está equipado! Vamos treinar equilíbrio hoje?
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <div className="fixed bottom-10 right-8 flex flex-col gap-4 z-[120]">
        <Button id="btn-play" asChild className="rounded-full h-16 w-16 shadow-2xl bg-accent hover:scale-110 transition-transform border-b-4 border-accent/80">
          <Link href="/playground">
            <Zap className="w-7 h-7 text-white" />
          </Link>
        </Button>
        <div id="btn-shop">
          <ShopDrawer onBuy={addItem} unlockedItemIds={studioState.unlockedItemIds} />
        </div>
      </div>

      {!studioState.placedItems.length && !isEditing && !showTutorial && !isLoading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[200] flex items-center justify-center p-8">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-10 rounded-[4rem] max-w-sm text-center space-y-6 shadow-2xl border border-primary/10"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Estúdio Vazio!</h2>
              <p className="text-xs text-muted-foreground font-medium">Use suas LudoCoins ganhas nas missões para transformar este espaço em seu centro de treinamento!</p>
            </div>
            <Button onClick={() => setIsEditing(true)} className="w-full h-16 rounded-full font-black uppercase tracking-widest bg-primary shadow-xl border-b-4 border-primary/80">
              Começar a Decorar
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
