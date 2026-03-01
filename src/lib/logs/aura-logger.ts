
'use client';

/**
 * @fileOverview AuraLogger - Sistema de telemetria e logs persistentes de sistema.
 * Armazena logs no LocalStorage para serem recuperados mesmo após o fechamento do APK.
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: any;
}

export const AuraLogger = {
  log(level: LogLevel, context: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${context.toUpperCase()}] ${message}`;

    // Cores para o console do desenvolvedor (F12)
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

    // Persistência para visualização no APK (Terminal In-App)
    if (typeof window !== 'undefined') {
      try {
        const rawLogs = localStorage.getItem('aura_logs');
        const logs: LogEntry[] = rawLogs ? JSON.parse(rawLogs) : [];
        logs.push({ 
          timestamp, 
          level, 
          context: context.toUpperCase(), 
          message, 
          data: data ? (typeof data === 'string' ? data : JSON.stringify(data, null, 2)) : null 
        });
        
        // Limita a 500 logs para manter a performance do terminal
        if (logs.length > 500) logs.shift();
        localStorage.setItem('aura_logs', JSON.stringify(logs));
        
        // Emite evento global para o Terminal atualizar
        window.dispatchEvent(new CustomEvent('aura-log-added'));
      } catch (e) {
        // Falha silenciosa se o armazenamento estiver cheio
      }
    }
  },

  info(context: string, message: string, data?: any) { this.log('info', context, message, data); },
  warn(context: string, message: string, data?: any) { this.log('warn', context, message, data); },
  error(context: string, message: string, data?: any) { this.log('error', context, message, data); },
  debug(context: string, message: string, data?: any) { this.log('debug', context, message, data); },
  
  getLogs(): LogEntry[] {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('aura_logs') || '[]');
    } catch (e) {
      return [];
    }
  },
  
  clearLogs() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aura_logs');
      window.dispatchEvent(new CustomEvent('aura-log-added'));
      this.info('SYSTEM', 'Histórico de telemetria limpo pelo administrador.');
    }
  },

  exportLogs() {
    const logs = this.getLogs();
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `urbeludo_terminal_${new Date().getTime()}.json`;
    a.click();
  }
};
