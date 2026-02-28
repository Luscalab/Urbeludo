
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Loader2, 
  CheckCircle2, 
  MapPin, 
  Coins, 
  Trophy,
  Zap,
  Brain,
  Wind,
  ChevronRight,
  Scan,
  Palette as PaletteIcon,
  ShieldCheck,
  Activity,
  Maximize2
} from 'lucide-react';

import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useI18n } from '@/components/I18nProvider';
import { MissionCategory } from '@/lib/types';
import { AvatarSelection } from '@/components/AvatarSelection';
import { FALLBACK_AVATAR } from '@/lib/avatar-catalog';

export function PlaygroundInterface({ debugMode = false }: { debugMode?: boolean }) {
  const { user } = useUser();
  const { toast } = useToast();
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [showGuide, setShowGuide] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState<any | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MissionCategory>('Motor');
  
  const [explorerName, setExplorerName] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState(FALLBACK_AVATAR.id);
  const [avatarColor, setAvatarColor] = useState('#9333ea');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const userProgressRef = useMemoFirebase(() => user ? { id: user.uid, path: `user_progress/${user.uid}` } : null, [user]);
  const { data: profile } = useDoc(userProgressRef);

  useEffect(() => {
    const editMode = searchParams.get('edit') === 'true';
    if (editMode) {
      setShowGuide(true);
      setTermsAccepted(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (profile) {
      const editMode = searchParams.get('edit') === 'true';
      if (profile.displayName && profile.hasSeenTutorial && !editMode) {
        setShowGuide(false);
      }
      setExplorerName(profile.displayName || '');
      setAvatarColor(profile.dominantColor || '#9333ea');
      setSelectedAvatarId(profile.avatar?.avatarId || FALLBACK_AVATAR.id);
    }
  }, [profile, searchParams]);

  const isCameraRequired = useMemo(() => {
    if (showGuide) return false;
    return true;
  }, [showGuide]);

  const handleSaveProfile = async () => {
    if (!termsAccepted || !explorerName.trim()) {
      toast({ variant: 'destructive', title: "Atenção", description: "Aceite os termos e defina seu codinome." });
      return;
    }
    const isEditMode = searchParams.get('edit') === 'true';

    if (userProgressRef) {
      updateDocumentNonBlocking(userProgressRef, { 
        displayName: explorerName,
        dominantColor: avatarColor,
        hasSeenTutorial: isEditMode ? (profile?.hasSeenTutorial ?? true) : true,
        avatar: { ...profile?.avatar, avatarId: selectedAvatarId }
      });
    }

    toast({ title: "Identidade Sincronizada", description: "Seu perfil foi atualizado com sucesso!" });
    
    if (isEditMode) {
      router.push('/dashboard');
    } else {
      router.push('/studio');
    }
  };

  const startScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      toast({ title: "Ambiente Analisado", description: "3 elementos urbanos identificados para o seu nível." });
    }, 3000);
  };

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      <AnimatePresence>
        {isCameraRequired && (
          <motion.div 
            initial={{ height: 0 }} animate={{ height: '60vh' }} exit={{ height: 0 }}
            className="relative w-full bg-black overflow-hidden z-10 shadow-2xl"
          >
            {/* HUD de Scan Avançado */}
            <div className="absolute inset-0 z-30 pointer-events-none p-6 flex flex-col justify-between">
               <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                     <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                        <Scan className="w-3 h-3" /> Live_Feed_2026
                     </div>
                     <div className="flex items-center gap-2 text-white font-black uppercase text-[8px] tracking-[0.3em] opacity-60 px-3">
                        LAT: -23.5505 LONG: -46.6333
                     </div>
                  </div>
                  <div className="p-2 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10">
                     <Maximize2 className="w-5 h-5 text-white/40" />
                  </div>
               </div>

               <div className="flex justify-center items-center">
                  <div className="w-64 h-64 border-2 border-white/20 rounded-[3rem] relative overflow-hidden">
                     <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                     <div className="absolute top-0 inset-x-0 h-1 bg-primary/50 animate-scanline" />
                  </div>
               </div>

               <div className="flex justify-between items-end">
                  <div className="bg-black/40 backdrop-blur-md p-4 rounded-3xl border border-white/10 space-y-2">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">Sensores: Online</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-primary" />
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">FPS: 60_Stable</span>
                     </div>
                  </div>
                  <Button onClick={startScan} disabled={isScanning} className="h-16 w-16 rounded-full bg-primary shadow-2xl border-4 border-white active:scale-90 transition-all p-0">
                     <Scan className={cn("w-7 h-7", isScanning && "animate-spin")} />
                  </Button>
               </div>
            </div>

            <video ref={videoRef} className="w-full h-full object-cover grayscale-[0.3]" autoPlay muted playsInline />
            
            {isScanning && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 bg-primary/20 backdrop-blur-xl flex flex-col items-center justify-center text-white"
              >
                <div className="w-48 h-48 rounded-full border-8 border-white/20 border-t-white animate-spin" />
                <span className="mt-10 text-[14px] font-black uppercase tracking-[0.5em] animate-pulse">Neural_Scan_Active</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn(
        "flex-1 bg-background p-10 z-20 overflow-y-auto no-scrollbar transition-all",
        isCameraRequired ? "-mt-16 rounded-t-[5rem] shadow-[0_-30px_60px_rgba(0,0,0,0.1)] border-t border-white/5" : "pt-12"
      )}>
        {showGuide ? (
          <div className="space-y-10 max-w-md mx-auto">
            <AvatarSelection initialAvatarId={selectedAvatarId} onSelect={setSelectedAvatarId} />
            
            <div className="space-y-8 bg-muted/20 p-8 rounded-[3.5rem] border border-primary/5">
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase text-primary/40 tracking-[0.3em] px-4">Codinome de Explorador</Label>
                <Input 
                  value={explorerName} 
                  onChange={(e) => setExplorerName(e.target.value)} 
                  className="rounded-3xl h-16 bg-white border-none shadow-inner text-lg font-bold px-8"
                  placeholder="EX: SAPIENT_ONE"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase text-primary/40 tracking-[0.3em] px-4">Frequência da Aura</Label>
                <div className="grid grid-cols-5 gap-3 bg-white/50 p-4 rounded-[2rem]">
                  {['#9333ea', '#3B82F6', '#EF4444', '#10b981', '#f59e0b'].map(c => (
                    <button 
                      key={c} 
                      onClick={() => setAvatarColor(c)} 
                      className={cn(
                        "aspect-square rounded-2xl border-4 transition-all duration-300", 
                        avatarColor === c ? "border-primary scale-110 shadow-xl" : "border-transparent opacity-40 hover:opacity-100"
                      )} 
                      style={{ backgroundColor: c }} 
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-white/50 p-4 rounded-3xl">
                <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(v) => setTermsAccepted(!!v)} className="w-8 h-8 rounded-xl border-2 border-primary" />
                <label htmlFor="terms" className="text-[10px] font-bold text-muted-foreground leading-tight">
                   Concordo com os protocolos de segurança biométrica UrbeLudo.
                </label>
              </div>
            </div>

            <Button onClick={handleSaveProfile} disabled={!termsAccepted} className="w-full h-24 rounded-[3.5rem] font-black uppercase tracking-[0.2em] bg-primary shadow-2xl flex justify-between px-14 border-b-8 border-primary/80 active:border-b-0 active:translate-y-2 transition-all">
              <span className="text-lg">{searchParams.get('edit') === 'true' ? 'Atualizar Identidade' : 'Iniciar Missão'}</span>
              <ChevronRight className="w-8 h-8" />
            </Button>
          </div>
        ) : (
          <div className="space-y-10 max-w-lg mx-auto">
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x">
                <CategoryButton active={selectedCategory === 'Arte'} onClick={() => setSelectedCategory('Arte')} icon={<PaletteIcon />} label="Arte" />
                <CategoryButton active={selectedCategory === 'Motor'} onClick={() => setSelectedCategory('Motor')} icon={<Zap />} label="Motor" />
                <CategoryButton active={selectedCategory === 'Mente'} onClick={() => setSelectedCategory('Mente')} icon={<Brain />} label="Mente" />
                <CategoryButton active={selectedCategory === 'Zen'} onClick={() => setSelectedCategory('Zen')} icon={<Wind />} label="Zen" />
            </div>
            
            <div className="flex flex-col items-center gap-8 py-20 text-center">
               <div className="p-8 bg-primary/5 rounded-[4rem] border-4 border-dashed border-primary/20 relative">
                  <div className="absolute -top-4 -right-4 bg-accent p-3 rounded-2xl shadow-xl text-white">
                     <ShieldCheck className="w-6 h-6" />
                  </div>
                  <Loader2 className="w-16 h-16 animate-spin text-primary/40" />
               </div>
               <div className="space-y-2">
                  <h4 className="text-2xl font-black uppercase italic tracking-tighter">Pronto para Explorar</h4>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Mova o visor para identificar desafios urbanos.</p>
               </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {celebrating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[250] bg-primary/95 backdrop-blur-3xl flex flex-col items-center justify-center text-white">
            <Trophy className="w-48 h-48 mb-12 text-accent animate-bounce" />
            <h2 className="text-7xl font-black uppercase italic tracking-tighter">Mastered!</h2>
            <div className="mt-8 flex items-center gap-4 bg-white/20 px-8 py-3 rounded-full">
               <Coins className="w-6 h-6 text-yellow-400" />
               <span className="text-2xl font-black">+50 LudoCoins</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={cn(
      "px-12 py-6 rounded-[3rem] text-[13px] font-black uppercase flex items-center gap-4 transition-all border-4 snap-center shrink-0", 
      active ? "bg-primary text-white border-primary shadow-[0_20px_40px_rgba(0,0,0,0.1)] scale-105" : "bg-white text-muted-foreground border-transparent hover:border-primary/20"
    )}>
      {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })} {label}
    </button>
  );
}
