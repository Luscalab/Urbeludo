
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/components/I18nProvider';
import { Button } from '@/components/ui/button';
import { ChevronRight, X, MapPin, Sparkles, Coins, Zap, ShoppingBag } from 'lucide-react';
import { LocalPersistence } from '@/lib/local-persistence';

export interface TutorialStep {
  targetId: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface TutorialOverlayProps {
  userName: string;
  avatarUrl: string;
  onComplete: () => void;
}

export function TutorialOverlay({ userName, avatarUrl, onComplete }: TutorialOverlayProps) {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const steps: TutorialStep[] = [
    {
      targetId: "studio-avatar",
      icon: <Sparkles className="w-6 h-6 text-white" />,
      title: t('tutorial.step1').replace('{name}', userName).split('!')[0] + '!',
      description: t('tutorial.step1').split('!')[1] || "Este é o seu espaço de movimento!"
    },
    {
      targetId: "coin-counter",
      icon: <Coins className="w-6 h-6 text-white" />,
      title: "A Moeda do Movimento",
      description: t('tutorial.step2')
    },
    {
      targetId: "btn-play",
      icon: <Zap className="w-6 h-6 text-white" />,
      title: "Hora de Explorar",
      description: t('tutorial.step3')
    },
    {
      targetId: "btn-shop",
      icon: <ShoppingBag className="w-6 h-6 text-white" />,
      title: "Personalize seu Lar",
      description: t('tutorial.step4')
    }
  ];

  const updatePosition = useCallback(() => {
    const step = steps[currentStep];
    const element = document.getElementById(step.targetId);
    
    if (element) {
      setTargetRect(element.getBoundingClientRect());
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [updatePosition]);

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      await LocalPersistence.saveProgress({ hasSeenTutorial: true });
      onComplete();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] pointer-events-none overflow-hidden">
        {/* Spotlight Effect */}
        <motion.div
          className="absolute inset-0 bg-black/70 pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {targetRect && (
            <motion.div
              className="absolute bg-transparent rounded-[2rem]"
              style={{
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.7)",
              }}
              initial={false}
              animate={{
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
              }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            />
          )}
        </motion.div>

        {/* Dialog Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="absolute z-[1050] pointer-events-auto flex flex-col items-center w-full px-6"
          style={{
            top: targetRect 
              ? (targetRect.bottom + 100 > window.innerHeight ? targetRect.top - 280 : targetRect.bottom + 32) 
              : "40%",
          }}
        >
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border-4 border-primary/10 relative">
            
            <div className="absolute -top-8 left-8 bg-primary p-4 rounded-[1.2rem] shadow-xl border-4 border-white">
              {steps[currentStep].icon}
            </div>

            <button 
              onClick={onComplete}
              className="absolute top-6 right-6 text-muted-foreground hover:text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mt-4">
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-foreground mb-2">
                {steps[currentStep].title}
              </h3>
              <p className="text-muted-foreground text-xs font-medium leading-relaxed mb-8">
                {steps[currentStep].description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all ${i === currentStep ? 'w-8 bg-primary' : 'w-2 bg-primary/20'}`}
                  />
                ))}
              </div>
              
              <Button
                onClick={handleNext}
                className="rounded-full h-12 px-6 font-black uppercase text-[10px] bg-primary shadow-lg shadow-primary/20 flex items-center gap-2"
              >
                {currentStep === steps.length - 1 ? t('tutorial.gotIt') : t('common.next')}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
