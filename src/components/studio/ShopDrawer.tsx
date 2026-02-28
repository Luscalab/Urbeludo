
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Coins, Sparkles, Package, Home, Zap, ShoppingBag, Star } from 'lucide-react';
import { STUDIO_CATALOG } from '@/lib/studio-catalog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ShopDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userCoins: number;
  unlockedItemIds: string[];
  onBuyItem: (itemId: string, price: number) => void;
  onPlaceItem: (itemId: string) => void;
  userName?: string;
}

export function ShopDrawer({ isOpen, onClose, userCoins, unlockedItemIds, onBuyItem, onPlaceItem, userName }: ShopDrawerProps) {
  const [activeTab, setActiveTab] = useState<string>("Todos");

  const categories = [
    { id: "Todos", icon: <Package className="w-4 h-4" /> },
    { id: "Essencial", icon: <Home className="w-4 h-4" /> },
    { id: "Ativo", icon: <Zap className="w-4 h-4" /> },
    { id: "Estético", icon: <ShoppingBag className="w-4 h-4" /> },
    { id: "Especial", icon: <Star className="w-4 h-4" /> }
  ];

  const isSapient = userName?.toLowerCase() === 'sapient';

  const filteredCatalog = activeTab === "Todos" 
    ? STUDIO_CATALOG 
    : STUDIO_CATALOG.filter(item => item.category === activeTab);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-[200] backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 h-[85vh] bg-background rounded-t-[4rem] z-[210] flex flex-col shadow-2xl border-t-8 border-primary"
          >
            <div className="p-8 border-b flex justify-between items-start bg-primary/5 rounded-t-[4rem]">
              <div className="space-y-1">
                <h2 className="text-4xl font-black text-primary uppercase italic tracking-tighter">Ludo Studio Shop</h2>
                <div className="bg-white px-6 py-2 rounded-2xl flex items-center gap-3 shadow-inner border border-primary/10">
                  <Coins className="w-6 h-6 text-yellow-500" />
                  <span className="text-xl font-black">{isSapient ? '∞' : userCoins} <span className="text-[10px] uppercase opacity-40">LudoCoins</span></span>
                </div>
              </div>
              <button onClick={onClose} className="p-4 bg-white text-primary rounded-3xl shadow-xl hover:scale-110 active:scale-95 transition-all">
                <X className="w-7 h-7" />
              </button>
            </div>

            <div className="flex gap-2 p-6 overflow-x-auto no-scrollbar border-b">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={cn(
                    "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                    activeTab === cat.id 
                      ? "bg-primary text-white shadow-xl scale-105" 
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {cat.icon} {cat.id}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 gap-6 pb-32 no-scrollbar">
              {filteredCatalog.map((item) => {
                const countInInventory = unlockedItemIds.filter(id => id === item.id).length;
                const canAfford = isSapient || userCoins >= item.price;
                const isSpecial = item.category === 'Especial';

                return (
                  <motion.div 
                    key={item.id}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "bg-white rounded-[3rem] p-6 flex flex-col items-center border-4 transition-all relative group shadow-sm",
                      isSpecial ? "border-accent/30 bg-accent/5" : "border-muted/10 hover:border-primary/30"
                    )}
                  >
                    {countInInventory > 0 && (
                      <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-[9px] font-black shadow-lg">
                        Mochila: {countInInventory}
                      </div>
                    )}

                    <div className="w-28 h-28 mb-6 flex items-center justify-center bg-muted/20 rounded-[2.5rem] shadow-inner border-2 border-white overflow-hidden p-4">
                       <img src={item.assetPath} alt={item.name} className="max-w-full max-h-full object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-500" />
                    </div>

                    <div className="text-center mb-6 space-y-1">
                      <h3 className="text-[12px] font-black text-foreground uppercase italic tracking-tighter leading-none">{item.name}</h3>
                      <p className="text-[8px] text-muted-foreground font-bold leading-tight px-4">{item.description}</p>
                    </div>
                    
                    <div className="mt-auto w-full space-y-3">
                      {countInInventory > 0 && (
                        <button 
                          onClick={() => onPlaceItem(item.id)}
                          className="w-full py-4 bg-green-500 text-white rounded-2xl text-[11px] font-black uppercase flex items-center justify-center gap-2 shadow-xl shadow-green-500/20 active:scale-95 border-b-4 border-green-700 active:border-b-0"
                        >
                          <Package className="w-4 h-4" /> Posicionar no Studio
                        </button>
                      )}
                      
                      <button 
                        disabled={!canAfford && !isSapient}
                        onClick={() => onBuyItem(item.id, isSapient ? 0 : item.price)}
                        className={cn(
                          "w-full py-4 rounded-2xl text-[11px] font-black uppercase flex items-center justify-center gap-2 transition-all active:scale-95 border-b-4",
                          (canAfford || isSapient) 
                            ? "bg-primary text-white shadow-xl shadow-primary/20 border-primary-foreground/20 active:border-b-0" 
                            : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed border-transparent"
                        )}
                      >
                        {!canAfford && !isSapient && <Lock className="w-4 h-4" />}
                        <Coins className="w-4 h-4" /> {isSapient ? 'GRÁTIS' : item.price}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
