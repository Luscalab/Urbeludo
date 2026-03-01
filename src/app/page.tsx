
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { 
  Zap, 
  Play, 
  ArrowRight, 
  Sparkles,
  Waves,
  Music,
  Fingerprint,
  ShieldCheck,
  Activity,
  Cpu,
  Trophy,
  Target,
  Orbit,
  Gamepad2,
  Scan,
  Wind
} from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';
import { LanguageSelector } from '@/components/LanguageSelector';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

export default function Home() {
  const { t } = useI18n();

  // Imagem focada em movimento consciente para o Hero
  const heroImage = PlaceHolderImages.find(img => img.id === 'play-movement');

  return (
    <div className="flex flex-col min-h-screen bg-background bg-mesh-game overflow-x-hidden">
      <AccessibilityToolbar />
      
      {/* NAVBAR FUTURISTA - GLASSMORPHISM */}
      <header className="px-6 h-24 flex items-center justify-between border-b border-white/20 sticky top-0 z-[100] bg-white/40 backdrop-blur-3xl">
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="p-2 bg-white rounded-[1.5rem] border-2 border-primary/20 shadow-2xl"
          >
            <UrbeLudoLogo className="w-10 h-10 text-primary" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-3xl font-black uppercase italic tracking-tighter leading-none text-primary">UrbeLudo</span>
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Laboratório de Psicomotricidade 2026</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-6 mr-6">
            <Link href="/auth" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Neurociência</Link>
            <Link href="/auth" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Precisão</Link>
            <Link href="/auth" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Privacidade</Link>
          </div>
          <LanguageSelector />
          <Button asChild className="rounded-full bg-primary font-black uppercase text-[10px] px-8 h-12 shadow-[0_10px_20px_rgba(147,51,234,0.3)] hover:shadow-primary/40 transition-all border-b-4 border-primary/70">
            <Link href="/auth">Conectar</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION: O SALTO PARA A PSICOMOTRICIDADE 2026 */}
        <section className="relative pt-20 pb-32 px-6 container mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <motion.div 
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "circOut" }}
              className="space-y-10 text-left lg:flex-1 relative z-10"
            >
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest animate-pulse-soft">
                <Orbit className="w-4 h-4" /> Evolução Biomecânica Digital
              </div>
              
              <h1 className="text-7xl lg:text-[10rem] font-black uppercase italic tracking-tighter leading-[0.8] text-foreground text-shadow-game">
                DOMINE A <span className="text-primary block">AURA</span> DO MOVIMENTO
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-md font-medium">
                Sincronize seu corpo com o ambiente digital em tempo real. Transforme cada gesto em um rastro de luz consciente usando IA de borda.
              </p>

              <div className="flex flex-col sm:flex-row gap-6">
                <Button asChild size="lg" className="h-28 rounded-[3rem] px-14 text-[18px] font-black uppercase tracking-widest shadow-[0_25px_50px_rgba(147,51,234,0.4)] bg-primary border-b-[12px] border-primary/70 active:border-b-0 active:translate-y-2 transition-all group flex-1">
                  <Link href="/auth" className="flex items-center justify-between w-full">
                    <span>Iniciar Treino</span>
                    <ArrowRight className="w-10 h-10 group-hover:translate-x-3 transition-transform" />
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-8">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-zinc-200 overflow-hidden shadow-2xl relative">
                      <Image src={`https://picsum.photos/seed/explorer${i}/80/80`} alt="Explorer" fill className="object-cover" />
                    </div>
                  ))}
                </div>
                <div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-primary block">Rede Ativa</span>
                   <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">+500 Atletas da Aura</span>
                </div>
              </div>
            </motion.div>

            {/* INTERACTIVE HUD PREVIEW */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="relative aspect-[4/5] lg:flex-1 w-full max-w-2xl rounded-[5rem] overflow-hidden shadow-[0_80px_150px_rgba(0,0,0,0.3)] border-[12px] border-white bg-slate-900 group"
            >
              <Image 
                src={heroImage?.imageUrl || "https://picsum.photos/seed/balance/1200/1600"} 
                alt="Movement Mastery" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-1000 opacity-80"
                priority
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/20 pointer-events-none" />
              
              <div className="absolute top-10 right-10 flex flex-col items-end gap-3">
                 <div className="px-5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center gap-3 shadow-2xl">
                    <Activity className="w-5 h-5 text-secondary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sincronia: 98.4%</span>
                 </div>
                 <div className="px-5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center gap-3 shadow-2xl">
                    <Zap className="w-5 h-5 text-accent" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Aura: Bio-Ativa</span>
                 </div>
              </div>

              <div className="absolute bottom-10 left-10 right-10 p-8 rounded-[4rem] bg-white/10 backdrop-blur-3xl border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[2.5rem] bg-accent flex items-center justify-center text-white shadow-[0_0_50px_rgba(244,63,94,0.6)] animate-pulse">
                    <Scan className="w-10 h-10" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-white/60 tracking-widest mb-1">Status do Sensor</div>
                    <div className="text-2xl font-black text-white italic tracking-tighter">Captura Biomecânica</div>
                  </div>
                </div>
                <Button variant="secondary" className="px-8 h-16 rounded-full font-black uppercase text-[12px] tracking-widest shadow-xl bg-white text-primary hover:bg-zinc-100">
                  Jogar Agora
                </Button>
              </div>

              <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-primary/40 blur-sm z-20 pointer-events-none shadow-[0_0_20px_rgba(147,51,234,0.8)]"
              />
            </motion.div>
          </div>
        </section>

        {/* FEATURES: O LABORATÓRIO SENSORIAL 2026 */}
        <section className="py-32 px-6 container mx-auto">
          <div className="flex flex-col items-center text-center mb-24 space-y-4">
             <div className="p-4 bg-white rounded-3xl shadow-xl border-4 border-primary/5 mb-4">
                <UrbeLudoLogo className="w-16 h-16 text-primary" />
             </div>
             <h2 className="text-6xl lg:text-8xl font-black uppercase italic tracking-tighter text-foreground leading-none">A CIÊNCIA DO <span className="text-primary">PLAY</span></h2>
             <p className="text-[12px] font-black text-muted-foreground uppercase tracking-[0.5em]">Neurociência do Desenvolvimento Motor</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<Waves />}
              title="Equilíbrio"
              description="Domine o sistema vestibular em relação ao horizonte digital. Ajustes posturais milimétricos."
              color="bg-secondary"
              shadow="shadow-secondary/20"
            />
            <FeatureCard 
              icon={<Music />}
              title="Ritmo"
              description="Sincronize batimentos e movimentos com a pulsação sonora. Coordenação rítmica avançada."
              color="bg-primary"
              shadow="shadow-primary/20"
            />
            <FeatureCard 
              icon={<Fingerprint />}
              title="Precisão"
              description="Refine sua coordenação visomotora fina através de trilhas de luz geradas em tempo real."
              color="bg-accent"
              shadow="shadow-accent/20"
            />
          </div>
        </section>

        {/* TECH REVEAL */}
        <section className="py-24 px-6 container mx-auto">
           <div className="rounded-[5rem] bg-slate-950 p-16 lg:p-24 relative overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center gap-16">
              <div className="absolute inset-0 bg-mesh-game opacity-20 pointer-events-none" />
              
              <div className="lg:flex-1 space-y-10 relative z-10 text-center lg:text-left">
                 <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-widest border border-white/20">
                    <Cpu className="w-4 h-4 text-secondary" /> Tecnologia de Borda Determinística
                 </div>
                 <h2 className="text-6xl lg:text-[9rem] font-black uppercase italic text-white tracking-tighter leading-[0.8]">
                    PRIVACIDADE <span className="text-secondary">TOTAL</span>
                 </h2>
                 <p className="text-white/60 text-xl font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                    Sua imagem nunca sai do dispositivo. Nossa IA processa movimentos em milissegundos usando apenas hardware local.
                 </p>
                 <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-4">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase text-white tracking-widest bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                       <ShieldCheck className="w-5 h-5 text-green-400" /> 100% Offline
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase text-white tracking-widest bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                       <Zap className="w-5 h-5 text-yellow-400" /> Latência Zero
                    </div>
                 </div>
              </div>

              <motion.div 
                whileHover={{ scale: 1.05, rotate: -2 }}
                className="lg:flex-1 relative aspect-square max-w-md w-full bg-gradient-to-br from-primary/30 to-secondary/30 rounded-[4rem] border-8 border-white/10 backdrop-blur-3xl flex items-center justify-center p-16 shadow-[0_0_100px_rgba(34,211,238,0.2)]"
              >
                 <div className="relative z-10 w-full h-full">
                    <UrbeLudoLogo className="w-full h-full text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.5)]" />
                 </div>
              </motion.div>
           </div>
        </section>
      </main>

      <footer className="py-24 border-t border-white/10 px-6 text-center space-y-12">
        <div className="flex flex-col items-center gap-6">
          <UrbeLudoLogo className="w-20 h-20 text-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground opacity-60">
            © 2026 UrbeLudo Labs. O Futuro do Movimento é Consciente.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color, shadow }: { icon: React.ReactNode, title: string, description: string, color: string, shadow: string }) {
  return (
    <motion.div 
      whileHover={{ y: -20, scale: 1.05 }}
      className={cn(
        "p-14 rounded-[5rem] bg-white border-b-[16px] border-zinc-100 shadow-[0_40px_80px_rgba(0,0,0,0.08)] space-y-10 flex flex-col items-center text-center group transition-all duration-500",
        shadow
      )}
    >
      <div className={cn(
        "w-28 h-28 rounded-[3rem] flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform duration-500 relative overflow-hidden",
        color
      )}>
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-12 h-12 relative z-10" }) : icon}
      </div>
      <div className="space-y-6">
        <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none text-foreground">{title}</h3>
        <p className="text-base text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">{description}</p>
      </div>
    </motion.div>
  );
}
