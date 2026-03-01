
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { 
  Shield, 
  Activity, 
  Zap, 
  Smartphone, 
  Play, 
  ArrowRight, 
  Sparkles,
  Trophy,
  Waves,
  Music,
  Fingerprint
} from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';
import { LanguageSelector } from '@/components/LanguageSelector';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const { t } = useI18n();

  // Usando a foto focada em movimento para o Hero
  const heroImage = PlaceHolderImages.find(img => img.id === 'play-movement');

  return (
    <div className="flex flex-col min-h-screen bg-background bg-mesh-game overflow-x-hidden">
      <AccessibilityToolbar />
      
      <header className="px-6 h-20 flex items-center justify-between border-b border-primary/10 sticky top-0 z-50 bg-background/60 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="p-1 bg-white rounded-2xl border border-primary/20 shadow-inner"
          >
            <UrbeLudoLogo className="w-10 h-10 text-primary" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-2xl font-black uppercase italic tracking-tighter leading-none text-primary">UrbeLudo</span>
            <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{t('home.tagline')}</span>
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
        {/* HERO SECTION */}
        <section className="relative pt-16 pb-20 px-6 container mx-auto overflow-hidden">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8 text-left lg:flex-1"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest animate-pulse-soft">
                <Sparkles className="w-3 h-3" /> Playground Psicomotor 2026
              </div>
              
              <h1 className="text-6xl lg:text-9xl font-black uppercase italic tracking-tighter leading-[0.85] text-foreground">
                DOMINE O <span className="text-primary block">EQUILÍBRIO</span> URBANO
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed max-w-sm font-medium">
                Sincronize seu corpo com a cidade através de sensores de precisão e IA de borda.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-md">
                <Button asChild size="lg" className="h-20 rounded-full px-12 text-[14px] font-black uppercase tracking-widest shadow-2xl bg-primary border-b-8 border-primary/70 active:border-b-0 active:translate-y-2 transition-all group flex-1">
                  <Link href="/auth" className="flex items-center justify-between w-full">
                    <span>{t('home.startJourney')}</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-20 rounded-full px-8 text-[12px] font-black uppercase tracking-widest border-4 border-primary/10 hover:bg-primary/5">
                  <Link href="/playground">{t('home.exploreTech')}</Link>
                </Button>
              </div>
            </motion.div>

            {/* INTERACTIVE PREVIEW */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative aspect-[3/4] sm:aspect-video lg:flex-1 rounded-[4rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.2)] border-8 border-white bg-muted"
            >
               <Image 
                src={heroImage?.imageUrl || "https://picsum.photos/seed/balance/1200/1600"} 
                alt="Movement Playground" 
                fill 
                className="object-cover"
                data-ai-hint={heroImage?.imageHint || "balance movement"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-8 left-8 right-8 p-8 rounded-[3rem] bg-white/20 backdrop-blur-3xl border border-white/30 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-[1.8rem] bg-accent flex items-center justify-center text-white shadow-2xl animate-bounce">
                    <Activity className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-white/80 tracking-widest">Foco Ativo</div>
                    <div className="text-xl font-black text-white italic">Sincronia 98%</div>
                  </div>
                </div>
                <div className="flex -space-x-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-primary/20 backdrop-blur-md overflow-hidden shadow-xl">
                      <img src={`https://picsum.photos/seed/avatar${i}/100/100`} alt="Explorer" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-24 px-6 container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Waves className="w-8 h-8" />}
              title="Equilíbrio"
              description="Ajuste sua postura milimetricamente para dominar a Aura."
              color="bg-blue-500"
            />
            <FeatureCard 
              icon={<Music className="w-8 h-8" />}
              title="Ritmo"
              description="Siga a pulsação sonora da cidade com precisão motora."
              color="bg-primary"
            />
            <FeatureCard 
              icon={<Fingerprint className="w-8 h-8" />}
              title="Precisão"
              description="Controle motor fino através de trilhas de luz digitais."
              color="bg-accent"
            />
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20 px-6 container mx-auto">
          <div className="bg-slate-950 rounded-[4rem] p-12 text-center space-y-8 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-mesh-game opacity-20 pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <h2 className="text-5xl font-black uppercase italic text-white tracking-tighter leading-none">PRONTO PARA O SALTO?</h2>
              <p className="text-white/40 text-sm font-bold uppercase tracking-widest max-w-xs mx-auto">Conecte sua identidade e comece o treino agora.</p>
            </div>
            <Button asChild size="lg" className="h-24 px-16 rounded-full bg-white text-slate-950 font-black uppercase tracking-widest text-xl shadow-2xl relative z-10 border-b-8 border-zinc-200 active:border-b-0 active:translate-y-2 transition-all">
              <Link href="/auth">{t('home.connectIdentity')}</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-16 border-t border-primary/10 px-6 bg-white/20 text-center space-y-10">
        <div className="flex flex-col items-center gap-6">
          <div className="p-3 bg-white rounded-[2rem] shadow-2xl border-2 border-primary/5">
            <UrbeLudoLogo className="w-20 h-20 text-primary" />
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-black uppercase italic tracking-tighter text-primary">UrbeLudo</span>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em]">Playground Digital 2026</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-8 text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">
          <Link href="/terms" className="hover:text-primary transition-colors">Termos</Link>
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacidade</Link>
          <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
          <span>© 2026 UrbeLudo</span>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="p-10 rounded-[3.5rem] bg-white border-b-8 border-zinc-100 shadow-xl space-y-6 flex flex-col items-center text-center"
    >
      <div className={`w-20 h-20 rounded-[2rem] ${color} flex items-center justify-center text-white shadow-2xl`}>
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">{description}</p>
      </div>
    </motion.div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
