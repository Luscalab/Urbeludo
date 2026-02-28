
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { ArrowLeft, Brain, Move, Activity, Settings, UserCircle, Coins, Sparkles, Home as HomeIcon } from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

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
          <Card className="aspect-square flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden group">
             <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/studio/800')] opacity-10 grayscale group-hover:scale-110 transition-transform duration-1000" />
             <div className="z-10 text-center space-y-4">
                <div className="w-32 h-32 rounded-full bg-white shadow-2xl flex items-center justify-center border-4 border-primary">
                  <Sparkles className="w-16 h-16 text-primary animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Seu Avatar</h2>
                  <div className="flex gap-2 justify-center">
                    <Badge className="bg-primary">{levelNames[pLevel-1]}</Badge>
                    <Badge variant="outline" className="flex gap-1"><Coins className="w-3 h-3"/> {profile?.ludoCoins || 0}</Badge>
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
              <Progress value={progressToNext} className="h-3" />
              <p className="text-[10px] text-muted-foreground italic">Faltam {5 - ((profile?.totalChallengesCompleted || 0) % 5)} desafios para o Nível {pLevel < 4 ? pLevel + 1 : 4}.</p>
            </div>

            <Card className="p-6 bg-muted/50 border-none">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <HomeIcon className="w-4 h-4 text-primary" /> Estúdio do Avatar
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3].map(i => (
                  <div key={i} className="aspect-square bg-background rounded-xl border-2 border-dashed flex items-center justify-center text-muted-foreground">
                    <Settings className="w-4 h-4 opacity-20" />
                  </div>
                ))}
              </div>
              <Button disabled variant="outline" className="w-full mt-4 text-xs font-bold uppercase">Loja em Breve</Button>
            </Card>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <UserCircle className="w-4 h-4" /> Configurações de Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Faixa Etária</label>
                <Select onValueChange={(v) => handleUpdateProfile('ageGroup', v)} value={profile?.ageGroup || 'adolescent_adult'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preschool">Educação Infantil (2-5 anos)</SelectItem>
                    <SelectItem value="school_age">Fundamental (6-12 anos)</SelectItem>
                    <SelectItem value="adolescent_adult">Adolescente / Adulto (13+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Nível de Habilidade</label>
                <Select onValueChange={(v) => handleUpdateProfile('skillLevel', v)} value={profile?.skillLevel || 'intermediate'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="font-bold mb-2">Escada Psicomotora</h3>
            <div className="space-y-3 mt-4">
              {levelNames.map((name, i) => (
                <div key={i} className={cn(
                  "flex items-center gap-3 p-2 rounded-lg text-sm",
                  pLevel === i + 1 ? "bg-primary text-white font-bold" : "opacity-40"
                )}>
                  <div className="w-6 h-6 rounded-full border flex items-center justify-center text-[10px]">{i+1}</div>
                  {name}
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
