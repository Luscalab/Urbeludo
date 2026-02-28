
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { 
  ArrowLeft, 
  Coins, 
  ShoppingBag,
  Zap,
  Target,
  ChevronRight,
  Battery,
  Award,
  Edit2,
  Share2,
  User
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
import { Input } from '@/components/ui/input';

export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const userProgressRef = useMemoFirebase(() => user ? doc(db, 'user_progress', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userProgressRef);

  const handleUpdateProfile = (field: string, value: any) => {
    if (userProgressRef) {
      updateDocumentNonBlocking(userProgressRef, { [field]: value });
      toast({ title: "Sincronizado", description: "Seu perfil foi atualizado." });
    }
  };

  const pLevel = profile?.psychomotorLevel || 1;
  const energy = profile?.avatar?.energy ?? 100;
  const levelNames = ["Alicerce", "Movimento", "Precisão", "Ritmo"];

  const BADGE_DATA: Record<string, { label: string, icon: string, rarity: string }> = {
    'creative-explorer': { label: 'Explorador Criativo', icon: '🎨', rarity: 'rare' },
    'balance-master': { label: 'Mestre do Equilíbrio', icon: '⚖️', rarity: 'epic' },
    'street-artist': { label: 'Artista de Rua', icon: '🖌️', rarity: 'legendary' }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      <header className="px-6 h-16 flex items-center justify-between border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/playground" className="p-2"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex items-center gap-1">
          <UrbeLudoLogo className="w-6 h-6 text-primary" />
          <span className="text-sm font-black uppercase italic tracking-tighter">Perfil Urbe</span>
        </div>
        <div className="bg-primary/10 px-3 py-1 rounded-xl flex items-center gap-2">
            <Coins className="w-3 h-3 text-yellow-600" />
            <span className="text-xs font-black">{profile?.ludoCoins || 0}</span>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8 container max-w-lg mx-auto">
        {/* Header Profile */}
        <div className="flex flex-col items-center text-center space-y-4">
           <div className="relative w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-primary/20 shadow-xl bg-muted">
              <Image src={`https://picsum.photos/seed/${user?.uid}/200`} alt="Avatar" fill className="object-cover" />
              <button className="absolute bottom-1 right-1 bg-primary text-white p-1.5 rounded-xl shadow-lg"><Edit2 className="w-3 h-3" /></button>
           </div>
           <div className="space-y-1">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">{profile?.displayName || "Explorador"}</h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase italic px-4 leading-tight">{profile?.bio || "Transformando a cidade em playground."}</p>
           </div>
        </div>

        {/* Badges Section */}
        <div className="space-y-4">
           <div className="flex justify-between items-center px-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Emblemas Épicos</h4>
              <Award className="w-4 h-4 text-primary" />
           </div>
           <div className="flex flex-wrap gap-3">
              {profile?.badges?.map((badgeId: string) => {
                const badge = BADGE_DATA[badgeId];
                return (
                  <div key={badgeId} className={cn(
                    "px-4 py-2 rounded-2xl flex items-center gap-2 border shadow-sm transition-transform active:scale-95",
                    badge?.rarity === 'legendary' ? "bg-yellow-50 border-yellow-200" : 
                    badge?.rarity === 'epic' ? "bg-purple-50 border-purple-200" : "bg-primary/5 border-primary/10"
                  )}>
                    <span className="text-lg">{badge?.icon}</span>
                    <span className="text-[9px] font-black uppercase tracking-tight">{badge?.label}</span>
                  </div>
                );
              }) || (
                <div className="w-full py-6 bg-muted/20 rounded-3xl text-center border border-dashed">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Complete missões lúdicas para ganhar emblemas!</p>
                </div>
              )}
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
              <Share2 className="w-8 h-8 text-accent opacity-40" />
              <div className="text-2xl font-black">{profile?.totalLikesReceived || 0}</div>
              <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Reconhecimento</div>
           </Card>
        </div>

        {/* Settings */}
        <Card className="p-6 border-none rounded-[3rem] space-y-6 bg-muted/20">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Configurações Psicomotoras</h4>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-muted-foreground px-2">Nome de Exibição</label>
              <Input 
                className="rounded-2xl h-12 border-none bg-background shadow-sm px-4 font-bold" 
                defaultValue={profile?.displayName} 
                onBlur={(e) => handleUpdateProfile('displayName', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-muted-foreground px-2">Faixa Etária (Lógica IA)</label>
              <Select onValueChange={(v) => handleUpdateProfile('ageGroup', v)} value={profile?.ageGroup || 'adolescent_adult'}>
                <SelectTrigger className="rounded-2xl h-12 border-none bg-background shadow-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="preschool">Infantil (2-5 anos)</SelectItem>
                  <SelectItem value="school_age">Escolar (6-12 anos)</SelectItem>
                  <SelectItem value="adolescent_adult">Adulto/Adolescente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Button asChild className="w-full h-16 rounded-[2.5rem] font-black uppercase tracking-widest shadow-xl flex justify-between px-8 bg-black hover:bg-slate-900">
          <Link href="/shop">
            <span className="flex items-center gap-3"><ShoppingBag className="w-6 h-6" /> LudoShop</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </Button>
      </main>

      <footer className="fixed bottom-0 inset-x-0 h-20 bg-background border-t flex items-center justify-around px-6 z-50">
         <Link href="/playground" className="flex flex-col items-center gap-1 text-muted-foreground"><Target className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Play</span></Link>
         <Link href="/community" className="flex flex-col items-center gap-1 text-muted-foreground"><Share2 className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Galeria</span></Link>
         <div className="flex flex-col items-center gap-1 text-primary"><User className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Perfil</span></div>
      </footer>
    </div>
  );
}
