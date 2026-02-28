
'use client';

import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, Sphere, ContactShadows, Environment } from '@react-three/drei';
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
  Sun,
  Eye,
  Sparkles
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

// --- COMPONENTE DO AVATAR CARTOONESCO 2D (ESTILO 2026) ---
function CartoonAvatar2D({ traits, isBreathing, targetRotation }: { traits: AvatarizeUserOutput, isBreathing: boolean, targetRotation: THREE.Euler }) {
  const groupRef = useRef<THREE.Group>(null);
  const faceGroupRef = useRef<THREE.Group>(null);
  const hairRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current && faceGroupRef.current) {
      const t = state.clock.getElapsedTime();
      
      // Animação de "Respiração Elástica" estilo Cartoon
      const breathFreq = isBreathing ? 4 : 1.2;
      const breathAmp = isBreathing ? 0.05 : 0.015;
      const scale = 1 + Math.sin(t * breathFreq) * breathAmp;
      groupRef.current.scale.set(scale, scale, 1);
      groupRef.current.position.y = Math.sin(t * 0.8) * 0.1;

      // Efeito de Paralaxe Facial (Simula 3D em 2D)
      const lerpSpeed = 0.1;
      faceGroupRef.current.position.x = THREE.MathUtils.lerp(faceGroupRef.current.position.x, targetRotation.y * 0.8, lerpSpeed);
      faceGroupRef.current.position.y = THREE.MathUtils.lerp(faceGroupRef.current.position.y, -targetRotation.x * 0.6, lerpSpeed);
      
      // Cabelo balança levemente com o movimento
      if (hairRef.current) {
        hairRef.current.rotation.z = THREE.MathUtils.lerp(hairRef.current.rotation.z, targetRotation.y * 0.1, 0.05);
      }
    }
  });

  const skinColor = traits.face?.tone === 'Escuro' ? "#8d5524" : traits.face?.tone === 'Médio' ? "#e0ac69" : "#ffdbac";
  const hairColor = traits.hair?.color || "#333333";
  const eyeColor = traits.eyes?.color || "#00FFFF";
  const primaryColor = traits.dominantColor || "#33993D";

  return (
    <group ref={groupRef}>
      {/* CORPO (CAPSULA CARTUM) */}
      <mesh position={[0, -1.2, -0.2]}>
        <capsuleGeometry args={[0.5, 1, 4, 16]} />
        <meshBasicMaterial color={primaryColor} />
      </mesh>
      {/* Contorno do Corpo */}
      <mesh position={[0, -1.2, -0.25]} scale={1.08}>
        <capsuleGeometry args={[0.5, 1, 4, 16]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* CABEÇA (CÍRCULO FLAT) */}
      <group position={[0, 0.2, 0]}>
        <mesh>
          <circleGeometry args={[0.8, 64]} />
          <meshBasicMaterial color={skinColor} />
        </mesh>
        {/* Contorno do Rosto */}
        <mesh position={[0, 0, -0.05]} scale={1.06}>
          <circleGeometry args={[0.8, 64]} />
          <meshBasicMaterial color="#000000" />
        </mesh>

        {/* CABELO (FORMAS VETORIAIS) */}
        <group ref={hairRef} position={[0, 0.4, -0.02]}>
           <mesh>
             {traits.hair?.style === 'longo' || traits.hair?.style === 'cacheado' ? (
               <circleGeometry args={[0.9, 32, 0, Math.PI]} />
             ) : (
               <circleGeometry args={[0.85, 32, 0, Math.PI]} />
             )}
             <meshBasicMaterial color={hairColor} />
           </mesh>
           {/* Detalhes do Cabelo */}
           <mesh position={[0, 0, -0.01]} scale={1.05}>
             <circleGeometry args={[0.9, 32, 0, Math.PI]} />
             <meshBasicMaterial color="#000000" />
           </mesh>
        </group>

        {/* ELEMENTOS FACIAIS (COM PARALAXE) */}
        <group ref={faceGroupRef} position={[0, 0, 0.1]}>
          {/* OLHOS */}
          <group position={[0, 0.1, 0]}>
            {/* Esquerdo */}
            <mesh position={[-0.25, 0, 0]}>
              <circleGeometry args={[0.12, 32]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[-0.25, 0, 0.01]}>
              <circleGeometry args={[0.06, 32]} />
              <meshBasicMaterial color={eyeColor} />
            </mesh>
            {/* Direito */}
            <mesh position={[0.25, 0, 0]}>
              <circleGeometry args={[0.12, 32]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0.25, 0, 0.01]}>
              <circleGeometry args={[0.06, 32]} />
              <meshBasicMaterial color={eyeColor} />
            </mesh>
          </group>

          {/* VISOR NEON (ACESSÓRIO) */}
          <mesh position={[0, 0.1, 0.05]}>
            <planeGeometry args={[0.7, 0.2]} />
            <meshBasicMaterial color={primaryColor} transparent opacity={0.4} />
          </mesh>
          <mesh position={[0, 0.1, 0.04]} scale={1.1}>
            <planeGeometry args={[0.7, 0.2]} />
            <meshBasicMaterial color="#000000" />
          </mesh>

          {/* BOCA (SORRISO CARTUM) */}
          <mesh position={[0, -0.3, 0]} rotation={[0, 0, Math.PI]}>
            <ringGeometry args={[0.08, 0.12, 32, 1, 0, Math.PI]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </group>
      </group>

      {/* AURA DE DADOS (EFEITO VETORIAL) */}
      <mesh position={[0, -0.2, -0.5]} rotation={[0, 0, Date.now() * 0.001]}>
        <ringGeometry args={[1.5, 1.55, 6]} />
        <meshBasicMaterial color={primaryColor} transparent opacity={0.3} />
      </mesh>
      
      <ContactShadows position={[0, -2, 0]} opacity={0.2} scale={10} blur={3} far={4} />
    </group>
  );
}

