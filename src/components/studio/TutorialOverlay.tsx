'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/components/I18nProvider';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Coins, Zap, ShoppingBag } from 'lucide-react';
import { LocalPersistence } from '@/lib/local-persistence';

interface TutorialOverlayProps {
  userName: string;
  avatarUrl: string;
  onComplete: () => void;
}

export function TutorialOverlay({ userName, avatarUrl, onComplete }: TutorialOverlayProps) {
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [spotlight, setSpotlight] = useState({ x: '50%', y: '50%', size: 0 });

  const steps = [
    {
      id: 1,
      text: t('tutorial.step1').replace('{name}', userName),
      icon: <Sparkles className="w-10 h-10 text-primary" />,
      target: null
    },
    {
      id: 2,
      text: t('tutorial.step2'),
      icon: <Coins className="w-10 h-10 text-yellow-500" />,
      target: 'coin-counter'
    },
    {
      id: 3,
      text: t('tutorial.step3'),
      icon: <Zap className="w-10 h-10 text-accent" />,
      target: 'btn-play'
    },
    {
      id: 4,
      text: t('tutorial.step4'),
      icon: <ShoppingBag className="w-10 h-10 text-primary" />,
      target: 'btn-shop'
    }
  ];

  useEffect(() => {
    const currentStep = steps[step - 1];
    if (currentStep.target) {
      const el = document.getElementById(currentStep.target);
      if (el) {
        const rect = el.getBoundingClientRect();
        setSpotlight({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          size: Math.max(rect.width, rect.height) + 40
        });
      }
    } else {
      setSpotlight({ x: '50%', y: '50%', size: 0 });
    }
  }, [step]);

  const handleNext = async () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      await LocalPersistence.saveProgress({ hasSeenTutorial: true });
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] pointer-events-none">
      <AnimatePresence>
        {/* Backdrop com Spotlight */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 pointer-events-auto"
          style={{
            maskImage: spotlight.size > 0 
              ? `radial-gradient(circle ${spotlight.size / 2}px at ${spotlight.x}px ${spotlight.y}px, transparent 100%, black 100%)`
              : 'none',
            WebkitMaskImage: spotlight.size > 0 
              ? `radial-gradient(circle ${spotlight.size / 2}px at ${spotlight.x}px ${spotlight.y}px, transparent 100%, black 100%)`
              : 'none'
          }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 flex flex-col items-center justify-end p-8 pointer-events-none">
        <motion.div 
          key={step}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="bg-white rounded-[3rem] p-8 w-full max-w-sm shadow-2xl border-4 border-primary/20 pointer-events-auto mb-12 relative"
        >
          {/* Avatar Flutuante */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl bg-primary/10">
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          </div>

          <div className="pt-16 space-y-6 text-center">
            <div className="flex justify-center">{steps[step - 1].icon}</div>
            <p className="text-sm font-bold text-muted-foreground leading-relaxed">
              {steps[step - 1].text}
            </p>
            
            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                onClick={onComplete}
                className="flex-1 rounded-2xl font-black uppercase text-[10px]"
              >
                {t('common.skip')}
              </Button>
              <Button 
                onClick={handleNext}
                className="flex-[2] h-14 rounded-2xl font-black uppercase text-[10px] bg-primary shadow-lg flex justify-between px-6"
              >
                <span>{step === steps.length ? t('tutorial.gotIt') : t('common.next')}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Indicador de Passos */}
          <div className="flex justify-center gap-1 mt-6">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all ${i + 1 === step ? 'w-6 bg-primary' : 'w-2 bg-primary/20'}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
