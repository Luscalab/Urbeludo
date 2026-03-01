
'use client';

import { Preferences } from '@capacitor/preferences';
import { AuraLogger } from '@/lib/logs/aura-logger';

const STORAGE_KEYS = {
  USER_PROGRESS: 'urbeludo_progress',
  USER_ID: 'urbeludo_uid',
  LANGUAGE: 'language'
};

/**
 * Utilitário de persistência local absoluta para arquitetura Standalone.
 * Versão Instrumentada com Telemetria de Sistema.
 */
export const LocalPersistence = {
  async saveProgress(data: any) {
    if (typeof window === 'undefined') return;
    try {
      const current = await this.getProgress() || {};
      const updated = { ...current, ...data };
      
      AuraLogger.debug('Persistence', 'Iniciando gravação de progresso...', { keys: Object.keys(data) });
      
      await Preferences.set({
        key: STORAGE_KEYS.USER_PROGRESS,
        value: JSON.stringify(updated),
      });
      
      window.dispatchEvent(new Event('local-data-updated'));
      AuraLogger.info('Persistence', 'Progresso salvo com sucesso no armazenamento local.');
    } catch (e) {
      AuraLogger.error('Persistence', 'Falha crítica na gravação local', e);
    }
  },

  async getProgress() {
    if (typeof window === 'undefined') return null;
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEYS.USER_PROGRESS });
      if (value) {
        AuraLogger.debug('Persistence', 'Dados recuperados do cache local.');
        return JSON.parse(value);
      }
      return null;
    } catch (e) {
      AuraLogger.warn('Persistence', 'Falha ao ler progresso ou cache vazio.');
      return null;
    }
  },

  async saveUserId(uid: string) {
    if (typeof window === 'undefined') return;
    try {
      AuraLogger.info('Persistence', `Registrando UID de Sistema: ${uid}`);
      await Preferences.set({
        key: STORAGE_KEYS.USER_ID,
        value: uid,
      });
    } catch (e) {
      AuraLogger.error('Persistence', 'Erro ao registrar UID', e);
    }
  },

  async getUserId() {
    if (typeof window === 'undefined') return null;
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEYS.USER_ID });
      return value;
    } catch (e) {
      return null;
    }
  },

  async clear() {
    if (typeof window === 'undefined') return;
    try {
      AuraLogger.warn('Persistence', 'Comando de limpeza total (PURGE) executado.');
      await Preferences.clear();
      window.location.reload();
    } catch (e) {}
  }
};
