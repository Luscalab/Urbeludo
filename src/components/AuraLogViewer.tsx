
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Download, Terminal, ChevronRight, Activity, Cpu, Database, Wifi } from 'lucide-react';
import { AuraLogger, LogEntry } from '@/lib/logs/aura-logger';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function AuraLogViewer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateLogs = () => setLogs(AuraLogger.getLogs());
    updateLogs();
    window.addEventListener('aura-log-added', updateLogs);
    return () => window.removeEventListener('aura-log-added', updateLogs);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [logs]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400 border-red-900/50 bg-red-950/30';
      case 'warn': return 'text-yellow-400 border-yellow-900/50 bg-yellow-950/30';
      case 'debug': return 'text-slate-500 border-slate-800 bg-slate-900/30';
      default: return 'text-cyan-400 border-cyan-900/50 bg-cyan-950/30';
    }
  };

  const getContextIcon = (context: string) => {
    if (context.includes('WORKER') || context.includes('BRAIN')) return <Cpu className="w-3 h-3" />;
    if (context.includes('STORAGE') || context.includes('PERSISTENCE')) return <Database className="w-3 h-3" />;
    if (context.includes('GEMINI') || context.includes('FLOW')) return <Wifi className="w-3 h-3" />;
    return <Terminal className="w-3 h-3" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-6"
        >
          <motion.div
            initial={{ scale: 0.95, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 40 }}
            className="w-full h-full sm:max-w-4xl bg-slate-950 border-0 sm:border-4 border-slate-800 rounded-none sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
          >
            <header className="p-6 bg-slate-900 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                  <Terminal className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase italic tracking-tighter text-white">Console de Telemetria</h3>
                  <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 text-green-500 animate-pulse" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sincronia UrbeLudo v2.0 (ADMIN)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => AuraLogger.exportLogs()} 
                  className="p-3 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
                  title="Baixar Logs"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => AuraLogger.clearLogs()} 
                  className="p-3 hover:bg-red-500/10 rounded-xl text-red-400 transition-colors"
                  title="Limpar Histórico"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={onClose} 
                  className="p-3 hover:bg-slate-800 rounded-xl text-white transition-colors ml-2"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>
            </header>

            <ScrollArea className="flex-1 p-6 font-mono" ref={scrollRef}>
              <div className="space-y-2 pb-10">
                {logs.length === 0 ? (
                  <div className="py-24 text-center opacity-20">
                    <Terminal className="w-16 h-16 text-white mx-auto mb-4" />
                    <p className="text-white text-[10px] font-black uppercase tracking-widest">Iniciando kernel de telemetria...</p>
                  </div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="group border-l border-slate-800 pl-4 py-1.5 hover:bg-white/5 transition-colors rounded-r-xl">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <Badge variant="outline" className={cn("text-[7px] font-black uppercase px-2 py-0 h-4 border", getLevelColor(log.level))}>
                          {log.level}
                        </Badge>
                        <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase">
                          {getContextIcon(log.context)}
                          {log.context}
                        </span>
                        <span className="text-[7px] text-slate-600 ml-auto font-mono">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      </div>
                      <p className={cn(
                        "text-[10px] font-medium leading-relaxed",
                        log.level === 'error' ? 'text-red-300' : log.level === 'warn' ? 'text-yellow-200' : 'text-slate-300'
                      )}>
                        {log.message}
                      </p>
                      {log.data && (
                        <div className="mt-2 p-3 bg-black/40 rounded-xl border border-white/5 text-[8px] text-cyan-500/70 overflow-x-auto whitespace-pre-wrap font-mono leading-tight">
                          {log.data}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            
            <footer className="p-4 bg-slate-900 border-t border-white/5 flex items-center justify-between px-8">
               <div className="text-[8px] font-black text-slate-500 uppercase">
                  Log entries: {logs.length} / 500
               </div>
               <button 
                onClick={onClose} 
                className="px-8 py-3 bg-white text-slate-950 rounded-full text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
               >
                 Sair do Terminal
               </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
