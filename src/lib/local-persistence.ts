
'use client';

import { Preferences } from '@capacitor/preferences';

const STORAGE_KEYS = {
  USER_PROGRESS: 'urbeludo_progress',
  USER_ID: 'urbeludo_uid',
  LANGUAGE: 'language'
};

/**
 * Utilitário de persistência local para garantir resiliência offline do APK.
 */
export const LocalPersistence = {
  async saveProgress(data: any) {
    await Preferences.set({
      key: STORAGE_KEYS.USER_PROGRESS,
      value: JSON.stringify(data),
    });
  },

  async getProgress() {
    const { value } = await Preferences.get({ key: STORAGE_KEYS.USER_PROGRESS });
    return value ? JSON.parse(value) : null;
  },

  async saveUserId(uid: string) {
    await Preferences.set({
      key: STORAGE_KEYS.USER_ID,
      value: uid,
    });
  },

  async getUserId() {
    const { value } = await Preferences.get({ key: STORAGE_KEYS.USER_ID });
    return value;
  },

  async clear() {
    await Preferences.clear();
  }
};
