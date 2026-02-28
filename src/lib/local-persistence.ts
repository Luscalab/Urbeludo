
'use client';

import { Preferences } from '@capacitor/preferences';

const STORAGE_KEYS = {
  USER_PROGRESS: 'urbeludo_progress',
  USER_ID: 'urbeludo_uid',
  ACTIVITIES: 'urbeludo_activities',
  LANGUAGE: 'language'
};

/**
 * Utilitário de persistência local absoluta para arquitetura Standalone.
 * Gerencia todo o estado do app no hardware do dispositivo.
 */
export const LocalPersistence = {
  async saveProgress(data: any) {
    if (typeof window === 'undefined') return;
    try {
      const current = await this.getProgress() || {};
      const updated = { ...current, ...data };
      await Preferences.set({
        key: STORAGE_KEYS.USER_PROGRESS,
        value: JSON.stringify(updated),
      });
      // Emitir evento para atualizar hooks locais
      window.dispatchEvent(new Event('local-data-updated'));
    } catch (e) {
      console.warn('Erro ao salvar progresso local:', e);
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
      const activities = await this.getActivities();
      const newActivities = [activity, ...activities].slice(0, 50); // Limite de 50 registros locais
      await Preferences.set({
        key: STORAGE_KEYS.ACTIVITIES,
        value: JSON.stringify(newActivities),
      });
      window.dispatchEvent(new Event('local-data-updated'));
    } catch (e) {}
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
