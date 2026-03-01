
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

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-urban');
  const playImage = PlaceHolderImages.find(img => img.id === 'play-movement');

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
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-20 px-6 container mx-auto overflow-hidden">
          <div className="flex flex-col gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8 text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest animate-pulse-soft mx-auto">
                <Sparkles className="w-3 h-3" /> Digital Playground 2026
              </div>
              
              <h1 className="text-5xl lg:text-8xl font-black uppercase italic tracking-tighter leading-[0.9] text-foreground">
                TRANSFORME O <span className="text-primary block">MOVIMENTO</span> EM ARTE
              </h1>
              
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto font-medium">
                O primeiro ecossistema móvel de psicomotricidade que usa IA de borda para converter seu equilíbrio e voz em conquistas digitais.
              </p>

              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <Button asChild size="lg" className="h-20 rounded-full px-10 text-[12px] font-black uppercase tracking-widest shadow-2xl bg-primary border-b-8 border-primary/70 active:border-b-0 active:translate-y-2 transition-all group">
                  <Link href="/auth" className="flex items-center justify-between w-full">
                    <span>{t('home.startJourney')}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="h-14 rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <Link href="/playground">{t('home.exploreTech')}</Link>
                </Button>
              </div>
            </motion.div>

            {/* INTERACTIVE PREVIEW */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative aspect-[4/5] sm:aspect-video rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white bg-muted"
            >
               <Image 
                src={heroImage?.imageUrl || "https://picsum.photos/seed/hero/1200/800"} 
                alt="Urban Playground" 
                fill 
                className="object-cover"
                data-ai-hint={heroImage?.imageHint || "urban architecture"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-8 left-8 right-8 p-8 rounded-[2.5rem] bg-white/10 backdrop-blur-2xl border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-white shadow-xl animate-bounce">
                    <Activity className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-white/70 tracking-widest">Aura Ativa</div>
                    <div className="text-lg font-black text-white italic">Sincronia Vestibular</div>
                  </div>
                </div>
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-primary/20 backdrop-blur-md overflow-hidden shadow-lg">
                      <img src={`https://picsum.photos/seed/${i}/100/100`} alt="Player" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-accent flex items-center justify-center text-[10px] font-black text-white shadow-lg">+2k</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* GAME MODES SECTION */}
        <section className="py-24 px-6 bg-slate-900 text-white rounded-t-[4rem]">
          <div className="container mx-auto space-y-16">
            <div className="text-center space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">O Traço Vivo</span>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Desafios de Precisão</h2>
              <p className="text-xs text-white/40 uppercase font-bold tracking-widest">Laboratórios Sensoriais Portáteis</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ModePreviewCard 
                icon={<Waves className="w-8 h-8" />}
                title="Equilíbrio"
                desc="Use o giroscópio para manter sua Aura no centro da zona segura."
                color="bg-blue-500"
              />
              <ModePreviewCard 
                icon={<Music className="w-8 h-8" />}
                title="Ritmo"
                desc="Mova seu dispositivo seguindo a pulsação sonora da cidade."
                color="bg-primary"
              />
              <ModePreviewCard 
                icon={<Fingerprint className="w-8 h-8" />}
                title="Precisão"
                desc="Desenhe trilhas de luz em labirintos de coordenação motora fina."
                color="bg-accent"
              />
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-24 px-6">
          <div className="container mx-auto space-y-12">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{t('home.coreEngine')}</span>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{t('home.whyUrbeLudo')}</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FeatureCard 
                icon={<Shield className="w-6 h-6" />}
                title={t('home.privacyTitle')}
                description={t('home.privacyDesc')}
                color="bg-emerald-500"
              />
              <FeatureCard 
                icon={<Smartphone className="w-6 h-6" />}
                title={t('home.mobileTitle')}
                description={t('home.mobileDesc')}
                color="bg-zinc-900"
              />
              <FeatureCard 
                icon={<Zap className="w-6 h-6" />}
                title={t('home.aiTitle')}
                description={t('home.aiDesc')}
                color="bg-orange-500"
              />
              <FeatureCard 
                icon={<Trophy className="w-6 h-6" />}
                title="Evolução Lúdica"
                description="Ganhe moedas, suba de nível e personalize seu estúdio privado."
                color="bg-primary"
              />
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20 px-6 container mx-auto">
          <div className="bg-primary rounded-[3.5rem] p-12 text-center space-y-8 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-mesh-game opacity-30 pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <h2 className="text-4xl font-black uppercase italic text-white tracking-tighter">{t('home.ctaTitle')}</h2>
              <p className="text-white/80 text-sm font-medium max-w-xs mx-auto">{t('home.ctaDesc')}</p>
            </div>
            <Button asChild size="lg" className="h-20 px-12 rounded-full bg-white text-primary font-black uppercase tracking-widest text-lg shadow-xl relative z-10 active:scale-95 transition-all">
              <Link href="/auth">{t('home.connectIdentity')}</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-16 border-t border-primary/10 px-6 bg-white/20 text-center space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="p-2 bg-white rounded-3xl shadow-lg">
            <UrbeLudoLogo className="w-16 h-16 text-primary" />
          </div>
          <span className="text-2xl font-black uppercase italic tracking-tighter">UrbeLudo</span>
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-60 max-w-xs mx-auto leading-relaxed">
            Desenvolvido para transformar qualquer ambiente em um espaço de exploração e movimento seguro.
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-6 text-[9px] font-black uppercase text-muted-foreground tracking-widest opacity-40">
          <Link href="/terms" className="hover:text-primary transition-colors">Termos</Link>
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacidade</Link>
          <span>© 2026 UrbeLudo</span>
        </div>
      </footer>
    </div>
  );
}

function ModePreviewCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-6 flex flex-col items-center text-center group hover:bg-white/10 transition-all">
      <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform", color)}>
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-black uppercase italic tracking-tighter">{title}</h3>
        <p className="text-[10px] text-white/40 font-bold uppercase leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      className="p-10 rounded-[3rem] bg-white border border-primary/5 shadow-xl space-y-6 flex items-start gap-8"
    >
      <div className={`w-16 h-16 shrink-0 rounded-[1.5rem] ${color} flex items-center justify-center text-white shadow-lg`}>
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-black uppercase italic tracking-tighter leading-none text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground font-medium leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
