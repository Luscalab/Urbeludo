
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { 
  ArrowLeft, 
  Settings, 
  UserCircle, 
  Coins, 
  Sparkles, 
  Home as HomeIcon, 
  ShoppingBag,
  History
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
      toast({ title: "Perfil Atualizado" });
    }
  };

  const pLevel = profile?.psychomotorLevel || 1;
  const levelNames = ["Alicerce", "Movimento", "Precisão", "Ritmo"];
  const progressToNext = ((profile?.totalChallengesCompleted || 0) % 5) * 20;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 h-20 flex items-center border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/playground" className="flex items-center gap-2 mr-6">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <UrbeLudoLogo className="w-8 h-8 text-primary" />
          <span className="text-lg font-headline font-bold tracking-tight">Evolução do Avatar</span>
        </div>
      </header>

      <main className="flex-1 p-6 container mx-auto max-w-4xl space-y-8">
        {/* Avatar Section */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <Card className="aspect-square flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden group rounded-3xl">
             <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/studio/800')] opacity-10 grayscale group-hover:scale-110 transition-transform duration-1000" />
             <div className="z-10 text-center space-y-4">
                <div className="w-40 h-40 rounded-full bg-white shadow-2xl flex items-center justify-center border-4 border-primary relative">
                  <Sparkles className="w-20 h-20 text-primary animate-pulse" />
                  <div className="absolute -bottom-2 -right-2 bg-accent text-accent-foreground px-2 py-1 rounded-lg text-[10px] font-black uppercase">LVL {pLevel}</div>
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Seu Avatar</h2>
                  <div className="flex gap-2 justify-center">
                    <Badge className="bg-primary">{levelNames[pLevel-1]}</Badge>
                    <Badge variant="outline" className="flex gap-1 bg-white/50"><Coins className="w-3 h-3 text-yellow-600"/> {profile?.ludoCoins || 0}</Badge>
                  </div>
                </div>
             </div>
          </Card>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <span>Progresso Motor</span>
                <span>Nível {pLevel}</span>
              </div>
              <Progress value={progressToNext} className="h-4 rounded-full" />
              <p className="text-[10px] text-muted-foreground italic">Faltam {5 - ((profile?.totalChallengesCompleted || 0) % 5)} desafios para o Nível {pLevel < 4 ? pLevel + 1 : 4}.</p>
            </div>

            <Card className="p-6 bg-muted/50 border-none rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black uppercase tracking-tighter flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-primary" /> Estúdio & Loja
                </h3>
                <Button asChild size="sm" className="rounded-xl font-bold uppercase text-[10px] tracking-widest h-8">
                  <Link href="/shop">Abrir Loja</Link>
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {profile?.avatar?.unlockedItems?.slice(0, 4).map((itemId: string) => (
                  <div key={itemId} className="aspect-square bg-background rounded-xl border flex items-center justify-center text-[10px] font-bold overflow-hidden">
                    <img src={`https://picsum.photos/seed/${itemId}/100`} alt={itemId} className="w-full h-full object-cover" />
                  </div>
                )) || [1,2,3,4].map(i => (
                  <div key={i} className="aspect-square bg-background rounded-xl border-2 border-dashed flex items-center justify-center text-muted-foreground">
                    <Lock className="w-4 h-4 opacity-20" />
                  </div>
                ))}
              </div>
            </Card>

            <Button asChild variant="outline" className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest">
              <Link href="/history">
                <History className="w-4 h-4 mr-2" /> Histórico de Jornada
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="rounded-3xl border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                <UserCircle className="w-4 h-4" /> Perfil Psicomotor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Faixa Etária</label>
                <Select onValueChange={(v) => handleUpdateProfile('ageGroup', v)} value={profile?.ageGroup || 'adolescent_adult'}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preschool">Educação Infantil (2-5 anos)</SelectItem>
                    <SelectItem value="school_age">Fundamental (6-12 anos)</SelectItem>
                    <SelectItem value="adolescent_adult">Adolescente / Adulto (13+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Habilidade Base</label>
                <Select onValueChange={(v) => handleUpdateProfile('skillLevel', v)} value={profile?.skillLevel || 'intermediate'}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6 bg-primary/5 border-primary/20 rounded-3xl">
            <h3 className="font-black uppercase tracking-tighter mb-4">Hierarquia de Domínio</h3>
            <div className="space-y-3">
              {levelNames.map((name, i) => (
                <div key={i} className={cn(
                  "flex items-center gap-3 p-3 rounded-xl text-sm transition-all",
                  pLevel === i + 1 ? "bg-primary text-white font-bold shadow-lg scale-105" : 
                  pLevel > i + 1 ? "opacity-60 bg-primary/10" : "opacity-30 border-dashed border"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-full border flex items-center justify-center font-black text-xs",
                    pLevel === i + 1 ? "bg-white text-primary" : ""
                  )}>{i+1}</div>
                  <span className="uppercase tracking-widest text-[10px] font-black">{name}</span>
                  {pLevel > i + 1 && <Sparkles className="w-3 h-3 ml-auto" />}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

function Lock({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" 
      strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
