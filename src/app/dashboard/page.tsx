
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { 
  ArrowLeft, 
  UserCircle, 
  Coins, 
  Sparkles, 
  ShoppingBag,
  History,
  Lock,
  Zap,
  Target
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const userProgressRef = useMemoFirebase(() => user ? doc(db, 'user_progress', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userProgressRef);

  const handleUpdateProfile = (field: string, value: string | number) => {
    if (userProgressRef) {
      updateDocumentNonBlocking(userProgressRef, { [field]: value });
      toast({ title: "Perfil Sincronizado", description: "Sua jornada de evolução continua." });
    }
  };

  const pLevel = profile?.psychomotorLevel || 1;
  const levelNames = ["Alicerce", "Movimento", "Precisão", "Ritmo"];
  const progressToNext = ((profile?.totalChallengesCompleted || 0) % 5) * 20;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 h-20 flex items-center border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/playground" className="flex items-center gap-2 mr-6 hover:text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Playground</span>
        </Link>
        <div className="flex items-center gap-2 flex-1 justify-center sm:justify-start">
          <UrbeLudoLogo className="w-8 h-8 text-primary" />
          <span className="text-lg font-black tracking-tighter uppercase italic">Estúdio do Avatar</span>
        </div>
      </header>

      <main className="flex-1 p-6 container mx-auto max-w-5xl space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
        
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Coluna do Avatar */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="aspect-square relative overflow-hidden rounded-[3rem] shadow-2xl border-none group bg-slate-900">
               <Image 
                src="https://images.unsplash.com/photo-1587321965030-035a856311d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                alt="Avatar"
                fill
                className="object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                data-ai-hint="cyberpunk avatar"
              />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
               
               <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                  <div className="w-48 h-48 rounded-full border-4 border-primary/50 flex items-center justify-center backdrop-blur-sm bg-white/5 relative">
                    <Sparkles className="w-24 h-24 text-primary animate-pulse" />
                    <Badge className="absolute -bottom-2 bg-accent text-accent-foreground font-black px-4 py-1 rounded-full text-xs shadow-xl">
                      LVL {pLevel}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Seu Herói</h2>
                    <Badge variant="outline" className="border-primary text-primary font-black uppercase tracking-widest bg-primary/10">
                      {levelNames[pLevel-1]}
                    </Badge>
                  </div>
               </div>

               <div className="absolute top-6 right-6">
                 <div className="bg-black/50 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-2xl">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    <span className="text-white font-black text-xl">{profile?.ludoCoins || 0}</span>
                 </div>
               </div>
            </Card>

            <Card className="p-6 bg-muted/40 border-none rounded-[2rem] space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-black uppercase tracking-tighter text-sm flex items-center gap-2 text-muted-foreground">
                  <Target className="w-4 h-4" /> Domínio Psicomotor
                </h3>
                <span className="text-[10px] font-black uppercase text-primary">Nível {pLevel}</span>
              </div>
              <Progress value={progressToNext} className="h-4 rounded-full bg-slate-200" />
              <p className="text-[10px] text-muted-foreground font-bold italic text-center">
                Vença mais {5 - ((profile?.totalChallengesCompleted || 0) % 5)} desafios para desbloquear o próximo estágio.
              </p>
            </Card>
          </div>

          {/* Coluna de Configuração e Loja */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="rounded-[2rem] border-none bg-primary/5 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
                    <UserCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-black uppercase tracking-tighter italic">Bio-Perfil</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Faixa Etária</label>
                    <Select onValueChange={(v) => handleUpdateProfile('ageGroup', v)} value={profile?.ageGroup || 'adolescent_adult'}>
                      <SelectTrigger className="h-12 rounded-2xl border-none bg-background shadow-sm"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-2xl border-none">
                        <SelectItem value="preschool">Educação Infantil (2-5 anos)</SelectItem>
                        <SelectItem value="school_age">Fundamental (6-12 anos)</SelectItem>
                        <SelectItem value="adolescent_adult">Adolescente / Adulto (13+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Habilidade</label>
                    <Select onValueChange={(v) => handleUpdateProfile('skillLevel', v)} value={profile?.skillLevel || 'intermediate'}>
                      <SelectTrigger className="h-12 rounded-2xl border-none bg-background shadow-sm"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-2xl border-none">
                        <SelectItem value="beginner">Iniciante</SelectItem>
                        <SelectItem value="intermediate">Intermediário</SelectItem>
                        <SelectItem value="advanced">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              <Card className="rounded-[2rem] border-none bg-accent/10 p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <h3 className="font-black uppercase tracking-tighter italic">Arsenal Neon</h3>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium leading-tight">Equipe itens épicos resgatados com seu movimento real.</p>
                </div>
                <Button asChild className="w-full h-12 rounded-2xl font-black uppercase tracking-widest shadow-xl">
                  <Link href="/shop">Abrir Loja</Link>
                </Button>
              </Card>
            </div>

            <Card className="p-8 rounded-[3rem] border-none bg-slate-900 text-white space-y-6">
              <h3 className="font-black uppercase tracking-tighter text-xl italic flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" /> Status da Escada
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {levelNames.map((name, i) => (
                  <div key={i} className={cn(
                    "flex items-center gap-4 p-4 rounded-3xl transition-all duration-500",
                    pLevel === i + 1 ? "bg-white text-slate-950 scale-105 shadow-[0_0_30px_rgba(255,255,255,0.15)]" : 
                    pLevel > i + 1 ? "bg-white/10 opacity-60" : "bg-white/5 opacity-20 border border-white/10"
                  )}>
                    <div className={cn(
                      "w-10 h-10 rounded-full border-2 flex items-center justify-center font-black",
                      pLevel === i + 1 ? "bg-primary text-white border-primary" : "border-white/20"
                    )}>{i+1}</div>
                    <span className="uppercase tracking-[0.2em] text-[10px] font-black">{name}</span>
                    {pLevel > i + 1 && <Sparkles className="w-4 h-4 ml-auto text-primary" />}
                    {pLevel === i + 1 && <Zap className="w-4 h-4 ml-auto text-accent animate-pulse" />}
                  </div>
                ))}
              </div>
            </Card>

            <Button asChild variant="outline" className="w-full h-16 rounded-3xl border-2 font-black uppercase tracking-widest text-xs hover:bg-muted/50">
              <Link href="/history">
                <History className="w-5 h-5 mr-3" /> Ver Histórico de Jornada
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="p-12 text-center opacity-40">
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">UrbeLudo © Sincronização Biométrica Ativa</p>
      </footer>
    </div>
  );
}
