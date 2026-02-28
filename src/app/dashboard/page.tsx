
'use client';

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
  LogOut,
  Sparkles,
  Trophy
} from 'lucide-react';
import { useUser, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { initiateSignOut } from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/components/I18nProvider';
import { getAvatarById } from '@/lib/avatar-catalog';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { t } = useI18n();

  const userProgressRef = useMemoFirebase(() => user ? { id: user.uid, path: `user_progress/${user.uid}` } : null, [user]);
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

  const avatarInfo = getAvatarById(profile?.avatar?.avatarId || '1.png');

  return (
    <div className="min-h-screen bg-background flex flex-col pb-32 bg-mesh-purple">
      <header className="px-6 h-24 flex items-center justify-between bg-white/60 backdrop-blur-2xl sticky top-0 z-[100] border-b border-white/20">
        <Link href="/playground" className="p-3 bg-white rounded-full shadow-md"><ArrowLeft className="w-6 h-6 text-primary" /></Link>
        <div className="flex items-center gap-2">
          <UrbeLudoLogo className="w-8 h-8 text-primary" />
          <span className="text-lg font-black uppercase italic tracking-tighter">Estúdio Ludo</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 px-4 py-2 rounded-2xl flex items-center gap-2 border border-primary/20">
              <Coins className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-black">{profile?.ludoCoins || 0}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full h-10 w-10">
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </header>

      <main className="flex-1 p-8 space-y-10 container max-w-lg mx-auto">
        <div className="flex flex-col items-center text-center space-y-6">
           <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
           >
              <div className="w-40 h-40 rounded-[3.5rem] overflow-hidden border-8 border-white shadow-[0_40px_80px_rgba(0,0,0,0.1)] bg-muted p-6">
                <img src={avatarInfo.src} alt="Avatar" className="w-full h-full object-contain" />
              </div>
              <button 
                onClick={() => router.push('/playground?edit=true')}
                className="absolute -bottom-2 -right-2 bg-primary text-white p-4 rounded-3xl shadow-2xl hover:scale-110 active:scale-90 transition-all border-4 border-white"
              >
                <Edit2 className="w-6 h-6" />
              </button>
           </motion.div>
           <div className="space-y-2">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{profile?.displayName || "Explorador"}</h2>
              <div className="flex items-center justify-center gap-3">
                 <Badge variant="outline" className="text-[10px] font-black uppercase border-primary/20 text-primary px-4 py-1 rounded-full">Nível {profile?.psychomotorLevel || 1}</Badge>
                 <Badge variant="outline" className="text-[10px] font-black uppercase border-accent/20 text-accent px-4 py-1 rounded-full">Estúdio v.{studioLevel}</Badge>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Button asChild className="w-full h-24 rounded-[3.5rem] font-black uppercase tracking-[0.2em] shadow-2xl flex justify-between px-12 bg-primary border-b-8 border-primary/80 active:border-b-0 active:translate-y-2 transition-all">
            <Link href="/studio">
              <span className="flex items-center gap-4 text-lg"><Home className="w-8 h-8" /> Entrar no Studio</span>
              <Sparkles className="w-7 h-7 animate-pulse" />
            </Link>
          </Button>

          <Card className="p-8 border-none rounded-[3.5rem] bg-white shadow-xl space-y-6">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <Target className="w-6 h-6 text-primary" />
                   <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Evolução de Estilo</span>
                </div>
                <span className="text-[10px] font-black uppercase text-primary bg-primary/5 px-4 py-1.5 rounded-full">
                  {challengesToNextLevel} missões para v.{studioLevel + 1}
                </span>
             </div>
             <div className="space-y-3">
                <Progress value={(5 - challengesToNextLevel) * 20} className="h-4 rounded-full bg-primary/10" />
                <div className="flex justify-between text-[9px] font-black uppercase text-muted-foreground px-1 opacity-60">
                   <span>Iniciante</span>
                   <span>Mestre</span>
                </div>
             </div>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <Card className="p-6 bg-white border-none rounded-[2.5rem] shadow-lg flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                 <Battery className={cn("w-6 h-6", energy < 30 && "text-destructive animate-pulse")} />
              </div>
              <div className="space-y-1">
                 <div className="text-xl font-black">{energy}%</div>
                 <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Energia Vital</div>
              </div>
           </Card>
           <Card className="p-6 bg-white border-none rounded-[2.5rem] shadow-lg flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                 <Trophy className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                 <div className="text-xl font-black">{profile?.totalChallengesCompleted || 0}</div>
                 <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Vitórias</div>
              </div>
           </Card>
        </div>

        <div className="space-y-5">
           <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground px-4">Hall de Conquistas</h4>
           <div className="flex flex-wrap gap-3">
              {profile?.badges?.map((badgeId: string) => {
                const badge = BADGE_DATA[badgeId];
                return (
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    key={badgeId} 
                    className={cn(
                      "px-5 py-3 rounded-3xl flex items-center gap-3 border shadow-md bg-white",
                      badge?.rarity === 'legendary' ? "border-yellow-400" : 
                      badge?.rarity === 'epic' ? "border-purple-400" : "border-primary/10"
                    )}
                  >
                    <span className="text-xl">{badge?.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-tight">{badge?.label}</span>
                  </motion.div>
                );
              }) || (
                <div className="w-full text-center py-12 bg-white/40 rounded-[3rem] border-4 border-dashed border-primary/10">
                   <p className="text-[10px] text-muted-foreground uppercase font-black italic tracking-widest">Nenhuma insígnia conquistada ainda.</p>
                </div>
              )}
           </div>
        </div>

        <Button asChild className="w-full h-20 rounded-[3rem] font-black uppercase tracking-[0.2em] shadow-xl flex justify-between px-12 bg-zinc-900 border-b-8 border-black active:border-b-0 active:translate-y-2 transition-all">
          <Link href="/shop">
            <span className="flex items-center gap-4 text-base"><ShoppingBag className="w-7 h-7" /> Visitar LudoShop</span>
            <ChevronRight className="w-6 h-6" />
          </Link>
        </Button>
      </main>

      <footer className="fixed bottom-0 inset-x-0 h-24 bg-white/80 backdrop-blur-2xl border-t border-white/20 flex items-center justify-around px-8 z-[100] rounded-t-[3.5rem] shadow-2xl">
         <Link href="/playground" className="flex flex-col items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"><Target className="w-7 h-7" /><span className="text-[9px] font-black uppercase tracking-widest">Play</span></Link>
         <Link href="/community" className="flex flex-col items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"><Share2 className="w-7 h-7" /><span className="text-[9px] font-black uppercase tracking-widest">Galeria</span></Link>
         <div className="flex flex-col items-center gap-1.5 text-primary"><User className="w-8 h-8" /><span className="text-[10px] font-black uppercase tracking-widest">Perfil</span></div>
      </footer>
    </div>
  );
}
