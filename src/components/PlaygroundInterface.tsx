
"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, Camera, CheckCircle2, RotateCcw, ScanLine, Trophy } from 'lucide-react';
import { identifyUrbanElements, type IdentifyUrbanElementsOutput } from '@/ai/flows/identify-urban-elements-flow';
import { proposeDynamicChallenges, type ProposeDynamicChallengesOutput } from '@/ai/flows/propose-dynamic-challenges';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

export function PlaygroundInterface() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [detectedData, setDetectedData] = useState<IdentifyUrbanElementsOutput | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<ProposeDynamicChallengesOutput | null>(null);

  // Firestore Data
  const userProgressRef = useMemoFirebase(() => user ? doc(db, 'user_progress', user.uid) : null, [db, user]);
  const { data: userStats } = useDoc(userProgressRef);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      setHasCameraPermission(true);
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Acesso à Câmera Negado',
        description: 'Por favor, habilite as permissões de câmera no seu navegador para usar o UrbeLudo.',
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return null;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  const scanEnvironment = async () => {
    const frame = captureFrame();
    if (!frame) return;

    setIsScanning(true);
    setDetectedData(null);
    setCurrentChallenge(null);

    try {
      const result = await identifyUrbanElements({ webcamFeedDataUri: frame });
      setDetectedData(result);
      
      if (result.elements.length > 0) {
        setIsGenerating(true);
        const challenge = await proposeDynamicChallenges({
          detectedElements: result.elements.map(e => e.description),
          userSkillLevel: (userStats?.skillLevel as any) || 'intermediate',
        });
        setCurrentChallenge(challenge);
        setIsGenerating(false);
      }
    } catch (err) {
      console.error("Scanning failed:", err);
      toast({
        variant: 'destructive',
        title: 'Erro na Identificação',
        description: 'Não conseguimos analisar o ambiente agora. Tente novamente em alguns segundos.',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const completeChallenge = () => {
    if (!currentChallenge || !user || !userProgressRef) return;
    
    const activitiesRef = collection(db, 'user_progress', user.uid, 'challenge_activities');
    
    // Save Activity
    addDocumentNonBlocking(activitiesRef, {
      userProgressId: user.uid,
      challengeDefinitionId: 'dynamic_gen',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      durationSeconds: currentChallenge.estimatedDurationSeconds || 60,
      isCompleted: true,
      challengeDescription: currentChallenge.challengeDescription,
      challengeType: currentChallenge.challengeType,
      targetElement: currentChallenge.targetElement,
      difficulty: currentChallenge.difficulty
    });

    // Update Stats
    const newStats = {
      id: user.uid,
      lastActiveDate: new Date().toISOString(),
      totalChallengesCompleted: (userStats?.totalChallengesCompleted || 0) + 1,
      currentStreak: (userStats?.currentStreak || 0) + 1,
      longestStreak: Math.max(userStats?.longestStreak || 0, (userStats?.currentStreak || 0) + 1),
      totalTimeSpentSeconds: (userStats?.totalTimeSpentSeconds || 0) + (currentChallenge.estimatedDurationSeconds || 60),
      skillLevel: userStats?.skillLevel || 'intermediate'
    };

    setDocumentNonBlocking(userProgressRef, newStats, { merge: true });
    
    toast({
      title: "Desafio Concluído!",
      description: "Você ganhou pontos de progresso.",
    });

    setCurrentChallenge(null);
    setDetectedData(null);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden relative bg-black">
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover grayscale-[0.3]"
        />
        <canvas ref={canvasRef} className="hidden" />

        <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Badge variant="secondary" className="bg-background/40 backdrop-blur-md text-foreground flex gap-2 items-center px-3 py-1">
                <ScanLine className="w-3 h-3 text-primary" /> 
                {isScanning ? "Analisando Ambiente..." : "Observação Ativa"}
              </Badge>
              {userStats?.currentStreak && userStats.currentStreak > 0 && (
                <div className="bg-accent/80 text-accent-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm animate-pulse">
                  <Trophy className="w-3 h-3" /> STREAK: {userStats.currentStreak}
                </div>
              )}
            </div>
          </div>

          {hasCameraPermission === false && (
            <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm pointer-events-auto">
              <Alert variant="destructive" className="max-w-xs">
                <AlertTitle>Acesso Necessário</AlertTitle>
                <AlertDescription>
                  Permita o acesso à câmera para identificar elementos urbanos e jogar.
                  <Button onClick={startCamera} size="sm" className="w-full mt-4 bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Tentar Novamente
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {detectedData && !currentChallenge && (
            <div className="flex flex-wrap gap-2 justify-center mb-10 pointer-events-auto">
              {detectedData.elements.map((el, i) => (
                <Badge key={i} className="bg-primary/90 text-primary-foreground text-xs py-1.5 px-3">
                  Encontrado: {el.type}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-6 z-10">
        <div className="max-w-md mx-auto space-y-4">
          {currentChallenge ? (
            <Card className="p-5 bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-primary mb-1">Desafio Atual</div>
                  <h3 className="font-headline font-bold text-lg leading-tight">{currentChallenge.challengeDescription}</h3>
                </div>
                <Badge className="bg-accent text-accent-foreground uppercase text-[10px]">
                  {currentChallenge.difficulty}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-muted rounded-xl">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Foco</div>
                  <div className="text-sm font-semibold flex items-center gap-1.5">
                    <ActivityIcon className="w-4 h-4 text-primary" />
                    {currentChallenge.challengeType.replace('_', ' ')}
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-xl">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Alvo</div>
                  <div className="text-sm font-semibold truncate">{currentChallenge.targetElement}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={completeChallenge} className="flex-1 h-12 text-sm font-bold bg-primary hover:bg-primary/90">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Concluir
                </Button>
                <Button onClick={scanEnvironment} variant="outline" className="h-12 w-12 p-0">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ) : (
            <div className="flex justify-center flex-col items-center gap-4">
              {isScanning || isGenerating ? (
                <div className="bg-background/90 backdrop-blur-md p-6 rounded-3xl flex items-center gap-4 border animate-pulse">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="font-medium text-sm">
                    {isScanning ? "Identificando arquitetura..." : "Propondo desafio..."}
                  </span>
                </div>
              ) : (
                <Button 
                  onClick={scanEnvironment} 
                  disabled={hasCameraPermission === false}
                  size="lg" 
                  className="rounded-full w-24 h-24 flex-col bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/40 border-4 border-white"
                >
                  <Camera className="w-8 h-8 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Scan</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  );
}
