'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Loader2, 
  Sparkles, 
  BrainCircuit,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePathname } from 'next/navigation';
import { askAuraHelper } from '@/ai/flows/aura-helper-flow';
import { initAuraBrain } from '@/lib/aura-brain';
import { cn } from '@/lib/utils';
import { SUGESTOES_AURA } from '@/lib/aura-suggestions';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

export function FloatingAuraBot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Olá, Mestre do Movimento! Eu sou o AuraHelper. Em que posso ajudar sua jornada hoje?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const startBrain = async () => {
    if (isInitializing || loadProgress === 100) return;
    setIsInitializing(true);
    try {
      await initAuraBrain((p) => setLoadProgress(p));
    } catch (err) {
      console.error("Erro ao ativar motor semântico:", err);
    } finally {
      // Pequeno delay para garantir que a UI mostre o 100%
      setTimeout(() => setIsInitializing(false), 800);
    }
  };

  useEffect(() => {
    if (isOpen && loadProgress < 100) {
      startBrain();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const processMessage = async (text: string) => {
    if (!text.trim() || isLoading || isInitializing) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsLoading(true);

    try {
      const response = await askAuraHelper({
        question: text,
        context: `Tela: ${pathname}`
      });
      
      setMessages(prev => [...prev, { role: 'bot', text: response.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Minha percepção sensorial falhou. Pode repetir?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (text) {
      processMessage(text);
      setInputValue('');
    }
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none w-full max-w-lg px-6">
      <div className="flex flex-col items-center">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={cn(
            "pointer-events-auto h-12 px-6 rounded-full flex items-center gap-3 shadow-2xl transition-all border-b-4 active:border-b-0 active:translate-y-1",
            isOpen 
              ? "bg-slate-900 text-white border-slate-700" 
              : "bg-white/80 backdrop-blur-xl text-primary border-primary/20"
          )}
        >
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <BrainCircuit className="w-5 h-5 animate-pulse" />}
          <span className="text-[10px] font-black uppercase tracking-widest">
            {isOpen ? 'Fechar Guia' : 'AuraHelper'}
          </span>
          {!isInitializing && !isOpen && loadProgress === 100 && <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />}
          {isInitializing && <Loader2 className="w-3 h-3 animate-spin opacity-40" />}
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="pointer-events-auto mt-4 w-full bg-white rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.15)] border-4 border-primary/5 flex flex-col overflow-hidden max-h-[500px]"
            >
              <div className="p-6 bg-primary/5 border-b flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black uppercase italic tracking-tighter">Guia de Sensibilidade</h3>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">IA Semântica de Borda</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                   <div className={cn("w-1.5 h-1.5 rounded-full", isInitializing ? "bg-yellow-500" : "bg-green-500")} />
                   <span className="text-[7px] font-black text-green-700 uppercase">{isInitializing ? "Sincronizando..." : "Online"}</span>
                </div>
              </div>

              <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                <div className="space-y-4 pb-4">
                  {isInitializing ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-primary/5 rounded-[2rem] border-2 border-primary/10 space-y-4">
                      <div className="text-primary text-[10px] font-black uppercase tracking-widest animate-pulse">
                        Aura está expandindo o cérebro...
                      </div>
                      <div className="w-full bg-white h-2 rounded-full overflow-hidden shadow-inner">
                        <motion.div 
                          className="bg-primary h-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${loadProgress}%` }}
                        />
                      </div>
                      <div className="flex justify-between w-full">
                        <span className="text-[8px] font-black text-primary/40 uppercase">{loadProgress}% sincronizado</span>
                        <p className="text-primary/40 text-[8px] font-black uppercase italic">
                          Modo Offline Ativando!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: msg.role === 'bot' ? -10 : 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cn(
                            "flex flex-col max-w-[85%]",
                            msg.role === 'bot' ? "items-start" : "items-end ml-auto"
                          )}
                        >
                          <div className={cn(
                            "p-4 rounded-3xl text-[11px] font-medium leading-relaxed shadow-sm",
                            msg.role === 'bot' 
                              ? "bg-slate-100 text-slate-800 rounded-tl-none border-l-4 border-primary" 
                              : "bg-primary text-white rounded-tr-none shadow-primary/20"
                          )}>
                            {msg.text}
                          </div>
                        </motion.div>
                      ))}
                    </>
                  )}
                  {isLoading && (
                    <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl w-fit">
                      <Loader2 className="w-3 h-3 animate-spin text-primary" />
                      <span className="text-[8px] font-black uppercase text-muted-foreground">Processando Borda...</span>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {!isInitializing && (
                <>
                  <div className="px-6 py-2 border-t bg-slate-50/30">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                      {SUGESTOES_AURA.map((sug) => (
                        <button
                          key={sug.id}
                          onClick={() => processMessage(sug.label)}
                          disabled={isLoading}
                          className="whitespace-nowrap px-4 py-2 rounded-full bg-white border border-primary/10 text-primary text-[9px] font-black uppercase shadow-sm hover:bg-primary/5 active:scale-95 transition-all flex items-center gap-2"
                        >
                          <span>{sug.icon}</span>
                          <span>{sug.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 border-t bg-slate-50/50">
                    <div className="relative">
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Dúvidas técnicas ou sobre o corpo..."
                        className="h-14 rounded-2xl pr-14 pl-6 border-transparent bg-white shadow-inner font-bold text-xs focus:ring-primary"
                      />
                      <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={isLoading || !inputValue.trim()}
                        className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-primary text-white shadow-lg active:scale-90 transition-transform"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
