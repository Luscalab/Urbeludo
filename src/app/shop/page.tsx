"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { 
  ArrowLeft, 
  Coins, 
  Shirt, 
  Home as HomeIcon, 
  Zap,
  Star,
  Gamepad2,
  Lock,
  Eye,
  Check,
  ShoppingBag
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ShopItem {
  id: string;
  name: string;
  price: number;
  category: 'vestiario' | 'decoracao' | 'aura';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  levelGate?: number; // Minimum psychomotor level required
  challengeGate?: number; // Minimum total challenges required
  image: string;
}

const LUDO_SHOP_ITEMS: ShopItem[] = [
  // --- VESTIÁRIO ---
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

  // --- DECORAÇÃO ---
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
    id: 'cyber-chair', 
    name: 'Poltrona Gravity', 
    price: 1200, 
    category: 'decoracao', 
    rarity: 'epic',
    description: 'Flutua 10cm acima do chão. O ápice do conforto digital.',
    challengeGate: 25,
    image: 'https://picsum.photos/seed/chair/400'
  },

  // --- AURA ---
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
  const db = useFirestore();
  const { toast } = useToast();
  const [previewItem, setPreviewItem] = useState<ShopItem | null>(null);
  
  const userProgressRef = useMemoFirebase(() => user ? doc(db, 'user_progress', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userProgressRef);

  const ludoCoins = profile?.ludoCoins || 0;
  const unlockedItems = profile?.avatar?.unlockedItems || [];
  const currentLevel = profile?.psychomotorLevel || 1;
  const totalCompleted = profile?.totalChallengesCompleted || 0;

  const handleBuy = (item: ShopItem) => {
    if (ludoCoins < item.price) {
      toast({ variant: 'destructive', title: 'Saldo Insuficiente', description: 'Mova-se mais para ganhar LudoCoins!' });
      return;
    }

    if (item.levelGate && currentLevel < item.levelGate) {
      toast({ variant: 'destructive', title: 'Nível Bloqueado', description: `Necessário Nível ${item.levelGate}.` });
      return;
    }

    if (item.challengeGate && totalCompleted < item.challengeGate) {
      toast({ variant: 'destructive', title: 'Experiência Insuficiente', description: `Complete ${item.challengeGate} desafios primeiro.` });
      return;
    }

    const newUnlocked = [...unlockedItems, item.id];
    updateDocumentNonBlocking(userProgressRef!, {
      ludoCoins: ludoCoins - item.price,
      avatar: { ...profile?.avatar, unlockedItems: newUnlocked }
    });

    toast({ title: 'Item Desbloqueado!', description: `${item.name} agora é seu.` });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      <header className="px-6 h-20 flex items-center border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/dashboard" className="mr-4"><ArrowLeft className="w-6 h-6" /></Link>
        <div className="flex-1">
          <h1 className="text-xl font-black uppercase italic tracking-tighter">LudoShop</h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Estilo Um Studio</p>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-2xl flex items-center gap-2 border border-primary/20">
          <Coins className="w-5 h-5 text-yellow-600" />
          <span className="font-black text-lg">{ludoCoins}</span>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8">
        {/* Provador Interativo Simulation */}
        {previewItem && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-300">
             <div className="relative w-full aspect-square max-w-sm rounded-[3rem] overflow-hidden bg-slate-900 mb-8 border-4 border-primary/50">
                <img src={previewItem.image} alt="Preview" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <div className="absolute bottom-8 inset-x-0">
                   <h3 className="text-2xl font-black text-white uppercase italic">{previewItem.name}</h3>
                   <Badge className="bg-primary text-white mt-2">Modo Provador</Badge>
                </div>
             </div>
             <p className="text-white/60 text-sm mb-8 max-w-xs">{previewItem.description}</p>
             <div className="flex gap-4 w-full max-w-sm">
                <Button variant="outline" className="flex-1 h-14 rounded-2xl border-white/20 text-white font-bold" onClick={() => setPreviewItem(null)}>Voltar</Button>
                <Button className="flex-1 h-14 rounded-2xl font-black uppercase" onClick={() => { handleBuy(previewItem); setPreviewItem(null); }}>Comprar</Button>
             </div>
          </div>
        )}

        <Tabs defaultValue="vestiario" className="space-y-6">
          <TabsList className="w-full bg-muted/30 rounded-2xl p-1 h-auto flex gap-1">
            <TabsTrigger value="vestiario" className="flex-1 py-3 rounded-xl gap-2 font-black uppercase text-[10px]">
              <Shirt className="w-4 h-4" /> Vestiário
            </TabsTrigger>
            <TabsTrigger value="decoracao" className="flex-1 py-3 rounded-xl gap-2 font-black uppercase text-[10px]">
              <HomeIcon className="w-4 h-4" /> Decoração
            </TabsTrigger>
            <TabsTrigger value="aura" className="flex-1 py-3 rounded-xl gap-2 font-black uppercase text-[10px]">
              <Zap className="w-4 h-4" /> Auras
            </TabsTrigger>
          </TabsList>

          {['vestiario', 'decoracao', 'aura'].map(cat => (
            <TabsContent key={cat} value={cat} className="grid grid-cols-1 gap-4">
              {LUDO_SHOP_ITEMS.filter(i => i.category === cat).map(item => {
                const isLocked = (item.levelGate && currentLevel < item.levelGate) || (item.challengeGate && totalCompleted < item.challengeGate);
                const isUnlocked = unlockedItems.includes(item.id);

                return (
                  <Card key={item.id} className={cn(
                    "relative overflow-hidden border-none rounded-[2rem] shadow-sm transition-all active:scale-95",
                    isUnlocked ? "bg-primary/5" : "bg-white"
                  )}>
                    <div className="flex p-4 gap-4">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-muted shrink-0 relative">
                        <img src={item.image} alt={item.name} className={cn("w-full h-full object-cover", isLocked && "grayscale")} />
                        {isLocked && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Lock className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-w-0">
                        <div className="flex justify-between items-start">
                           <h3 className="font-black uppercase italic tracking-tighter text-sm truncate">{item.name}</h3>
                           <div className="flex items-center gap-1">
                              <Coins className="w-3 h-3 text-yellow-600" />
                              <span className="text-xs font-black">{item.price}</span>
                           </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium line-clamp-2 mt-1">{item.description}</p>
                        <div className="mt-2 flex gap-2">
                           {isUnlocked ? (
                             <Badge variant="secondary" className="bg-primary/20 text-primary border-none text-[8px] uppercase font-black"><Check className="w-2 h-2 mr-1" /> Adquirido</Badge>
                           ) : (
                             <>
                               <Button size="sm" variant="ghost" className="h-8 rounded-xl text-[9px] font-black uppercase" onClick={() => setPreviewItem(item)}><Eye className="w-3 h-3 mr-1" /> Testar</Button>
                               <Button size="sm" className="h-8 rounded-xl text-[9px] font-black uppercase" disabled={isLocked} onClick={() => handleBuy(item)}>{isLocked ? "Bloqueado" : "Comprar"}</Button>
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
         <Link href="/playground" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary"><Zap className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Play</span></Link>
         <Link href="/dashboard" className="flex flex-col items-center gap-1 text-muted-foreground"><Gamepad2 className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Estúdio</span></Link>
         <div className="flex flex-col items-center gap-1 text-primary"><ShoppingBag className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Loja</span></div>
      </footer>
    </div>
  );
}