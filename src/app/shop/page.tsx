"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { 
  ArrowLeft, 
  Coins, 
  Shirt, 
  Home as HomeIcon, 
  Zap,
  Gamepad2,
  Lock,
  Eye,
  Check,
  ShoppingBag
} from 'lucide-react';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useI18n } from '@/components/I18nProvider';

interface ShopItem {
  id: string;
  name: string;
  price: number;
  category: 'vestiario' | 'decoracao' | 'aura';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  levelGate?: number;
  challengeGate?: number;
  image: string;
}

const LUDO_SHOP_ITEMS: ShopItem[] = [
  { 
    id: 'foundation-sneakers', 
    name: 'Tênis de Alicerce', 
    price: 0, 
    category: 'vestiario', 
    rarity: 'common',
    description: 'O primeiro passo da sua jornada. Confortável e minimalista.',
    image: 'https://picsum.photos/seed/sneakers1/400'
  },
  { 
    id: 'neon-sneakers', 
    name: 'Tênis Pulse Neon', 
    price: 350, 
    category: 'vestiario', 
    rarity: 'rare',
    description: 'Brilha em sincronia com seu movimento. Estilo Um Studio.',
    challengeGate: 10,
    image: 'https://picsum.photos/seed/sneakers-neon/400'
  },
  { 
    id: 'rhythm-visor', 
    name: 'Visor Rítmico', 
    price: 800, 
    category: 'vestiario', 
    rarity: 'epic',
    description: 'Exibe padrões de onda baseados na sua precisão motora.',
    levelGate: 4,
    image: 'https://picsum.photos/seed/visor/400'
  },
  { 
    id: 'zen-rug', 
    name: 'Tapete de Treino Zen', 
    price: 200, 
    category: 'decoracao', 
    rarity: 'common',
    description: 'Um tapete minimalista para suas missões de casa.',
    image: 'https://picsum.photos/seed/rug/400'
  },
  { 
    id: 'blue-precision-aura', 
    name: 'Aura de Precisão Azul', 
    price: 2500, 
    category: 'aura', 
    rarity: 'legendary',
    description: 'Um rastro de luz azul que aparece quando você atinge o equilíbrio perfeito.',
    levelGate: 3,
    challengeGate: 50,
    image: 'https://picsum.photos/seed/aura-blue/400'
  }
];

