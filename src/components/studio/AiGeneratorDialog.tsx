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
import { Sparkles, Loader2, Wand2, Package, Check, AlertCircle } from 'lucide-react';
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
      console.error("Erro na arquitetura Ludo:", error);
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
      <DialogContent className="sm:max-w-[500px] rounded-[4rem] border-8 border-primary/20 bg-background p-10 shadow-[0_50px_100px_rgba(0,0,0,0.3)]">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary rounded-[1.5rem] shadow-xl">
              <Wand2 className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter leading-none">Arquiteto Ludo</DialogTitle>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary/60 tracking-widest">
                <Sparkles className="w-3 h-3" /> Modo Offline Ativo
              </div>
            </div>
          </div>
          <DialogDescription className="text-xs font-medium text-muted-foreground uppercase tracking-widest leading-relaxed">
            Dê vida a móveis e decorações instantaneamente através da IA determinística do UrbeLudo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-8">
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
                  <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground px-4">Conceito do Objeto</Label>
                  <Input 
                    placeholder="Ex: Sofá de neon azul ou Mesa de madeira rústica" 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isGenerating}
                    className="h-20 rounded-[1.5rem] border-4 border-primary/10 bg-muted/20 px-8 text-lg font-bold focus:border-primary transition-all placeholder:opacity-50"
                  />
                </div>

                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full h-20 rounded-[2.5rem] font-black uppercase tracking-widest bg-primary shadow-2xl flex justify-center gap-4 active:scale-95 transition-all text-lg"
                >
                  {isGenerating ? (
                    <><Loader2 className="w-7 h-7 animate-spin" /> Materializando...</>
                  ) : (
                    <><Wand2 className="w-7 h-7" /> Criar Agora</>
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                key="preview"
                initial={{ opacity: 0, scale: 0.9, rotateY: 45 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                className="flex flex-col items-center gap-8"
              >
                <div className="w-64 h-64 rounded-[4rem] bg-white border-8 border-primary/10 p-8 shadow-[inset_0_0_50px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                  <img src={generatedItem.assetPath} alt="Preview" className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-primary/40 animate-pulse" />
                  </div>
                </div>

                <div className="text-center space-y-2 px-4">
                  <h4 className="text-2xl font-black uppercase italic tracking-tighter text-primary">{generatedItem.name}</h4>
                  <p className="text-[11px] text-muted-foreground font-bold leading-tight">{generatedItem.description}</p>
                </div>

                <Button 
                  onClick={handleCollect}
                  className="w-full h-20 rounded-[2.5rem] bg-green-500 hover:bg-green-600 text-white font-black uppercase tracking-widest flex items-center justify-center gap-4 shadow-2xl shadow-green-500/20 text-lg"
                >
                  <Check className="w-7 h-7 stroke-[4]" /> Levar para Mochila
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-primary/5 p-4 rounded-3xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-primary opacity-50" />
          <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest">
            Motor de Borda Ativo: Processamento 100% Local e Síncrono.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
