"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Camera, CheckCircle2, RotateCcw, ChevronRight, ScanLine, Trophy } from 'lucide-react';
import { identifyUrbanElements, type IdentifyUrbanElementsOutput } from '@/ai/flows/identify-urban-elements-flow';
import { proposeDynamicChallenges, type ProposeDynamicChallengesOutput } from '@/ai/flows/propose-dynamic-challenges';
import { useLocalStorage } from '@/hooks/use-local-storage';

type HistoryItem = {
  timestamp: number;
  challenge: ProposeDynamicChallengesOutput;
};

export function PlaygroundInterface() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [detectedData, setDetectedData] = useState<IdentifyUrbanElementsOutput | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<ProposeDynamicChallengesOutput | null>(null);
  const [history, setHistory] = useLocalStorage<HistoryItem[]>("urbe-history", []);
  const [stats, setStats] = useLocalStorage<{ streak: number; totalCompleted: number }>("urbe-stats", { streak: 0, totalCompleted: 0 });

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.error("Camera access error:", err);
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
          userSkillLevel: 'intermediate',
          previousChallenges: history.slice(0, 5).map(h => h.challenge.challengeDescription)
        });
        setCurrentChallenge(challenge);
        setIsGenerating(false);
      }
    } catch (err) {
      console.error("Scanning failed:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const completeChallenge = () => {
    if (!currentChallenge) return;
    
    const newItem: HistoryItem = {
      timestamp: Date.now(),
      challenge: currentChallenge
    };
    
    setHistory([newItem, ...history]);
    setStats(prev => ({
      streak: prev.streak + 1,
      totalCompleted: prev.totalCompleted + 1
    }));
    
    setCurrentChallenge(null);
    setDetectedData(null);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden relative bg-black">
      {/* Video Container */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover grayscale-[0.3]"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* HUD Overlay */}
        <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Badge variant="secondary" className="bg-background/40 backdrop-blur-md text-foreground flex gap-2 items-center px-3 py-1">
                <ScanLine className="w-3 h-3 text-primary" /> 
                {isScanning ? "Scanning Environment..." : "Active Observation"}
              </Badge>
              {stats.streak > 0 && (
                <div className="bg-accent/80 text-accent-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm animate-pulse">
                  <Trophy className="w-3 h-3" /> STREAK: {stats.streak}
                </div>
              )}
            </div>
          </div>

          {/* Target Element Highlights Simulation */}
          {detectedData && !currentChallenge && (
            <div className="flex flex-wrap gap-2 justify-center mb-10 pointer-events-auto">
              {detectedData.elements.map((el, i) => (
                <Badge key={i} className="bg-primary/90 text-primary-foreground text-xs py-1.5 px-3">
                  Found: {el.type}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="absolute bottom-0 inset-x-0 p-6 z-10">
        <div className="max-w-md mx-auto space-y-4">
          
          {/* Challenge Display */}
          {currentChallenge ? (
            <Card className="p-5 bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-primary mb-1">Current Challenge</div>
                  <h3 className="font-headline font-bold text-lg leading-tight">{currentChallenge.challengeDescription}</h3>
                </div>
                <Badge className="bg-accent text-accent-foreground uppercase text-[10px]">
                  {currentChallenge.difficulty}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-muted rounded-xl">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Focus</div>
                  <div className="text-sm font-semibold flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-primary" />
                    {currentChallenge.challengeType.replace('_', ' ')}
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-xl">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Target</div>
                  <div className="text-sm font-semibold truncate">{currentChallenge.targetElement}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={completeChallenge} className="flex-1 h-12 text-sm font-bold bg-primary hover:bg-primary/90">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Complete
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
                    {isScanning ? "Identifying architecture..." : "Proposing challenge..."}
                  </span>
                </div>
              ) : (
                <Button 
                  onClick={scanEnvironment} 
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

// Reuse icon imports or standard ones
function Activity({ className }: { className?: string }) {
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