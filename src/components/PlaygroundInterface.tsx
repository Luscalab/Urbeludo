
"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  CheckCircle2, 
  Home as HomeIcon, 
  MapPin, 
  Coins, 
  Trophy,
  Camera,
  RefreshCw,
  Scan,
  Volume2,
  Hand,
  Info,
  Palette,
  Zap,
  Brain,
  Wind,
  Sun
} from 'lucide-react';
import { proposeDynamicChallenges, type ProposeDynamicChallengesOutput } from '@/ai/flows/propose-dynamic-challenges';
import { identifyUrbanElements } from '@/ai/flows/identify-urban-elements-flow';
import { avatarizeUser, type AvatarizeUserOutput } from '@/ai/flows/avatarize-user-flow';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type CategoryType = 'artistic' | 'motor' | 'memory' | 'relaxation';

// --- COMPONENTE DO PERSONAGEM 3D ---
function LudoAvatar3D({ traits, isBreathing }: { traits: AvatarizeUserOutput, isBreathing: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      // Movimento suave de "vida"
      groupRef.current.position.y = Math.sin(t * 0.8) * 0.05;
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.1;
      
      // Reação de respiração intensificada
      if (isBreathing) {
        const breathScale = 1 + Math.sin(t * 1.5) * 0.04;
        groupRef.current.scale.set(breathScale, breathScale, breathScale);
      } else {
        groupRef.current.scale.set(1, 1, 1);
      }

      // Olhar segue levemente o mouse/centro
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(t * 0.2) * 0.05;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Tronco */}
      <mesh position={[0, -0.6, 0]}>
        <capsuleGeometry args={[0.4, 0.8, 4, 16]} />
        <meshStandardMaterial 
          color={traits.dominantColor || "#33993D"} 
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Cabeça */}
      <mesh ref={headRef} position={[0, 0.4, 0]}>
        {traits.face?.shape === 'Quadrado' ? (
          <boxGeometry args={[0.7, 0.8, 0.7]} />
        ) : (
          <sphereGeometry args={[0.45, 32, 32]} />
        )}
        <meshStandardMaterial color={traits.face?.tone === 'Escuro' ? "#4b2c20" : "#f1c27d"} />
        
        {/* Olhos Reativos */}
        <group position={[0, 0.1, 0.35]}>
          <mesh position={[-0.15, 0, 0]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color={traits.eyes?.color || "cyan"} emissive={traits.eyes?.color || "cyan"} emissiveIntensity={1} />
          </mesh>
          <mesh position={[0.15, 0, 0]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color={traits.eyes?.color || "cyan"} emissive={traits.eyes?.color || "cyan"} emissiveIntensity={1} />
          </mesh>
        </group>

        {/* Visor Pulse Integrado */}
        <mesh position={[0, 0.1, 0.4]}>
          <boxGeometry args={[0.55, 0.12, 0.1]} />
          <meshStandardMaterial color="cyan" transparent opacity={0.5} emissive="cyan" emissiveIntensity={0.5} />
        </mesh>
      </mesh>

      {/* Cabelo Dinâmico */}
      <group position={[0, 0.6, 0]}>
        <mesh>
          {traits.hair?.style === 'cacheado' || traits.hair?.style === 'ondulado' ? (
            <torusKnotGeometry args={[0.25, 0.08, 64, 8]} />
          ) : (
            <sphereGeometry args={[0.47, 32, 16, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
          )}
          <meshStandardMaterial color={traits.hair?.color || "#333"} />
        </mesh>
      </group>

      {/* Aura de Identidade */}
      <Float speed={2.5} rotationIntensity={0.6} floatIntensity={0.6}>
        <mesh position={[0, 0, -0.4]}>
          <Sphere args={[1.2, 32, 32]}>
            <MeshDistortMaterial
              color={traits.dominantColor || "#33993D"}
              speed={1.5}
              distort={0.3}
              radius={1}
              transparent
              opacity={0.1}
            />
          </Sphere>
        </mesh>
      </Float>
    </group>
  );
}

// --- INTERFACE PRINCIPAL ---
export function PlaygroundInterface() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [showGuide, setShowGuide] = useState(true);
  const [isInitializingCamera, setIsInitializingCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<ProposeDynamicChallengesOutput & { missionType?: 'home' | 'street' } | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [photoProof, setPhotoProof] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('motor');
  
  const [isAvatarizing, setIsAvatarizing] = useState(false);
  const [safeAvatar, setSafeAvatar] = useState<AvatarizeUserOutput | null>(null);
  const [cameraMode, setCameraMode] = useState<'user' | 'environment'>('user');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isLibrasEnabled, setIsLibrasEnabled] = useState(false);
  const [isLowLight, setIsLowLight] = useState(false);

  const [ageGroup, setAgeGroup] = useState('adolescent_adult');
  const [neurodivergence, setNeurodivergence] = useState('');

  const userProgressRef = useMemoFirebase(() => user ? doc(db, 'user_progress', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userProgressRef);

  useEffect(() => {
    if (profile) {
      setAgeGroup(profile.ageGroup || 'adolescent_adult');
      setNeurodivergence(profile.neurodivergence || '');
      if (profile.avatar?.traits) {
        setSafeAvatar(profile.avatar.traits as any);
      }
    }
  }, [profile]);

  const startCamera = async (mode: 'user' | 'environment') => {
    setIsInitializingCamera(true);
    try {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.error("Video play error:", e));
          setTimeout(() => setIsInitializingCamera(false), 500);
        };
      }
    } catch (error) {
      console.error("Camera access error:", error);
      setHasCameraPermission(false);
      setIsInitializingCamera(false);
      toast({
        variant: 'destructive',
        title: 'Câmera Não Acessível',
        description: 'Verifique as permissões do seu navegador para usar o UrbeLudo.'
      });
    }
  };

  useEffect(() => {
    if (!showGuide) {
      // Se não tem avatar, força frontal para o scan
      if (!safeAvatar) {
        setCameraMode('user');
        startCamera('user');
      } else {
        startCamera(cameraMode);
      }
    }
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraMode, showGuide, !!safeAvatar]);

  const speak = (text: string) => {
    if (isAudioEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (activeChallenge) {
      const stepText = activeChallenge.steps[currentStep];
      speak(stepText);
    }
  }, [currentStep, activeChallenge]);

  const checkBrightness = (video: HTMLVideoElement): number => {
    const canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 255;
    ctx.drawImage(video, 0, 0, 50, 50);
    const imageData = ctx.getImageData(0, 0, 50, 50);
    const data = imageData.data;
    let totalBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      totalBrightness += (data[i] + data[i+1] + data[i+2]) / 3;
    }
    return totalBrightness / (data.length / 4);
  };

  const handleFaceScan = async () => {
    if (!videoRef.current || isInitializingCamera) return;
    
    const video = videoRef.current;
    if (video.videoWidth === 0) {
      toast({ title: "Iniciando...", description: "Aguarde o hardware da câmera." });
      return;
    }

    const brightness = checkBrightness(video);
    if (brightness < 50) {
      setIsLowLight(true);
      const msg = "Está muito escuro para o reconhecimento facial.";
      speak(msg);
      toast({ variant: 'destructive', title: "Luz Insuficiente", description: msg });
      return;
    } 

    setIsLowLight(false);
    setIsAvatarizing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Canvas context failure");
      ctx.drawImage(video, 0, 0);
      const photo = canvas.toDataURL('image/jpeg', 0.8);
      
      const result = await avatarizeUser({ photoDataUri: photo });
      setSafeAvatar(result);

      if (userProgressRef) {
        updateDocumentNonBlocking(userProgressRef, { "avatar.traits": result });
      }
      toast({ title: "Identidade Digital Gerada!", description: "Seu Ludo Persona 3D está pronto." });
    } catch (e) {
      console.error("Scan error:", e);
      const fallback: AvatarizeUserOutput = {
        hair: { style: 'curto', color: '#333333', texture: 'Liso' },
        eyes: { shape: 'Amendoado', color: '#33993D', eyebrowShape: 'Natural' },
        face: { shape: 'Oval', tone: 'Médio', undertone: 'Neutro', noseShape: 'Natural', mouthShape: 'Natural' },
        accessories: [],
        dominantColor: "#33993D",
        accessoryType: "Visor Pulse",
        avatarStyleDescription: "Explorador Padrão"
      };
      setSafeAvatar(fallback);
      toast({ title: "Scan Automatizado", description: "Usando avatar padrão de explorador." });
    } finally {
      setIsAvatarizing(false);
    }
  };

  const handleSaveProfile = async () => {
    if (userProgressRef) {
      updateDocumentNonBlocking(userProgressRef, {
        ageGroup, neurodivergence
      });
    }
    setShowGuide(false);
  };

  const handleStartMission = async (type: 'home' | 'street') => {
    const energy = profile?.avatar?.energy ?? 100;
    if (energy < 10) {
      toast({ variant: 'destructive', title: 'Falta de Energia', description: 'Seu explorador precisa descansar um pouco.' });
      return;
    }

    if (type === 'street') setCameraMode('environment');
    else setCameraMode('user');

    setIsScanning(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      let detected: string[] = [];
      if (type === 'street' && videoRef.current && videoRef.current.videoWidth > 0) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
        const result = await identifyUrbanElements({ webcamFeedDataUri: canvas.toDataURL('image/jpeg') });
        detected = result.elements.map(e => `${e.type}: ${e.description}`);
      }

      const challenge = await proposeDynamicChallenges({
        missionType: type,
        category: selectedCategory,
        psychomotorLevel: profile?.psychomotorLevel || 1,
        userAgeGroup: profile?.ageGroup || 'adolescent_adult',
        userSkillLevel: profile?.skillLevel || 'intermediate',
        detectedElements: detected
      });
      setActiveChallenge({ ...challenge, missionType: type });
      setCurrentStep(0);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Falha na IA', description: 'A conexão com o Mestre do Movimento falhou.' });
    } finally {
      setIsScanning(false);
    }
  };

  const takePhotoWithAvatarOverlay = () => {
    if (videoRef.current && canvasRef.current) {
      setIsCapturing(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, canvas.height - 120, canvas.width, 120);
        ctx.fillStyle = '#99E630';
        ctx.font = 'bold 18px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('IDENTIDADE PROTEGIDA 3D • URBELUDO', canvas.width / 2, canvas.height - 75);
        ctx.fillStyle = 'white';
        ctx.font = '500 12px Inter';
        ctx.fillText('BIOMETRIA DESCARTADA LOCALMENTE APÓS O SCAN', canvas.width / 2, canvas.height - 45);

        setPhotoProof(canvas.toDataURL('image/jpeg', 0.85));
      }
      setIsCapturing(false);
    }
  };

  const completeMission = () => {
    if (!activeChallenge || !user || !userProgressRef) return;
    const missionType = activeChallenge.missionType || 'home';
    const activityData = {
      userProgressId: user.uid,
      userName: profile?.displayName || "Explorador",
      startTime: new Date().toISOString(),
      isCompleted: true,
      ludoCoinsEarned: activeChallenge.ludoCoinsReward,
      missionType,
      challengeTitle: activeChallenge.challengeTitle,
      challengeDescription: activeChallenge.challengeDescription,
      photoUrl: photoProof,
      likes: 0,
      isPublic: !!photoProof
    };

    addDocumentNonBlocking(collection(db, 'user_progress', user.uid, 'challenge_activities'), activityData);
    if (activityData.isPublic) addDocumentNonBlocking(collection(db, 'public_gallery'), activityData);

    const updates = {
      ludoCoins: (profile?.ludoCoins || 0) + activeChallenge.ludoCoinsReward,
      totalChallengesCompleted: (profile?.totalChallengesCompleted || 0) + 1,
      avatar: { ...profile?.avatar, energy: Math.max(0, (profile?.avatar?.energy ?? 100) - 15) },
      dailyCycle: {
        ...profile?.dailyCycle,
        homeMissionCompleted: missionType === 'home' ? true : (profile?.dailyCycle?.homeMissionCompleted ?? false),
        streetMissionCompleted: missionType === 'street' ? true : (profile?.dailyCycle?.streetMissionCompleted ?? false),
      }
    };
    setDocumentNonBlocking(userProgressRef, updates, { merge: true });
    setCelebrating(true);
    setTimeout(() => { 
      setCelebrating(false); 
      setActiveChallenge(null);
      setPhotoProof(null);
      setCameraMode('user');
    }, 3500);
  };

  const isBreathingActivity = activeChallenge?.challengeType === 'breathing' || selectedCategory === 'relaxation';

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Viewport da Câmera + Renderizador 3D */}
      <div className="relative w-full aspect-[4/3] bg-black overflow-hidden shadow-2xl z-0">
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover" 
          autoPlay 
          muted 
          playsInline 
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* CAMADA 3D AO VIVO (Visível apenas em Selfie ou Home) */}
        {safeAvatar && cameraMode === 'user' && (
          <div className="absolute inset-0 z-30 pointer-events-none">
            <Canvas shadows alpha>
              <PerspectiveCamera makeDefault position={[0, 0, 4.5]} fov={35} />
              <ambientLight intensity={1.2} />
              <pointLight position={[5, 5, 5]} intensity={1.5} />
              <spotLight position={[0, 4, 4]} angle={0.2} penumbra={1} intensity={1} />
              
              <Suspense fallback={null}>
                <LudoAvatar3D traits={safeAvatar} isBreathing={isBreathingActivity} />
              </Suspense>
              
              <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
            </Canvas>
          </div>
        )}

        {/* Alerta de Luz */}
        {isLowLight && (
          <div className="absolute inset-0 z-40 bg-black/75 flex flex-col items-center justify-center text-center p-8 animate-pulse">
            <Sun className="w-14 h-14 text-destructive mb-4" />
            <h3 className="text-white font-black uppercase text-sm">Luz Insuficiente</h3>
            <p className="text-white/60 text-[9px] font-bold uppercase mt-2">Aumente a luz para o scan facial seguro.</p>
          </div>
        )}

        {/* Guia Visual do Scan */}
        {cameraMode === 'user' && !safeAvatar && !isInitializingCamera && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-72 border-4 border-dashed border-primary/30 rounded-[3.5rem] relative">
              <div className="absolute inset-0 bg-primary/5 rounded-[3.5rem]" />
              <div className="absolute -top-14 inset-x-0 text-center text-primary font-black text-[10px] uppercase">Enquadre seu rosto para o Scan 3D</div>
            </div>
          </div>
        )}

        {/* Acessibilidade Libras Ativa */}
        {isLibrasEnabled && (activeChallenge || isLowLight) && (
          <div className="absolute bottom-6 left-6 w-28 h-28 bg-black/80 backdrop-blur-xl rounded-[2.5rem] border border-primary/40 flex flex-col items-center justify-center z-40 animate-float-libras shadow-2xl">
             <Hand className="w-12 h-12 text-primary" />
             <span className="text-[9px] font-black text-white uppercase mt-2 tracking-tighter">Libras Ativa</span>
          </div>
        )}

        {/* Loader de Inicialização */}
        {isInitializingCamera && (
          <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center gap-4 text-white">
             <Loader2 className="w-10 h-10 animate-spin text-primary" />
             <span className="text-[11px] font-black uppercase tracking-widest text-primary/80">Sincronizando Playground...</span>
          </div>
        )}

        {/* Preview da Foto Segura */}
        {photoProof && (
          <div className="absolute inset-0 bg-black/98 flex flex-col items-center justify-center p-6 z-[100] animate-in fade-in zoom-in-95">
             <img src={photoProof} className="max-h-[70vh] rounded-[3rem] border-2 border-primary/50 shadow-2xl" alt="Prova Segura" />
             <Button variant="ghost" className="mt-6 text-white font-black uppercase text-[11px] gap-2" onClick={() => setPhotoProof(null)}>
               <RefreshCw className="w-5 h-5" /> Refazer Captura
             </Button>
          </div>
        )}
      </div>

      {/* Interface de Controle Inferior */}
      <div className="flex-1 -mt-10 bg-background rounded-t-[3.5rem] p-8 shadow-[0_-15px_40px_rgba(0,0,0,0.12)] overflow-y-auto space-y-8 z-20">
        
        {showGuide ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex flex-col items-center text-center space-y-4">
               <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary"><Info className="w-10 h-10" /></div>
               <h2 className="text-3xl font-black uppercase italic tracking-tighter">Guia de Exploração</h2>
               <p className="text-[11px] font-medium text-muted-foreground max-w-[280px] leading-relaxed">Personalize seu estúdio psicomotor para uma jornada segura e inclusiva.</p>
            </div>
            <div className="grid gap-3">
              <AcessibilityToggle active={isAudioEnabled} onClick={() => setIsAudioEnabled(!isAudioEnabled)} icon={<Volume2 />} label="Áudio Guia" sub="Narração de missões" />
              <AcessibilityToggle active={isLibrasEnabled} onClick={() => setIsLibrasEnabled(!isLibrasEnabled)} icon={<Hand />} label="Avatar Libras" sub="Tradução visual" />
            </div>
            <div className="space-y-5">
              <ProfileInput label="Faixa Etária" value={ageGroup} onValueChange={setAgeGroup} options={[
                {v: 'preschool', l: 'Infantil (3-6)'}, {v: 'school_age', l: 'Escolar (7-12)'}, {v: 'adolescent_adult', l: 'Geral (13+)'}
              ]} />
              <ProfileInput label="Identificação" value={profile?.sex || 'prefer_not_to_say'} onValueChange={(v) => handleUpdateProfile('sex', v)} options={[
                {v: 'male', l: 'Masculino'}, {v: 'female', l: 'Feminino'}, {v: 'other', l: 'Outro'}, {v: 'prefer_not_to_say', l: 'Privado'}
              ]} />
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground px-2">Neurodivergência</Label>
                <Input placeholder="Ex: TDAH, Autismo (opcional)" value={neurodivergence} onChange={e => setNeurodivergence(e.target.value)} className="rounded-2xl h-14 bg-muted/20" />
              </div>
            </div>
            <Button onClick={handleSaveProfile} className="w-full h-18 rounded-[2.5rem] font-black uppercase tracking-widest bg-primary shadow-xl hover:scale-[1.02] transition-transform">Iniciar Playground</Button>
          </div>
        ) : !safeAvatar ? (
          <div className="p-8 bg-primary/5 rounded-[3.5rem] border-2 border-dashed border-primary/20 text-center space-y-6 animate-in fade-in zoom-in-95">
             <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary animate-pulse"><Scan className="w-10 h-10" /></div>
             <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase italic">Scan Facial 3D</h3>
                <p className="text-[11px] font-medium text-muted-foreground max-w-[260px] mx-auto leading-relaxed">
                  Geraremos uma identidade digital 3D artística. Seus dados biométricos reais são deletados permanentemente após a análise de borda.
                </p>
             </div>
             <Button onClick={handleFaceScan} disabled={isAvatarizing || isInitializingCamera} className="w-full h-18 rounded-[2.5rem] font-black uppercase tracking-widest bg-primary shadow-lg border-b-4 border-primary/80 active:border-b-0 active:translate-y-1 transition-all">
               {isAvatarizing ? <Loader2 className="animate-spin" /> : "Gerar Ludo Persona 3D"}
             </Button>
          </div>
        ) : (
          <>
            <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                <CategoryButton active={selectedCategory === 'artistic'} onClick={() => setSelectedCategory('artistic')} icon={<Palette className="w-4 h-4" />} label="Arte" />
                <CategoryButton active={selectedCategory === 'motor'} onClick={() => setSelectedCategory('motor')} icon={<Zap className="w-4 h-4" />} label="Motor" />
                <CategoryButton active={selectedCategory === 'memory'} onClick={() => setSelectedCategory('memory')} icon={<Brain className="w-4 h-4" />} label="Mente" />
                <CategoryButton active={selectedCategory === 'relaxation'} onClick={() => setSelectedCategory('relaxation')} icon={<Wind className="w-4 h-4" />} label="Zen" />
            </div>

            {!activeChallenge ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <ChallengeRow title="O Despertar" subtitle="Espaço de Casa" icon={<HomeIcon />} isCompleted={profile?.dailyCycle?.homeMissionCompleted} onClick={() => handleStartMission('home')} disabled={isScanning} />
                <ChallengeRow title="A Jornada" subtitle="Missão Urbana" icon={<MapPin />} isCompleted={profile?.dailyCycle?.streetMissionCompleted} onClick={() => handleStartMission('street')} disabled={isScanning} />
              </div>
            ) : (
              <div className="bg-primary/5 rounded-[3.5rem] p-8 space-y-8 animate-in slide-in-from-bottom-8">
                <div className="flex justify-between items-center">
                  <Badge className="bg-accent text-accent-foreground font-black text-[10px] uppercase px-5 py-1.5">Nível: {activeChallenge.difficulty}</Badge>
                  <div className="flex items-center gap-1.5 font-black text-primary text-xl"><Coins className="w-6 h-6 text-yellow-500" /> {activeChallenge.ludoCoinsReward}</div>
                </div>
                <h3 className="text-3xl font-black uppercase italic leading-none tracking-tighter">{activeChallenge.challengeTitle}</h3>
                <div className="space-y-4">
                   {activeChallenge.steps.map((step, idx) => (
                     <div key={idx} className={cn(
                       "flex items-center gap-5 p-6 rounded-[2.5rem] border-2 transition-all duration-300",
                       currentStep === idx ? "bg-white border-primary/30 shadow-2xl scale-105" : "bg-muted/30 border-transparent opacity-40"
                     )}>
                       <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-black", currentStep >= idx ? "bg-primary text-white" : "bg-muted")}>{idx + 1}</div>
                       <p className="text-xs font-bold leading-snug">{step}</p>
                     </div>
                   ))}
                </div>
                <div className="pt-4">
                  {currentStep < activeChallenge.steps.length - 1 ? (
                    <Button onClick={() => { setCurrentStep(prev => prev + 1); speak(activeChallenge.steps[currentStep + 1]); }} className="w-full h-18 rounded-[2.5rem] font-black uppercase bg-primary shadow-xl">Próximo Passo</Button>
                  ) : !photoProof ? (
                    <Button onClick={takePhotoWithAvatarOverlay} disabled={isCapturing} className="w-full h-20 rounded-[2.5rem] font-black uppercase bg-accent text-accent-foreground flex items-center justify-center gap-4 shadow-2xl border-b-4 border-accent/80 active:border-b-0 active:translate-y-1 transition-all">
                      <Camera className="w-10 h-10" /> Registro de Identidade
                    </Button>
                  ) : (
                    <Button onClick={completeMission} className="w-full h-20 rounded-[2.5rem] font-black uppercase bg-primary text-white animate-bounce shadow-2xl">Concluir Missão</Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {celebrating && (
        <div className="fixed inset-0 z-[250] bg-primary flex flex-col items-center justify-center p-12 text-center text-white animate-in zoom-in-95 duration-500">
          <Trophy className="w-28 h-28 mb-8 animate-bounce text-yellow-300" />
          <h2 className="text-6xl font-black uppercase italic mb-8 tracking-tighter">Vitória!</h2>
          <div className="bg-white/20 px-12 py-6 rounded-[3rem] border border-white/40 backdrop-blur-3xl">
             <span className="text-5xl font-black">+{activeChallenge?.ludoCoinsReward} LudoCoins</span>
          </div>
          <p className="mt-10 text-xs font-bold uppercase tracking-widest opacity-80">Sua jornada psicomotora avançou.</p>
        </div>
      )}
    </div>
  );

  function handleUpdateProfile(field: string, value: any) {
    if (userProgressRef) {
      updateDocumentNonBlocking(userProgressRef, { [field]: value });
    }
  }
}

function AcessibilityToggle({ active, onClick, icon, label, sub }: any) {
  return (
    <Button variant="outline" className={cn("h-20 rounded-[2rem] gap-5 transition-all px-6 border-2", active ? "border-primary bg-primary/10" : "bg-white")} onClick={onClick}>
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", active ? "text-primary bg-primary/10" : "text-muted-foreground bg-muted")}>{icon}</div>
      <div className="text-left flex-1">
        <span className="text-[11px] font-black uppercase block leading-none">{label}</span>
        <span className="text-[9px] font-bold text-muted-foreground uppercase">{sub} • {active ? "Ativo" : "Off"}</span>
      </div>
    </Button>
  );
}

function ProfileInput({ label, value, onValueChange, options }: any) {
  return (
    <div className="space-y-2">
      <Label className="text-[10px] font-black uppercase text-muted-foreground px-2">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="rounded-2xl h-14 bg-muted/20 border-transparent focus:border-primary">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-2xl">
          {options.map((opt: any) => <SelectItem key={opt.v} value={opt.v}>{opt.l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function CategoryButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={cn(
      "px-7 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 transition-all border-2 shadow-sm active:scale-95 whitespace-nowrap",
      active ? "bg-primary text-white border-primary" : "bg-white text-muted-foreground border-transparent"
    )}>
      {icon} {label}
    </button>
  );
}

function ChallengeRow({ title, subtitle, icon, isCompleted, onClick, disabled }: any) {
  return (
    <div onClick={!disabled && !isCompleted ? onClick : undefined} className={cn(
      "p-6 rounded-[2.5rem] flex items-center gap-6 transition-all duration-300", 
      isCompleted ? "bg-muted/40 opacity-50 grayscale" : 
      disabled ? "bg-muted/10 opacity-30 cursor-not-allowed" : "bg-white border-2 border-primary/5 shadow-xl active:scale-[0.98] cursor-pointer hover:border-primary/20"
    )}>
      <div className={cn("w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-inner", isCompleted ? "bg-primary text-white" : "bg-primary/10 text-primary")}>
        {isCompleted ? <CheckCircle2 className="w-10 h-10" /> : icon}
      </div>
      <div className="flex-1 text-left">
        <span className="text-[10px] font-black uppercase text-muted-foreground opacity-70 tracking-widest">{subtitle}</span>
        <h4 className="text-2xl font-black uppercase italic mt-1 tracking-tighter leading-none">{title}</h4>
      </div>
    </div>
  );
}
