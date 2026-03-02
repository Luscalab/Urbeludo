'use client';

import { Preferences } from '@capacitor/preferences';
import { AuraLogger } from '@/lib/logs/aura-logger';

const STORAGE_KEYS = {
  USER_PROGRESS: 'urbeludo_progress',
  USER_ID: 'urbeludo_uid',
  ACTIVITIES: 'urbeludo_activities',
  LANGUAGE: 'language'
};

/**
 * Utilitário de persistência local absoluta para arquitetura Standalone.
 * Gerencia progresso do usuário e histórico de atividades offline.
 */
export const LocalPersistence = {
  async saveProgress(data: any) {
    if (typeof window === 'undefined') return;
    try {
      const current = await this.getProgress() || {};
      const updated = { ...current, ...data };
      
      AuraLogger.debug('Persistence', 'Gravando progresso...', { keys: Object.keys(data) });
      
      await Preferences.set({
        key: STORAGE_KEYS.USER_PROGRESS,
        value: JSON.stringify(updated),
      });
      
      window.dispatchEvent(new Event('local-data-updated'));
    } catch (e) {
      AuraLogger.error('Persistence', 'Erro na gravação de progresso', e);
    }
  },

  async getProgress() {
    if (typeof window === 'undefined') return null;
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEYS.USER_PROGRESS });
      return value ? JSON.parse(value) : null;
    } catch (e) {
      return null;
    }
  },

  async saveActivity(activity: any) {
    if (typeof window === 'undefined') return;
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEYS.ACTIVITIES });
      const activities = value ? JSON.parse(value) : [];
      
      const newActivity = {
        ...activity,
        id: activity.id || `act-${Date.now()}`,
        startTime: activity.startTime || new Date().toISOString()
      };
      
      activities.unshift(newActivity);
      
      // Mantém apenas as últimas 50 atividades para não estourar o armazenamento
      const limitedActivities = activities.slice(0, 50);
      
      await Preferences.set({
        key: STORAGE_KEYS.ACTIVITIES,
        value: JSON.stringify(limitedActivities),
      });
      
      window.dispatchEvent(new Event('local-data-updated'));
      AuraLogger.info('Persistence', 'Nova atividade registrada no histórico local.');
    } catch (e) {
      AuraLogger.error('Persistence', 'Erro ao salvar atividade', e);
    }
  },

  async getActivities() {
    if (typeof window === 'undefined') return [];
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEYS.ACTIVITIES });
      return value ? JSON.parse(value) : [];
    } catch (e) {
      return [];
    }
  },

  async saveUserId(uid: string) {
    if (typeof window === 'undefined') return;
    try {
      await Preferences.set({
        key: STORAGE_KEYS.USER_ID,
        value: uid,
      });
      AuraLogger.info('Persistence', `UID salvo: ${uid}`);
    } catch (e) {}
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
      await Preferences.clear();
      window.location.reload();
    } catch (e) {}
  }
};
