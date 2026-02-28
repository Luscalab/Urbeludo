"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { 
  ArrowLeft, 
  UserCircle, 
  Coins, 
  ShoppingBag,
  Zap,
  Target,
  ChevronRight,
  Home as HomeIcon,
  Battery
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const userProgressRef = useMemoFirebase(() => user ? doc(db, 'user_progress', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userProgressRef);

  const handleUpdateProfile = (field: string, value: string | number) => {
    if (userProgressRef) {
      updateDocumentNonBlocking(userProgressRef, { [field]: value });
      toast({ title: "DNA Sincronizado", description: "Perfil atualizado com sucesso." });
    }
  };

  const pLevel = profile?.psychomotorLevel || 1;
  const energy = profile?.avatar?.energy ?? 100;
  const levelNames = ["Alicerce", "Movimento", "Precisão", "Ritmo"];
  const progressToNext = ((profile?.totalChallengesCompleted || 0) % 5) * 20;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      <header className="px-6 h-16 flex items-center justify-between border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/playground" className="p-2 -ml-2"><ArrowLeft className="w-6 h-6" /></Link>
        <div className="flex items-center gap-1">
          <UrbeLudoLogo className="w-6 h-6 text-primary" />
          <span className="text-sm font-black uppercase italic tracking-tighter">Estúdio</span>
        </div>
        <div className="bg-primary/10 px-3 py-1 rounded-xl flex items-center gap-2">
            <Coins className="w-3 h-3 text-yellow-600" />
            <span className="text-xs font-black">{profile?.ludoCoins || 0}</span>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Stamina / Energy Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-black uppercase text-muted-foreground px-2">
            <span className="flex items-center gap-1"><Battery className="w-3 h-3" /> Stamina do Avatar</span>
            <span className={cn(energy < 30 ? "text-destructive" : "text-primary")}>{energy}%</span>
          </div>
          <Progress value={energy} className={cn("h-2 rounded-full", energy < 30 ? "bg-destructive/20" : "bg-primary/20")} />
        </div>

        {/* Avatar Studio View */}
        <div className="relative aspect-[4/5] w-full rounded-[3rem] overflow-hidden shadow-2xl bg-slate-900 group">
           <Image 
            src="https://images.unsplash.com/photo-1587321965030-035a856311d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            alt="Avatar"
            fill
            className="object-cover opacity-60"
            data-ai-hint="cyberpunk avatar studio"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="absolute bottom-8 inset-x-0 text-center space-y-2 px-6">
             <Badge className="bg-accent text-accent-foreground font-black px-4 py-1 rounded-full text-[10px] uppercase shadow-xl">
               Nível {pLevel}: {levelNames[pLevel-1]}
             </Badge>
             <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
               {profile?.avatar?.studioLevel === 1 ? "Studio Inicial" : `Mansão Nível ${profile?.avatar?.studioLevel}`}
             </h2>
          </div>
          <div className="absolute top-6 left-6">
             <div className="bg-black/50 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-2xl flex items-center gap-2">
                <HomeIcon className="w-4 h-4 text-white" />
                <span className="text-white text-[10px] font-black uppercase">Nível 1</span>
             </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
           <Card className="p-6 bg-primary/5 border-none rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-2">
              <Target className="w-8 h-8 text-primary opacity-40" />
              <div className="text-2xl font-black">{profile?.totalChallengesCompleted || 0}</div>
              <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Desafios</div>
           </Card>
           <Card className="p-6 bg-accent/5 border-none rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-2">
              <Zap className="w-8 h-8 text-accent opacity-40" />
              <div className="text-2xl font-black">{profile?.currentStreak || 0}</div>
              <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Streak</div>
           </Card>
        </div>

        {/* Profile Settings */}
        <Card className="p-6 border-none rounded-[2.5rem] space-y-6 bg-muted/20">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Sincronização Biométrica</h4>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-muted-foreground px-2">Idade</label>
              <Select onValueChange={(v) => handleUpdateProfile('ageGroup', v)} value={profile?.ageGroup || 'adolescent_adult'}>
                <SelectTrigger className="rounded-2xl h-12 border-none bg-background shadow-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="preschool">Infantil (2-5)</SelectItem>
                  <SelectItem value="school_age">Fundamental (6-12)</SelectItem>
                  <SelectItem value="adolescent_adult">Adolescente/Adulto (13+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-muted-foreground px-2">Habilidade</label>
              <Select onValueChange={(v) => handleUpdateProfile('skillLevel', v)} value={profile?.skillLevel || 'intermediate'}>
                <SelectTrigger className="rounded-2xl h-12 border-none bg-background shadow-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="beginner">Iniciante</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Shop Shortcut */}
        <Button asChild className="w-full h-16 rounded-[2rem] font-black uppercase tracking-widest shadow-xl flex justify-between px-8 bg-black hover:bg-slate-900">
          <Link href="/shop">
            <span className="flex items-center gap-3"><ShoppingBag className="w-6 h-6" /> LudoShop</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </Button>
      </main>

      {/* Bottom Nav */}
      <footer className="fixed bottom-0 inset-x-0 h-20 bg-background border-t flex items-center justify-around px-6 z-50">
         <Link href="/playground" className="flex flex-col items-center gap-1 text-muted-foreground"><Zap className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Play</span></Link>
         <div className="flex flex-col items-center gap-1 text-primary"><Gamepad2 className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Estúdio</span></div>
         <Link href="/shop" className="flex flex-col items-center gap-1 text-muted-foreground"><ShoppingBag className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Loja</span></Link>
      </footer>
    </div>
  );
}

function Gamepad2(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gamepad-2"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15" y1="13" y2="13"/><line x1="18" x2="18" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/></svg>
  )
}