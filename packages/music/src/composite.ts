import type { MusicSourceId, Track } from '@mgg/game-core';
import type { MusicProvider, SearchOptions } from './types.js';

/**
 * Merges several providers behind one MusicProvider. Search results are
 * concatenated and de-duplicated by (title, artist); getTrack dispatches to the
 * provider whose id matches the track id prefix.
 */
export class CompositeProvider implements MusicProvider {
  readonly id: MusicSourceId;

  constructor(private readonly providers: MusicProvider[]) {
    if (providers.length === 0) throw new Error('CompositeProvider needs at least one provider');
    this.id = providers[0].id;
  }

  async search(query: string, opts?: SearchOptions): Promise<Track[]> {
    const batches = await Promise.all(this.providers.map((p) => p.search(query, opts)));
    const seen = new Set<string>();
    const merged: Track[] = [];
    for (const batch of batches) {
      for (const track of batch) {
        const key = `${track.title.toLowerCase()}::${track.artist.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(track);
        }
      }
    }
    return merged;
  }

  async getTrack(id: string): Promise<Track | null> {
    const prefix = id.split(':')[0] as MusicSourceId;
    const provider = this.providers.find((p) => p.id === prefix) ?? this.providers[0];
    return provider.getTrack(id);
  }
}
