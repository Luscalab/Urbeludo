
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Coins, Sparkles, Package, Home, Zap, ShoppingBag, Star, Wand2 } from 'lucide-react';
import { STUDIO_CATALOG } from '@/lib/studio-catalog';
import { Badge } from '@/components/ui/badge';
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
            className="fixed inset-0 bg-black/80 z-[200] backdrop-blur-md"
          />

          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[90vh] bg-white rounded-t-[5rem] z-[210] flex flex-col shadow-[0_-50px_100px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Header Sims-Style */}
            <div className="p-10 border-b-8 border-primary/5 flex justify-between items-center bg-zinc-50 rounded-t-[5rem]">
              <div className="space-y-3">
                <h2 className="text-5xl font-black text-primary uppercase italic tracking-tighter leading-none">LudoShop</h2>
                <div className="bg-white px-8 py-3 rounded-[2rem] inline-flex items-center gap-4 shadow-xl border-4 border-primary/5">
                  <Coins className="w-8 h-8 text-yellow-500" />
                  <span className="text-3xl font-black tracking-tighter">{isSapient ? '∞' : userCoins} <span className="text-xs uppercase opacity-30">Moedas</span></span>
                </div>
              </div>
              <div className="flex gap-6">
                <button 
                  onClick={onOpenGenerator}
                  className="h-20 px-10 rounded-[2.5rem] bg-primary text-white font-black uppercase tracking-widest gap-4 shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center border-b-8 border-primary/70"
                >
                  <Wand2 className="w-7 h-7" /> ARQUITETO IA
                </button>
                <button onClick={onClose} className="p-6 bg-white text-primary rounded-[2.5rem] shadow-2xl hover:scale-110 active:scale-95 transition-all border-4 border-primary/5">
                  <X className="w-8 h-8 stroke-[4]" />
                </button>
              </div>
            </div>

            {/* Categorias Estilo Sims 2026 */}
            <div className="flex gap-4 p-8 overflow-x-auto no-scrollbar bg-white border-b-4 border-primary/5 sticky top-0 z-30">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={cn(
                    "px-10 py-5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shrink-0",
                    activeTab === cat.id 
                      ? "bg-primary text-white shadow-2xl scale-105" 
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  {cat.icon} {cat.id}
                </button>
              ))}
            </div>

            {/* Grid de Itens */}
            <div className="flex-1 overflow-y-auto p-10 grid grid-cols-2 md:grid-cols-3 gap-8 pb-40 no-scrollbar bg-zinc-50/50">
              {filteredCatalog.map((item) => {
                const countInInventory = unlockedItemIds.filter(id => id === item.id).length;
                const canAfford = isSapient || userCoins >= item.price;
                const isSpecial = item.category === 'Especial' || item.isAiGenerated;

                return (
                  <motion.div 
                    key={item.id}
                    whileTap={{ scale: 0.96 }}
                    className={cn(
                      "bg-white rounded-[4rem] p-8 flex flex-col items-center border-8 transition-all relative group shadow-lg",
                      isSpecial ? "border-accent/30 shadow-accent/5" : "border-white hover:border-primary/20 shadow-primary/5"
                    )}
                  >
                    {countInInventory > 0 && (
                      <div className="absolute top-6 left-6 bg-blue-600 text-white px-5 py-2 rounded-full text-[10px] font-black shadow-2xl z-20">
                        EM USO: {countInInventory}
                      </div>
                    )}

                    {item.isAiGenerated && (
                      <div className="absolute top-6 right-6 bg-accent text-white p-3 rounded-2xl shadow-2xl z-20">
                        <Sparkles className="w-5 h-5" />
                      </div>
                    )}

                    <div className="w-40 h-40 mb-8 flex items-center justify-center bg-muted/20 rounded-[3rem] shadow-inner border-4 border-white overflow-hidden p-6 relative">
                       <img src={item.assetPath} alt={item.name} className="max-w-full max-h-full object-contain drop-shadow-2xl group-hover:scale-115 transition-transform duration-700" />
                    </div>

                    <div className="text-center mb-8 space-y-2">
                      <h3 className="text-lg font-black text-foreground uppercase italic tracking-tighter leading-none">{item.name}</h3>
                      <p className="text-[10px] text-muted-foreground font-bold leading-tight px-6 opacity-60">{item.description}</p>
                    </div>
                    
                    <div className="mt-auto w-full space-y-4">
                      {countInInventory > 0 && (
                        <button 
                          onClick={() => onPlaceItem(item.id)}
                          className="w-full py-5 bg-green-500 text-white rounded-[2rem] text-[12px] font-black uppercase flex items-center justify-center gap-3 shadow-2xl shadow-green-500/20 active:scale-95 border-b-8 border-green-700 active:border-b-0"
                        >
                          <Package className="w-5 h-5" /> POSICIONAR NO STUDIO
                        </button>
                      )}
                      
                      {!item.isAiGenerated && (
                        <button 
                          disabled={!canAfford && !isSapient}
                          onClick={() => onBuyItem(item.id, isSapient ? 0 : item.price)}
                          className={cn(
                            "w-full py-5 rounded-[2rem] text-[12px] font-black uppercase flex items-center justify-center gap-3 transition-all active:scale-95 border-b-8",
                            (canAfford || isSapient) 
                              ? "bg-primary text-white shadow-2xl shadow-primary/20 border-primary-foreground/20 active:border-b-0" 
                              : "bg-muted text-muted-foreground opacity-40 cursor-not-allowed border-transparent"
                          )}
                        >
                          {!canAfford && !isSapient && <Lock className="w-5 h-5" />}
                          <Coins className="w-5 h-5" /> {isSapient ? 'GRÁTIS' : item.price}
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

function Button(props: any) {
  return <button {...props} className={cn("inline-flex items-center justify-center", props.className)} />;
}
