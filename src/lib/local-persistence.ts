'use client';

import { Preferences } from '@capacitor/preferences';
import { AuraLogger } from '@/lib/logs/aura-logger';
import { UserProgress, ChallengeActivity } from '@/lib/types';

const STORAGE_KEYS = {
  USER_PROGRESS: 'urbeludo_progress',
  USER_ID: 'urbeludo_uid',
  ACTIVITIES: 'urbeludo_activities',
  LANGUAGE: 'language'
};

/**
 * Utilitário de persistência local absoluta.
 * Tratamento robusto de tipos para evitar falhas de inicialização.
 */
export const LocalPersistence = {
  async saveProgress(data: Partial<UserProgress>) {
    if (typeof window === 'undefined' || !data) return;
    try {
      const current = await this.getProgress() || {};
      const updated = { ...current, ...data };
      
      await Preferences.set({
        key: STORAGE_KEYS.USER_PROGRESS,
        value: JSON.stringify(updated),
      });
      
      window.dispatchEvent(new Event('local-data-updated'));
    } catch (e) {
      AuraLogger.error('Persistence', 'Erro na gravação de progresso', e);
    }
  },

  async getProgress(): Promise<UserProgress | null> {
    if (typeof window === 'undefined') return null;
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEYS.USER_PROGRESS });
      if (!value) return null;
      try {
        return JSON.parse(value) as UserProgress;
      } catch {
        return null;
      }
    } catch (e) {
      return null;
    }
  },

  async saveActivity(activity: Partial<ChallengeActivity>) {
    if (typeof window === 'undefined' || !activity) return;
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEYS.ACTIVITIES });
      let activities: ChallengeActivity[] = [];
      if (value) {
        try {
          activities = JSON.parse(value);
        } catch {
          activities = [];
        }
      }
      
      const newActivity: ChallengeActivity = {
        id: activity.id || `act-${Date.now()}`,
        timestamp: activity.timestamp || new Date().toISOString(),
        score: activity.score || 0,
        earnedCoins: activity.earnedCoins || 0,
        type: activity.type || 'unknown'
      };
      
      activities.unshift(newActivity);
      const limitedActivities = activities.slice(0, 50);
      
      await Preferences.set({
        key: STORAGE_KEYS.ACTIVITIES,
        value: JSON.stringify(limitedActivities),
      });
      
      window.dispatchEvent(new Event('local-data-updated'));
    } catch (e) {
      AuraLogger.error('Persistence', 'Erro ao salvar atividade', e);
    }
  },

  async getActivities(): Promise<ChallengeActivity[]> {
    if (typeof window === 'undefined') return [];
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEYS.ACTIVITIES });
      if (!value) return [];
      try {
        return JSON.parse(value) as ChallengeActivity[];
      } catch {
        return [];
      }
    } catch (e) {
      return [];
    }
  },

  async saveUserId(uid: string) {
    if (typeof window === 'undefined' || !uid) return;
    try {
      await Preferences.set({
        key: STORAGE_KEYS.USER_ID,
        value: uid,
      });
      AuraLogger.info('Persistence', `UID sincronizado localmente.`);
    } catch (e) {}
  },

  async getUserId() {
    if (typeof window === 'undefined') return null;
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEYS.USER_ID });
      return value; // UID é string pura
    } catch (e) {
      return null;
    }
  },

  async clear() {
    if (typeof window === 'undefined') return;
    try {
      await Preferences.clear();
      window.location.href = '/';
    } catch (e) {}
  }
};
