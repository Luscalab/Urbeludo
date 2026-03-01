'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Camera, 
  Check, 
  Loader2, 
  Sparkles, 
  Palette, 
  UserCircle,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { AvatarSelection } from '@/components/AvatarSelection';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { avatarizeUser } from '@/ai/flows/avatarize-user-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';

/**
 * Página de Edição de Identidade Ludo.
 * Permite trocar o avatar (qualquer arquivo em public/assets/avatars) e o nome.
 */
export default function EditProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const userProgressRef = useMemoFirebase(() => user ? { id: user.uid, path: `user_progress/${user.uid}` } : null, [user]);
  const { data: profile, isLoading } = useDoc(userProgressRef);

  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [isAvatarizing, setIsAvatarizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincroniza o estado local apenas quando o perfil carregar
  useEffect(() => {
    if (profile) {
      if (selectedAvatarId === null) setSelectedAvatarId(profile.avatar?.avatarId || '');
      if (displayName === '') setDisplayName(profile.displayName || '');
    }
  }, [profile, selectedAvatarId, displayName]);

  const handleSave = async () => {
    if (!userProgressRef) return;

    updateDocumentNonBlocking(userProgressRef, {
      displayName: displayName || profile?.displayName || "Explorador",
      avatar: {
        ...profile?.avatar,
        avatarId: selectedAvatarId || profile?.avatar?.avatarId || ""
      }
    });

    toast({
      title: "Identidade Sincronizada!",
      description: "Suas mudanças foram salvas no dispositivo."
    });
    router.push('/dashboard');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProgressRef) return;

    setIsAvatarizing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;
        const result = await avatarizeUser({ photoDataUri: base64String });
        
        updateDocumentNonBlocking(userProgressRef, {
          dominantColor: result.dominantColor,
          avatar: {
            ...profile?.avatar,
            accessoryType: result.accessoryType,
            traits: {
              hair: result.hair.style,
              hairColor: result.hair.color,
              eyeColor: result.eyes.color,
              skinTone: result.face.tone,
            }
          }
        });

        toast({
          title: "Aura Detectada!",
          description: result.avatarStyleDescription
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro de Análise",
          description: "Não foi possível processar sua aura agora."
        });
      } finally {
        setIsAvatarizing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-10">
      <header className="px-6 h-20 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-[100] border-b">
        <Link href="/dashboard" className="p-2 bg-white rounded-full shadow-sm">
          <ArrowLeft className="w-5 h-5 text-primary" />
        </Link>
        <div className="flex items-center gap-2">
          <UrbeLudoLogo className="w-6 h-6 text-primary" />
          <span className="text-sm font-black uppercase italic tracking-tighter">Identidade do Herói</span>
        </div>
        <Button 
          onClick={handleSave}
          size="sm" 
          className="rounded-full bg-primary font-black uppercase text-[10px] px-6 h-10"
        >
          Salvar
        </Button>
      </header>

      <main className="flex-1 space-y-12 py-8 overflow-x-hidden">
        {/* Seletor Dinâmico de Avatar */}
        <section className="container max-w-lg mx-auto">
          <AvatarSelection 
            initialAvatarId={selectedAvatarId || undefined} 
            onSelect={(id) => setSelectedAvatarId(id)} 
          />
        </section>

        {/* Campos de Nome e IA */}
        <section className="container max-w-lg mx-auto px-6 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest px-2">
              <UserCircle className="w-3 h-3 text-primary" /> Nome do Explorador
            </div>
            <Input 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Digite seu nome lúdico"
              className="h-16 rounded-[1.5rem] border-4 border-primary/5 bg-muted/20 px-6 font-bold focus:border-primary transition-all"
            />
          </div>

          <Card className="p-8 rounded-[3rem] border-none shadow-xl bg-gradient-to-br from-primary/5 to-accent/5 space-y-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-12 h-12" />
             </div>
             
             <div className="space-y-2 relative z-10">
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-foreground">Sincronia de Aura</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed">
                  Defina as cores e traços da sua identidade a partir de uma foto real com IA.
                </p>
             </div>

             <input 
               type="file" 
               accept="image/*" 
               ref={fileInputRef} 
               onChange={handleFileChange} 
               className="hidden" 
             />

             <Button 
               onClick={() => fileInputRef.current?.click()}
               disabled={isAvatarizing}
               className="w-full h-16 rounded-full bg-white text-primary font-black uppercase tracking-widest border-b-4 border-primary/20 hover:border-b-0 hover:translate-y-1 active:scale-95 transition-all shadow-lg flex gap-3"
             >
                {isAvatarizing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> 
                    Lendo Aura...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" /> 
                    Capturar Aura
                  </>
                )}
             </Button>

             <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 rounded-2xl">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-[8px] font-black uppercase text-primary/60 tracking-widest leading-tight">
                  Soberania de Dados: Processamento 100% Local.
                </span>
             </div>
          </Card>

          {profile?.dominantColor && (
            <div className="flex items-center justify-between p-6 bg-white rounded-[2rem] shadow-sm border border-primary/5">
              <div className="flex items-center gap-4">
                <div 
                  className="w-10 h-10 rounded-xl shadow-lg animate-pulse" 
                  style={{ backgroundColor: profile.dominantColor }}
                />
                <div>
                  <div className="text-[9px] font-black uppercase text-muted-foreground">Sinal de Aura Ativo</div>
                  <div className="text-xs font-black text-foreground uppercase">{profile.dominantColor}</div>
                </div>
              </div>
              <Palette className="w-5 h-5 text-muted-foreground/30" />
            </div>
          )}
        </section>

        <section className="container max-w-lg mx-auto px-6">
          <Button 
            onClick={handleSave}
            className="w-full h-20 rounded-[2.5rem] bg-primary text-white font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-4 border-b-8 border-primary/70 active:border-b-0 active:translate-y-2 transition-all"
          >
            <Check className="w-6 h-6 stroke-[4]" /> Confirmar Identidade
          </Button>
        </section>
      </main>
    </div>
  );
}

