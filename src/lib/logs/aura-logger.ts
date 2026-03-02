'use client';

/**
 * @fileOverview AuraLogger - Sistema de telemetria otimizado para performance.
 * Mantém logs em memória para evitar o gargalo de escrita no LocalStorage durante
 * operações intensivas de IA (que causavam o travamento da interface).
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: any;
}

// Armazenamento em memória para evitar bloqueio de I/O
let memoryLogs: LogEntry[] = [];
const MAX_LOGS = 500;

export const AuraLogger = {
  log(level: LogLevel, context: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${context.toUpperCase()}] ${message}`;

    const colors = {
      info: 'color: #9333ea; font-weight: bold;',
      warn: 'color: #f59e0b; font-weight: bold;',
      error: 'color: #ef4444; font-weight: bold;',
      debug: 'color: #64748b; font-weight: normal;'
    };

    if (level === 'error') {
      console.error(`[${timestamp}] ${formattedMessage}`, data || '');
    } else if (level === 'warn') {
      console.warn(`[${timestamp}] ${formattedMessage}`, data || '');
    } else if (level === 'debug') {
      console.debug(`%c[${timestamp}] ${formattedMessage}`, colors[level], data || '');
    } else {
      console.log(`%c[${timestamp}] ${formattedMessage}`, colors[level], data || '');
    }

    // Adiciona ao buffer de memória
    memoryLogs.push({ 
      timestamp, 
      level, 
      context: context.toUpperCase(), 
      message, 
      data: data ? (typeof data === 'string' ? data : JSON.stringify(data, null, 2)) : null 
    });
    
    if (memoryLogs.length > MAX_LOGS) memoryLogs.shift();
    
    // Notifica o sistema apenas no navegador
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aura-log-added'));
    }
  },

  info(context: string, message: string, data?: any) { this.log('info', context, message, data); },
  warn(context: string, message: string, data?: any) { this.log('warn', context, message, data); },
  error(context: string, message: string, data?: any) { this.log('error', context, message, data); },
  debug(context: string, message: string, data?: any) { this.log('debug', context, message, data); },
  
  getLogs(): LogEntry[] {
    return memoryLogs;
  },
  
  clearLogs() {
    memoryLogs = [];
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aura-log-added'));
      this.info('SYSTEM', 'Histórico de telemetria limpo em memória.');
    }
  },

  exportLogs() {
    const logs = this.getLogs();
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `urbeludo_telemetria_${new Date().getTime()}.json`;
    a.click();
  }
};
