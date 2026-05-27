import type { HttpClient } from '@mgg/game-core';

/** Browser fetch-based HttpClient. Used by live MusicProviders (Phase 5+). */
export const browserHttpClient: HttpClient = {
  async get(url: string): Promise<unknown> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.json();
  },
};
