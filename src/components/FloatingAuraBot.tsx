
'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
import { initAuraBrain } from '@/lib/aura-brain';
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
    { role: 'bot', text: 'Olá, Mestre do Movimento! Eu sou o AuraHelper. Em que posso ajudar sua jornada hoje?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Privilégio administrativo baseado no e-mail do usuário logado
  const isSapient = profile?.email === 'sapientcontato@gmail.com';

  useEffect(() => {
    AuraLogger.info('AuraBot', 'Iniciando sincronização técnica da Aura...');
    initAuraBrain((p) => {
      setLoadProgress(p);
      if (p === 100) {
        AuraLogger.info('AuraBot', 'Sincronização concluída. Cérebro local operante.');
      }
    });
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  const processMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading || loadProgress < 100) return;

    AuraLogger.info('AuraBot', `Mensagem recebida: "${text}"`);
    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsLoading(true);

    try {
      const response = await askAuraHelper({
        question: text,
        context: `Tela Atual: ${pathname}`
      });
      
      setMessages(prev => [...prev, { role: 'bot', text: response.answer }]);
    } catch (error) {
      AuraLogger.error('AuraBot', 'Erro no processamento da mensagem', error);
      setMessages(prev => [...prev, { role: 'bot', text: "Minha percepção sensorial oscilou. Verifique o console de telemetria." }]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, loadProgress, pathname]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (text) {
      processMessage(text);
      setInputValue('');
    }
  };

  const handleIconClick = () => {
    // Clique secreto: 5 vezes abre o console de logs técnico (Apenas para sapientcontato@gmail.com)
    if (isSapient) {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      if (newCount >= 5) {
        setIsLogViewerOpen(true);
        setClickCount(0);
        AuraLogger.info('AuraBot', 'Console de Telemetria ativado via clique sequencial.');
      }
    }
    
    setIsOpen(!isOpen);
  };

  const isReady = useMemo(() => loadProgress === 100, [loadProgress]);

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
              {isOpen ? 'Fechar Guia' : 'AuraHelper'}
            </span>
            {!isOpen && isReady && <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse border-2 border-white" />}
            {!isReady && !isOpen && <Loader2 className="w-3 h-3 animate-spin opacity-40" />}
          </motion.button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="pointer-events-auto mt-4 w-full bg-white rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.2)] border-4 border-primary/5 flex flex-col overflow-hidden max-h-[520px]"
              >
                <div className="p-6 bg-primary/5 border-b flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-black uppercase italic tracking-tighter">Guia de Sensibilidade</h3>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Processamento Híbrido Ativo</p>
                  </div>
                  
                  {/* Botão de Logs exclusivo para sapientcontato@gmail.com */}
                  {isSapient && (
                    <button 
                      onClick={() => setIsLogViewerOpen(true)} 
                      className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                      title="Ver Telemetria"
                    >
                      <Terminal className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                  <div className="space-y-4 pb-4">
                    {!isReady ? (
                      <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 space-y-5">
                        <div className="text-primary text-[10px] font-black uppercase tracking-[0.2em] animate-pulse text-center">
                          Aura está expandindo o cérebro em segundo plano...
                        </div>
                        <div className="w-full bg-white h-3 rounded-full overflow-hidden shadow-inner border">
                          <motion.div 
                            className="bg-gradient-to-r from-primary to-accent h-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${loadProgress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <div className="flex justify-between w-full">
                          <span className="text-[8px] font-black text-primary uppercase">{loadProgress}% sincronizado</span>
                          <p className="text-muted-foreground text-[8px] font-black uppercase italic">
                            Modo Offline em breve
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {messages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "flex flex-col max-w-[85%] mb-4",
                              msg.role === 'bot' ? "items-start" : "items-end ml-auto"
                            )}
                          >
                            <div className={cn(
                              "p-4 rounded-[1.8rem] text-[11px] font-medium leading-relaxed shadow-sm",
                              msg.role === 'bot' 
                                ? "bg-slate-100 text-slate-800 rounded-tl-none border-l-4 border-primary" 
                                : "bg-primary text-white rounded-tr-none shadow-primary/20"
                            )}>
                              {msg.text}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    {isLoading && (
                      <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl w-fit">
                        <Loader2 className="w-3 h-3 animate-spin text-primary" />
                        <span className="text-[8px] font-black uppercase text-muted-foreground">Interpretando intenção...</span>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="px-6 py-2 border-t bg-slate-50/30">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                    {SUGESTOES_AURA.map((sug) => (
                      <button
                        key={sug.id}
                        onClick={() => processMessage(sug.label)}
                        disabled={isLoading || !isReady}
                        className={cn(
                          "whitespace-nowrap px-4 py-2 rounded-full border text-[9px] font-black uppercase shadow-sm transition-all flex items-center gap-2",
                          !isReady 
                            ? "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed opacity-50"
                            : "bg-white border-primary/10 text-primary hover:bg-primary/5 active:scale-95"
                        )}
                      >
                        <span>{sug.icon}</span>
                        <span>{sug.label}</span>
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
                      disabled={isLoading || !isReady}
                      placeholder={isReady ? "Dúvidas técnicas ou clínicas..." : "Aguarde a sincronização técnica..."}
                      className="h-14 rounded-2xl pr-14 pl-6 border-transparent bg-slate-50 shadow-inner font-bold text-xs focus:ring-primary"
                    />
                    <Button
                      size="icon"
                      onClick={handleSend}
                      disabled={isLoading || !inputValue.trim() || !isReady}
                      className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-primary text-white shadow-lg active:scale-90 transition-transform"
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
