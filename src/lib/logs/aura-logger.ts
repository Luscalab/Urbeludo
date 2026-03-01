'use client';

/**
 * @fileOverview AuraLogger - Sistema de telemetria e logs persistentes.
 * Permite monitorar o comportamento da IA em tempo real e recuperar histórico no APK.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export const AuraLogger = {
  log(level: LogLevel, context: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${context.toUpperCase()}] ${message}`;

    // Cores para o console (estilo Chrome/Firefox)
    const colors = {
      info: 'color: #9333ea; font-weight: bold;',
      warn: 'color: #f59e0b; font-weight: bold;',
      error: 'color: #ef4444; font-weight: bold;',
      debug: 'color: #64748b; font-weight: normal;'
    };

    if (level === 'error') {
      console.error(formattedMessage, data || '');
    } else if (level === 'warn') {
      console.warn(formattedMessage, data || '');
    } else {
      console.log(`%c${formattedMessage}`, colors[level], data || '');
    }

    // Persistência para debug em APK (Capacitor)
    if (typeof window !== 'undefined') {
      try {
        const rawLogs = localStorage.getItem('aura_logs');
        const logs = rawLogs ? JSON.parse(rawLogs) : [];
        logs.push({ timestamp, level, context, message, data: data ? String(data) : null });
        
        // Mantém apenas os últimos 100 logs para não estourar o armazenamento
        if (logs.length > 100) logs.shift();
        localStorage.setItem('aura_logs', JSON.stringify(logs));
      } catch (e) {
        // Falha silenciosa se o localStorage estiver cheio ou indisponível
      }
    }
  },

  info(context: string, message: string, data?: any) { this.log('info', context, message, data); },
  warn(context: string, message: string, data?: any) { this.log('warn', context, message, data); },
  error(context: string, message: string, data?: any) { this.log('error', context, message, data); },
  debug(context: string, message: string, data?: any) { this.log('debug', context, message, data); },
  
  getLogs() {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('aura_logs') || '[]');
  },
  
  clearLogs() {
    if (typeof window !== 'undefined') localStorage.removeItem('aura_logs');
  }
};
