
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
  const isSapient = userName?.toLowerCase() === 'sapient';

  const categories = [
    { id: "Todos", icon: <Package className="w-5 h-5" /> },
    { id: "Essencial", icon: <Home className="w-5 h-5" /> },
    { id: "Ativo", icon: <Zap className="w-5 h-5" /> },
    { id: "Estético", icon: <ShoppingBag className="w-5 h-5" /> },
    { id: "Especial", icon: <Star className="w-5 h-5" /> }
  ];

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
            className="fixed inset-0 bg-black/60 z-[300] backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="fixed bottom-0 inset-x-0 h-[80vh] bg-[#f0f4f8] rounded-t-[4rem] z-[310] flex flex-col shadow-2xl border-t-8 border-white"
          >
            {/* Store Header */}
            <div className="p-8 flex justify-between items-center bg-white rounded-t-[4rem] shrink-0 border-b-4 border-zinc-100">
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white shadow-xl border-b-4 border-primary/70">
                     <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div className="flex flex-col">
                     <h2 className="text-3xl font-black text-foreground uppercase italic tracking-tighter">Mercado Ludo</h2>
                     <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                        <Coins className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-black text-yellow-800">{isSapient ? '∞' : userCoins} LC</span>
                     </div>
                  </div>
               </div>
               <button onClick={onClose} className="p-4 bg-zinc-100 text-zinc-400 rounded-full hover:bg-zinc-200 transition-all">
                  <X className="w-6 h-6 stroke-[3]" />
               </button>
            </div>

            {/* Category Navigation */}
            <div className="flex gap-4 p-6 overflow-x-auto no-scrollbar bg-white z-30 shrink-0">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={cn(
                    "px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 border-b-4",
                    activeTab === cat.id 
                      ? "bg-primary text-white border-primary/70 shadow-lg scale-105" 
                      : "bg-zinc-100 text-zinc-400 border-zinc-200 hover:bg-zinc-200"
                  )}
                >
                  {cat.icon} {cat.id}
                </button>
              ))}
            </div>

            {/* Items Grid */}
            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 gap-6 pb-32 no-scrollbar">
              {filteredCatalog.map((item) => {
                const countInInventory = unlockedItemIds.filter(id => id === item.id).length;
                const canAfford = isSapient || userCoins >= item.price;
                
                return (
                  <motion.div 
                    key={item.id}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white rounded-[3rem] p-6 flex flex-col items-center border-b-8 border-zinc-100 shadow-xl relative group"
                  >
                    {countInInventory > 0 && (
                      <div className="absolute -top-3 -left-3 bg-secondary text-white h-10 w-10 rounded-2xl flex items-center justify-center text-xs font-black shadow-lg border-2 border-white">
                        {countInInventory}
                      </div>
                    )}

                    <div className="w-28 h-28 mb-4 flex items-center justify-center bg-zinc-50 rounded-3xl p-4">
                       <img src={item.assetPath} alt={item.name} className="max-w-full max-h-full object-contain drop-shadow-md" />
                    </div>

                    <h3 className="text-xs font-black text-foreground uppercase text-center mb-4 truncate w-full">{item.name}</h3>
                    
                    <div className="mt-auto w-full">
                      {countInInventory > 0 ? (
                        <button 
                          onClick={() => onPlaceItem(item.id)}
                          className="w-full py-4 bg-green-500 text-white rounded-2xl text-[9px] font-black uppercase shadow-lg border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all"
                        >
                          Posicionar
                        </button>
                      ) : (
                        <button 
                          disabled={!canAfford && !isSapient}
                          onClick={() => onBuyItem(item.id, isSapient ? 0 : item.price)}
                          className={cn(
                            "w-full py-4 rounded-2xl text-[9px] font-black uppercase flex items-center justify-center gap-2 border-b-4 transition-all active:border-b-0 active:translate-y-1",
                            (canAfford || isSapient) 
                              ? "bg-primary text-white border-primary/70 shadow-lg" 
                              : "bg-zinc-200 text-zinc-400 border-zinc-300 cursor-not-allowed"
                          )}
                        >
                          <Coins className="w-3 h-3" /> {isSapient ? 'GRÁTIS' : `${item.price}`}
                        </button>
                      )}
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

