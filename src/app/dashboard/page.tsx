
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { ArrowLeft, Brain, Move, Activity, Crosshair, Settings, UserCircle } from 'lucide-react';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const userProgressRef = useMemoFirebase(() => user ? doc(db, 'user_progress', user.uid) : null, [db, user]);
  const { data: userProfile } = useDoc(userProgressRef);

  const activitiesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'user_progress', user.uid, 'challenge_activities'),
      orderBy('startTime', 'desc')
    );
  }, [db, user]);

  const { data: history, isLoading } = useCollection(activitiesQuery);
  
  const typeDistribution = (history || []).reduce((acc: Record<string, number>, item) => {
    const type = item.challengeType || 'other';
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

  const handleUpdateProfile = (field: string, value: string) => {
    if (userProgressRef) {
      updateDocumentNonBlocking(userProgressRef, { [field]: value });
      toast({
        title: "Perfil Atualizado",
        description: "Suas preferências de psicomotricidade foram salvas.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 h-20 flex items-center border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/playground" className="flex items-center gap-2 mr-6">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <UrbeLudoLogo className="w-8 h-8 text-primary" />
          <span className="text-lg font-headline font-bold tracking-tight">Painel de Controle</span>
        </div>
      </header>

      <main className="flex-1 p-6 container mx-auto max-w-4xl">
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <StatMiniCard icon={<Brain className="w-4 h-4" />} label="Consciência Espacial" value={`${Math.min(100, (typeDistribution['spatial_awareness'] || 0) * 10)}%`} />
          <StatMiniCard icon={<Move className="w-4 h-4" />} label="Equilíbrio e Tônus" value={`${Math.min(100, (typeDistribution['balance'] || 0) * 10)}%`} />
          <StatMiniCard icon={<Crosshair className="w-4 h-4" />} label="Precisão Motora" value={`${Math.min(100, (typeDistribution['jump'] || 0) * 10)}%`} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Distribuição de Foco</CardTitle>
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
                  {isLoading ? "Carregando seus dados..." : "Complete desafios para ver sua evolução."}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Settings className="w-4 h-4" /> Perfil Psicomotor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                  <UserCircle className="w-3 h-3" /> Faixa Etária
                </label>
                <Select onValueChange={(v) => handleUpdateProfile('ageGroup', v)} value={userProfile?.ageGroup || 'adolescent_adult'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua idade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preschool">Educação Infantil (2-5 anos)</SelectItem>
                    <SelectItem value="school_age">Fundamental (6-12 anos)</SelectItem>
                    <SelectItem value="adolescent_adult">Adolescente / Adulto (13+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Nível de Habilidade</label>
                <Select onValueChange={(v) => handleUpdateProfile('skillLevel', v)} value={userProfile?.skillLevel || 'intermediate'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground leading-relaxed mt-2">
                  A IA utiliza sua idade e nível para sugerir movimentos pedagogicamente seguros e desafiadores.
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-xs font-bold uppercase text-muted-foreground mb-1">ID do Jogador</div>
                <div className="text-[10px] font-mono break-all opacity-60">{user?.uid}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-muted/50 border-none">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Lógica Pedagógica
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Baseado em Gallahue e Piaget, o UrbeLudo adapta os desafios ao seu estágio de desenvolvimento motor:
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-primary font-bold">●</span> <strong className="text-foreground">Sensório-motor:</strong> Exploração do ambiente.
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">●</span> <strong className="text-foreground">Operatório:</strong> Coordenação e lateralidade.
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">●</span> <strong className="text-foreground">Refinamento:</strong> Performance e saúde.
              </li>
            </ul>
          </Card>
          
          <Card className="p-6 bg-primary/5 border-primary/20 flex flex-col justify-between">
            <div>
              <h3 className="font-bold mb-2">Pronto para mais?</h3>
              <p className="text-sm text-muted-foreground">Encontre um novo elemento urbano e faça o scan para receber um desafio único personalizado para seu nível.</p>
            </div>
            <Button asChild className="w-full mt-6">
              <Link href="/playground">Abrir Câmera</Link>
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
