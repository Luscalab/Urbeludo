
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Coins, Sparkles, Package, Home, Zap, ShoppingBag, Star, Wand2, Info } from 'lucide-react';
import { STUDIO_CATALOG } from '@/lib/studio-catalog';
import { cn } from '@/lib/utils';
import { StudioItem } from '@/lib/types';

interface ShopDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userCoins: number;
  unlockedItemIds: string[];
  customItems?: StudioItem[];
  onBuyItem: (itemId: string, price: number) => void;
  onPlaceItem: (itemId: string) => void;
  onOpenGenerator: () => void;
  userName?: string;
}

/**
 * Gaveta de Compras Estilo Sims Mobile.
 * Categorias expressivas e botões grandes para touch.
 */
export function ShopDrawer({ 
  isOpen, 
  onClose, 
  userCoins, 
  unlockedItemIds, 
  customItems = [], 
  onBuyItem, 
  onPlaceItem, 
  onOpenGenerator,
  userName 
}: ShopDrawerProps) {
  const [activeTab, setActiveTab] = useState<string>("Todos");

  const categories = [
    { id: "Todos", icon: <Package className="w-5 h-5" /> },
    { id: "Essencial", icon: <Home className="w-5 h-5" /> },
    { id: "Ativo", icon: <Zap className="w-5 h-5" /> },
    { id: "Estético", icon: <ShoppingBag className="w-5 h-5" /> },
    { id: "Especial", icon: <Star className="w-5 h-5" /> }
  ];

  const isSapient = userName?.toLowerCase() === 'sapient';
  const allAvailableItems = [...STUDIO_CATALOG, ...customItems];
  const filteredCatalog = activeTab === "Todos" 
    ? allAvailableItems 
    : allAvailableItems.filter(item => item.category === activeTab);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 z-[300] backdrop-blur-xl"
          />

          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 35, stiffness: 250 }}
            className="fixed bottom-0 left-0 right-0 h-[85vh] bg-white rounded-t-[5rem] z-[310] flex flex-col shadow-[0_-50px_100px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            {/* Header Sims Mobile Style */}
            <div className="p-10 border-b-8 border-primary/5 flex justify-between items-center bg-zinc-50 rounded-t-[5rem] shrink-0">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h2 className="text-4xl font-black text-foreground uppercase italic tracking-tighter">Ludo Shop</h2>
                </div>
                <div className="bg-white px-8 py-3 rounded-3xl inline-flex items-center gap-4 shadow-xl border-4 border-primary/5">
                  <Coins className="w-7 h-7 text-yellow-500" />
                  <span className="text-3xl font-black tracking-tighter">{isSapient ? '∞' : userCoins}</span>
                  <span className="text-[10px] font-black uppercase text-muted-foreground opacity-40">Ludo Coins</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={onOpenGenerator}
                  className="h-20 px-10 rounded-[2.5rem] bg-accent text-white font-black uppercase tracking-widest gap-4 shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center border-b-8 border-accent/70"
                >
                  <Wand2 className="w-6 h-6" /> ARQUITETO
                </button>
                <button onClick={onClose} className="p-6 bg-white text-primary rounded-[2.5rem] shadow-2xl hover:scale-110 active:scale-95 transition-all border-4 border-primary/5">
                  <X className="w-8 h-8 stroke-[4]" />
                </button>
              </div>
            </div>

            {/* Navegação de Categorias */}
            <div className="flex gap-4 p-8 overflow-x-auto no-scrollbar bg-white border-b-4 border-primary/5 z-30 shrink-0">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={cn(
                    "px-10 py-5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 shrink-0",
                    activeTab === cat.id 
                      ? "bg-primary text-white shadow-2xl scale-105" 
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  {cat.icon} {cat.id}
                </button>
              ))}
            </div>

            {/* Feed de Itens Dinâmico */}
            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 lg:grid-cols-4 gap-8 pb-40 no-scrollbar bg-zinc-50/50">
              {filteredCatalog.map((item) => {
                const countInInventory = unlockedItemIds.filter(id => id === item.id).length;
                const canAfford = isSapient || userCoins >= item.price;
                const isSpecial = item.category === 'Especial' || item.isAiGenerated;

                return (
                  <motion.div 
                    key={item.id}
                    whileHover={{ y: -5 }}
                    className={cn(
                      "bg-white rounded-[3.5rem] p-8 flex flex-col items-center border-8 transition-all relative group shadow-lg",
                      isSpecial ? "border-accent/20" : "border-white"
                    )}
                  >
                    {countInInventory > 0 && (
                      <div className="absolute -top-4 -left-4 bg-primary text-white h-12 w-12 rounded-2xl flex items-center justify-center text-xs font-black shadow-2xl z-20 border-4 border-white">
                        {countInInventory}
                      </div>
                    )}

                    <div className="w-32 h-32 mb-6 flex items-center justify-center bg-muted/10 rounded-3xl overflow-hidden p-4 relative group-hover:scale-110 transition-transform duration-500">
                       <img src={item.assetPath} alt={item.name} className="max-w-full max-h-full object-contain drop-shadow-2xl" />
                    </div>

                    <div className="text-center mb-6 space-y-1">
                      <h3 className="text-sm font-black text-foreground uppercase italic tracking-tighter">{item.name}</h3>
                      <p className="text-[9px] text-muted-foreground font-bold leading-tight opacity-50">{item.description}</p>
                    </div>
                    
                    <div className="mt-auto w-full space-y-3">
                      {countInInventory > 0 ? (
                        <button 
                          onClick={() => onPlaceItem(item.id)}
                          className="w-full py-4 bg-green-500 text-white rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-xl shadow-green-500/20 active:scale-95 border-b-4 border-green-700 active:border-b-0"
                        >
                          <Package className="w-4 h-4" /> POSICIONAR
                        </button>
                      ) : (
                        <button 
                          disabled={!canAfford && !isSapient}
                          onClick={() => onBuyItem(item.id, isSapient ? 0 : item.price)}
                          className={cn(
                            "w-full py-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all active:scale-95 border-b-4",
                            (canAfford || isSapient) 
                              ? "bg-primary text-white shadow-xl shadow-primary/20 border-primary-foreground/20 active:border-b-0" 
                              : "bg-muted text-muted-foreground opacity-40 cursor-not-allowed border-transparent"
                          )}
                        >
                          {!canAfford && !isSapient ? <Lock className="w-4 h-4" /> : <Coins className="w-4 h-4" />}
                          {isSapient ? 'GRÁTIS' : `${item.price} LC`}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-8 py-4 rounded-full flex items-center gap-3 shadow-2xl">
               <Info className="w-4 h-4 text-primary" />
               <span className="text-[9px] font-black uppercase tracking-[0.2em]">Toque para selecionar e posicionar no Studio</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
