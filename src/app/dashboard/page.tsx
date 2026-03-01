'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Coins, 
  Zap, 
  Target, 
  Award, 
  Edit2, 
  User, 
  History as HistoryIcon,
  Play,
  Trophy,
  Calendar
} from 'lucide-react';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { getAvatarById } from '@/lib/avatar-catalog';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const userProgressRef = useMemoFirebase(() => user ? { id: user.uid, path: `user_progress/${user.uid}` } : null, [user]);
  const { data: profile } = useDoc(userProgressRef);

  const avatarInfo = getAvatarById(profile?.avatar?.avatarId || '1.png');
  const history = (profile?.history || []).slice(0, 5); // Últimas 5 sessões

  return (
    <div className="min-h-screen bg-background flex flex-col pb-32 bg-mesh-purple">
      <header className="px-6 h-20 flex items-center justify-between bg-white/60 backdrop-blur-2xl sticky top-0 z-[100] border-b border-white/10">
        <Link href="/" className="p-2 bg-white rounded-full shadow-sm"><ArrowLeft className="w-5 h-5 text-primary" /></Link>
        <div className="flex items-center gap-2">
          <UrbeLudoLogo className="w-6 h-6 text-primary" />
          <span className="text-sm font-black uppercase italic tracking-tighter">Performance Ludo</span>
        </div>
        <div className="bg-primary/10 px-4 py-1.5 rounded-2xl flex items-center gap-2 border border-primary/20">
          <Coins className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-black">{profile?.ludoCoins || 0}</span>
        </div>
      </header>

      <main className="flex-1 p-8 space-y-10 container max-w-lg mx-auto">
        {/* Profile Card */}
        <div className="flex flex-col items-center text-center space-y-6">
           <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
           >
              <div className="w-36 h-36 rounded-[3rem] overflow-hidden border-4 border-white shadow-xl bg-muted p-4">
                <img src={avatarInfo.src} alt="Avatar" className="w-full h-full object-contain" />
              </div>
              <button 
                onClick={() => router.push('/playground?edit=true')}
                className="absolute -bottom-1 -right-1 bg-primary text-white p-3 rounded-2xl shadow-lg border-2 border-white"
              >
                <Edit2 className="w-5 h-5" />
              </button>
           </motion.div>
           <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{profile?.displayName || "Explorador"}</h2>
              <div className="flex items-center justify-center gap-3">
                 <Badge variant="outline" className="text-[9px] font-black uppercase border-primary/20 text-primary px-3 py-1 rounded-full">Nível {profile?.psychomotorLevel || 1}</Badge>
                 <Badge variant="outline" className="text-[9px] font-black uppercase border-accent/20 text-accent px-3 py-1 rounded-full">O Traço Vivo</Badge>
              </div>
           </div>
        </div>

        {/* Action Button */}
        <Button asChild className="w-full h-24 rounded-[3rem] font-black uppercase tracking-[0.2em] shadow-2xl flex justify-between px-10 bg-primary border-b-8 border-primary/80 active:border-b-0 active:translate-y-2 transition-all">
          <Link href="/playground">
            <span className="flex items-center gap-4 text-lg"><Zap className="w-8 h-8 fill-current" /> Iniciar Brincadeira</span>
            <Play className="w-6 h-6 fill-current" />
          </Link>
        </Button>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
           <Card className="p-6 bg-white border-none rounded-[2.5rem] shadow-lg flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                 <Target className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                 <div className="text-xl font-black">{profile?.totalChallengesCompleted || 0}</div>
                 <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Vitórias</div>
              </div>
           </Card>
           <Card className="p-6 bg-white border-none rounded-[2.5rem] shadow-lg flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                 <Award className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                 <div className="text-xl font-black">{profile?.currentStreak || 0}</div>
                 <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Dias Ativos</div>
              </div>
           </Card>
        </div>

        {/* History Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <HistoryIcon className="w-4 h-4" /> Histórico de Arte
            </h3>
          </div>

          <div className="space-y-3">
            {history.length > 0 ? history.map((session: any, idx: number) => (
              <Card key={idx} className="p-4 border-none rounded-[1.5rem] bg-white shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase italic text-foreground">Sessão {new Date(session.timestamp).toLocaleDateString()}</div>
                    <div className="text-[8px] font-bold text-muted-foreground uppercase">Fluxo Motor: {session.score} pts</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-none font-black">+{session.earnedCoins} LC</Badge>
              </Card>
            )) : (
              <div className="text-center py-10 bg-white/40 rounded-[2rem] border-2 border-dashed border-primary/10">
                <p className="text-[9px] font-black text-muted-foreground uppercase italic tracking-widest">Nenhuma pintura realizada ainda.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 inset-x-0 h-20 bg-white/80 backdrop-blur-2xl border-t border-white/10 flex items-center justify-around px-8 z-[100] rounded-t-[3rem] shadow-2xl">
         <Link href="/playground" className="flex flex-col items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"><Zap className="w-6 h-6" /><span className="text-[8px] font-black uppercase tracking-widest">Jogar</span></Link>
         <div className="flex flex-col items-center gap-1.5 text-primary"><User className="w-7 h-7" /><span className="text-[9px] font-black uppercase tracking-widest">Perfil</span></div>
         <Link href="/history" className="flex flex-col items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"><HistoryIcon className="w-6 h-6" /><span className="text-[8px] font-black uppercase tracking-widest">Sessões</span></Link>
      </footer>
    </div>
  );
}