export default function ShopPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const { t } = useI18n();
  const [previewItem, setPreviewItem] = useState<ShopItem | null>(null);
  
  // Standalone: Usamos referências fake
  const userProgressRef = useMemoFirebase(() => user ? { id: user.uid, path: `user_progress/${user.uid}` } : null, [user]);
  const { data: profile } = useDoc(userProgressRef);

  const ludoCoins = profile?.ludoCoins || 0;
  const unlockedItems = profile?.avatar?.unlockedItems || [];
  const currentLevel = profile?.psychomotorLevel || 1;
  const totalCompleted = profile?.totalChallengesCompleted || 0;

  const handleBuy = (item: ShopItem) => {
    if (ludoCoins < item.price) {
      toast({ variant: 'destructive', title: t('shop.balance'), description: t('shop.balanceDesc') });
      return;
    }

    if (item.levelGate && currentLevel < item.levelGate) {
      toast({ variant: 'destructive', title: 'Nível Bloqueado', description: `Necessário Nível ${item.levelGate}.` });
      return;
    }

    const newUnlocked = [...unlockedItems, item.id];
    if (userProgressRef) {
      updateDocumentNonBlocking(userProgressRef, {
        ludoCoins: ludoCoins - item.price,
        avatar: { ...profile?.avatar, unlockedItems: newUnlocked }
      });
    }

    toast({ title: t('shop.unlocked'), description: `${item.name} ${t('shop.unlockedDesc')}` });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      <header className="px-6 h-16 flex items-center border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/dashboard" className="mr-4"><ArrowLeft className="w-5 h-5 text-primary" /></Link>
        <div className="flex-1">
          <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none">{t('shop.title')}</h1>
          <p className="text-[9px] font-bold text-muted-foreground uppercase">{t('shop.subtitle')}</p>
        </div>
        <div className="bg-primary/10 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-primary/20">
          <Coins className="w-4 h-4 text-yellow-600" />
          <span className="font-black text-sm">{ludoCoins}</span>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 container max-w-lg mx-auto">
        {previewItem && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
             <div className="relative w-full aspect-square max-w-xs rounded-[3rem] overflow-hidden bg-slate-900 mb-6 border-4 border-primary/50">
                <img src={previewItem.image} alt="Preview" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <div className="absolute bottom-6 inset-x-0">
                   <h3 className="text-xl font-black text-white uppercase italic">{previewItem.name}</h3>
                   <Badge className="bg-primary text-white mt-1 text-[8px] uppercase">{t('shop.test')}</Badge>
                </div>
             </div>
             <p className="text-white/60 text-[11px] mb-8 max-w-xs">{previewItem.description}</p>
             <div className="flex gap-4 w-full max-w-xs">
                <Button variant="outline" className="flex-1 h-14 rounded-2xl border-white/20 text-white font-bold uppercase text-[10px]" onClick={() => setPreviewItem(null)}>{t('common.back')}</Button>
                <Button className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px]" onClick={() => { handleBuy(previewItem); setPreviewItem(null); }}>{t('shop.buy')}</Button>
             </div>
          </div>
        )}

        <Tabs defaultValue="vestiario" className="space-y-6">
          <TabsList className="w-full bg-muted/30 rounded-2xl p-1 h-auto flex gap-1">
            <TabsTrigger value="vestiario" className="flex-1 py-3 rounded-xl gap-2 font-black uppercase text-[9px]">
              <Shirt className="w-4 h-4" /> {t('shop.vestiario')}
            </TabsTrigger>
            <TabsTrigger value="decoracao" className="flex-1 py-3 rounded-xl gap-2 font-black uppercase text-[9px]">
              <HomeIcon className="w-4 h-4" /> {t('shop.decoracao')}
            </TabsTrigger>
            <TabsTrigger value="aura" className="flex-1 py-3 rounded-xl gap-2 font-black uppercase text-[9px]">
              <Zap className="w-4 h-4" /> {t('shop.auras')}
            </TabsTrigger>
          </TabsList>

          {['vestiario', 'decoracao', 'aura'].map(cat => (
            <TabsContent key={cat} value={cat} className="grid grid-cols-1 gap-4">
              {LUDO_SHOP_ITEMS.filter(i => i.category === cat).map(item => {
                const isLocked = (item.levelGate && currentLevel < item.levelGate) || (item.challengeGate && totalCompleted < item.challengeGate);
                const isUnlocked = unlockedItems.includes(item.id);

                return (
                  <Card key={item.id} className={cn(
                    "relative overflow-hidden border-none rounded-[2.5rem] shadow-sm transition-all active:scale-98",
                    isUnlocked ? "bg-primary/5" : "bg-white"
                  )}>
                    <div className="flex p-4 gap-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-muted shrink-0 relative">
                        <img src={item.image} alt={item.name} className={cn("w-full h-full object-cover", isLocked && "grayscale")} />
                        {isLocked && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Lock className="w-5 h-5 text-white" /></div>}
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-w-0">
                        <div className="flex justify-between items-start">
                           <h3 className="font-black uppercase italic tracking-tighter text-xs truncate">{item.name}</h3>
                           <div className="flex items-center gap-1">
                              <Coins className="w-3 h-3 text-yellow-600" />
                              <span className="text-[10px] font-black">{item.price}</span>
                           </div>
                        </div>
                        <p className="text-[9px] text-muted-foreground font-medium line-clamp-2 mt-1">{item.description}</p>
                        <div className="mt-2 flex gap-2">
                           {isUnlocked ? (
                             <Badge variant="secondary" className="bg-primary/20 text-primary border-none text-[8px] uppercase font-black"><Check className="w-2 h-2 mr-1" /> {t('shop.acquired')}</Badge>
                           ) : (
                             <>
                               <Button size="sm" variant="ghost" className="h-8 rounded-xl text-[8px] font-black uppercase px-3" onClick={() => setPreviewItem(item)}><Eye className="w-3 h-3 mr-1" /> {t('shop.test')}</Button>
                               <Button size="sm" className="h-8 rounded-xl text-[8px] font-black uppercase px-4" disabled={isLocked} onClick={() => handleBuy(item)}>{isLocked ? t('shop.locked') : t('shop.buy')}</Button>
                             </>
                           )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <footer className="fixed bottom-0 inset-x-0 h-20 bg-background border-t flex items-center justify-around px-6 z-50">
         <Link href="/playground" className="flex flex-col items-center gap-1 text-muted-foreground"><Zap className="w-5 h-5" /><span className="text-[8px] font-black uppercase">{t('common.play')}</span></Link>
         <Link href="/dashboard" className="flex flex-col items-center gap-1 text-muted-foreground"><Gamepad2 className="w-5 h-5" /><span className="text-[8px] font-black uppercase">{t('dashboard.studioTitle')}</span></Link>
         <div className="flex flex-col items-center gap-1 text-primary"><ShoppingBag className="w-5 h-5" /><span className="text-[8px] font-black uppercase">{t('common.shop')}</span></div>
      </footer>
    </div>
  );
}
