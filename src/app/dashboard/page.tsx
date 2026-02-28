
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
  User,
  Home,
  LogOut
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { initiateSignOut } from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const userProgressRef = useMemoFirebase(() => user ? doc(db, 'user_progress', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userProgressRef);

  const handleSignOut = () => {
    initiateSignOut(auth);
    router.push('/');
    toast({ title: "Sessão Encerrada", description: "Até a próxima exploração!" });
  };

  const energy = profile?.avatar?.energy ?? 100;
  const studioLevel = profile?.avatar?.studioLevel || 1;
  const challengesToNextLevel = 5 - ((profile?.totalChallengesCompleted || 0) % 5);

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
          <span className="text-sm font-black uppercase italic tracking-tighter">Estúdio Ludo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 px-3 py-1 rounded-xl flex items-center gap-2">
              <Coins className="w-3 h-3 text-yellow-600" />
              <span className="text-xs font-black">{profile?.ludoCoins || 0}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full h-8 w-8">
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8 container max-w-lg mx-auto">
        {/* Header Profile */}
        <div className="flex flex-col items-center text-center space-y-4">
           <div className="relative w-28 h-28 rounded-[2.5rem] overflow-hidden border-4 border-primary/20 shadow-xl bg-muted">
              <Image src={`https://picsum.photos/seed/${user?.uid}/200`} alt="Avatar" fill className="object-cover" />
              <button className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-xl shadow-lg"><Edit2 className="w-4 h-4" /></button>
           </div>
           <div className="space-y-1">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none">{profile?.displayName || "Explorador"}</h2>
              <div className="flex items-center justify-center gap-2">
                 <Badge variant="outline" className="text-[8px] font-black uppercase border-primary/30 text-primary">Nível {profile?.psychomotorLevel || 1}</Badge>
                 <Badge variant="outline" className="text-[8px] font-black uppercase border-accent/30 text-accent">Studio v.{studioLevel}</Badge>
              </div>
           </div>
        </div>

        {/* Studio Progress */}
        <Card className="p-5 border-none rounded-[2rem] bg-primary/5 space-y-3">
           <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                 <Home className="w-4 h-4 text-primary" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Expansão do Studio</span>
              </div>
              <span className="text-[9px] font-black uppercase text-primary">{challengesToNextLevel} missões para evoluir</span>
           </div>
           <Progress value={(5 - challengesToNextLevel) * 20} className="h-2.5 rounded-full bg-primary/10" />
        </Card>

        {/* Energy Check */}
        <div className="grid grid-cols-2 gap-3">
           <Card className="p-4 bg-muted/20 border-none rounded-3xl flex items-center gap-3">
              <Battery className={cn("w-5 h-5", energy < 30 ? "text-destructive" : "text-primary")} />
              <div>
                 <div className="text-xs font-black">{energy}%</div>
                 <div className="text-[8px] font-bold text-muted-foreground uppercase">Energia</div>
              </div>
           </Card>
           <Card className="p-4 bg-muted/20 border-none rounded-3xl flex items-center gap-3">
              <Target className="w-5 h-5 text-accent" />
              <div>
                 <div className="text-xs font-black">{profile?.totalChallengesCompleted || 0}</div>
                 <div className="text-[8px] font-bold text-muted-foreground uppercase">Concluídos</div>
              </div>
           </Card>
        </div>

        {/* Badges */}
        <div className="space-y-3">
           <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Emblemas Conquistados</h4>
           <div className="flex flex-wrap gap-2">
              {profile?.badges?.map((badgeId: string) => {
                const badge = BADGE_DATA[badgeId];
                return (
                  <div key={badgeId} className={cn(
                    "px-3 py-1.5 rounded-xl flex items-center gap-2 border shadow-sm",
                    badge?.rarity === 'legendary' ? "bg-yellow-50 border-yellow-200" : 
                    badge?.rarity === 'epic' ? "bg-purple-50 border-purple-200" : "bg-primary/5 border-primary/10"
                  )}>
                    <span className="text-base">{badge?.icon}</span>
                    <span className="text-[8px] font-black uppercase tracking-tight">{badge?.label}</span>
                  </div>
                );
              }) || (
                <p className="text-[9px] text-muted-foreground uppercase italic px-2">Nenhum emblema ainda. Vá para a rua!</p>
              )}
           </div>
        </div>

        {/* Action Button */}
        <Button asChild className="w-full h-16 rounded-[2.5rem] font-black uppercase tracking-widest shadow-xl flex justify-between px-8 bg-black hover:bg-slate-900 border-b-4 border-slate-800 active:border-b-0 active:translate-y-1 transition-all">
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
