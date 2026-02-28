'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { History, LayoutDashboard, Loader2 } from 'lucide-react';

// Carregamento dinâmico do PlaygroundInterface com SSR desativado.
// Isso resolve o erro "Export Pose doesn't exist" ao isolar o TensorFlow do servidor.
const PlaygroundInterface = dynamic(
  () => import('@/components/PlaygroundInterface').then(mod => mod.PlaygroundInterface),
  { 
    ssr: false,
    loading: () => (
      <div className="flex-1 flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Iniciando Motor de Visão...</p>
      </div>
    )
  }
);

export default function PlaygroundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 h-20 flex items-center border-b bg-background/80 backdrop-blur-md z-50">
        <Link href="/" className="flex items-center gap-2">
          <UrbeLudoLogo className="w-8 h-8 text-primary" />
          <span className="text-lg font-headline font-bold tracking-tight hidden sm:inline-block">UrbeLudo</span>
        </Link>
        <div className="ml-auto flex gap-2">
           <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
            <Link href="/history">
              <History className="w-4 h-4 mr-2" /> History
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm" className="bg-primary/10 text-primary hover:bg-primary/20">
            <Link href="/dashboard">
              <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 relative flex flex-col">
        <PlaygroundInterface />
      </main>
    </div>
  );
}
