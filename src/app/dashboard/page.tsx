
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Coins, 
  Zap, 
  Target, 
  Award, 
  User, 
  History as HistoryIcon,
  Calendar,
  Sparkles,
  ShieldCheck,
  Edit3
} from 'lucide-react';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { getAvatarById } from '@/lib/avatar-catalog';
import { useI18n } from '@/components/I18nProvider';

export default function DashboardPage() {
  const { user } = useUser();
  const { t } = useI18n();
  const userProgressRef = useMemoFirebase(() => user ? { id: user.uid, path: `user_progress/${user.uid}` } : null, [user]);
  const { data: profile } = useDoc(userProgressRef);

  const avatarInfo = getAvatarById(profile?.avatar?.avatarId || '1.png');
  const history = (profile?.history || []).slice(0, 5);
  const auraColor = profile?.dominantColor || '#9333ea';
  const level = profile?.psychomotorLevel || 1;

  return (
    <div className="min-h-screen bg-background bg-mesh-game flex flex-col pb-32">
      <header className="px-6 h-20 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-[100] border-b">
        <Link href="/" className="p-2 bg-white rounded-full shadow-sm"><ArrowLeft className="w-5 h-5 text-primary" /></Link>
        <div className="flex items-center gap-2">
          <UrbeLudoLogo className="w-6 h-6 text-primary" />
          <span className="text-sm font-black uppercase italic tracking-tighter">Perfil Ludo</span>
        </div>
        <div className="bg-primary/10 px-4 py-1.5 rounded-2xl flex items-center gap-2 border border-primary/20">
          <Coins className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-black">{profile?.ludoCoins || 0}</span>
        </div>
      </header>

      <main className="flex-1 p-8 space-y-10 container max-w-lg mx-auto">
        {/* Seção de Evolução de Aura */}
        <div className="flex flex-col items-center text-center space-y-6">
           <div className="relative group">
             <motion.div 
               animate={{ 
                 scale: [1, 1.1, 1],
                 opacity: [0.3, 0.6, 0.3],
                 rotate: [0, 180, 360]
               }}
               transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 rounded-full blur-3xl -z-10"
               style={{ backgroundColor: auraColor }}
             />
             <div className="w-40 h-40 rounded-[4rem] overflow-hidden border-4 border-white shadow-2xl bg-white p-4 relative">
               <img src={avatarInfo.src} alt="Avatar" className="w-full h-full object-contain" />
               <div className="absolute inset-0 pointer-events-none rounded-[3.8rem] border-2 border-primary/10" />
             </div>
             
             <Link href="/profile/edit" className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-accent border-4 border-white flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all">
               <Edit3 className="w-5 h-5" />
             </Link>
           </div>
           
           <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{profile?.displayName || "Explorador"}</h2>
              <div className="flex flex-col items-center gap-2">
                 <div className="flex items-center gap-3">
                   <Badge variant="outline" className="text-[9px] font-black uppercase border-primary/20 text-primary px-3 py-1 rounded-full">Nível {level}</Badge>
                   <Badge variant="outline" className="text-[9px] font-black uppercase border-accent/20 text-accent px-3 py-1 rounded-full">
                     {profile?.avatar?.accessoryType || "Explorador Iniciante"}
                   </Badge>
                 </div>
                 <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em]">{t('dashboard.evolution')}</p>
              </div>
           </div>
        </div>

        <Button asChild className="w-full h-24 rounded-full font-black uppercase tracking-widest shadow-2xl flex justify-center gap-4 bg-primary border-b-8 border-primary/70 active:border-b-0 active:translate-y-2 transition-all group overflow-hidden relative">
          <Link href="/playground">
            <Zap className="w-8 h-8 group-hover:scale-125 transition-transform" /> Iniciar Brincadeira
            <motion.div 
              animate={{ x: [-200, 600] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
            />
          </Link>
        </Button>

        <div className="grid grid-cols-2 gap-4">
           <Card className="p-6 bg-white border-none rounded-[2.5rem] shadow-lg flex flex-col items-center gap-3 text-center border-b-4 border-zinc-100">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Target className="w-5 h-5" /></div>
              <div className="space-y-1">
                 <div className="text-xl font-black">{profile?.totalChallengesCompleted || 0}</div>
                 <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Sessões</div>
              </div>
           </Card>
           <Card className="p-6 bg-white border-none rounded-[2.5rem] shadow-lg flex flex-col items-center gap-3 text-center border-b-4 border-zinc-100">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent"><Award className="w-5 h-5" /></div>
              <div className="space-y-1">
                 <div className="text-xl font-black">{profile?.currentStreak || 0}</div>
                 <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Dias Ativos</div>
              </div>
           </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><HistoryIcon className="w-4 h-4" /> Histórico Recente</h3>
          <div className="space-y-3">
            {history.length > 0 ? history.map((session: any, idx: number) => (
              <Card key={idx} className="p-4 border-none rounded-[2rem] bg-white shadow-sm flex items-center justify-between border-b-2 border-zinc-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"><Calendar className="w-5 h-5 text-muted-foreground" /></div>
                  <div>
                    <div className="text-[9px] font-black uppercase italic text-foreground">{new Date(session.timestamp).toLocaleDateString()}</div>
                    <div className="text-[8px] font-bold text-muted-foreground uppercase">{session.type || 'Desafio Concluído'}</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-none font-black">+{session.earnedCoins} LC</Badge>
              </Card>
            )) : (
              <div className="text-center py-10 bg-white/40 rounded-[2.5rem] border-2 border-dashed border-primary/20">
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Nenhuma atividade registrada.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-[8px] font-black uppercase text-muted-foreground opacity-40 py-4">
          <ShieldCheck className="w-3 h-3 text-primary" />
          Soberania de Dados: Suas auras são privadas e locais.
        </div>
      </main>

      <footer className="fixed bottom-0 inset-x-0 h-20 bg-white/80 backdrop-blur-2xl border-t flex items-center justify-around px-8 z-[100] rounded-t-[2.5rem] shadow-2xl">
         <Link href="/playground" className="flex flex-col items-center gap-1 text-muted-foreground"><Zap className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Brincar</span></Link>
         <div className="flex flex-col items-center gap-1 text-primary"><User className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Perfil</span></div>
         <Link href="/" className="flex flex-col items-center gap-1 text-muted-foreground"><ArrowLeft className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Sair</span></Link>
      </footer>
    </div>
  );
}
