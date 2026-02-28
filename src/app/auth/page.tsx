
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { useAuth, useUser } from '@/firebase';
import { 
  initiateEmailSignIn, 
  initiateEmailSignUp, 
  initiateGoogleSignIn,
  initiateAnonymousSignIn
} from '@/firebase/non-blocking-login';
import { Mail, Lock, Chrome, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/playground');
    }
  }, [user, isUserLoading, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      toast({
        variant: 'destructive',
        title: 'Termos Obrigatórios',
        description: 'Você precisa aceitar os termos de uso para continuar.'
      });
      return;
    }

    setIsLoading(true);
    if (isLogin) {
      initiateEmailSignIn(auth, email, password);
    } else {
      initiateEmailSignUp(auth, email, password);
    }
    // O redirecionamento é feito pelo useEffect monitorando o estado do user
  };

  const handleGoogleSignIn = () => {
    if (!termsAccepted) {
      toast({
        variant: 'destructive',
        title: 'Termos Obrigatórios',
        description: 'Você precisa aceitar os termos de uso antes de conectar com Google.'
      });
      return;
    }
    initiateGoogleSignIn(auth);
  };

  const handleGuestSignIn = () => {
    initiateAnonymousSignIn(auth);
  };

  if (isUserLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-[2.5rem] shadow-inner">
            <UrbeLudoLogo className="w-16 h-16 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">UrbeLudo</h1>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Seu Estúdio de Movimento Urbano</p>
          </div>
        </div>

        <Card className="p-8 border-none rounded-[3rem] shadow-xl bg-background space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground px-2">E-mail de Explorador</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="email" 
                  placeholder="seu@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 rounded-2xl h-14 bg-muted/20 border-transparent focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground px-2">Senha de Acesso</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 rounded-2xl h-14 bg-muted/20 border-transparent focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 px-2 pt-2">
              <Checkbox 
                id="terms" 
                checked={termsAccepted} 
                onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                className="w-5 h-5 rounded-md border-2 border-primary"
              />
              <label htmlFor="terms" className="text-[10px] font-bold text-muted-foreground leading-tight">
                Eu aceito os <Link href="/terms" className="text-primary underline">Termos de Uso</Link> e a política de descarte de dados biométricos.
              </label>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-16 rounded-[2.5rem] font-black uppercase tracking-widest bg-primary shadow-lg flex justify-between px-8 border-b-4 border-primary/80 active:border-b-0 active:translate-y-1 transition-all">
              <span>{isLogin ? 'Entrar no Estúdio' : 'Criar Identidade'}</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted" /></div>
            <div className="relative flex justify-center text-[8px] font-black uppercase"><span className="bg-background px-4 text-muted-foreground">Ou conecte via</span></div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button variant="outline" onClick={handleGoogleSignIn} className="h-14 rounded-2xl gap-3 border-muted-foreground/20 font-bold uppercase text-[10px]">
              <Chrome className="w-4 h-4 text-red-500" /> Entrar com Google
            </Button>
          </div>

          <div className="text-center space-y-4 pt-2">
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-[10px] font-black uppercase text-primary hover:underline"
            >
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça Login'}
            </button>
            <div className="block pt-2">
              <button 
                onClick={handleGuestSignIn}
                className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground"
              >
                Continuar como convidado (sem salvar progresso)
              </button>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase text-muted-foreground opacity-60">
          <ShieldCheck className="w-3 h-3 text-primary" />
          IA de Borda: Biometria descartada localmente
        </div>
      </div>
    </div>
  );
}
