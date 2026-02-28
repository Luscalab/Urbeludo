'use client';

import React, { useState } from 'react';
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
  Home, 
  Info,
  Smartphone,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';

export default function StudioPage() {
  const { user } = useUser();
  const { furniture, updateFurniturePosition, addFurniture, removeFurniture } = useStudio();
  const [isEditing, setIsEditing] = useState(false);
  
  const userProgressRef = useMemoFirebase(() => user ? { id: user.uid, path: `user_progress/${user.uid}` } : null, [user]);
  const { data: profile } = useDoc(userProgressRef);

  return (
    <div className="min-h-screen bg-background overflow-hidden flex flex-col relative">
      {/* Background Decorativo */}
      <div className="absolute inset-0 bg-mesh-purple opacity-30 pointer-events-none" />
      
      {/* Header */}
      <header className="px-6 h-20 flex items-center justify-between border-b bg-background/60 backdrop-blur-xl z-50">
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
          className="rounded-2xl font-black uppercase text-[10px] gap-2"
        >
          {isEditing ? <><Check className="w-4 h-4" /> Pronto</> : <><Edit3 className="w-4 h-4" /> Editar</>}
        </Button>
      </header>

      {/* Studio Area */}
      <main className="flex-1 relative p-4 flex items-center justify-center">
        <div 
          id="studio-grid"
          className="w-full h-full max-w-lg aspect-[4/5] bg-white/40 rounded-[4rem] border-4 border-white/20 shadow-2xl relative overflow-hidden backdrop-blur-sm"
        >
          {/* Piso Estilizado */}
          <div className="absolute inset-0 opacity-10" style={{ 
            backgroundImage: 'radial-gradient(circle, #9333ea 1px, transparent 1px)',
            backgroundSize: '40px 40px' 
          }} />

          {/* Móveis */}
          {furniture.map(item => (
            <FurniturePiece 
              key={item.id} 
              data={item} 
              onUpdate={updateFurniturePosition}
              onRemove={removeFurniture}
              isEditing={isEditing}
              auraColor={profile?.dominantColor || '#9333ea'}
            />
          ))}

          {/* Avatar do Usuário */}
          <motion.div 
            animate={{ 
              y: [0, -10, 0],
              scale: isEditing ? 0.8 : 1
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="w-32 h-32 rounded-[3rem] overflow-hidden border-4 border-primary shadow-2xl bg-muted">
              <img 
                src={profile?.avatar?.equippedItems?.[0] || 'https://picsum.photos/seed/ludo/400'} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 inset-x-0 flex justify-center">
              <span className="bg-primary text-white text-[8px] font-black uppercase px-3 py-1 rounded-full shadow-lg">
                {profile?.displayName || 'Explorador'}
              </span>
            </div>
          </motion.div>

          {/* Dica Visual de Edição */}
          <AnimatePresence>
            {isEditing && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-8 inset-x-0 flex justify-center z-50"
              >
                <div className="bg-black/80 text-white text-[9px] font-black uppercase px-6 py-3 rounded-full flex items-center gap-3 backdrop-blur-md shadow-2xl border border-white/10">
                  <Smartphone className="w-4 h-4 text-primary animate-bounce" />
                  Arraste os itens para decorar
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-10 right-8 flex flex-col gap-4 z-50">
        <ShopDrawer onBuy={addFurniture} />
      </div>

      {/* Welcome Tips (First visit) */}
      {!furniture.length && !isEditing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-8">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-10 rounded-[3.5rem] max-w-sm text-center space-y-6 shadow-2xl"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Seu Espaço Vazio!</h2>
            <p className="text-xs text-muted-foreground font-medium">Seu estúdio é onde você descansa entre as missões urbanas. Use suas LudoCoins para decorá-lo!</p>
            <Button onClick={() => setIsEditing(true)} className="w-full h-16 rounded-full font-black uppercase tracking-widest bg-primary shadow-xl">
              Começar a Decorar
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
