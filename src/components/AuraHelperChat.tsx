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
import { useUser, useDoc, useMemoFirebase } from '@/firebase';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

interface AuraHelperChatProps {
  /**
   * Posição do widget
   * @default 'fixed'
   */
  position?: 'fixed' | 'floating';
  /**
   * Mostrar recursos de debug (log viewer)
   * @default false
   */
  showDebugTools?: boolean;
}

/**
 * AuraHelperChat - Unified component for AI assistance.
 * Merges FloatingAuraBot and AuraHelper with parametrized features.
 */
export function AuraHelperChat({ 
  position = 'fixed',
  showDebugTools = false 
}: AuraHelperChatProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const userProgressRef = useMemoFirebase(() => user ? { id: user.uid, path: `user_progress/${user.uid}` } : null, [user]);
  const { data: profile } = useDoc(userProgressRef);

  const [isOpen, setIsOpen] = useState(false);
  const [isLogViewerOpen, setIsLogViewerOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Olá! Sou o AuraHelper 2026. Como posso guiar seu movimento hoje?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSapient = profile?.email === 'sapientcontato@gmail.com' || profile?.displayName?.toLowerCase() === 'sapient';

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
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
      AuraLogger.error('AuraBot', 'Erro ao processar mensagem', error);
      setMessages(prev => [...prev, { role: 'bot', text: "Senti uma pequena interferência de 2026. Pode repetir?" }]);
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
    if (isSapient && showDebugTools) {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      if (newCount >= 5) {
        setIsLogViewerOpen(true);
        setClickCount(0);
      }
    }
    setIsOpen(!isOpen);
  };

  const positionClasses = position === 'fixed' 
    ? "fixed top-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none w-full max-w-lg px-6"
    : "absolute top-0 right-0 z-50";

  return (
    <div className={positionClasses}>
      <div className="flex flex-col items-center">
        <motion.button
          onClick={handleIconClick}
          className={cn(
            "pointer-events-auto h-12 px-6 rounded-full flex items-center gap-3 shadow-2xl transition-all border-b-4 active:border-b-0 active:translate-y-1",
            isOpen 
              ? "bg-slate-950 text-white border-slate-800" 
              : "bg-white/90 backdrop-blur-xl text-primary border-primary/20"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <BrainCircuit className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-wider">
            {isOpen ? 'Fechar' : 'AuraHelper'}
          </span>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 180 }}
                exit={{ rotate: 0 }}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 10, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="pointer-events-auto mt-4 w-full bg-slate-950 border-2 border-primary/20 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Messages Container */}
              <ScrollArea className="h-72 p-4">
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex gap-2",
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <motion.div
                        initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          "max-w-xs rounded-lg px-4 py-2 text-sm",
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-slate-800 text-white border border-primary/20'
                        )}
                      >
                        {msg.text}
                      </motion.div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Processando...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t border-primary/10 p-4 bg-slate-900/50">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSend();
                      }
                    }}
                    placeholder="Faça uma pergunta..."
                    className="bg-slate-800 border-primary/20 text-white placeholder:text-slate-500"
                  />
                  <Button
                    size="sm"
                    onClick={handleSend}
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {/* Debug Tools Button */}
                {isSapient && showDebugTools && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsLogViewerOpen(!isLogViewerOpen)}
                    className="mt-2 w-full text-xs"
                  >
                    <Terminal className="w-3 h-3 mr-2" />
                    Ver Logs
                  </Button>
                )}
              </div>

              {/* Suggestions Bar */}
              {messages.length <= 1 && (
                <div className="border-t border-primary/10 p-3 bg-slate-900/30">
                  <div className="grid grid-cols-2 gap-2">
                    {SUGESTOES_AURA.slice(0, 4).map((sugestao) => (
                      <button
                        key={sugestao.id}
                        onClick={() => processMessage(sugestao.label)}
                        className="text-[10px] font-bold p-2 rounded bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                      >
                        {sugestao.icon} {sugestao.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
