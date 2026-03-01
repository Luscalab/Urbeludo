'use client';

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
  Target
} from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';
import { LanguageSelector } from '@/components/LanguageSelector';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

export default function Home() {
  const { t } = useI18n();

  // Imagem focada em movimento para o Hero
  const heroImage = PlaceHolderImages.find(img => img.id === 'play-movement');

  return (
    <div className="flex flex-col min-h-screen bg-background bg-mesh-game overflow-x-hidden">
      <AccessibilityToolbar />
      
      {/* NAVBAR FUTURISTA */}
      <header className="px-6 h-24 flex items-center justify-between border-b border-primary/10 sticky top-0 z-[100] bg-background/60 backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="p-2 bg-white rounded-[1.5rem] border-2 border-primary/20 shadow-xl"
          >
            <UrbeLudoLogo className="w-10 h-10 text-primary" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-3xl font-black uppercase italic tracking-tighter leading-none text-primary">UrbeLudo</span>
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.3em]">{t('home.tagline')}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <Button asChild className="rounded-full bg-primary font-black uppercase text-[10px] px-8 h-12 shadow-lg hover:shadow-primary/20 transition-all">
            <Link href="/auth">Conectar</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION: O SALTO PARA 2026 */}
        <section className="relative pt-20 pb-32 px-6 container mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <motion.div 
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "circOut" }}
              className="space-y-10 text-left lg:flex-1 relative z-10"
            >
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest animate-pulse-soft">
                <Sparkles className="w-4 h-4" /> Laboratório Psicomotor 2026
              </div>
              
              <h1 className="text-7xl lg:text-[10rem] font-black uppercase italic tracking-tighter leading-[0.8] text-foreground text-shadow-game">
                DOMINE A <span className="text-primary block">AURA</span> DA CIDADE
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-md font-medium">
                Transforme cada passo em um rastro de luz digital. Use sensores de precisão e IA de borda para sincronizar seu corpo com o ambiente urbano.
              </p>

              <div className="flex flex-col sm:flex-row gap-6">
                <Button asChild size="lg" className="h-24 rounded-[3rem] px-14 text-[16px] font-black uppercase tracking-widest shadow-[0_25px_50px_rgba(147,51,234,0.3)] bg-primary border-b-[12px] border-primary/70 active:border-b-0 active:translate-y-2 transition-all group flex-1">
                  <Link href="/auth" className="flex items-center justify-between w-full">
                    <span>{t('home.startJourney')}</span>
                    <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform" />
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-4 pt-8 opacity-60">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-zinc-200 overflow-hidden shadow-lg">
                      <Image src={`https://picsum.photos/seed/explorer${i}/80/80`} alt="Explorer" width={40} height={40} className="object-cover" />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">+500 Artistas Ativos hoje</span>
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
                alt="Movement Playground" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-1000 opacity-80"
                priority
              />
              
              {/* HUD OVERLAY ELEMENTS */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20 pointer-events-none" />
              
              <div className="absolute top-10 right-10 flex flex-col items-end gap-3">
                 <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center gap-3 shadow-2xl">
                    <Activity className="w-5 h-5 text-accent animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sincronia: 98.4%</span>
                 </div>
                 <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center gap-3 shadow-2xl">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Nível 4: Aura Solar</span>
                 </div>
              </div>

              <div className="absolute bottom-10 left-10 right-10 p-8 rounded-[3.5rem] bg-white/20 backdrop-blur-3xl border border-white/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[2rem] bg-accent flex items-center justify-center text-white shadow-[0_0_40px_rgba(244,63,94,0.5)]">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-white/60 tracking-widest mb-0.5">Status de Borda</div>
                    <div className="text-xl font-black text-white italic tracking-tighter">Processamento Local</div>
                  </div>
                </div>
                <div className="px-6 py-3 bg-white text-primary rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl">
                  Explorar Agora
                </div>
              </div>

              {/* SCANNER LINE EFFECT */}
              <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-primary/40 blur-sm z-20 pointer-events-none shadow-[0_0_20px_rgba(147,51,234,0.8)]"
              />
            </motion.div>
          </div>
        </section>

        {/* FEATURES: O LABORATÓRIO SENSORIAL */}
        <section className="py-32 px-6 container mx-auto">
          <div className="text-center mb-24 space-y-4">
             <h2 className="text-5xl lg:text-7xl font-black uppercase italic tracking-tighter text-foreground">SINTA A CIDADE</h2>
             <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">O Futuro da Psicomotricidade Digital</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<Waves />}
              title="Equilíbrio"
              description="Domine o sistema vestibular ajustando sua postura em relação ao horizonte digital."
              color="bg-blue-500"
              shadow="shadow-blue-500/20"
            />
            <FeatureCard 
              icon={<Music />}
              title="Ritmo"
              description="Sincronize seus batimentos e movimentos com a pulsação urbana captada pelos sensores."
              color="bg-primary"
              shadow="shadow-primary/20"
            />
            <FeatureCard 
              icon={<Fingerprint />}
              title="Precisão"
              description="Refine sua coordenação visomotora fina através de trilhas de luz geradas por IA."
              color="bg-accent"
              shadow="shadow-accent/20"
            />
          </div>
        </section>

        {/* TECH REVEAL: EDGE AI & PRIVACY */}
        <section className="py-24 px-6 container mx-auto">
           <div className="rounded-[5rem] bg-slate-950 p-16 lg:p-24 relative overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center gap-16">
              <div className="absolute inset-0 bg-mesh-game opacity-20 pointer-events-none" />
              
              <div className="lg:flex-1 space-y-8 relative z-10 text-center lg:text-left">
                 <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-widest border border-white/20">
                    <Cpu className="w-4 h-4 text-cyan-400" /> Tecnologia Determinística
                 </div>
                 <h2 className="text-5xl lg:text-8xl font-black uppercase italic text-white tracking-tighter leading-none">
                    PRIVACIDADE <span className="text-cyan-400">TOTAL</span>
                 </h2>
                 <p className="text-white/60 text-lg font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                    Suas imagens e movimentos nunca saem do seu dispositivo. Nossa IA de borda processa tudo em milissegundos no seu próprio hardware.
                 </p>
                 <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-white tracking-widest bg-white/5 px-4 py-2 rounded-xl">
                       <ShieldCheck className="w-4 h-4 text-green-400" /> GDPR Compliance
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-white tracking-widest bg-white/5 px-4 py-2 rounded-xl">
                       <Zap className="w-4 h-4 text-yellow-400" /> Latência Zero
                    </div>
                 </div>
              </div>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="lg:flex-1 relative aspect-square max-w-md w-full bg-gradient-to-br from-primary/40 to-cyan-500/40 rounded-[4rem] border-8 border-white/10 backdrop-blur-3xl flex items-center justify-center p-12 shadow-[0_0_100px_rgba(34,211,238,0.2)]"
              >
                 <UrbeLudoLogo className="w-full h-full text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.5)]" />
                 <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-accent rounded-full blur-3xl opacity-50" />
                 <div className="absolute -top-10 -left-10 w-32 h-32 bg-cyan-400 rounded-full blur-3xl opacity-50" />
              </motion.div>
           </div>
        </section>

        {/* FINAL CTA: CONNECT IDENTITY */}
        <section className="py-40 px-6 container mx-auto text-center space-y-12">
           <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-6xl lg:text-[7rem] font-black uppercase italic tracking-tighter text-foreground leading-none">
                PRONTO PARA <span className="text-primary">DECOLAR</span>?
              </h2>
              <p className="text-muted-foreground text-sm font-bold uppercase tracking-[0.3em]">Crie sua Identidade Ludo e comece o treino agora.</p>
           </div>
           <Button asChild size="lg" className="h-28 px-20 rounded-full bg-slate-950 text-white font-black uppercase tracking-widest text-2xl shadow-[0_40px_80px_rgba(0,0,0,0.3)] relative z-10 border-b-[12px] border-slate-800 active:border-b-0 active:translate-y-2 transition-all group">
             <Link href="/auth" className="flex items-center gap-6">
                <span>Conectar Identidade</span>
                <Play className="w-8 h-8 group-hover:scale-125 transition-transform" />
             </Link>
           </Button>
        </section>
      </main>

      {/* FOOTER: URBAN LABS 2026 */}
      <footer className="py-24 border-t border-primary/10 px-6 bg-white/20 backdrop-blur-md text-center space-y-12">
        <div className="flex flex-col items-center gap-8">
          <div className="p-4 bg-white rounded-[2.5rem] shadow-2xl border-4 border-primary/5">
            <UrbeLudoLogo className="w-24 h-24 text-primary" />
          </div>
          <div className="space-y-2">
            <span className="text-4xl font-black uppercase italic tracking-tighter text-primary">UrbeLudo</span>
            <p className="text-[12px] font-black text-muted-foreground uppercase tracking-[0.5em]">O Futuro é o Movimento</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">
          <Link href="/terms" className="hover:text-primary transition-colors">Termos de Uso</Link>
          <Link href="/privacy" className="hover:text-primary transition-colors">Política de Privacidade</Link>
          <div className="hidden md:block w-2 h-2 rounded-full bg-primary/20" />
          <Link href="/accessibility" className="hover:text-primary transition-colors">Acessibilidade</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Suporte Urbano</Link>
        </div>
        
        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-30">
          © 2026 UrbeLudo Labs. Todos os direitos reservados. APK Offline v2.5.0
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color, shadow }: { icon: React.ReactElement, title: string, description: string, color: string, shadow: string }) {
  return (
    <motion.div 
      whileHover={{ y: -15, scale: 1.02 }}
      className={cn(
        "p-12 rounded-[4rem] bg-white border-b-[12px] border-zinc-100 shadow-2xl space-y-8 flex flex-col items-center text-center group",
        shadow
      )}
    >
      <div className={cn(
        "w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform duration-500",
        color
      )}>
        {React.cloneElement(icon, { className: "w-10 h-10" })}
      </div>
      <div className="space-y-4">
        <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">{description}</p>
      </div>
      <div className="pt-4">
         <div className="h-1.5 w-12 rounded-full bg-zinc-100 group-hover:w-24 transition-all duration-500" />
      </div>
    </motion.div>
  );
}
