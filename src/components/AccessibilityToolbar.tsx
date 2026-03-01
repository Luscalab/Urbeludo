
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Accessibility, Volume2, VolumeX, Hand, MessageSquareText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/I18nProvider';

export function AccessibilityToolbar() {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [isLibrasVisible, setIsLibrasVisible] = useState(false);

  const speakText = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToRead = document.body.innerText;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <>
      <div className="fixed top-24 right-4 z-[999] flex flex-col items-end gap-2">
        <motion.div
          animate={{ scale: isOpen ? 1 : 0.8 }}
          className="relative"
        >
          <Button
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-xl border-2 border-primary/20 text-primary shadow-xl"
            aria-label={t('common.accessibility')}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Accessibility className="w-6 h-6" />}
          </Button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute top-14 right-0 bg-white rounded-3xl shadow-2xl p-4 border-2 border-primary/10 flex flex-col gap-3 min-w-[160px]"
              >
                <button
                  onClick={speakText}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-primary/5 rounded-xl transition-colors text-[10px] font-black uppercase text-primary"
                >
                  <Volume2 className="w-4 h-4" /> {t('common.readPage')}
                </button>
                <button
                  onClick={stopAudio}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-red-50 rounded-xl transition-colors text-[10px] font-black uppercase text-red-500"
                >
                  <VolumeX className="w-4 h-4" /> {t('common.stopAudio')}
                </button>
                <button
                  onClick={() => setIsLibrasVisible(!isLibrasVisible)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-primary/5 rounded-xl transition-colors text-[10px] font-black uppercase text-primary"
                >
                  <Hand className="w-4 h-4" /> {t('common.libras')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {isLibrasVisible && (
          <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            className="fixed bottom-24 right-4 z-[998] w-48 h-64 bg-white/90 backdrop-blur-2xl rounded-[3rem] border-4 border-primary/20 shadow-2xl overflow-hidden flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="absolute top-4 right-4">
              <button onClick={() => setIsLibrasVisible(false)} className="text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            <Hand className="w-12 h-12 text-primary mb-4 animate-bounce" />
            <p className="text-[9px] font-black uppercase text-primary tracking-widest leading-tight">
              Libras Ativo
            </p>
            <div className="mt-4 w-full h-24 bg-primary/5 rounded-2xl flex items-center justify-center">
               <span className="text-[8px] font-bold text-primary/40 uppercase italic">Avatar Sinalizador</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
