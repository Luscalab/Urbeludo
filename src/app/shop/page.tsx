
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
  Check,
  Zap,
  Star,
  Gamepad2
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ShopItem {
  id: string;
  name: string;
  breed?: string;
  price: number;
  category: 'avatar' | 'pets' | 'furniture' | 'clothes' | 'hats';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  animationHint: string;
  image: string;
}

const SHOP_ITEMS: ShopItem[] = [
  // --- PETS ---
  { 
    id: 'cyber-husky', 
    name: 'Cyber Husky', 
    breed: 'Husky Siberiano',
    price: 600, 
    category: 'pets', 
    rarity: 'epic',
    description: 'Um pet de gelo digital que deixa rastros de neon por onde passa.', 
    animationHint: 'Uiva frequências de som e corre em círculos digitais.',
    image: 'https://picsum.photos/seed/husky/400' 
  },
  { 
    id: 'neon-siamese', 
    name: 'Gato Neon', 
    breed: 'Siamês Quantum',
    price: 450, 
    category: 'pets', 
    rarity: 'rare',
    description: 'Elegante e furtivo, ele detecta bordas urbanas antes de você.', 
    animationHint: 'Se espreguiça emitindo pulsos de luz azul.',
    image: 'https://picsum.photos/seed/siamese/400' 
  },
  { 
    id: 'gravity-turtle', 
    name: 'Tartaruga Gravitacional', 
    breed: 'Galápagos-Void',
    price: 800, 
    category: 'pets', 
    rarity: 'legendary',
    description: 'Flutua ao seu lado, ajudando no equilíbrio estático.', 
    animationHint: 'Gira o casco lentamente criando um campo de gravidade zero.',
    image: 'https://picsum.photos/seed/turtle/400' 
  },
  { 
    id: 'techno-shiba', 
    name: 'Techno Shiba', 
    breed: 'Shiba Inu Digital',
    price: 350, 
    category: 'pets', 
    rarity: 'common',
    description: 'Sempre animado para uma missão de rua.', 
    animationHint: 'Abana o rabo de fibra óptica freneticamente.',
    image: 'https://picsum.photos/seed/shiba/400' 
  },

  // --- CLOTHES (ROUPAS) ---
  { 
    id: 'kinetic-suit', 
    name: 'Traje Cinético', 
    price: 250, 
    category: 'clothes', 
    rarity: 'epic',
    description: 'Roupa que brilha intensamente durante movimentos bruscos.', 
    animationHint: 'As linhas de costura mudam de cor com seu batimento cardíaco.',
    image: 'https://picsum.photos/seed/suit/400' 
  },
  { 
    id: 'flow-cape', 
    name: 'Capa Flow', 
    price: 180, 
    category: 'clothes', 
    rarity: 'rare',
    description: 'Uma capa semi-transparente que segue o fluxo do vento.', 
    animationHint: 'Ondula suavemente mesmo em ambientes fechados.',
    image: 'https://picsum.photos/seed/cape/400' 
  },
  { 
    id: 'rhythm-sneakers', 
    name: 'Tênis Rítmico', 
    price: 120, 
    category: 'clothes', 
    rarity: 'common',
    description: 'Solado que deixa pegadas de luz no asfalto.', 
    animationHint: 'Solta faíscas neon quando você pula.',
    image: 'https://picsum.photos/seed/sneakers/400' 
  },

  // --- HATS (CHAPÉUS) ---
  { 
    id: 'freq-visor', 
    name: 'Visor de Frequência', 
    price: 300, 
    category: 'hats', 
    rarity: 'epic',
    description: 'Analisa elementos urbanos em tempo real nos seus olhos.', 
    animationHint: 'Dados digitais descem pela lente como chuva de Matrix.',
    image: 'https://picsum.photos/seed/visor/400' 
  },
  { 
    id: 'halo-crown', 
    name: 'Coroa de Luz', 
    price: 1200, 
    category: 'hats', 
    rarity: 'legendary',
    description: 'O símbolo supremo de quem dominou o Nível 4: Ritmo.', 
    animationHint: 'Gira sobre a cabeça emanando anéis de energia.',
    image: 'https://picsum.photos/seed/halo/400' 
  },

  // --- FURNITURE (MÓVEIS) ---
  { 
    id: 'zen-cube', 
    name: 'Cubo Zen', 
    price: 500, 
    category: 'furniture', 
    rarity: 'rare',
    description: 'Um puff flutuante para seu avatar meditar.', 
    animationHint: 'Pulsa uma luz quente e sobe/desce suavemente.',
    image: 'https://picsum.photos/seed/cube/400' 
  },
  { 
    id: 'data-plant', 
    name: 'Planta de Dados', 
    price: 150, 
    category: 'furniture', 
    rarity: 'common',
    description: 'Folhas que crescem conforme você completa desafios.', 
    animationHint: 'As folhas balançam e brilham quando você entra na casa.',
    image: 'https://picsum.photos/seed/plant/400' 
  },

  // --- AVATAR ---
  { 
    id: 'aura-pulsar', 
    name: 'Aura Pulsar', 
    price: 1500, 
    category: 'avatar', 
    rarity: 'legendary',
    description: 'O efeito visual definitivo de energia vital.', 
    animationHint: 'O avatar fica envolto em chamas de neon constantes.',
    image: 'https://picsum.photos/seed/aura2/400' 
  },
  { 
    id: 'glitch-skin', 
    name: 'Pele Glitch', 
    price: 900, 
    category: 'avatar', 
    rarity: 'epic',
    description: 'Efeito de distorção digital para um visual cyberpunk.', 
    animationHint: 'Partes do corpo desaparecem e reaparecem em milissegundos.',
    image: 'https://picsum.photos/seed/glitch/400' 
  },
];

