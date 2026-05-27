import type { Track } from './types.js';

export function fakeTrack(overrides: Partial<Track> = {}): Track {
  return {
    id: 'itunes:1',
    title: 'Test Song',
    artist: 'Test Artist',
    album: 'Test Album',
    releaseYear: 1990,
    releaseDate: '1990-06-01',
    previewUrl: 'https://example.com/clip.m4a',
    artworkUrl: 'https://example.com/art.jpg',
    durationMs: 30000,
    source: 'itunes',
    yearVerified: true,
    ...overrides,
  };
}

/** A pool of distinct tracks for distractor generation in tests. */
export function fakePool(n: number): Track[] {
  return Array.from({ length: n }, (_, i) =>
    fakeTrack({
      id: `itunes:${i + 1}`,
      title: `Song ${i + 1}`,
      artist: `Artist ${i + 1}`,
      releaseYear: 1970 + i,
    }),
  );
}
