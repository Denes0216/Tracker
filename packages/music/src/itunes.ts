import type { HttpClient, Track } from '@mgg/game-core';
import type { MusicProvider, SearchOptions } from './types.js';

const ITUNES_BASE = 'https://itunes.apple.com';

/** Build a URL query string without depending on URLSearchParams (DOM/Node). */
function queryString(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

/** Shape of the fields we read from an iTunes Search API result row. */
interface ITunesResult {
  wrapperType?: string;
  kind?: string;
  trackId?: number;
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  releaseDate?: string;
  previewUrl?: string;
  artworkUrl100?: string;
  trackTimeMillis?: number;
}

interface ITunesResponse {
  resultCount: number;
  results: ITunesResult[];
}

/** Upgrade iTunes' 100x100 artwork URL to a larger size. */
function upscaleArtwork(url: string | undefined, size = 600): string {
  if (!url) return '';
  return url.replace(/\/\d+x\d+bb\./, `/${size}x${size}bb.`);
}

/** Map a raw iTunes song row to our Track, or null if it isn't usable. */
export function mapITunesResult(r: ITunesResult): Track | null {
  if (r.kind !== 'song' || !r.trackId || !r.previewUrl || !r.releaseDate) {
    return null;
  }
  const year = Number.parseInt(r.releaseDate.slice(0, 4), 10);
  if (!Number.isFinite(year)) return null;

  return {
    id: `itunes:${r.trackId}`,
    title: r.trackName ?? '',
    artist: r.artistName ?? '',
    album: r.collectionName ?? '',
    releaseYear: year,
    releaseDate: r.releaseDate,
    previewUrl: r.previewUrl,
    artworkUrl: upscaleArtwork(r.artworkUrl100),
    durationMs: r.trackTimeMillis ?? 30000,
    source: 'itunes',
    // Search results report the *album* year; not safe for Pin-the-Year until
    // a human verifies it in the deck-builder.
    yearVerified: false,
  };
}

/** Strip the "itunes:" prefix from a Track id; returns null if not ours. */
function rawTrackId(id: string): string | null {
  return id.startsWith('itunes:') ? id.slice('itunes:'.length) : null;
}

/**
 * iTunes Search API provider. No auth required, stable CDN preview URLs.
 * Network access is injected via `HttpClient` so this stays platform-agnostic.
 */
export class ITunesProvider implements MusicProvider {
  readonly id = 'itunes' as const;

  constructor(
    private readonly http: HttpClient,
    private readonly defaultCountry = 'US',
  ) {}

  async search(query: string, opts: SearchOptions = {}): Promise<Track[]> {
    const params = queryString({
      term: query,
      entity: 'song',
      media: 'music',
      limit: String(opts.limit ?? 25),
      country: opts.country ?? this.defaultCountry,
    });
    const data = (await this.http.get(`${ITUNES_BASE}/search?${params}`)) as ITunesResponse;
    return (data.results ?? []).map(mapITunesResult).filter((t): t is Track => t !== null);
  }

  async getTrack(id: string): Promise<Track | null> {
    const raw = rawTrackId(id);
    if (!raw) return null;
    const params = queryString({ id: raw, entity: 'song' });
    const data = (await this.http.get(`${ITUNES_BASE}/lookup?${params}`)) as ITunesResponse;
    const first = (data.results ?? []).map(mapITunesResult).find((t): t is Track => t !== null);
    return first ?? null;
  }
}
