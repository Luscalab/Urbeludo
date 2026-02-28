'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FurniturePiece } from '@/components/studio/FurniturePiece';
import { ShopDrawer } from '@/components/studio/ShopDrawer';
import { useStudio } from '@/hooks/use-studio';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { 
  ArrowLeft, 
  Edit3, 
  Check, 
  Smartphone,
  Sparkles,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { STUDIO_CATALOG } from '@/lib/studio-catalog';

export default function StudioPage() {
  const { user } = useUser();
  const { studioState, updateItemPosition, addItem, removeItem } = useStudio();
  const [isEditing, setIsEditing] = useState(false);
  
  const userProgressRef = useMemoFirebase(() => user ? { id: user.uid, path: `user_progress/${user.uid}` } : null, [user]);
  const { data: profile } = useDoc(userProgressRef);

  // Observador de Itens Ativos (Gatilho Pedagógico)
  const activeItemsCount = useMemo(() => {
    return studioState.placedItems.filter(pi => {
      const catalogItem = STUDIO_CATALOG.find(ci => ci.id === pi.itemId);
      return catalogItem?.category === 'Ativo';
    }).length;
  }, [studioState.placedItems]);

  return (
    <div className="min-h-screen bg-background overflow-hidden flex flex-col relative">
      <div className="absolute inset-0 bg-mesh-purple opacity-30 pointer-events-none" />
      
      <header className="px-6 h-20 flex items-center justify-between border-b bg-background/60 backdrop-blur-xl z-[100]">
        <Link href="/dashboard" className="p-2 bg-white rounded-full shadow-sm">
          <ArrowLeft className="w-5 h-5 text-primary" />
        </Link>
        <div className="flex items-center gap-2">
          <UrbeLudoLogo className="w-8 h-8 text-primary" />
          <span className="text-sm font-black uppercase italic tracking-tighter">Meu Estúdio</span>
        </div>
        <Button 
          variant={isEditing ? "default" : "outline"} 
          onClick={() => setIsEditing(!isEditing)}
          className="rounded-2xl font-black uppercase text-[10px] gap-2 shadow-sm"
        >
          {isEditing ? <><Check className="w-4 h-4" /> Pronto</> : <><Edit3 className="w-4 h-4" /> Editar</>}
        </Button>
      </header>

      <main className="flex-1 relative p-4 flex items-center justify-center">
        <div 
          id="studio-grid"
          className="w-full h-full max-w-lg aspect-[4/5] bg-white/40 rounded-[4rem] border-4 border-white/20 shadow-2xl relative overflow-hidden backdrop-blur-sm"
        >
          <div className="absolute inset-0 opacity-10" style={{ 
            backgroundImage: 'radial-gradient(circle, #9333ea 1px, transparent 1px)',
            backgroundSize: '40px 40px' 
          }} />

          {studioState.placedItems.map(item => (
            <FurniturePiece 
              key={item.instanceId} 
              data={item} 
              onUpdate={updateItemPosition}
              onRemove={removeItem}
              isEditing={isEditing}
              auraColor={profile?.dominantColor || '#9333ea'}
            />
          ))}

          {/* Avatar com Feedback de Itens Ativos */}
          <motion.div 
            animate={{ 
              y: [0, -10, 0],
              scale: isEditing ? 0.8 : 1
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[90]"
          >
            <div className="relative">
              <div className="w-32 h-32 rounded-[3.5rem] overflow-hidden border-4 border-primary shadow-2xl bg-muted">
                <img 
                  src={profile?.avatar?.equippedItems?.[0] || 'https://picsum.photos/seed/ludo/400'} 
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
        <ShopDrawer onBuy={addItem} unlockedItemIds={studioState.unlockedItemIds} />
      </div>

      {!studioState.placedItems.length && !isEditing && (
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
