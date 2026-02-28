
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { Shield, Activity, Zap, MapPin, ArrowRight, Sparkles, Smartphone, Play } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background bg-mesh-purple overflow-x-hidden">
      {/* Premium Navigation */}
      <header className="px-6 h-24 flex items-center justify-between border-b border-primary/10 sticky top-0 z-50 bg-background/60 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="p-2 bg-primary/10 rounded-2xl border border-primary/20 shadow-inner"
          >
            <UrbeLudoLogo className="w-8 h-8 text-primary" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-xl font-black uppercase italic tracking-tighter leading-none">UrbeLudo</span>
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Motion Studio v.26</span>
          </div>
        </div>
        <nav className="hidden md:flex gap-10 items-center">
          <Link href="#features" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Features</Link>
          <Link href="/playground" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Playground</Link>
          <Button asChild className="h-12 rounded-full px-8 bg-black hover:bg-zinc-900 text-[10px] font-black uppercase tracking-widest shadow-xl">
            <Link href="/auth">Connect Identity</Link>
          </Button>
        </nav>
        <Button asChild size="icon" variant="ghost" className="md:hidden rounded-2xl">
          <Link href="/auth"><Play className="w-5 h-5" /></Link>
        </Button>
      </header>

      <main className="flex-1">
        {/* Hero 2026 Experience */}
        <section className="relative pt-20 pb-32 px-6 container mx-auto overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-10 relative z-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest animate-pulse-soft">
                <Sparkles className="w-3 h-3" /> Digital Playground Active
              </div>
              <h1 className="text-6xl lg:text-8xl font-black uppercase italic tracking-tighter leading-[0.85] text-foreground">
                Move your <span className="text-primary drop-shadow-[0_0_15px_rgba(147,51,234,0.3)]">Soul</span> in the <span className="text-accent underline decoration-4 underline-offset-8">City</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg font-medium">
                Transforme calçadas em pistas e muros em desafios. A tecnologia de 2026 no seu bolso para reconectar corpo e asfalto através de movimentos psicomotores puros.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="h-16 rounded-full px-10 text-[12px] font-black uppercase tracking-widest shadow-2xl bg-primary hover:scale-105 transition-transform group">
                  <Link href="/auth" className="flex items-center gap-3">
                    Start Journey <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-16 rounded-full px-10 text-[12px] font-black uppercase tracking-widest border-2 hover:bg-muted/50">
                  <Link href="#features">Explore Tech</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative aspect-square lg:aspect-video rounded-[4rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.15)] border-4 border-white/40 bg-muted group"
            >
               <Image 
                src="https://images.unsplash.com/photo-1581175990636-0c75be2d4aea?auto=format&fit=crop&q=80&w=1200&h=800" 
                alt="Urban Playground" 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-1000"
                data-ai-hint="urban architecture"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
              <div className="absolute bottom-10 left-10 right-10 p-8 rounded-[2.5rem] bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-white shadow-lg">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-white/60 tracking-widest">Active Players</div>
                    <div className="text-xl font-black text-white italic">+2.5K Today</div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-primary bg-muted overflow-hidden">
                        <img src={`https://picsum.photos/seed/${i}/100`} alt="user" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Dynamic Features Cards */}
        <section id="features" className="py-32 bg-white/40 backdrop-blur-md border-y border-primary/5">
          <div className="container mx-auto px-6">
            <div className="text-center mb-24 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Core Engine</span>
              <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter">Why UrbeLudo?</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard 
                icon={<Shield className="w-6 h-6" />}
                title="Privacy Pure"
                description="Sem gravação. O reconhecimento de borda descarta seu vídeo localmente em milissegundos."
                color="bg-blue-500"
              />
              <FeatureCard 
                icon={<Activity className="w-6 h-6" />}
                title="Psychomotor"
                description="Desafios reais para equilíbrio, tônus e consciência espacial urbana."
                color="bg-primary"
              />
              <FeatureCard 
                icon={<Zap className="w-6 h-6" />}
                title="Real-Time AI"
                description="Identificação instantânea de degraus, guias e planos verticais."
                color="bg-accent"
              />
              <FeatureCard 
                icon={<Smartphone className="w-6 h-6" />}
                title="APK Native"
                description="Construído para performance mobile. Baixa latência, alta diversão."
                color="bg-zinc-900"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 container mx-auto px-6">
          <div className="bg-primary rounded-[5rem] p-16 lg:p-24 relative overflow-hidden shadow-2xl shadow-primary/30">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10 text-center space-y-10">
              <h2 className="text-5xl lg:text-8xl font-black uppercase italic text-white tracking-tighter leading-none">
                The City Is <br /> Your Gym.
              </h2>
              <p className="text-white/80 max-w-xl mx-auto font-medium text-lg leading-relaxed">
                Pare de olhar para telas e comece a olhar através delas para a cidade. O movimento é a sua linguagem.
              </p>
              <Button asChild size="lg" className="h-20 rounded-full px-16 text-lg font-black uppercase tracking-widest bg-white text-primary hover:bg-white/90 shadow-2xl transition-all hover:scale-105">
                <Link href="/auth">Connect Identity</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-primary/10 px-6 bg-white/20">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <UrbeLudoLogo className="w-10 h-10 text-primary" />
              <span className="text-2xl font-black uppercase italic tracking-tighter">UrbeLudo</span>
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Built for the active urban soul.</p>
          </div>
          <div className="flex gap-12 text-[10px] font-black uppercase tracking-widest">
            <Link href="/terms" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/community" className="hover:text-primary transition-colors">Community</Link>
            <Link href="https://github.com" className="hover:text-primary transition-colors">GitHub</Link>
          </div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            © 2026 UrbeLudo. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="p-10 rounded-[3rem] bg-white border border-primary/5 shadow-xl shadow-primary/5 space-y-8"
    >
      <div className={`w-14 h-14 rounded-[1.5rem] ${color} flex items-center justify-center text-white shadow-lg`}>
        {icon}
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-black uppercase italic tracking-tighter">{title}</h3>
        <p className="text-xs text-muted-foreground font-medium leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
