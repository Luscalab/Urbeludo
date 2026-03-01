
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { Shield, Activity, Zap, Smartphone, Play, ArrowRight, Sparkles } from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';
import { LanguageSelector } from '@/components/LanguageSelector';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col min-h-screen bg-background bg-mesh-game overflow-x-hidden">
      <AccessibilityToolbar />
      
      <header className="px-6 h-20 flex items-center justify-between border-b border-primary/10 sticky top-0 z-50 bg-background/60 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="p-1 bg-white rounded-2xl border border-primary/20 shadow-inner"
          >
            <UrbeLudoLogo className="w-10 h-10 text-primary" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-xl font-black uppercase italic tracking-tighter leading-none">UrbeLudo</span>
            <span className="text-[7px] font-bold text-primary uppercase tracking-[0.1em]">{t('home.tagline')}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <Button asChild size="icon" variant="ghost" className="rounded-2xl">
            <Link href="/auth"><Play className="w-5 h-5 text-primary" /></Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative pt-12 pb-20 px-6 container mx-auto">
          <div className="flex flex-col gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8 text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest animate-pulse-soft mx-auto">
                <Sparkles className="w-3 h-3" /> Digital Playground Active
              </div>
              <h1 className="text-5xl lg:text-8xl font-black uppercase italic tracking-tighter leading-[0.9] text-foreground">
                {t('home.heroTitle').split(' ').map((word, i) => (
                  <span key={i} className={i === 2 ? "text-primary block" : ""}>{word} </span>
                ))}
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto font-medium">
                {t('home.heroSubtitle')}
              </p>
              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <Button asChild size="lg" className="h-16 rounded-full px-10 text-[12px] font-black uppercase tracking-widest shadow-2xl bg-primary group">
                  <Link href="/auth" className="flex items-center justify-between w-full">
                    <span>{t('home.startJourney')}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="h-14 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <Link href="/playground">{t('home.exploreTech')}</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border-2 border-white/20 bg-muted"
            >
               <Image 
                src="https://images.unsplash.com/photo-1581175990636-0c75be2d4aea?auto=format&fit=crop&q=80&w=1200&h=800" 
                alt="Urban Playground" 
                fill 
                className="object-cover"
                data-ai-hint="urban architecture"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-6 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center text-white shadow-lg">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[8px] font-black uppercase text-white/70 tracking-widest">{t('home.activePlayers')}</div>
                    <div className="text-sm font-black text-white italic">+2.5K Hoje</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-20 px-6">
          <div className="container mx-auto space-y-12">
            <div className="text-center space-y-2">
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-primary">{t('home.coreEngine')}</span>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">{t('home.whyUrbeLudo')}</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <FeatureCard 
                icon={<Shield className="w-5 h-5" />}
                title={t('home.privacyTitle')}
                description={t('home.privacyDesc')}
                color="bg-blue-500"
              />
              <FeatureCard 
                icon={<Activity className="w-5 h-5" />}
                title={t('home.psychomotorTitle')}
                description={t('home.psychomotorDesc')}
                color="bg-primary"
              />
              <FeatureCard 
                icon={<Zap className="w-5 h-5" />}
                title={t('home.aiTitle')}
                description={t('home.aiDesc')}
                color="bg-accent"
              />
              <FeatureCard 
                icon={<Smartphone className="w-5 h-5" />}
                title={t('home.mobileTitle')}
                description={t('home.mobileDesc')}
                color="bg-zinc-900"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-primary/10 px-6 bg-white/20 text-center space-y-6">
        <div className="flex flex-col items-center gap-3">
          <UrbeLudoLogo className="w-12 h-12 text-primary" />
          <span className="text-lg font-black uppercase italic tracking-tighter">UrbeLudo</span>
          <p className="text-[8px] font-bold text-primary uppercase tracking-widest">{t('home.tagline')}</p>
        </div>
        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-50">
          © 2026 UrbeLudo. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      className="p-8 rounded-[2.5rem] bg-white border border-primary/5 shadow-lg space-y-6 flex items-center gap-6"
    >
      <div className={`w-12 h-12 shrink-0 rounded-[1.2rem] ${color} flex items-center justify-center text-white shadow-md`}>
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-black uppercase italic tracking-tighter leading-none">{title}</h3>
        <p className="text-[10px] text-muted-foreground font-medium leading-tight">{description}</p>
      </div>
    </motion.div>
  );
}