const RARITY_COLORS = {
  common: 'bg-slate-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-amber-500 animate-pulse',
};

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
      toast({ 
        variant: 'destructive', 
        title: 'Saldo Insuficiente', 
        description: 'Mova-se mais para ganhar LudoCoins!' 
      });
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
      title: 'Aquisição de Sucesso!',
      description: `${item.name} agora faz parte do seu inventário.`,
    });
  };

  const categories = [
    { id: 'avatar', label: 'Efeitos', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'pets', label: 'Companheiros', icon: <Dog className="w-4 h-4" /> },
    { id: 'furniture', label: 'Estúdio', icon: <FurnitureIcon className="w-4 h-4" /> },
    { id: 'clothes', label: 'Estilo', icon: <Shirt className="w-4 h-4" /> },
    { id: 'hats', label: 'Acessórios', icon: <HatIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 h-20 flex items-center border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2 mr-6 hover:text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-widest hidden sm:inline">Voltar</span>
        </Link>
        <div className="flex items-center gap-2 flex-1 justify-center sm:justify-start">
          <UrbeLudoLogo className="w-8 h-8 text-primary" />
          <span className="text-lg font-black tracking-tighter uppercase italic">Shop de Elite</span>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-2xl flex items-center gap-2 border border-primary/20 shadow-inner">
          <Coins className="w-5 h-5 text-yellow-600" />
          <span className="font-black text-lg">{ludoCoins}</span>
        </div>
      </header>

      <main className="flex-1 p-6 container mx-auto max-w-7xl">
        <div className="mb-12 text-center space-y-3">
          <Badge className="bg-accent text-accent-foreground px-6 py-1.5 text-[10px] uppercase font-black tracking-[0.3em] shadow-lg">
            Sincronização de Progresso Ativa
          </Badge>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
            Arsenal <span className="text-primary">Psicomotor</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium">Equipe seu avatar com as recompensas do seu esforço físico real.</p>
        </div>

        <Tabs defaultValue="avatar" className="space-y-10">
          <TabsList className="flex flex-wrap h-auto p-1.5 bg-muted/30 rounded-3xl justify-center gap-1">
            {categories.map(cat => (
              <TabsTrigger 
                key={cat.id} 
                value={cat.id}
                className="rounded-2xl py-3 px-6 data-[state=active]:bg-background data-[state=active]:shadow-xl flex items-center gap-2 transition-all duration-300"
              >
                {cat.icon}
                <span className="text-xs font-black uppercase tracking-widest">{cat.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(cat => (
            <TabsContent key={cat.id} value={cat.id} className="animate-in fade-in zoom-in-95 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {SHOP_ITEMS.filter(item => item.category === cat.id).map(item => (
                  <Card key={item.id} className="group relative overflow-hidden border-none bg-muted/20 hover:bg-muted/40 transition-all duration-500 rounded-3xl shadow-sm hover:shadow-2xl">
                    {/* Rarity Tag */}
                    <div className={cn(
                      "absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-white shadow-lg",
                      RARITY_COLORS[item.rarity]
                    )}>
                      {item.rarity}
                    </div>

                    <div className="aspect-[4/5] relative overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-1000 ease-out"
                        data-ai-hint={item.name}
                      />
                      
                      {/* Price Badge Overlay */}
                      <div className="absolute top-4 right-4 z-10">
                         <Badge variant="secondary" className="bg-background/90 backdrop-blur-xl px-3 py-1.5 border border-white/20 shadow-xl flex gap-2 items-center rounded-xl">
                            <Coins className="w-4 h-4 text-yellow-600" />
                            <span className="font-black text-sm">{item.price}</span>
                         </Badge>
                      </div>

                      {/* Purchased Overlay */}
                      {unlockedItems.includes(item.id) && (
                        <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center z-20 transition-opacity">
                          <div className="bg-white text-primary px-6 py-2 rounded-2xl font-black uppercase tracking-widest scale-110 shadow-2xl flex items-center gap-2">
                            <Check className="w-5 h-5" /> Adquirido
                          </div>
                        </div>
                      )}
                      
                      {/* Animation Hint Hover */}
                      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                        <div className="flex items-center gap-2 text-white/90 mb-1">
                          <Zap className="w-3 h-3 text-accent" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Animação</span>
                        </div>
                        <p className="text-[10px] text-white/80 italic leading-tight">{item.animationHint}</p>
                      </div>
                    </div>

                    <CardHeader className="p-6 pb-2">
                      <div className="space-y-1">
                        {item.breed && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">{item.breed}</span>
                        )}
                        <CardTitle className="text-xl font-black uppercase tracking-tighter italic">{item.name}</CardTitle>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 pt-2 space-y-6">
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed min-h-[3em]">{item.description}</p>
                      
                      <Button 
                        onClick={() => handleBuy(item)} 
                        disabled={unlockedItems.includes(item.id)}
                        variant={unlockedItems.includes(item.id) ? "secondary" : "default"}
                        className={cn(
                          "w-full rounded-2xl font-black uppercase tracking-[0.2em] h-14 text-xs transition-all duration-300 shadow-lg",
                          !unlockedItems.includes(item.id) && "hover:scale-105 hover:bg-accent hover:text-accent-foreground active:scale-95"
                        )}
                      >
                        {unlockedItems.includes(item.id) ? (
                          <span className="flex items-center gap-2"><Star className="w-4 h-4" /> Item da Coleção</span>
                        ) : (
                          <span className="flex items-center gap-2">Resgatar Item <ArrowLeft className="w-4 h-4 rotate-180" /></span>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <footer className="p-12 text-center border-t mt-24 bg-muted/10">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Gamepad2 className="w-8 h-8 text-primary/40" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground">
            Sua jornada física, seu estilo digital
          </p>
          <div className="flex gap-4 opacity-30 grayscale hover:grayscale-0 transition-all">
             <UrbeLudoLogo className="w-6 h-6" />
             <UrbeLudoLogo className="w-6 h-6 rotate-90" />
             <UrbeLudoLogo className="w-6 h-6 rotate-180" />
          </div>
        </div>
      </footer>
    </div>
  );
}
