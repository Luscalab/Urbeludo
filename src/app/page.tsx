
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { Shield, Activity, Zap, Map } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 h-20 flex items-center border-b sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <UrbeLudoLogo className="w-10 h-10 text-primary" />
          <span className="text-xl font-headline font-bold tracking-tight">UrbeLudo</span>
        </div>
        <nav className="ml-auto flex gap-6 items-center">
          <Link href="/playground" className="text-sm font-medium hover:text-primary transition-colors">
            Playground
          </Link>
          <Button asChild variant="default" className="bg-primary text-primary-foreground font-semibold">
            <Link href="/auth">Entrar / Cadastrar</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-6 container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-7xl font-headline font-extrabold tracking-tighter leading-tight text-foreground">
                The Urban Space is <span className="text-primary">Your Playground.</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                UrbeLudo uses edge-AI to transform curbs, steps, and walls into real-time psychomotor challenges. Move your body, master the city.
              </p>
              <div className="flex gap-4">
                <Button asChild size="lg" className="h-14 px-8 text-lg font-bold">
                  <Link href="/auth">Começar Jornada</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg font-bold">
                  <Link href="#how-it-works">Saiba Mais</Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-muted border">
               <Image 
                src="https://picsum.photos/seed/urban1/1200/800" 
                alt="Urban Playground" 
                fill 
                className="object-cover"
                data-ai-hint="urban architecture"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="how-it-works" className="py-20 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-headline font-bold">Why UrbeLudo?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We combine traditional psychomotricity with cutting-edge computer vision to turn screen time into movement time.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard 
                icon={<Shield className="w-6 h-6" />}
                title="Privacy First"
                description="Detection happens 100% on your device. We never record or store your video feed."
              />
              <FeatureCard 
                icon={<Activity className="w-6 h-6" />}
                title="Psychomotor Focus"
                description="Challenges designed to improve balance, tone, and spatial awareness."
              />
              <FeatureCard 
                icon={<Zap className="w-6 h-6" />}
                title="Real-Time AI"
                description="Instant identification of urban elements as you move through the city."
              />
              <FeatureCard 
                icon={<Map className="w-6 h-6" />}
                title="Urban Exploration"
                description="Gamifies your commute and turns every street corner into a gym."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t px-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <UrbeLudoLogo className="w-8 h-8 text-primary" />
            <span className="font-headline font-bold">UrbeLudo</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 UrbeLudo. Built for the active city.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-background border hover:shadow-lg transition-all border-primary/10">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-3">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
