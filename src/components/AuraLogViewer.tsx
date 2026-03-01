'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Download, Terminal, ChevronRight, Activity } from 'lucide-react';
import { AuraLogger, LogEntry } from '@/lib/logs/aura-logger';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function AuraLogViewer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const updateLogs = () => setLogs(AuraLogger.getLogs());
    updateLogs();
    window.addEventListener('aura-log-added', updateLogs);
    return () => window.removeEventListener('aura-log-added', updateLogs);
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-500 text-white border-red-600';
      case 'warn': return 'bg-yellow-500 text-black border-yellow-600';
      case 'debug': return 'bg-slate-700 text-slate-300 border-slate-600';
      default: return 'bg-primary text-white border-primary-foreground/20';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-2xl bg-slate-900 border-4 border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            <header className="p-6 bg-slate-800 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary rounded-2xl shadow-lg">
                  <Terminal className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase italic tracking-tighter text-white">Console de Telemetria</h3>
                  <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 text-green-500 animate-pulse" />
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Sincronia UrbeLudo v1.0</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => AuraLogger.exportLogs()} 
                  className="p-2.5 hover:bg-slate-700 rounded-xl text-slate-400 transition-colors"
                  title="Baixar Logs"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => AuraLogger.clearLogs()} 
                  className="p-2.5 hover:bg-red-500/10 rounded-xl text-red-400 transition-colors"
                  title="Limpar Histórico"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={onClose} 
                  className="p-2.5 hover:bg-slate-700 rounded-xl text-white transition-colors ml-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </header>

            <ScrollArea className="flex-1 bg-slate-950 p-6 font-mono">
              <div className="space-y-3">
                {logs.length === 0 ? (
                  <div className="py-24 text-center">
                    <Terminal className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Aguardando telemetria inicial...</p>
                  </div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="group border-l-2 border-slate-800 pl-4 py-1 hover:border-primary transition-colors">
                      <div className="flex items-center gap-3 mb-1">
                        <Badge variant="outline" className={cn("text-[7px] font-black uppercase px-2 h-4", getLevelColor(log.level))}>
                          {log.level}
                        </Badge>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight">{log.context}</span>
                        <span className="text-[7px] text-slate-700 ml-auto">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[10px] font-medium text-slate-300 leading-relaxed">{log.message}</p>
                      {log.data && (
                        <div className="mt-2 p-3 bg-slate-900/50 rounded-xl border border-slate-800/50 text-[8px] text-slate-500 overflow-x-auto whitespace-pre-wrap">
                          {log.data}
                        </div>
                      )}
                    </div>
                  )).reverse()
                )}
              </div>
            </ScrollArea>
            
            <footer className="p-4 bg-slate-900 border-t border-slate-800 flex justify-center">
               <button 
                onClick={onClose} 
                className="px-10 py-3 bg-white text-slate-950 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
               >
                 Retornar ao Playground
               </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
