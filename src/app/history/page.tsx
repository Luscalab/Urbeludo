"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { ArrowLeft, CheckCircle2, Calendar, Trophy, Zap } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';

type HistoryItem = {
  timestamp: number;
  challenge: {
    challengeDescription: string;
    challengeType: string;
    targetElement: string;
    difficulty: string;
  };
};

export default function HistoryPage() {
  const [history] = useLocalStorage<HistoryItem[]>("urbe-history", []);
  const [stats] = useLocalStorage<{ streak: number; totalCompleted: number }>("urbe-stats", { streak: 0, totalCompleted: 0 });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 h-20 flex items-center border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/playground" className="flex items-center gap-2 mr-6">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <UrbeLudoLogo className="w-8 h-8 text-primary" />
          <span className="text-lg font-headline font-bold tracking-tight">Your Journey</span>
        </div>
      </header>

      <main className="flex-1 p-6 container mx-auto max-w-2xl">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <Card className="p-6 bg-primary text-primary-foreground flex flex-col items-center justify-center text-center">
            <Trophy className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.totalCompleted}</div>
            <div className="text-xs font-medium uppercase tracking-widest opacity-80">Challenges Won</div>
          </Card>
          <Card className="p-6 bg-accent text-accent-foreground flex flex-col items-center justify-center text-center">
            <Zap className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.streak}</div>
            <div className="text-xs font-medium uppercase tracking-widest opacity-80">Current Streak</div>
          </Card>
        </div>

        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" /> Activity History
        </h2>

        {history.length === 0 ? (
          <div className="text-center py-20 bg-muted rounded-3xl border border-dashed">
            <p className="text-muted-foreground mb-6">No challenges completed yet.</p>
            <Button asChild>
              <Link href="/playground">Find your first spot</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, idx) => (
              <Card key={idx} className="p-4 hover:border-primary/40 transition-colors">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-primary px-1.5 py-0.5 rounded bg-primary/10">
                        {item.challenge.difficulty}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm mb-1 leading-snug">{item.challenge.challengeDescription}</h3>
                    <div className="text-xs text-muted-foreground">
                      Target: {item.challenge.targetElement} • Type: {item.challenge.challengeType.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}