'use client';

import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { STUDIO_CATALOG } from '@/lib/studio-catalog';
import { Coins, ShoppingBag, Plus } from 'lucide-react';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export function ShopDrawer({ onBuy }: { onBuy: (itemId: string) => void }) {
  const { user } = useUser();
  const { toast } = useToast();
  const userProgressRef = useMemoFirebase(() => user ? { id: user.uid, path: `user_progress/${user.uid}` } : null, [user]);
  const { data: profile } = useDoc(userProgressRef);

  const ludoCoins = profile?.ludoCoins || 0;

  const handlePurchase = (item: any) => {
    if (ludoCoins < item.price) {
      toast({
        variant: 'destructive',
        title: 'Saldo Insuficiente',
        description: `Mova-se mais para ganhar LudoCoins!`
      });
      return;
    }

    updateDocumentNonBlocking(userProgressRef, {
      ludoCoins: ludoCoins - item.price
    });

    onBuy(item.id);
    toast({
      title: 'Item Adquirido!',
      description: `${item.name} foi adicionado ao seu estúdio.`
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="rounded-full h-16 w-16 shadow-2xl bg-primary hover:scale-110 transition-transform border-b-4 border-primary/80">
          <ShoppingBag className="w-7 h-7" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-[3rem] h-[75vh] border-none bg-background/95 backdrop-blur-xl">
        <SheetHeader className="mb-6">
          <div className="flex justify-between items-center px-4">
            <div className="space-y-1">
              <SheetTitle className="text-2xl font-black uppercase italic tracking-tighter">Ludo Studio Shop</SheetTitle>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Equipe seu espaço de treino</p>
            </div>
            <div className="bg-primary/10 px-4 py-2 rounded-2xl flex items-center gap-2 border border-primary/20 shadow-inner">
              <Coins className="w-4 h-4 text-yellow-600" />
              <span className="font-black text-sm">{ludoCoins}</span>
            </div>
          </div>
        </SheetHeader>
        <div className="grid gap-4 overflow-y-auto pb-16 px-2 no-scrollbar">
          {STUDIO_CATALOG.map(item => (
            <div key={item.id} className="bg-white rounded-[2.5rem] p-5 flex items-center gap-5 shadow-sm border border-primary/5 hover:border-primary/20 transition-colors">
              <div className="w-20 h-20 bg-muted/30 rounded-3xl flex items-center justify-center text-4xl shadow-inner border border-white">
                {item.assetPath}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-black uppercase text-xs italic">{item.name}</h4>
                  <Badge variant="outline" className="text-[7px] font-black uppercase py-0 px-2 h-4">{item.category}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight mt-1 line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Coins className="w-3 h-3 text-yellow-600" />
                  <span className="text-[11px] font-black">{item.price} LC</span>
                </div>
              </div>
              <Button onClick={() => handlePurchase(item)} className="rounded-2xl h-12 w-12 p-0 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                <Plus className="w-6 h-6" />
              </Button>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
