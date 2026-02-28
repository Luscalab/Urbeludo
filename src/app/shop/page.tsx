
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
  User as UserIcon, 
  Dog, 
  Home as FurnitureIcon, 
  Shirt, 
  Ghost as HatIcon,
  ShoppingBag,
  Sparkles,
  Check
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
  category: 'avatar' | 'pets' | 'furniture' | 'clothes' | 'hats';
  description: string;
  image: string;
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 'neon-watch', name: 'Relógio Neon', price: 150, category: 'avatar', description: 'Um acessório rítmico pulsante.', image: 'https://picsum.photos/seed/watch/200' },
  { id: 'cyber-pup', name: 'Cyber Dog', price: 500, category: 'pets', description: 'Um companheiro robótico leal.', image: 'https://picsum.photos/seed/dog/200' },
  { id: 'urban-sofa', name: 'Sofá de Concreto', price: 300, category: 'furniture', description: 'Conforto brutalista para sua casa.', image: 'https://picsum.photos/seed/sofa/200' },
  { id: 'tech-hoodie', name: 'Tech Hoodie', price: 120, category: 'clothes', description: 'À prova d\'água e cheio de estilo.', image: 'https://picsum.photos/seed/hoodie/200' },
  { id: 'gravity-cap', name: 'Boné Gravidade', price: 80, category: 'hats', description: 'Nunca cai, nem durante saltos.', image: 'https://picsum.photos/seed/cap/200' },
  { id: 'aura-level4', name: 'Aura de Ritmo', price: 1000, category: 'avatar', description: 'Efeito visual épico de Nível 4.', image: 'https://picsum.photos/seed/aura/200' },
  { id: 'cat-drone', name: 'Gato Drone', price: 450, category: 'pets', description: 'Vigia seu progresso do alto.', image: 'https://picsum.photos/seed/cat/200' },
];

export default function ShopPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const userProgressRef = useMemoFirebase(() => user ? doc(db, 'user_progress', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userProgressRef);

  const ludoCoins = profile?.ludoCoins || 0;
  const unlockedItems = profile?.avatar?.unlockedItems || [];

  const handleBuy = (item: ShopItem) => {
    if (ludoCoins < item.price) {
      toast({ variant: 'destructive', title: 'Saldo Insuficiente', description: 'Complete mais desafios para ganhar LudoCoins!' });
      return;
    }

    if (unlockedItems.includes(item.id)) {
      toast({ title: 'Item já Desbloqueado' });
      return;
    }

    const newUnlocked = [...unlockedItems, item.id];
    const newCoins = ludoCoins - item.price;

    updateDocumentNonBlocking(userProgressRef!, {
      ludoCoins: newCoins,
      avatar: {
        ...profile?.avatar,
        unlockedItems: newUnlocked
      }
    });

    toast({
      title: 'Compra Realizada!',
      description: `${item.name} foi adicionado à sua coleção.`,
    });
  };

  const categories = [
    { id: 'avatar', label: 'Personagem', icon: <UserIcon className="w-4 h-4" /> },
    { id: 'pets', label: 'Pets', icon: <Dog className="w-4 h-4" /> },
    { id: 'furniture', label: 'Móveis', icon: <FurnitureIcon className="w-4 h-4" /> },
    { id: 'clothes', label: 'Roupas', icon: <Shirt className="w-4 h-4" /> },
    { id: 'hats', label: 'Chapéus', icon: <HatIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 h-20 flex items-center border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2 mr-6">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <UrbeLudoLogo className="w-8 h-8 text-primary" />
          <span className="text-lg font-headline font-bold tracking-tight">Loja do Estúdio</span>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-2xl flex items-center gap-2 border border-primary/20">
          <Coins className="w-5 h-5 text-yellow-600" />
          <span className="font-bold">{ludoCoins}</span>
        </div>
      </header>

      <main className="flex-1 p-6 container mx-auto max-w-6xl">
        <div className="mb-10 text-center space-y-2">
          <Badge className="bg-accent text-accent-foreground px-4 py-1 text-xs uppercase font-black tracking-widest">Coleção Exclusiva</Badge>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Estilize seu Mundo</h1>
          <p className="text-muted-foreground">Transforme seu progresso físico em conquistas digitais.</p>
        </div>

        <Tabs defaultValue="avatar" className="space-y-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto p-1 bg-muted/50 rounded-2xl">
            {categories.map(cat => (
              <TabsTrigger 
                key={cat.id} 
                value={cat.id}
                className="rounded-xl py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm flex flex-col gap-1 md:flex-row md:gap-2"
              >
                {cat.icon}
                <span className="text-[10px] md:text-sm font-bold uppercase">{cat.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(cat => (
            <TabsContent key={cat.id} value={cat.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {SHOP_ITEMS.filter(item => item.category === cat.id).map(item => (
                  <Card key={item.id} className="group overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300">
                    <div className="aspect-square relative overflow-hidden bg-muted">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                        data-ai-hint={item.name}
                      />
                      {unlockedItems.includes(item.id) && (
                        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center">
                          <Badge className="bg-primary text-white scale-150"><Check className="w-4 h-4 mr-1"/> Adquirido</Badge>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                         <Badge variant="secondary" className="bg-white/90 backdrop-blur-md flex gap-1 items-center">
                            <Coins className="w-3 h-3 text-yellow-600" />
                            {item.price}
                         </Badge>
                      </div>
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg font-black uppercase tracking-tight">{item.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-4">
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                      <Button 
                        onClick={() => handleBuy(item)} 
                        disabled={unlockedItems.includes(item.id)}
                        className={cn(
                          "w-full rounded-xl font-bold uppercase tracking-widest h-12",
                          unlockedItems.includes(item.id) ? "bg-muted text-muted-foreground" : ""
                        )}
                      >
                        {unlockedItems.includes(item.id) ? 'Desbloqueado' : 'Comprar Item'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <footer className="p-8 text-center text-muted-foreground border-t mt-20">
        <Sparkles className="w-8 h-8 mx-auto mb-4 text-primary/40" />
        <p className="text-xs font-bold uppercase tracking-[0.2em]">O seu progresso físico molda o seu avatar digital</p>
      </footer>
    </div>
  );
}
