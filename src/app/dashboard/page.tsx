
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { 
  ArrowLeft, 
  UserCircle, 
  Coins, 
  Sparkles, 
  ShoppingBag,
  Zap,
  Target,
  ChevronRight
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
      toast({ title: "Perfil Atualizado", description: "DNA motor sincronizado." });
    }
  };

  const pLevel = profile?.psychomotorLevel || 1;
  const levelNames = ["Alicerce", "Movimento", "Precisão", "Ritmo"];
  const progressToNext = ((profile?.totalChallengesCompleted || 0) % 5) * 20;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <header className="px-6 h-16 flex items-center justify-between border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/playground" className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex items-center gap-1">
          <UrbeLudoLogo className="w-6 h-6 text-primary" />
          <span className="text-sm font-black uppercase italic tracking-tighter">Estúdio</span>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Avatar Card */}
        <div className="relative aspect-square max-w-sm mx-auto rounded-[3rem] overflow-hidden shadow-2xl bg-slate-900 group">
           <Image 
            src="https://images.unsplash.com/photo-1587321965030-035a856311d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            alt="Avatar"
            fill
            className="object-cover opacity-60"
            data-ai-hint="cyberpunk avatar"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="absolute bottom-8 inset-x-0 text-center space-y-2">
             <Badge className="bg-accent text-accent-foreground font-black px-4 py-1 rounded-full text-[10px] uppercase shadow-xl">
               Nível {pLevel}: {levelNames[pLevel-1]}
             </Badge>
             <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Seu Avatar</h2>
          </div>
          <div className="absolute top-6 right-6">
             <div className="bg-black/50 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-2xl flex items-center gap-2">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="text-white font-black">{profile?.ludoCoins || 0}</span>
             </div>
          </div>
        </div>

        {/* Level Progress */}
        <Card className="p-6 bg-primary/5 border-none rounded-[2.5rem] space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4" /> Evolução Psicomotora
            </h3>
            <span className="text-[10px] font-black text-primary">{progressToNext}%</span>
          </div>
          <Progress value={progressToNext} className="h-3 rounded-full" />
          <p className="text-[9px] text-center font-bold text-muted-foreground uppercase tracking-widest">
            Faltam {5 - ((profile?.totalChallengesCompleted || 0) % 5)} desafios para o próximo nível
          </p>
        </Card>

        {/* Profile Settings */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Configurações Biométricas</h4>
          <Card className="p-6 border-none rounded-[2.5rem] space-y-4 bg-white shadow-sm">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-muted-foreground">Idade</label>
              <Select onValueChange={(v) => handleUpdateProfile('ageGroup', v)} value={profile?.ageGroup || 'adolescent_adult'}>
                <SelectTrigger className="rounded-2xl h-12 border-none bg-muted/30"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-2xl border-none">
                  <SelectItem value="preschool">Infantil (2-5)</SelectItem>
                  <SelectItem value="school_age">Fundamental (6-12)</SelectItem>
                  <SelectItem value="adolescent_adult">Adolescente/Adulto (13+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-muted-foreground">Habilidade</label>
              <Select onValueChange={(v) => handleUpdateProfile('skillLevel', v)} value={profile?.skillLevel || 'intermediate'}>
                <SelectTrigger className="rounded-2xl h-12 border-none bg-muted/30"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-2xl border-none">
                  <SelectItem value="beginner">Iniciante</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </div>

        {/* Shop Shortcut */}
        <Button asChild className="w-full h-16 rounded-[2rem] font-black uppercase tracking-widest shadow-xl flex justify-between px-8">
          <Link href="/shop">
            <span className="flex items-center gap-3"><ShoppingBag className="w-6 h-6" /> Loja de Itens</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </Button>
      </main>

      {/* Bottom Nav Simulation */}
      <footer className="fixed bottom-0 inset-x-0 h-20 bg-background border-t flex items-center justify-around px-6 z-50">
         <Link href="/playground" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
            <Zap className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase">Play</span>
         </Link>
         <div className="flex flex-col items-center gap-1 text-primary">
            <UserCircle className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase">Perfil</span>
         </div>
      </footer>
    </div>
  );
}
