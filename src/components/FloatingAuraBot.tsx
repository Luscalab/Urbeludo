'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Loader2, 
  Sparkles, 
  BrainCircuit,
  ChevronDown,
  Terminal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePathname } from 'next/navigation';
import { askAuraHelper } from '@/ai/flows/aura-helper-flow';
import { AuraLogger } from '@/lib/logs/aura-logger';
import { cn } from '@/lib/utils';
import { SUGESTOES_AURA } from '@/lib/aura-suggestions';
import { AuraLogViewer } from '@/components/AuraLogViewer';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

export function FloatingAuraBot() {
  const pathname = usePathname();
  const { user } = useUser();
  const userProgressRef = useMemoFirebase(() => user ? { id: user.uid, path: `user_progress/${user.uid}` } : null, [user]);
  const { data: profile } = useDoc(userProgressRef);

  const [isOpen, setIsOpen] = useState(false);
  const [isLogViewerOpen, setIsLogViewerOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Olá, Explorador! Sou o AuraHelper. Como posso ajudar no seu treino hoje?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSapient = profile?.email === 'sapientcontato@gmail.com';

  // Função para rolar até o fim
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Rola sempre que mensagens mudam ou o bot carrega
  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isLoading, isOpen, scrollToBottom]);

  const processMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', text: trimmed }]);
    setIsLoading(true);

    try {
      const response = await askAuraHelper({
        question: trimmed,
        context: `Navegando em: ${pathname}`
      });
      
      setMessages(prev => [...prev, { role: 'bot', text: response.answer }]);
    } catch (error) {
      AuraLogger.error('AuraBot', 'Erro ao processar', error);
      setMessages(prev => [...prev, { role: 'bot', text: "Minha sincronia oscilou. Vamos tentar novamente?" }]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, pathname]);

  const handleSend = () => {
    if (inputValue.trim()) {
      processMessage(inputValue);
      setInputValue('');
    }
  };

  const handleIconClick = () => {
    if (isSapient) {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      if (newCount >= 5) {
        setIsLogViewerOpen(true);
        setClickCount(0);
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      {isSapient && <AuraLogViewer isOpen={isLogViewerOpen} onClose={() => setIsLogViewerOpen(false)} />}
      
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none w-full max-w-lg px-6">
        <div className="flex flex-col items-center">
          <motion.button
            onClick={handleIconClick}
            className={cn(
              "pointer-events-auto h-12 px-6 rounded-full flex items-center gap-3 shadow-2xl transition-all border-b-4 active:border-b-0 active:translate-y-1",
              isOpen 
                ? "bg-slate-950 text-white border-slate-800" 
                : "bg-white/90 backdrop-blur-xl text-primary border-primary/20"
            )}
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <BrainCircuit className="w-5 h-5 animate-pulse" />}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isOpen ? 'Fechar' : 'AuraHelper'}
            </span>
          </motion.button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="pointer-events-auto mt-4 w-full bg-white rounded-[2.5rem] shadow-2xl border-4 border-primary/5 flex flex-col overflow-hidden max-h-[520px]"
              >
                <div className="p-6 bg-primary/5 border-b flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-black uppercase italic tracking-tighter text-slate-900">Guia de Sensibilidade</h3>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">IA Híbrida Ativa</p>
                  </div>
                  {isSapient && (
                    <button onClick={() => setIsLogViewerOpen(true)} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400">
                      <Terminal className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                  <div className="space-y-4 pb-4">
                    {messages.map((msg, idx) => (
                      <div key={idx} className={cn("flex flex-col max-w-[85%]", msg.role === 'bot' ? "items-start" : "items-end ml-auto")}>
                        <div className={cn("p-4 rounded-[1.8rem] text-[11px] font-medium leading-relaxed shadow-sm", msg.role === 'bot' ? "bg-slate-100 text-slate-800 rounded-tl-none border-l-4 border-primary" : "bg-primary text-white rounded-tr-none")}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl w-fit">
                        <Loader2 className="w-3 h-3 animate-spin text-primary" />
                        <span className="text-[8px] font-black uppercase text-muted-foreground">Sintonizando...</span>
                      </div>
                    )}
                    
                    {/* Marcador para scroll automático */}
                    <div ref={messagesEndRef} className="h-1 w-full" />
                  </div>
                </ScrollArea>

                <div className="px-6 py-2 border-t bg-slate-50/30">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                    {SUGESTOES_AURA.map((sug) => (
                      <button
                        key={sug.id}
                        onClick={() => processMessage(sug.label)}
                        disabled={isLoading}
                        className="whitespace-nowrap px-4 py-2 rounded-full border bg-white border-primary/10 text-primary hover:bg-primary/5 text-[9px] font-black uppercase shadow-sm active:scale-95 transition-all disabled:opacity-50"
                      >
                        {sug.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-t bg-white">
                  <div className="relative">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      disabled={isLoading}
                      placeholder="Dúvida sobre o treino?"
                      className="h-14 rounded-2xl pr-14 pl-6 border-transparent bg-slate-50 font-bold text-xs"
                    />
                    <Button
                      size="icon"
                      onClick={handleSend}
                      disabled={isLoading || !inputValue.trim()}
                      className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-primary text-white shadow-lg"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
