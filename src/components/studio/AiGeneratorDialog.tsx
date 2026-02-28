
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, Wand2, Package, Check } from 'lucide-react';
import { generateStudioItem } from '@/ai/flows/generate-studio-item-flow';
import { StudioItem } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface AiGeneratorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onItemGenerated: (item: StudioItem) => void;
}

export function AiGeneratorDialog({ isOpen, onClose, onItemGenerated }: AiGeneratorDialogProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItem, setGeneratedItem] = useState<StudioItem | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGeneratedItem(null);
    try {
      const { item } = await generateStudioItem({ 
        prompt, 
        category: 'Especial' 
      });
      setGeneratedItem(item);
    } catch (error) {
      console.error("Erro na geração de IA:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCollect = () => {
    if (generatedItem) {
      onItemGenerated(generatedItem);
      onClose();
      setGeneratedItem(null);
      setPrompt('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[3rem] border-4 border-primary/20 bg-background p-8 shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-2xl shadow-lg">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">Arquiteto de IA</DialogTitle>
          </div>
          <DialogDescription className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Descreva qualquer móvel ou decoração e eu darei vida a ele.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-6">
          <AnimatePresence mode="wait">
            {!generatedItem ? (
              <motion.div 
                key="input"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Ideia do Objeto</Label>
                  <Input 
                    placeholder="Ex: Uma poltrona de cristal líquido neon..." 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isGenerating}
                    className="h-16 rounded-2xl border-2 border-primary/10 bg-muted/20 px-6 font-medium focus:border-primary transition-all"
                  />
                </div>

                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full h-18 rounded-[2rem] font-black uppercase tracking-widest bg-primary shadow-xl flex justify-center gap-4 active:scale-95 transition-all"
                >
                  {isGenerating ? (
                    <><Loader2 className="w-6 h-6 animate-spin" /> Materializando...</>
                  ) : (
                    <><Sparkles className="w-6 h-6" /> Gerar com Imagen 4</>
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                key="preview"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="w-48 h-48 rounded-[3rem] bg-primary/5 border-4 border-primary/20 p-6 shadow-inner relative overflow-hidden group">
                  <img src={generatedItem.assetPath} alt="Preview" className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <h4 className="text-xl font-black uppercase italic tracking-tighter">{generatedItem.name}</h4>
                  <p className="text-[10px] text-muted-foreground font-bold px-6">{generatedItem.description}</p>
                </div>

                <Button 
                  onClick={handleCollect}
                  className="w-full h-16 rounded-full bg-green-500 hover:bg-green-600 text-white font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-green-500/20"
                >
                  <Check className="w-6 h-6" /> Adicionar à Mochila
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-[8px] font-bold text-center text-muted-foreground uppercase tracking-widest opacity-40">
          Powered by Gemini 2.0 & Imagen 4 Digital Architecture
        </p>
      </DialogContent>
    </Dialog>
  );
}
