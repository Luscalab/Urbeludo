'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Download, Terminal, ChevronRight } from 'lucide-react';
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
      case 'error': return 'bg-red-100 text-red-700 border-red-200';
      case 'warn': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'debug': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-[2000] flex items-center justify-center p-6 pointer-events-none"
        >
          <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.3)] border-4 border-slate-900 overflow-hidden flex flex-col pointer-events-auto max-h-[80vh]">
            <header className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Terminal className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="text-sm font-black uppercase italic tracking-tighter">Console de Telemetria</h3>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Registros de Tempo Real (APK)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => AuraLogger.exportLogs()} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><Download className="w-4 h-4" /></button>
                <button onClick={() => AuraLogger.clearLogs()} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-red-400"><Trash2 className="w-4 h-4" /></button>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors ml-2"><X className="w-5 h-5" /></button>
              </div>
            </header>

            <ScrollArea className="flex-1 p-6 bg-slate-50">
              <div className="space-y-2">
                {logs.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 text-[10px] font-bold uppercase">Nenhum registro encontrado.</div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn("text-[7px] font-black uppercase", getLevelColor(log.level))}>
                            {log.level}
                          </Badge>
                          <span className="text-[8px] font-black text-slate-400">{log.context}</span>
                        </div>
                        <span className="text-[7px] font-mono text-slate-300">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[10px] font-medium text-slate-800 leading-tight">{log.message}</p>
                      {log.data && (
                        <div className="p-2 bg-slate-50 rounded-lg text-[8px] font-mono text-slate-500 overflow-x-auto whitespace-pre">
                          {log.data}
                        </div>
                      )}
                    </div>
                  )).reverse()
                )}
              </div>
            </ScrollArea>
            
            <footer className="p-4 bg-white border-t flex justify-center">
               <button onClick={onClose} className="px-8 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase">Fechar Console</button>
            </footer>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
