'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, Package, Home, Zap, ShoppingBag, Palette, LayoutGrid } from 'lucide-react';
import { STUDIO_CATALOG } from '@/lib/studio-catalog';
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

export function ShopDrawer({ 
  isOpen, 
  onClose, 
  userCoins, 
  unlockedItemIds, 
  onBuyItem, 
  onPlaceItem, 
  userName 
}: ShopDrawerProps) {
  const [activeTab, setActiveTab] = useState<string>("Essencial");
  const isSapient = userName?.toLowerCase() === 'sapient';

  const categories = [
    { id: "Essencial", icon: <Home className="w-5 h-5" /> },
    { id: "Ativo", icon: <Zap className="w-5 h-5" /> },
    { id: "Estético", icon: <ShoppingBag className="w-5 h-5" /> },
    { id: "Papel de Parede", icon: <Palette className="w-5 h-5" /> },
    { id: "Piso", icon: <LayoutGrid className="w-5 h-5" /> }
  ];

  const filteredCatalog = STUDIO_CATALOG.filter(item => item.category === activeTab);

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
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className="fixed bottom-0 inset-x-0 h-[85vh] bg-white rounded-t-[4rem] z-[310] flex flex-col shadow-2xl border-t-8 border-white"
          >
            <div className="p-8 flex justify-between items-center bg-white rounded-t-[4rem] shrink-0">
               <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-primary rounded-[1.8rem] flex items-center justify-center text-white shadow-xl">
                     <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div className="flex flex-col">
                     <h2 className="text-3xl font-black text-foreground uppercase italic tracking-tighter leading-none">Ludo Shopping</h2>
                     <div className="bg-yellow-100/50 px-4 py-1.5 rounded-full border border-yellow-200 flex items-center gap-2 mt-1.5 w-fit">
                        <Coins className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-black text-yellow-800 tracking-tighter">{isSapient ? '∞' : userCoins} LC</span>
                     </div>
                  </div>
               </div>
               <button onClick={onClose} className="p-4 bg-zinc-100 text-zinc-400 rounded-full hover:bg-zinc-200 transition-all">
                  <X className="w-6 h-6 stroke-[3]" />
               </button>
            </div>

            <div className="flex gap-3 p-6 overflow-x-auto no-scrollbar bg-white shrink-0 border-b scroll-px-6">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={cn(
                    "px-6 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 border-b-4",
                    activeTab === cat.id 
                      ? "bg-primary text-white border-primary/70 shadow-lg scale-105" 
                      : "bg-zinc-100 text-zinc-400 border-zinc-200"
                  )}
                >
                  {cat.icon} {cat.id}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 gap-6 pb-40 no-scrollbar bg-zinc-50/50">
              {filteredCatalog.map((item) => {
                const countInBackpack = unlockedItemIds.filter(id => id === item.id).length;
                const canAfford = isSapient || userCoins >= item.price;
                const isTexture = item.category === 'Papel de Parede' || item.category === 'Piso';
                
                return (
                  <motion.div 
                    key={item.id}
                    whileTap={{ scale: 0.96 }}
                    className="bg-white rounded-[3rem] p-6 flex flex-col items-center border-b-8 border-zinc-100 shadow-xl relative"
                  >
                    {!isTexture && countInBackpack > 0 && (
                      <div className="absolute top-4 left-4 bg-accent text-white h-9 w-9 rounded-2xl flex items-center justify-center text-[10px] font-black shadow-lg border-2 border-white z-10">
                        {countInBackpack}
                      </div>
                    )}

                    <div className={cn(
                      "w-full aspect-square mb-6 flex items-center justify-center rounded-[2.5rem] p-4 overflow-hidden",
                      isTexture ? "shadow-inner border-4 border-zinc-100" : "bg-zinc-50/50"
                    )}>
                       <img src={item.assetPath} alt={item.name} className={cn("max-w-full max-h-full object-contain drop-shadow-md", isTexture && "scale-[3] object-cover")} />
                    </div>

                    <div className="text-center space-y-1 mb-4">
                      <h3 className="text-[11px] font-black text-foreground uppercase tracking-tight">{item.name}</h3>
                      <div className="flex items-center justify-center gap-1.5 opacity-60">
                        <Coins className="w-3 h-3 text-yellow-600" />
                        <span className="text-[9px] font-black uppercase">{isSapient ? 0 : item.price}</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto w-full">
                      {(countInBackpack > 0 && !isTexture) ? (
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
                          {isSapient ? 'GRÁTIS' : (isTexture ? 'COMPRAR' : 'COMPRAR')}
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