// --- INTERFACE PRINCIPAL ---
export function PlaygroundInterface() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [targetRotation, setTargetRotation] = useState(new THREE.Euler(0, 0, 0));
  const [showGuide, setShowGuide] = useState(true);
  const [isInitializingCamera, setIsInitializingCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<ProposeDynamicChallengesOutput & { missionType?: 'home' | 'street' } | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [photoProof, setPhotoProof] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
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

  // Rastreamento Facial Cartoonesco (Motion Tracking)
  useEffect(() => {
    let animationId: number;
    let lastX = 20;
    let lastY = 15;

    const analyzeMotion = () => {
      if (videoRef.current && videoRef.current.readyState === 4 && cameraMode === 'user' && safeAvatar) {
        const video = videoRef.current;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 40; 
        tempCanvas.height = 30;
        const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
        
        if (ctx) {
          ctx.drawImage(video, 0, 0, 40, 30);
          const pixels = ctx.getImageData(0, 0, 40, 30).data;
          
          let totalX = 0;
          let totalY = 0;
          let weight = 0;

          for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i+1];
            const b = pixels[i+2];
            const brightness = (r + g + b) / 3;
            
            // Filtro de Tom de Pele/Rosto para 2026
            if (brightness > 100 && r > g) { 
              const x = (i / 4) % 40;
              const y = Math.floor((i / 4) / 40);
              totalX += x;
              totalY += y;
              weight++;
            }
          }

          if (weight > 5) {
            const avgX = totalX / weight;
            const avgY = totalY / weight;
            
            lastX = lastX * 0.85 + avgX * 0.15;
            lastY = lastY * 0.85 + avgY * 0.15;
            
            const rotY = -(lastX / 40 - 0.5) * 1.2;
            const rotX = (lastY / 30 - 0.5) * 0.8;
            
            setTargetRotation(new THREE.Euler(rotX, rotY, 0));
            setIsLowLight(weight < 15);
          } else {
            setIsLowLight(true);
          }
        }
      }
      animationId = requestAnimationFrame(analyzeMotion);
    };

    if (safeAvatar && !showGuide) {
      analyzeMotion();
    }

    return () => cancelAnimationFrame(animationId);
  }, [safeAvatar, showGuide, cameraMode]);

  const startCamera = async (mode: 'user' | 'environment') => {
    setIsInitializingCamera(true);
    try {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: mode } 
      });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.error("Video error:", e));
          setTimeout(() => setIsInitializingCamera(false), 300);
        };
      }
    } catch (error) {
      console.error("Camera access error:", error);
      setHasCameraPermission(false);
      setIsInitializingCamera(false);
      toast({
        variant: 'destructive',
        title: 'Câmera Não Acessível',
        description: 'Verifique as permissões para usar o UrbeLudo.'
      });
    }
  };

  useEffect(() => {
    if (!showGuide) {
      startCamera(cameraMode);
    }
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraMode, showGuide]);

  const speak = (text: string) => {
    if (isAudioEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleFaceScan = async () => {
    if (!videoRef.current || isInitializingCamera) return;
    
    setIsAvatarizing(true);
    try {
      const video = videoRef.current;
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
      toast({ title: "Avatar Cartoon Gerado!", description: "Sua identidade 2D reativa está pronta." });
    } catch (e) {
      console.error("Scan error:", e);
      toast({ title: "Aviso de Scan", description: "Usando avatar cartoon padrão." });
    } finally {
      setIsAvatarizing(false);
    }
  };

  const handleSaveProfile = async () => {
    if (userProgressRef) {
      updateDocumentNonBlocking(userProgressRef, { ageGroup, neurodivergence });
    }
    setShowGuide(false);
  };

  const handleStartMission = async (type: 'home' | 'street') => {
    const energy = profile?.avatar?.energy ?? 100;
    if (energy < 10) {
      toast({ variant: 'destructive', title: 'Energia Baixa', description: 'Descanse para recuperar energia.' });
      return;
    }

    setCameraMode(type === 'street' ? 'environment' : 'user');
    setIsScanning(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      let detected: string[] = [];
      if (type === 'street' && videoRef.current) {
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
      toast({ variant: 'destructive', title: 'Falha na IA', description: 'Não conseguimos gerar o desafio agora.' });
    } finally {
      setIsScanning(false);
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
    const updates = {
      ludoCoins: (profile?.ludoCoins || 0) + activeChallenge.ludoCoinsReward,
      totalChallengesCompleted: (profile?.totalChallengesCompleted || 0) + 1,
      avatar: { ...profile?.avatar, energy: Math.max(0, (profile?.avatar?.energy ?? 100) - 15) },
    };
    setDocumentNonBlocking(userProgressRef, updates, { merge: true });
    setCelebrating(true);
    setTimeout(() => { 
      setCelebrating(false); 
      setActiveChallenge(null);
      setCameraMode('user');
    }, 3000);
  };

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Viewport da Câmera + Renderizador Avatar Cartoon */}
      <div className="relative w-full aspect-[4/3] bg-black overflow-hidden shadow-2xl z-0">
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover" 
          autoPlay 
          muted 
          playsInline 
        />
        
        {/* Camada Cartoon Reativa */}
        {safeAvatar && cameraMode === 'user' && (
          <div className="absolute inset-0 z-30 pointer-events-none">
            <Canvas shadows gl={{ alpha: true, antialias: true }}>
              <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={30} />
              <ambientLight intensity={1.5} />
              <Suspense fallback={null}>
                <CartoonAvatar2D 
                  traits={safeAvatar} 
                  isBreathing={activeChallenge?.challengeType === 'breathing' || selectedCategory === 'relaxation'} 
                  targetRotation={targetRotation}
                />
              </Suspense>
              <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
            </Canvas>
          </div>
        )}

        {isLowLight && !showGuide && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-destructive/90 text-white px-4 py-1.5 rounded-full flex items-center gap-2 animate-bounce">
            <Sun className="w-3 h-3" />
            <span className="text-[8px] font-black uppercase">Pouca Luz</span>
          </div>
        )}

        {isLibrasEnabled && (
          <div className="absolute bottom-6 right-6 z-[45] w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 flex items-center justify-center animate-float-libras shadow-xl">
             <Hand className="w-8 h-8 text-primary" />
          </div>
        )}

        {isInitializingCamera && (
          <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center gap-3 text-white">
             <Loader2 className="w-12 h-12 animate-spin text-primary" />
             <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Acessando Playground...</span>
          </div>
        )}
      </div>

      {/* Interface Inferior Estilo 2026 */}
      <div className="flex-1 -mt-10 bg-background rounded-t-[3.5rem] p-8 shadow-2xl overflow-y-auto space-y-8 z-20 border-t border-primary/5">
        
        {showGuide ? (
          <div className="space-y-8">
            <div className="flex flex-col items-center text-center space-y-4">
               <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary border border-primary/20"><Info className="w-8 h-8" /></div>
               <h2 className="text-2xl font-black uppercase italic tracking-tighter">Estúdio de Configuração</h2>
               <p className="text-[10px] font-medium text-muted-foreground max-w-[260px]">Ajuste sua experiência inclusiva e psicomotora.</p>
            </div>
            <div className="grid gap-3">
              <AcessibilityToggle active={isAudioEnabled} onClick={() => { setIsAudioEnabled(!isAudioEnabled); speak("Áudio guia ativado"); }} icon={<Volume2 />} label="Áudio Guia" />
              <AcessibilityToggle active={isLibrasEnabled} onClick={() => setIsLibrasEnabled(!isLibrasEnabled)} icon={<Hand />} label="Avatar Libras" />
            </div>
            <div className="space-y-5">
              <ProfileInput label="Explorador" value={ageGroup} onValueChange={setAgeGroup} options={[
                {v: 'preschool', l: 'Infantil (3-6)'}, {v: 'school_age', l: 'Escolar (7-12)'}, {v: 'adolescent_adult', l: 'Geral (13+)'}
              ]} />
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground px-2">Neurodivergência</Label>
                <Input placeholder="Opcional: TDAH, Autismo..." value={neurodivergence} onChange={e => setNeurodivergence(e.target.value)} className="rounded-2xl h-14 bg-muted/20 border-transparent" />
              </div>
            </div>
            <Button onClick={handleSaveProfile} className="w-full h-16 rounded-[2.5rem] font-black uppercase tracking-widest bg-primary shadow-xl flex justify-between px-8 border-b-4 border-primary/70">
              <span>Acessar Playground</span>
              <ArrowRightIcon className="w-5 h-5" />
            </Button>
          </div>
        ) : !safeAvatar ? (
          <div className="p-10 bg-primary/5 rounded-[3.5rem] border-2 border-dashed border-primary/20 text-center space-y-6">
             <div className="w-20 h-20 mx-auto bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary border border-primary/30"><Scan className="w-10 h-10" /></div>
             <div className="space-y-2">
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Identidade Cartoon</h3>
                <p className="text-[10px] font-medium text-muted-foreground max-w-[240px] mx-auto">
                  Gere seu Ludo Persona 2D a partir da câmera frontal. Privacidade garantida.
                </p>
             </div>
             <Button onClick={handleFaceScan} disabled={isAvatarizing || isInitializingCamera} className="w-full h-16 rounded-[2.5rem] font-black uppercase bg-primary shadow-xl border-b-4 border-primary/80">
               {isAvatarizing ? <Loader2 className="animate-spin" /> : "Gerar Avatar 2D"}
             </Button>
          </div>
        ) : (
          <>
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar -mx-4 px-4">
                <CategoryButton active={selectedCategory === 'artistic'} onClick={() => setSelectedCategory('artistic')} icon={<Palette className="w-4 h-4" />} label="Arte" />
                <CategoryButton active={selectedCategory === 'motor'} onClick={() => setSelectedCategory('motor')} icon={<Zap className="w-4 h-4" />} label="Motor" />
                <CategoryButton active={selectedCategory === 'memory'} onClick={() => setSelectedCategory('memory')} icon={<Brain className="w-4 h-4" />} label="Mente" />
                <CategoryButton active={selectedCategory === 'relaxation'} onClick={() => setSelectedCategory('relaxation')} icon={<Wind className="w-4 h-4" />} label="Zen" />
            </div>

            {!activeChallenge ? (
              <div className="space-y-4">
                <ChallengeRow title="Missão Casa" subtitle="Exploração Interna" icon={<HomeIcon />} isCompleted={profile?.dailyCycle?.homeMissionCompleted} onClick={() => handleStartMission('home')} disabled={isScanning} />
                <ChallengeRow title="Missão Rua" subtitle="Desafio Urbano" icon={<MapPin />} isCompleted={profile?.dailyCycle?.streetMissionCompleted} onClick={() => handleStartMission('street')} disabled={isScanning} />
              </div>
            ) : (
              <div className="bg-primary/5 rounded-[3rem] p-7 space-y-6 border border-primary/10">
                <div className="flex justify-between items-center">
                  <Badge className="bg-accent text-accent-foreground font-black text-[9px] uppercase">Dificuldade: {activeChallenge.difficulty}</Badge>
                  <div className="flex items-center gap-2 font-black text-primary text-xl"><Coins className="w-5 h-5" /> {activeChallenge.ludoCoinsReward}</div>
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">{activeChallenge.challengeTitle}</h3>
                <div className="space-y-3">
                   {activeChallenge.steps.map((step, idx) => (
                     <div key={idx} className={cn(
                       "flex items-center gap-4 p-5 rounded-[2rem] border-2 transition-all",
                       currentStep === idx ? "bg-white border-primary/30 shadow-lg scale-[1.02]" : "bg-muted/20 border-transparent opacity-30"
                     )}>
                       <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-xs font-black", currentStep >= idx ? "bg-primary text-white" : "bg-muted")}>{idx + 1}</div>
                       <p className="text-[10px] font-bold leading-relaxed">{step}</p>
                     </div>
                   ))}
                </div>
                <div className="pt-2">
                  {currentStep < activeChallenge.steps.length - 1 ? (
                    <Button onClick={() => { setCurrentStep(prev => prev + 1); speak(activeChallenge.steps[currentStep + 1]); }} className="w-full h-14 rounded-2xl font-black uppercase bg-primary shadow-lg">Próximo</Button>
                  ) : (
                    <Button onClick={completeMission} className="w-full h-16 rounded-[2.5rem] font-black uppercase bg-primary shadow-xl border-b-4 border-primary/60">Concluir</Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {celebrating && (
        <div className="fixed inset-0 z-[250] bg-primary flex flex-col items-center justify-center p-10 text-center text-white animate-in zoom-in-95">
          <Trophy className="w-24 h-24 mb-6 animate-bounce text-yellow-300" />
          <h2 className="text-5xl font-black uppercase italic mb-4 tracking-tighter">Missão Concluída!</h2>
          <div className="bg-white/20 px-10 py-5 rounded-[3rem] border border-white/30 backdrop-blur-xl">
             <span className="text-4xl font-black">+{activeChallenge?.ludoCoinsReward} LC</span>
          </div>
        </div>
      )}
    </div>
  );
}

function AcessibilityToggle({ active, onClick, icon, label }: any) {
  return (
    <Button variant="outline" className={cn("h-16 rounded-2xl gap-4 transition-all px-6 border-2", active ? "border-primary bg-primary/5" : "bg-white")} onClick={onClick}>
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", active ? "text-primary bg-primary/10" : "text-muted-foreground bg-muted")}>{icon}</div>
      <div className="text-left flex-1">
        <span className="text-[10px] font-black uppercase block leading-none">{label}</span>
        <span className="text-[8px] font-bold text-muted-foreground uppercase">{active ? "Ativo" : "Desativado"}</span>
      </div>
    </Button>
  );
}

function ProfileInput({ label, value, onValueChange, options }: any) {
  return (
    <div className="space-y-2">
      <Label className="text-[10px] font-black uppercase text-muted-foreground px-2">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="rounded-2xl h-14 bg-muted/20 border-transparent font-bold">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-2xl">
          {options.map((opt: any) => <SelectItem key={opt.v} value={opt.v} className="rounded-xl font-bold uppercase text-[9px]">{opt.l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function CategoryButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={cn(
      "px-6 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 transition-all border-2",
      active ? "bg-primary text-white border-primary shadow-lg" : "bg-white text-muted-foreground border-transparent"
    )}>
      {icon} {label}
    </button>
  );
}

function ChallengeRow({ title, subtitle, icon, isCompleted, onClick, disabled }: any) {
  return (
    <div onClick={!disabled && !isCompleted ? onClick : undefined} className={cn(
      "p-6 rounded-[2.5rem] flex items-center gap-5 transition-all", 
      isCompleted ? "bg-muted/40 opacity-50 grayscale" : 
      disabled ? "bg-muted/10 opacity-30 cursor-not-allowed" : "bg-white border-2 border-primary/5 shadow-lg active:scale-95 cursor-pointer"
    )}>
      <div className={cn("w-16 h-16 rounded-[2rem] flex items-center justify-center", isCompleted ? "bg-primary text-white" : "bg-primary/10 text-primary")}>
        {isCompleted ? <CheckCircle2 className="w-8 h-8" /> : React.cloneElement(icon as React.ReactElement, { className: "w-8 h-8" })}
      </div>
      <div className="flex-1 text-left">
        <span className="text-[9px] font-black uppercase text-muted-foreground opacity-60">{subtitle}</span>
        <h4 className="text-xl font-black uppercase italic tracking-tighter leading-none">{title}</h4>
      </div>
    </div>
  );
}

function ArrowRightIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
}
