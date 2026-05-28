import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Deck, Track } from '@mgg/game-core';
import { useGameStore } from '../store/gameStore';
import { itunesProvider } from '../services/musicProvider';
import { usePreview } from '../hooks/usePreview';

function newDeckId(): string {
  return `custom:${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
}

export function DeckEditorScreen() {
  const navigate = useNavigate();
  const { deckId } = useParams();
  const existing = useGameStore((s) => (deckId ? s.customDecks.find((d) => d.id === deckId) : undefined));
  const saveCustomDeck = useGameStore((s) => s.saveCustomDeck);

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [tracks, setTracks] = useState<Track[]>(existing?.tracks ?? []);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && existing) {
      setName(existing.name);
      setDescription(existing.description);
      setTracks(existing.tracks);
      initialized.current = true;
    }
  }, [existing]);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const reqId = useRef(0);
  const { playingUrl, toggle } = usePreview();

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    const id = ++reqId.current;
    setSearching(true);
    setSearchError(null);
    const timer = setTimeout(async () => {
      try {
        const found = await itunesProvider.search(q, { limit: 15 });
        if (id === reqId.current) setResults(found);
      } catch {
        if (id === reqId.current) setSearchError('Search failed — check your connection.');
      } finally {
        if (id === reqId.current) setSearching(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const addTrack = (track: Track) =>
    setTracks((cur) => (cur.some((t) => t.id === track.id) ? cur : [...cur, track]));
  const removeTrack = (id: string) => setTracks((cur) => cur.filter((t) => t.id !== id));
  const setYear = (id: string, year: number) =>
    setTracks((cur) => cur.map((t) => (t.id === id ? { ...t, releaseYear: year } : t)));
  const toggleVerified = (id: string) =>
    setTracks((cur) => cur.map((t) => (t.id === id ? { ...t, yearVerified: !t.yearVerified } : t)));

  const verifiedCount = tracks.filter((t) => t.yearVerified).length;
  const canSave = name.trim().length > 0 && tracks.length > 0;

  const save = () => {
    if (!canSave) return;
    const deck: Deck = {
      id: deckId ?? newDeckId(),
      name: name.trim(),
      description: description.trim() || 'A custom crate',
      tracks,
    };
    saveCustomDeck(deck);
    navigate('/decks');
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-end justify-between">
        <div>
          <div className="eyebrow mb-3">{deckId ? 'edit crate' : 'new crate'}</div>
          <h2 className="display text-4xl">
            {deckId ? 'Tune the deck.' : 'Build a deck.'}
          </h2>
        </div>
        <button className="btn-quiet font-mono text-[11px] uppercase tracking-widest2" onClick={() => navigate('/decks')}>
          cancel
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={name}
          maxLength={40}
          placeholder="Deck name"
          onChange={(e) => setName(e.target.value)}
          className="field font-serif text-2xl"
        />
        <input
          type="text"
          value={description}
          maxLength={80}
          placeholder="Description (optional)"
          onChange={(e) => setDescription(e.target.value)}
          className="field"
        />
      </div>

      <section>
        <div className="eyebrow mb-3">dig for songs</div>
        <input
          type="text"
          value={query}
          placeholder="Search a song or artist…"
          onChange={(e) => setQuery(e.target.value)}
          className="field"
        />
        {searchError && <p className="mt-2 text-sm text-amber-warm">{searchError}</p>}
        {searching && <p className="serial mt-2">searching the catalog…</p>}
        {results.length > 0 && (
          <ul className="mt-4 flex flex-col gap-px overflow-hidden border border-rule bg-rule">
            {results.map((track) => {
              const added = tracks.some((t) => t.id === track.id);
              const playing = playingUrl === track.previewUrl;
              return (
                <li key={track.id} className="flex items-center gap-3 bg-ink-100/60 p-3">
                  <button
                    type="button"
                    onClick={() => toggle(track.previewUrl)}
                    aria-label={playing ? 'Stop preview' : 'Preview'}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center border font-mono text-xs uppercase tracking-widest2 transition-colors ${
                      playing
                        ? 'border-amber bg-amber/20 text-amber-warm'
                        : 'border-rule text-paper-dim hover:border-amber/60 hover:text-amber-warm'
                    }`}
                  >
                    {playing ? 'stop' : 'cue'}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-serif text-sm text-paper">{track.title}</div>
                    <div className="truncate text-xs text-paper-mute">
                      {track.artist} · {track.album} · {track.releaseYear}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={added}
                    onClick={() => addTrack(track)}
                    className={`shrink-0 border px-3 py-2 font-mono text-[11px] uppercase tracking-widest2 transition-colors ${
                      added
                        ? 'border-rule text-paper-mute'
                        : 'border-amber/60 text-amber-warm hover:bg-amber/15'
                    }`}
                  >
                    {added ? 'added' : 'add'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <span className="eyebrow">in this deck</span>
          <span className="serial">
            {String(tracks.length).padStart(3, '0')} songs · {verifiedCount} year-verified
          </span>
        </div>

        {tracks.length === 0 ? (
          <p className="border border-dashed border-rule p-6 text-center font-serif italic-soft text-paper-dim">
            Empty crate. Search above and add some sides.
          </p>
        ) : (
          <ul className="flex flex-col gap-px overflow-hidden border border-rule bg-rule">
            {tracks.map((track) => (
              <li key={track.id} className="flex items-center gap-2 bg-ink-100/60 p-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-serif text-sm text-paper">{track.title}</div>
                  <div className="truncate text-xs text-paper-mute">{track.artist}</div>
                </div>
                <input
                  type="number"
                  value={track.releaseYear}
                  aria-label={`Release year for ${track.title}`}
                  onChange={(e) => setYear(track.id, Number(e.target.value))}
                  className="w-20 border border-rule bg-ink-50 px-2 py-1 text-center font-mono text-sm tabular-nums text-paper outline-none focus:border-amber"
                />
                <button
                  type="button"
                  onClick={() => toggleVerified(track.id)}
                  title="Mark the year as verified to enable Pin the Year"
                  className={`shrink-0 border px-2 py-1 font-mono text-[10px] uppercase tracking-widest2 ${
                    track.yearVerified
                      ? 'border-amber/70 bg-amber/15 text-amber-warm'
                      : 'border-rule text-paper-mute hover:border-paper/30'
                  }`}
                >
                  {track.yearVerified ? 'verified' : 'verify'}
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${track.title}`}
                  onClick={() => removeTrack(track.id)}
                  className="shrink-0 px-2 py-1 font-mono text-[10px] uppercase tracking-widest2 text-paper-mute hover:text-amber-warm"
                >
                  remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-3 text-xs italic-soft text-paper-mute">
          iTunes reports the album year, which can be a later compilation. Verify the year to use a
          song in Pin the Year.
        </p>
      </section>

      <button className="btn-primary text-base" disabled={!canSave} onClick={save}>
        Save the crate
      </button>
    </div>
  );
}
