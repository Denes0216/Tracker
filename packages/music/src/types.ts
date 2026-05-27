import type { Track, MusicSourceId, HttpClient } from '@mgg/game-core';

// Track / MusicSourceId / HttpClient are owned by game-core (the dependency
// root) and re-exported here so app code can import them from '@mgg/music'.
export type { Track, MusicSourceId, HttpClient };

export interface SearchOptions {
  /** Max results to return. */
  limit?: number;
  /** ISO country code for the store front (affects availability). */
  country?: string;
}

/**
 * The single interface every music source implements. The game engine depends
 * on this, never on a concrete provider — that is what keeps the music source
 * swappable and mobile cheap to add.
 */
export interface MusicProvider {
  readonly id: MusicSourceId;
  /** Live search — powers custom/endless modes (Phase 5+). */
  search(query: string, opts?: SearchOptions): Promise<Track[]>;
  /** Resolve a single track by id (e.g. refresh an expired preview). */
  getTrack(id: string): Promise<Track | null>;
}
