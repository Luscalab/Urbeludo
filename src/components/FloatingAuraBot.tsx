
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Loader2, 
  Sparkles, 
  BrainCircuit,
  Info,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePathname } from 'next/navigation';
import { askAuraHelper } from '@/ai/flows/aura-helper-flow';
import { UrbeLudoLogo } from './UrbeLudoLogo';
import { cn } from '@/lib/utils';

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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await askAuraHelper({
        question: userMessage,
        context: `O usuário está na tela: ${pathname}`
      });
      
      setMessages(prev => [...prev, { role: 'bot', text: response.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Desculpe, minha percepção sensorial falhou. Pode repetir?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none w-full max-w-lg px-6">
      <div className="flex flex-col items-center">
        {/* Toggle Button */}
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
          <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
        </motion.button>

        {/* Chat Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="pointer-events-auto mt-4 w-full bg-white rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.15)] border-4 border-primary/5 flex flex-col overflow-hidden max-h-[450px]"
            >
              {/* Header */}
              <div className="p-6 bg-primary/5 border-b flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black uppercase italic tracking-tighter">Guia de Sensibilidade</h3>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">IA de Borda Determinística</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                   <span className="text-[7px] font-black text-green-700 uppercase">Online</span>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                <div className="space-y-4">
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
                  {isLoading && (
                    <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl w-fit">
                      <Loader2 className="w-3 h-3 animate-spin text-primary" />
                      <span className="text-[8px] font-black uppercase text-muted-foreground">Ouvindo a Aura...</span>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t bg-slate-50/50">
                <div className="relative">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Pergunte sobre os jogos ou o estúdio..."
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
                <p className="mt-2 text-center text-[7px] font-bold text-muted-foreground uppercase tracking-widest">
                  Suas perguntas ajudam a treinar meu motor lúdico.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
