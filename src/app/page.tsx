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
      <header className="px-6 h-24 flex items-center justify-between border-b border-white/10 sticky top-0 z-[100] bg-background/40 backdrop-blur-3xl">
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="p-2 bg-white rounded-[1.5rem] border-2 border-primary/20 shadow-2xl"
          >
            <UrbeLudoLogo className="w-10 h-10 text-primary" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-3xl font-black uppercase italic tracking-tighter leading-none text-primary">UrbeLudo</span>
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Laboratório Psicomotor 2026</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-6 mr-6">
            <Link href="/auth" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Neurociência</Link>
            <Link href="/auth" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Segurança</Link>
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
                Sincronize seu corpo com o ambiente digital em tempo real. Transforme cada gesto em um rastro de luz consciente usando IA de borda e precisão motora.
              </p>

              <div className="flex flex-col sm:flex-row gap-6">
                <Button asChild size="lg" className="h-28 rounded-[3rem] px-14 text-[18px] font-black uppercase tracking-widest shadow-[0_25px_50px_rgba(147,51,234,0.4)] bg-primary border-b-[12px] border-primary/70 active:border-b-0 active:translate-y-2 transition-all group flex-1">
                  <Link href="/auth" className="flex items-center justify-between w-full">
                    <span>Iniciar Treinamento</span>
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
                   <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">+500 Mestres de Movimento</span>
                </div>
              </div>
            </motion.div>

            {/* INTERACTIVE HUD PREVIEW - AAA GAME FEEL */}
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
              
              {/* HUD OVERLAY ELEMENTS */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/20 pointer-events-none" />
              
              <div className="absolute top-10 right-10 flex flex-col items-end gap-3">
                 <div className="px-5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center gap-3 shadow-2xl">
                    <Activity className="w-5 h-5 text-accent animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sincronia Corporal: 98.4%</span>
                 </div>
                 <div className="px-5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center gap-3 shadow-2xl">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Aura: Nível Ativo</span>
                 </div>
              </div>

              <div className="absolute top-1/2 left-10 flex flex-col gap-4">
                 {[1, 2, 3].map(i => (
                    <motion.div 
                      key={i}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + (i * 0.2) }}
                      className="w-1 h-12 bg-white/20 rounded-full"
                    >
                      <motion.div 
                        animate={{ height: ['0%', '100%', '0%'] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                        className="w-full bg-primary rounded-full shadow-[0_0_10px_rgba(147,51,234,0.8)]"
                      />
                    </motion.div>
                 ))}
              </div>

              <div className="absolute bottom-10 left-10 right-10 p-8 rounded-[4rem] bg-white/10 backdrop-blur-3xl border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[2.5rem] bg-accent flex items-center justify-center text-white shadow-[0_0_50px_rgba(244,63,94,0.6)] animate-pulse">
                    <Scan className="w-10 h-10" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-white/60 tracking-widest mb-1">Status do Sensor</div>
                    <div className="text-2xl font-black text-white italic tracking-tighter">Captura Biomecânica Ativa</div>
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
             <p className="text-[12px] font-black text-muted-foreground uppercase tracking-[0.5em]">Neurociência Aplicada ao Desenvolvimento Psicomotor</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<Waves />}
              title="Equilíbrio"
              description="Domine o sistema vestibular em relação ao horizonte digital. Ajustes posturais milimétricos."
              color="bg-blue-500"
              shadow="shadow-blue-500/20"
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

        {/* TECH REVEAL: DETERMINISTIC AI & PRIVACY */}
        <section className="py-24 px-6 container mx-auto">
           <div className="rounded-[5rem] bg-slate-950 p-16 lg:p-24 relative overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center gap-16">
              <div className="absolute inset-0 bg-mesh-game opacity-20 pointer-events-none" />
              
              <div className="lg:flex-1 space-y-10 relative z-10 text-center lg:text-left">
                 <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-widest border border-white/20">
                    <Cpu className="w-4 h-4 text-cyan-400" /> Tecnologia de Borda Determinística
                 </div>
                 <h2 className="text-6xl lg:text-[9rem] font-black uppercase italic text-white tracking-tighter leading-[0.8]">
                    PRIVACIDADE <span className="text-cyan-400">TOTAL</span>
                 </h2>
                 <p className="text-white/60 text-xl font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                    Sua imagem nunca sai do dispositivo. Nossa IA processa movimentos em milissegundos usando apenas o hardware local para máxima segurança pedagógica.
                 </p>
                 <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-4">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase text-white tracking-widest bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                       <ShieldCheck className="w-5 h-5 text-green-400" /> 100% Offline Ops
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase text-white tracking-widest bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                       <Zap className="w-5 h-5 text-yellow-400" /> Latência Zero
                    </div>
                 </div>
              </div>

              <motion.div 
                whileHover={{ scale: 1.05, rotate: -2 }}
                className="lg:flex-1 relative aspect-square max-w-md w-full bg-gradient-to-br from-primary/30 to-cyan-500/30 rounded-[4rem] border-8 border-white/10 backdrop-blur-3xl flex items-center justify-center p-16 shadow-[0_0_100px_rgba(34,211,238,0.2)]"
              >
                 <div className="relative z-10 w-full h-full">
                    <UrbeLudoLogo className="w-full h-full text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.5)]" />
                 </div>
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.3)_0,transparent_70%)]" />
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent rounded-full blur-[80px] opacity-40" />
                 <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-400 rounded-full blur-[80px] opacity-40" />
              </motion.div>
           </div>
        </section>

        {/* STATS STRIP */}
        <section className="py-20 border-y border-white/5 bg-slate-950/50">
          <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <StatItem value="20ms" label="Latência Visual" />
            <StatItem value="100%" label="Processamento Local" />
            <StatItem value="50+" label="Treinos Sensoriais" />
            <StatItem value="2026" label="Ludo Standard" />
          </div>
        </section>

        {/* FINAL CTA: CONNECT IDENTITY */}
        <section className="py-48 px-6 container mx-auto text-center space-y-16 relative">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
           <div className="max-w-3xl mx-auto space-y-8 relative z-10">
              <h2 className="text-7xl lg:text-[11rem] font-black uppercase italic tracking-tighter text-foreground leading-[0.8]">
                PRONTO PARA <span className="text-primary">DECOLAR</span>?
              </h2>
              <p className="text-muted-foreground text-lg font-bold uppercase tracking-[0.4em]">Crie sua Identidade Ludo e comece o treinamento psicomotor agora.</p>
           </div>
           <Button asChild size="lg" className="h-32 px-24 rounded-full bg-slate-950 text-white font-black uppercase tracking-widest text-3xl shadow-[0_40px_100px_rgba(0,0,0,0.4)] relative z-10 border-b-[16px] border-slate-800 active:border-b-0 active:translate-y-4 transition-all group overflow-hidden">
             <Link href="/auth" className="flex items-center gap-8">
                <span className="relative z-10">Conectar Identidade</span>
                <Play className="w-10 h-10 group-hover:scale-125 transition-transform relative z-10 fill-current" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             </Link>
           </Button>
        </section>
      </main>

      {/* FOOTER: MOVEMENT LABS 2026 */}
      <footer className="py-32 border-t border-white/10 px-6 bg-white/5 backdrop-blur-3xl text-center space-y-16">
        <div className="flex flex-col items-center gap-10">
          <div className="p-6 bg-white rounded-[3rem] shadow-2xl border-4 border-primary/5">
            <UrbeLudoLogo className="w-28 h-28 text-primary" />
          </div>
          <div className="space-y-3">
            <span className="text-5xl font-black uppercase italic tracking-tighter text-primary leading-none">UrbeLudo</span>
            <p className="text-[14px] font-black text-muted-foreground uppercase tracking-[0.5em]">O Futuro do Movimento é Consciente</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-16 text-[11px] font-black uppercase text-muted-foreground tracking-widest opacity-60">
          <Link href="/auth" className="hover:text-primary transition-colors flex items-center gap-2"><Target className="w-4 h-4" /> Termos de Uso</Link>
          <Link href="/auth" className="hover:text-primary transition-colors flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Privacidade</Link>
          <div className="hidden md:block w-3 h-3 rounded-full bg-primary/20" />
          <Link href="/auth" className="hover:text-primary transition-colors flex items-center gap-2"><Gamepad2 className="w-4 h-4" /> Acessibilidade</Link>
          <Link href="/auth" className="hover:text-primary transition-colors flex items-center gap-2"><Wind className="w-4 h-4" /> Respirar</Link>
        </div>
        
        <div className="space-y-4">
           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-40">
            © 2026 UrbeLudo Labs. Todos os direitos reservados. APK Offline v2.5.0 build biocinética.
           </p>
           <div className="flex justify-center gap-4 opacity-20">
              <div className="w-10 h-1 bg-muted-foreground rounded-full" />
              <div className="w-10 h-1 bg-muted-foreground rounded-full" />
              <div className="w-10 h-1 bg-muted-foreground rounded-full" />
           </div>
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
        <div className="absolute inset-0 bg-white/10 group-hover:translate-x-full transition-transform duration-700" />
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-12 h-12 relative z-10" }) : icon}
      </div>
      <div className="space-y-6">
        <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none text-foreground">{title}</h3>
        <p className="text-base text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">{description}</p>
      </div>
      <div className="pt-6">
         <div className="h-2 w-16 rounded-full bg-zinc-100 group-hover:w-32 group-hover:bg-primary/20 transition-all duration-500" />
      </div>
    </motion.div>
  );
}

function StatItem({ value, label }: { value: string, label: string }) {
  return (
    <div className="space-y-2">
      <div className="text-4xl font-black text-white italic tracking-tighter">{value}</div>
      <div className="text-[9px] font-black uppercase text-white/40 tracking-[0.3em]">{label}</div>
    </div>
  );
}
