'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, CheckCircle2, Coins, Sparkles } from 'lucide-react';
import { STUDIO_CATALOG } from '@/lib/studio-catalog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ShopDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userCoins: number;
  unlockedItemIds: string[];
  onBuyItem: (itemId: string, price: number) => void;
}

export function ShopDrawer({ isOpen, onClose, userCoins, unlockedItemIds, onBuyItem }: ShopDrawerProps) {
  const [activeTab, setActiveTab] = useState<string>("Todos");

  const categories = ["Todos", "Ativo", "Estético", "Essencial", "Especial"];

  const filteredCatalog = activeTab === "Todos" 
    ? STUDIO_CATALOG 
    : STUDIO_CATALOG.filter(item => item.category === activeTab);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 h-[75vh] bg-background rounded-t-[3.5rem] z-[210] flex flex-col shadow-2xl border-t-8 border-primary"
          >
            <div className="p-8 border-b border-muted flex justify-between items-start bg-primary/5 rounded-t-[3.5rem]">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-primary uppercase italic tracking-tighter">Ludo Shop</h2>
                <div className="bg-white/50 border border-primary/10 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-inner">
                  <Coins className="w-5 h-5 text-yellow-600" />
                  <span className="text-lg font-black text-foreground">{userCoins} <span className="text-[10px] uppercase opacity-60">LC</span></span>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-3 bg-white text-primary rounded-2xl shadow-sm hover:scale-110 active:scale-95 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar border-b border-muted">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={cn(
                    "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === cat 
                      ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" 
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-4 pb-24 no-scrollbar">
              {filteredCatalog.map((item) => {
                const isUnlocked = unlockedItemIds.includes(item.id);
                const canAfford = userCoins >= item.price;
                const isSpecial = item.category === 'Especial';

                return (
                  <motion.div 
                    key={item.id}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "bg-white rounded-[2.5rem] p-5 flex flex-col items-center border-4 transition-all relative group",
                      isSpecial ? "border-accent/20 bg-accent/5" : "border-muted/20 hover:border-primary/20"
                    )}
                  >
                    {isSpecial && (
                      <div className="absolute top-3 right-3 text-accent">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                      </div>
                    )}
                    
                    <div className="w-24 h-24 mb-4 flex items-center justify-center bg-muted/30 rounded-3xl shadow-inner border border-white relative overflow-hidden p-2">
                       <img 
                        src={item.assetPath} 
                        alt={item.name} 
                        className="max-w-full max-h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const span = e.currentTarget.parentElement?.querySelector('.fallback-emoji-shop');
                          if (span) (span as HTMLElement).style.display = 'block';
                        }}
                       />
                       <span className="fallback-emoji-shop hidden text-4xl">🎁</span>
                       {item.category === 'Ativo' && (
                         <Badge className="absolute bottom-1 right-1 bg-green-500 text-[7px] font-black px-1.5">+MOD</Badge>
                       )}
                    </div>

                    <div className="text-center mb-4 space-y-1">
                      <h3 className="text-[11px] font-black text-foreground uppercase italic leading-none">{item.name}</h3>
                      <p className="text-[8px] text-muted-foreground font-bold leading-tight px-2">{item.description}</p>
                    </div>
                    
                    {isUnlocked && item.category !== 'Ativo' ? (
                       <div className="mt-auto w-full py-3 bg-green-100 text-green-700 rounded-2xl text-[9px] font-black uppercase flex items-center justify-center gap-2">
                         <CheckCircle2 className="w-4 h-4" /> Adquirido
                       </div>
                    ) : (
                      <button 
                        disabled={!canAfford}
                        onClick={() => onBuyItem(item.id, item.price)}
                        className={cn(
                          "mt-auto w-full py-3 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md",
                          canAfford 
                            ? "bg-primary text-white hover:bg-primary/90 shadow-primary/20" 
                            : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                        )}
                      >
                        {!canAfford && <Lock className="w-3.5 h-3.5" />}
                        <Coins className="w-3.5 h-3.5" /> {item.price}
                      </button>
                    )}
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
