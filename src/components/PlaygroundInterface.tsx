
'use client';

import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, Sphere, MeshDistortMaterial, MeshWobbleMaterial, TorusKnot, ContactShadows, Environment } from '@react-three/drei';
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

// --- COMPONENTE DO PERSONAGEM 3D AVANÇADO (ESTILO 2026) ---
function LudoAvatar3D({ traits, isBreathing, targetRotation }: { traits: AvatarizeUserOutput, isBreathing: boolean, targetRotation: THREE.Euler }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current && headRef.current) {
      const t = state.clock.getElapsedTime();
      
      // Movimento suave de "vida" e respiração rítmica
      const breathFreq = isBreathing ? 2 : 0.8;
      const breathAmp = isBreathing ? 0.08 : 0.02;
      const breathScale = 1 + Math.sin(t * breathFreq) * breathAmp;
      
      groupRef.current.scale.set(breathScale, breathScale, breathScale);
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.15; // Flutuação

      // Rastreamento Reativo Suave (Interpolação de 2026)
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetRotation.y, 0.12);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetRotation.x, 0.1);
      
      // O corpo segue levemente a cabeça com inércia
      if (bodyRef.current) {
        bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, targetRotation.y * 0.3, 0.08);
        bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, -targetRotation.y * 0.1, 0.05);
      }
    }
  });

  const hairColor = traits.hair?.color || "#333333";
  const skinColor = traits.face?.tone === 'Escuro' ? "#4b2c20" : traits.face?.tone === 'Médio' ? "#d2b48c" : "#f1c27d";
  const eyeColor = traits.eyes?.color || "#00FFFF";
  const primaryColor = traits.dominantColor || "#33993D";

  return (
    <group ref={groupRef}>
      {/* Tronco Digital Evoluído - Material de Fluido de Dados */}
      <mesh ref={bodyRef} position={[0, -0.7, 0]} castShadow>
        <capsuleGeometry args={[0.38, 0.95, 8, 32]} />
        <MeshDistortMaterial 
          color={primaryColor} 
          speed={isBreathing ? 4 : 2} 
          distort={0.25} 
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.85}
          emissive={primaryColor}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Cabeça e Detalhes Faciais de Alta Fidelidade */}
      <group ref={headRef} position={[0, 0.55, 0]}>
        {/* Crânio Geométrico */}
        <mesh castShadow>
          {traits.face?.shape === 'Quadrado' ? (
            <boxGeometry args={[0.72, 0.82, 0.72]} />
          ) : (
            <sphereGeometry args={[0.48, 64, 64]} />
          )}
          <meshStandardMaterial 
            color={skinColor} 
            roughness={0.3} 
            metalness={0.2} 
          />
        </mesh>

        {/* Cabelo com Dinâmica de Wobble Digital */}
        <group position={[0, 0.22, 0]}>
          <mesh>
             {traits.hair?.style === 'cacheado' || traits.hair?.style === 'ondulado' ? (
              <torusKnotGeometry args={[0.3, 0.12, 160, 24]} />
            ) : traits.hair?.style === 'careca' ? (
              <sphereGeometry args={[0.49, 32, 32]} />
            ) : (
              <sphereGeometry args={[0.5, 64, 64, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
            )}
            <MeshWobbleMaterial 
              color={hairColor} 
              factor={traits.hair?.style === 'crespo' ? 0.05 : 0.3} 
              speed={1.5} 
              metalness={0.6}
              roughness={0.2}
            />
          </mesh>
        </group>

        {/* Olhos de Consciência Digital (Emissivos) */}
        <group position={[0, 0.06, 0.38]}>
          <mesh position={[-0.16, 0, 0]}>
            <sphereGeometry args={[0.07, 24, 24]} />
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={3} />
          </mesh>
          <mesh position={[0.16, 0, 0]}>
            <sphereGeometry args={[0.07, 24, 24]} />
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={3} />
          </mesh>
        </group>

        {/* Visor Neuro-Pulse 2026 */}
        <mesh position={[0, 0.06, 0.43]}>
          <boxGeometry args={[0.62, 0.16, 0.04]} />
          <meshStandardMaterial 
            color={primaryColor} 
            transparent 
            opacity={0.5} 
            emissive={primaryColor} 
            emissiveIntensity={2} 
            metalness={1}
            roughness={0}
          />
        </mesh>
      </group>

      {/* Aura Psicomotora Dinâmica (Representação da Categoria) */}
      <Float speed={4} rotationIntensity={2} floatIntensity={1.5}>
        <TorusKnot args={[1.2, 0.015, 256, 32, 2, 3]} position={[0, 0, -0.6]}>
          <meshStandardMaterial 
            color={primaryColor} 
            emissive={primaryColor} 
            emissiveIntensity={1.2} 
            wireframe
          />
        </TorusKnot>
      </Float>

      {/* Campo de Partículas de Conexão */}
      <Sphere args={[1.6, 20, 20]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color={primaryColor} 
          wireframe 
          transparent 
          opacity={0.03} 
        />
      </Sphere>
      
      <ContactShadows position={[0, -1.8, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
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
  
  // Estado de Rastreamento Biométrico
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

  // Lógica de Rastreamento de Movimento de Bordas (2026 Motion Logic)
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

          // Busca cluster de maior atividade luminosa (rosto/pele)
          for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i+1];
            const b = pixels[i+2];
            const brightness = (r + g + b) / 3;
            
            // Filtro de "pele/rosto" simplificado para 2026
            if (brightness > 110 && r > g) { 
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
            
            // Suavização temporal (Exponential Smoothing)
            lastX = lastX * 0.8 + avgX * 0.2;
            lastY = lastY * 0.8 + avgY * 0.2;
            
            // Mapeamento Neuro-Reativo
            const rotY = -(lastX / 40 - 0.5) * 1.5; // Eixo Y ampliado
            const rotX = (lastY / 30 - 0.5) * 1.0;  // Eixo X ampliado
            
            setTargetRotation(new THREE.Euler(rotX, rotY, 0));
            
            // Sensor de luz baixa
            if (weight < 20) setIsLowLight(true);
            else setIsLowLight(false);
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
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (activeChallenge) {
      const stepText = activeChallenge.steps[currentStep];
      speak(stepText);
    }
  }, [currentStep, activeChallenge]);

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
      toast({ title: "Identidade Digital Gerada!", description: "Seu Ludo Persona 3D está pronto." });
    } catch (e) {
      console.error("Scan error:", e);
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
      await new Promise(r => setTimeout(r, 1500));
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
    }, 4000);
  };

  const isBreathingActivity = activeChallenge?.challengeType === 'breathing' || selectedCategory === 'relaxation';

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Viewport da Câmera + Renderizador 3D Avançado */}
      <div className="relative w-full aspect-[4/3] bg-black overflow-hidden shadow-2xl z-0">
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover" 
          autoPlay 
          muted 
          playsInline 
        />
        
        {/* HUD de Diagnóstico de Borda */}
        {isLowLight && !showGuide && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-destructive/90 text-white px-6 py-2 rounded-full flex items-center gap-2 animate-bounce border-2 border-white/20">
            <Sun className="w-4 h-4" />
            <span className="text-[9px] font-black uppercase tracking-widest">Luz Insuficiente para Análise</span>
          </div>
        )}

        {/* CAMADA 3D AO VIVO REATIVA (TEC 2026) */}
        {safeAvatar && cameraMode === 'user' && (
          <div className="absolute inset-0 z-30 pointer-events-none">
            <Canvas shadows gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}>
              <PerspectiveCamera makeDefault position={[0, 0, 4.5]} fov={35} />
              <ambientLight intensity={1.5} />
              <pointLight position={[5, 5, 5]} intensity={2.5} />
              <spotLight position={[0, 4, 4]} angle={0.2} penumbra={1} intensity={2} castShadow />
              
              <Suspense fallback={null}>
                <LudoAvatar3D 
                  traits={safeAvatar} 
                  isBreathing={isBreathingActivity} 
                  targetRotation={targetRotation}
                />
                <Environment preset="city" />
              </Suspense>
              
              <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
            </Canvas>
          </div>
        )}

        {/* Avatar de Libras Reativo */}
        {isLibrasEnabled && (
          <div className="absolute bottom-6 right-6 z-[45] w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/30 flex items-center justify-center animate-float-libras shadow-2xl">
             <Hand className="w-10 h-10 text-primary" />
             <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-white animate-pulse" />
          </div>
        )}

        {/* Loader de Inicialização */}
        {isInitializingCamera && (
          <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center gap-4 text-white">
             <div className="relative">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-accent animate-pulse" />
             </div>
             <span className="text-[11px] font-black uppercase tracking-widest text-primary/80">Estabelecendo Conexão Neural...</span>
          </div>
        )}
      </div>

      {/* Interface de Controle Inferior (Design Futurista) */}
      <div className="flex-1 -mt-12 bg-background rounded-t-[4rem] p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.15)] overflow-y-auto space-y-8 z-20 border-t border-primary/5">
        
        {showGuide ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-600">
            <div className="flex flex-col items-center text-center space-y-5">
               <div className="w-24 h-24 bg-primary/10 rounded-[3rem] flex items-center justify-center text-primary shadow-inner border border-primary/20"><Info className="w-10 h-10" /></div>
               <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Configuração de Estúdio</h2>
               <p className="text-[11px] font-medium text-muted-foreground max-w-[280px] leading-relaxed">Adapte o ambiente para sua jornada psicomotora inclusiva.</p>
            </div>
            <div className="grid gap-4">
              <AcessibilityToggle active={isAudioEnabled} onClick={() => { setIsAudioEnabled(!isAudioEnabled); speak("Áudio guia ativado"); }} icon={<Volume2 />} label="Áudio Guia" sub="Narração de missões" />
              <AcessibilityToggle active={isLibrasEnabled} onClick={() => setIsLibrasEnabled(!isLibrasEnabled)} icon={<Hand />} label="Avatar Libras" sub="Intérprete Virtual" />
            </div>
            <div className="space-y-6">
              <ProfileInput label="Explorador" value={ageGroup} onValueChange={setAgeGroup} options={[
                {v: 'preschool', l: 'Infantil (3-6)'}, {v: 'school_age', l: 'Escolar (7-12)'}, {v: 'adolescent_adult', l: 'Geral (13+)'}
              ]} />
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground px-2">Neurodivergência / Notas</Label>
                <Input placeholder="Ex: TDAH, Autismo (opcional)" value={neurodivergence} onChange={e => setNeurodivergence(e.target.value)} className="rounded-2xl h-16 bg-muted/20 border-transparent focus:border-primary/40 transition-all px-6" />
              </div>
            </div>
            <Button onClick={handleSaveProfile} className="w-full h-20 rounded-[3rem] font-black uppercase tracking-widest bg-primary shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex justify-between px-10 border-b-4 border-primary/70">
              <span>Iniciar Playground</span>
              <Sparkles className="w-5 h-5" />
            </Button>
          </div>
        ) : !safeAvatar ? (
          <div className="p-10 bg-primary/5 rounded-[4rem] border-2 border-dashed border-primary/20 text-center space-y-7 animate-in fade-in zoom-in-95 duration-500">
             <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                <div className="relative w-24 h-24 bg-primary/10 rounded-[3rem] flex items-center justify-center text-primary border border-primary/30"><Scan className="w-12 h-12" /></div>
             </div>
             <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Bio-Sincronização</h3>
                <p className="text-[11px] font-medium text-muted-foreground max-w-[260px] mx-auto leading-relaxed">
                  Capture sua essência digital. Geramos um Ludo Persona 3D único e descartamos seus dados biométricos reais localmente.
                </p>
             </div>
             <Button onClick={handleFaceScan} disabled={isAvatarizing || isInitializingCamera} className="w-full h-20 rounded-[3rem] font-black uppercase tracking-widest bg-primary shadow-xl border-b-4 border-primary/80 active:border-b-0 active:translate-y-1 transition-all">
               {isAvatarizing ? <Loader2 className="animate-spin" /> : "Gerar Identidade 3D"}
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
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-6">
                <ChallengeRow title="O Despertar" subtitle="Espaço de Casa" icon={<HomeIcon />} isCompleted={profile?.dailyCycle?.homeMissionCompleted} onClick={() => handleStartMission('home')} disabled={isScanning} />
                <ChallengeRow title="A Jornada" subtitle="Missão Urbana" icon={<MapPin />} isCompleted={profile?.dailyCycle?.streetMissionCompleted} onClick={() => handleStartMission('street')} disabled={isScanning} />
              </div>
            ) : (
              <div className="bg-primary/5 rounded-[3.5rem] p-8 space-y-8 animate-in slide-in-from-bottom-10 border border-primary/10">
                <div className="flex justify-between items-center">
                  <Badge className="bg-accent text-accent-foreground font-black text-[10px] uppercase px-5 py-2 rounded-full border border-white/20">Nível: {activeChallenge.difficulty}</Badge>
                  <div className="flex items-center gap-2 font-black text-primary text-2xl tracking-tighter"><Coins className="w-6 h-6 text-yellow-500" /> {activeChallenge.ludoCoinsReward}</div>
                </div>
                <h3 className="text-3xl font-black uppercase italic leading-none tracking-tighter text-foreground/90">{activeChallenge.challengeTitle}</h3>
                <div className="space-y-4">
                   {activeChallenge.steps.map((step, idx) => (
                     <div key={idx} className={cn(
                       "flex items-center gap-5 p-7 rounded-[2.5rem] border-2 transition-all duration-400",
                       currentStep === idx ? "bg-white border-primary/40 shadow-2xl scale-[1.03]" : "bg-muted/30 border-transparent opacity-30"
                     )}>
                       <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-base font-black shrink-0", currentStep >= idx ? "bg-primary text-white" : "bg-muted")}>{idx + 1}</div>
                       <p className="text-xs font-bold leading-relaxed">{step}</p>
                     </div>
                   ))}
                </div>
                <div className="pt-4">
                  {currentStep < activeChallenge.steps.length - 1 ? (
                    <Button onClick={() => { setCurrentStep(prev => prev + 1); speak(activeChallenge.steps[currentStep + 1]); }} className="w-full h-20 rounded-[3rem] font-black uppercase bg-primary shadow-2xl border-b-4 border-primary/60">Próximo Passo</Button>
                  ) : (
                    <Button onClick={completeMission} className="w-full h-24 rounded-[3.5rem] font-black uppercase bg-primary text-white animate-pulse shadow-[0_20px_60px_rgba(51,153,61,0.4)] text-lg border-b-4 border-primary/50">Concluir Missão</Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {celebrating && (
        <div className="fixed inset-0 z-[250] bg-primary flex flex-col items-center justify-center p-12 text-center text-white animate-in zoom-in-95 duration-700">
          <Trophy className="w-32 h-32 mb-10 animate-bounce text-yellow-300 drop-shadow-[0_0_30px_rgba(253,224,71,0.5)]" />
          <h2 className="text-7xl font-black uppercase italic mb-8 tracking-tighter">Triunfo!</h2>
          <div className="bg-white/20 px-14 py-8 rounded-[4rem] border border-white/40 backdrop-blur-3xl shadow-inner">
             <span className="text-6xl font-black">+{activeChallenge?.ludoCoinsReward} LC</span>
          </div>
          <p className="mt-12 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Sua jornada psicomotora evoluiu.</p>
        </div>
      )}
    </div>
  );
}

function AcessibilityToggle({ active, onClick, icon, label, sub }: any) {
  return (
    <Button variant="outline" className={cn("h-24 rounded-[2.5rem] gap-6 transition-all px-8 border-2 shadow-sm", active ? "border-primary bg-primary/10 ring-4 ring-primary/5" : "bg-white")} onClick={onClick}>
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-colors", active ? "text-primary bg-primary/10" : "text-muted-foreground bg-muted")}>{icon}</div>
      <div className="text-left flex-1">
        <span className="text-xs font-black uppercase block leading-none mb-1">{label}</span>
        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{sub} • {active ? "Ativo" : "Off"}</span>
      </div>
    </Button>
  );
}

function ProfileInput({ label, value, onValueChange, options }: any) {
  return (
    <div className="space-y-3">
      <Label className="text-[10px] font-black uppercase text-muted-foreground px-3 tracking-widest">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="rounded-[2rem] h-18 bg-muted/20 border-transparent focus:border-primary/30 px-8 font-bold text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-[2rem]">
          {options.map((opt: any) => <SelectItem key={opt.v} value={opt.v} className="rounded-xl py-3 px-6 font-bold uppercase text-[10px]">{opt.l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function CategoryButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={cn(
      "px-9 py-5 rounded-[2rem] text-[11px] font-black uppercase flex items-center gap-4 transition-all border-2 shadow-sm active:scale-95 whitespace-nowrap",
      active ? "bg-primary text-white border-primary shadow-primary/20" : "bg-white text-muted-foreground border-transparent hover:border-primary/10"
    )}>
      {icon} {label}
    </button>
  );
}

function ChallengeRow({ title, subtitle, icon, isCompleted, onClick, disabled }: any) {
  return (
    <div onClick={!disabled && !isCompleted ? onClick : undefined} className={cn(
      "p-7 rounded-[3rem] flex items-center gap-7 transition-all duration-400", 
      isCompleted ? "bg-muted/40 opacity-50 grayscale" : 
      disabled ? "bg-muted/10 opacity-30 cursor-not-allowed" : "bg-white border-2 border-primary/5 shadow-xl active:scale-[0.97] cursor-pointer hover:border-primary/20"
    )}>
      <div className={cn("w-20 h-20 rounded-[2.5rem] flex items-center justify-center shadow-inner transition-colors", isCompleted ? "bg-primary text-white" : "bg-primary/10 text-primary")}>
        {isCompleted ? <CheckCircle2 className="w-12 h-12" /> : React.cloneElement(icon as React.ReactElement, { className: "w-10 h-10" })}
      </div>
      <div className="flex-1 text-left">
        <span className="text-[10px] font-black uppercase text-muted-foreground opacity-60 tracking-[0.15em]">{subtitle}</span>
        <h4 className="text-2xl font-black uppercase italic mt-1 tracking-tighter leading-none">{title}</h4>
      </div>
    </div>
  );
}

