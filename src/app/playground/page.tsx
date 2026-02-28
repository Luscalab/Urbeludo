import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { PlaygroundInterface } from '@/components/PlaygroundInterface';
import { History, LayoutDashboard } from 'lucide-react';

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

      <main className="flex-1 relative">
        <PlaygroundInterface />
      </main>
    </div>
  );
}