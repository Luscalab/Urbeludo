'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { Mail, Lock, Chrome, ArrowRight, ShieldCheck, ArrowLeft, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/components/I18nProvider';
import { LanguageSelector } from '@/components/LanguageSelector';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';
import { LocalPersistence } from '@/lib/local-persistence';
import { STATIC_AVATAR_LIST } from '@/lib/avatar-catalog';

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useI18n();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getDefaultAvatar = () => {
    return STATIC_AVATAR_LIST[0] || 'hero_default.png';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      toast({
        variant: 'destructive',
        title: 'Atenção',
        description: t('auth.termsAccept')
      });
      return;
    }

    setIsLoading(true);
    
    // Simulação de UID local
    const uid = `URBE_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const firstAvatar = getDefaultAvatar();

    // Persistência Offline
    await LocalPersistence.saveUserId(uid);
    await LocalPersistence.saveProgress({
      id: uid,
      displayName: name || `Explorador_${uid.slice(-4)}`,
      ludoCoins: 50,
      psychomotorLevel: 1,
      totalChallengesCompleted: 0,
      currentStreak: 0,
      hasSeenTutorial: false,
      dominantColor: '#9333ea',
      avatar: { avatarId: firstAvatar },
      history: []
    });

    toast({
      title: "Sucesso!",
      description: "Identidade Ludo conectada."
    });

    router.push('/dashboard');
  };

  const handleGuestSignIn = async () => {
    setIsLoading(true);
    const uid = `GUEST_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const firstAvatar = getDefaultAvatar();

    await LocalPersistence.saveUserId(uid);
    await LocalPersistence.saveProgress({
      id: uid,
      displayName: "Convidado",
      ludoCoins: 50,
      psychomotorLevel: 1,
      totalChallengesCompleted: 0,
      currentStreak: 0,
      hasSeenTutorial: false,
      dominantColor: '#3b82f6',
      avatar: { avatarId: firstAvatar },
      history: []
    });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col p-6">
      <AccessibilityToolbar />
      
      <header className="flex items-center justify-between mb-8">
        <Link href="/" className="p-2 bg-white rounded-full shadow-sm"><ArrowLeft className="w-5 h-5 text-primary" /></Link>
        <LanguageSelector />
      </header>

      <div className="w-full max-w-md mx-auto space-y-8 flex-1 flex flex-col justify-center">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-1 bg-white rounded-[2rem] shadow-inner">
            <UrbeLudoLogo className="w-16 h-16 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{t('auth.title')}</h1>
            <p className="text-[8px] font-black text-primary uppercase tracking-widest">{t('auth.tagline')}</p>
          </div>
        </div>

        <Card className="p-8 border-none rounded-[3rem] shadow-xl bg-background space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground px-2">{t('auth.nameLabel')}</Label>
                <div className="relative">
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="text" 
                    placeholder="Seu nome lúdico" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-12 rounded-2xl h-14 bg-muted/20 border-transparent focus:border-primary"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground px-2">{t('auth.emailLabel')}</Label>
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
              <Label className="text-[10px] font-black uppercase text-muted-foreground px-2">{t('auth.passwordLabel')}</Label>
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
              <label htmlFor="terms" className="text-[9px] font-bold text-muted-foreground leading-tight">
                {t('auth.termsAccept')}
              </label>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-16 rounded-[2.5rem] font-black uppercase tracking-widest bg-primary shadow-lg flex justify-between px-8 border-b-4 border-primary/80 active:border-b-0 active:translate-y-1 transition-all">
              <span>{isLogin ? t('auth.loginButton') : t('auth.signUpButton')}</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted" /></div>
            <div className="relative flex justify-center text-[8px] font-black uppercase"><span className="bg-background px-4 text-muted-foreground">Ou conecte via</span></div>
          </div>

          <Button variant="outline" className="w-full h-14 rounded-2xl gap-3 border-muted-foreground/20 font-bold uppercase text-[10px]">
            <Chrome className="w-4 h-4 text-red-500" /> {t('auth.googleSignIn')}
          </Button>

          <div className="text-center space-y-4 pt-2">
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-[10px] font-black uppercase text-primary hover:underline"
            >
              {isLogin ? t('auth.toggleSignUp') : t('auth.toggleLogin')}
            </button>
            <div className="block pt-2">
              <button 
                onClick={handleGuestSignIn}
                className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground"
              >
                {t('auth.guestSignIn')}
              </button>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase text-muted-foreground opacity-60">
          <ShieldCheck className="w-3 h-3 text-primary" />
          {t('auth.edgeAi')}
        </div>
      </div>
    </div>
  );
}
