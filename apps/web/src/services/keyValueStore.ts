import type { KeyValueStore } from '@mgg/game-core';

/** localStorage-backed KeyValueStore. Mobile later supplies AsyncStorage. */
export const localKeyValueStore: KeyValueStore = {
  async get(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async set(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore quota / privacy-mode failures
    }
  },
};
