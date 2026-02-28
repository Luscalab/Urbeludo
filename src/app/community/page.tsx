
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { ArrowLeft, MapPin, User, Info, Trophy } from 'lucide-react';
import { useCollection } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function CommunityPage() {
  const { data: myActivities, isLoading } = useCollection(null);

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col pb-24">
      <header className="px-6 h-16 flex items-center justify-between bg-background border-b sticky top-0 z-50">
        <Link href="/playground" className="p-2"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex items-center gap-2">
          <UrbeLudoLogo className="w-6 h-6 text-primary" />
          <span className="text-sm font-black uppercase italic tracking-tighter">Minha Jornada</span>
        </div>
        <div className="w-9" />
      </header>

      <main className="p-4 space-y-6 container max-w-lg mx-auto">
        <Card className="bg-primary/90 p-6 rounded-[2.5rem] text-white space-y-4 shadow-xl border-none">
          <div className="flex items-center gap-3">
            <Info className="w-6 h-6" />
            <h2 className="text-sm font-black uppercase italic tracking-tight">Modo Standalone Ativo</h2>
          </div>
          <p className="text-[10px] font-medium leading-relaxed opacity-90">
            Você está em uma rede lúdica privada. Seus dados e conquistas são salvos exclusivamente neste dispositivo para máxima privacidade e performance.
          </p>
        </Card>

        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Últimas Conquistas</h3>
          <Trophy className="w-4 h-4 text-primary" />
        </div>

        {isLoading ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>
        ) : (
          <div className="grid gap-4">
            {myActivities?.map((post: any, idx: number) => (
              <Card key={idx} className="overflow-hidden border-none rounded-[2rem] shadow-sm bg-background p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                   <MapPin className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black uppercase italic truncate">{post.challengeTitle}</h4>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase">{new Date(post.startTime).toLocaleDateString()} • {post.missionType}</p>
                </div>
                <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black">+{post.ludoCoinsEarned} LC</Badge>
              </Card>
            )) || (
              <div className="text-center py-10 text-muted-foreground text-[10px] font-bold uppercase">Nenhuma atividade registrada.</div>
            )}
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 inset-x-0 h-20 bg-background border-t flex items-center justify-around px-6 z-50">
         <Link href="/playground" className="flex flex-col items-center gap-1 text-muted-foreground"><MapPin className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Play</span></Link>
         <div className="flex flex-col items-center gap-1 text-primary"><Trophy className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Jornada</span></div>
         <Link href="/dashboard" className="flex flex-col items-center gap-1 text-muted-foreground"><User className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Perfil</span></Link>
      </footer>
    </div>
  );
}

function Loader2(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-loader-2 animate-spin"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>;
}
