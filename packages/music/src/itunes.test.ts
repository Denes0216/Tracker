import { describe, it, expect } from 'vitest';
import type { HttpClient } from '@mgg/game-core';
import { ITunesProvider, mapITunesResult } from './itunes.js';

const songRow = {
  wrapperType: 'track',
  kind: 'song',
  trackId: 123,
  trackName: 'Bohemian Rhapsody',
  artistName: 'Queen',
  collectionName: 'A Night at the Opera',
  releaseDate: '1975-10-31T12:00:00Z',
  previewUrl: 'https://audio.example.com/clip.m4a',
  artworkUrl100: 'https://art.example.com/100x100bb.jpg',
  trackTimeMillis: 354000,
};

describe('mapITunesResult', () => {
  it('maps a song row into a Track', () => {
    const track = mapITunesResult(songRow)!;
    expect(track).toMatchObject({
      id: 'itunes:123',
      title: 'Bohemian Rhapsody',
      artist: 'Queen',
      album: 'A Night at the Opera',
      releaseYear: 1975,
      source: 'itunes',
      yearVerified: false,
    });
  });

  it('upscales artwork to 600x600', () => {
    expect(mapITunesResult(songRow)!.artworkUrl).toBe('https://art.example.com/600x600bb.jpg');
  });

  it('rejects rows that are not songs or lack a preview', () => {
    expect(mapITunesResult({ ...songRow, kind: 'feature-movie' })).toBeNull();
    expect(mapITunesResult({ ...songRow, previewUrl: undefined })).toBeNull();
    expect(mapITunesResult({ ...songRow, releaseDate: undefined })).toBeNull();
  });
});

function fakeHttp(payload: unknown): HttpClient {
  return { get: async () => payload };
}

describe('ITunesProvider', () => {
  it('search maps and filters results', async () => {
    const provider = new ITunesProvider(
      fakeHttp({ resultCount: 2, results: [songRow, { kind: 'podcast', trackId: 9 }] }),
    );
    const tracks = await provider.search('queen');
    expect(tracks).toHaveLength(1);
    expect(tracks[0].id).toBe('itunes:123');
  });

  it('getTrack returns null for a non-itunes id', async () => {
    const provider = new ITunesProvider(fakeHttp({ resultCount: 0, results: [] }));
    expect(await provider.getTrack('deezer:5')).toBeNull();
  });

  it('getTrack resolves an itunes id', async () => {
    const provider = new ITunesProvider(fakeHttp({ resultCount: 1, results: [songRow] }));
    const track = await provider.getTrack('itunes:123');
    expect(track?.title).toBe('Bohemian Rhapsody');
  });
});
