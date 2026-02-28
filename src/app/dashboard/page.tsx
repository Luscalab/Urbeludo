"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { ArrowLeft, Brain, Crosshair, Move, Activity } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';

type HistoryItem = {
  timestamp: number;
  challenge: {
    challengeType: string;
  };
};

export default function DashboardPage() {
  const [history] = useLocalStorage<HistoryItem[]>("urbe-history", []);
  
  // Calculate distribution
  const typeDistribution = history.reduce((acc: Record<string, number>, item) => {
    const type = item.challenge.challengeType;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(typeDistribution).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value
  }));

  const chartConfig = {
    value: {
      label: "Challenges",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 h-20 flex items-center border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/playground" className="flex items-center gap-2 mr-6">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <UrbeLudoLogo className="w-8 h-8 text-primary" />
          <span className="text-lg font-headline font-bold tracking-tight">Personal Dashboard</span>
        </div>
      </header>

      <main className="flex-1 p-6 container mx-auto max-w-4xl">
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <StatMiniCard icon={<Brain className="w-4 h-4" />} label="Spatial Awareness" value={`${Math.min(100, (typeDistribution['spatial_awareness'] || 0) * 10)}%`} />
          <StatMiniCard icon={<Move className="w-4 h-4" />} label="Balance & Tone" value={`${Math.min(100, (typeDistribution['balance'] || 0) * 10)}%`} />
          <StatMiniCard icon={<Crosshair className="w-4 h-4" />} label="Precision" value={`${Math.min(100, (typeDistribution['jump'] || 0) * 10)}%`} />
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Focus Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ChartContainer config={chartConfig}>
                  <BarChart data={chartData}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(val) => val.split(' ')[0]}
                    />
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--accent))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground italic">
                Complete challenges to see your progress data.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-muted/50 border-none">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Why Psychomotricity?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every challenge you complete strengthens the connection between your cognitive processes and physical movements. Urban play develops:
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-primary font-bold">●</span> Laterality (Dominance)
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">●</span> Body Schema Awareness
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">●</span> Rhythm & Coordination
              </li>
            </ul>
          </Card>
          
          <Card className="p-6 bg-primary/5 border-primary/20 flex flex-col justify-between">
            <div>
              <h3 className="font-bold mb-2">Ready for more?</h3>
              <p className="text-sm text-muted-foreground">Find a new urban element and scan it to get a unique challenge tailored to your skill level.</p>
            </div>
            <Button asChild className="w-full mt-6">
              <Link href="/playground">Open Camera</Link>
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}

function StatMiniCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <Card className="p-4 flex items-center gap-4">
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <div className="text-[10px] text-muted-foreground uppercase font-bold">{label}</div>
        <div className="text-lg font-bold">{value}</div>
      </div>
    </Card>
  );
}