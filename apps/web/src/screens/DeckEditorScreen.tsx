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

  // Populate from a deep link once the store has hydrated the deck.
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
      description: description.trim() || 'Custom deck',
      tracks,
    };
    saveCustomDeck(deck);
    navigate('/decks');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{deckId ? 'Edit deck' : 'New deck'}</h2>
        <button className="text-sm text-slate-400 hover:text-slate-200" onClick={() => navigate('/decks')}>
          Cancel
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={name}
          maxLength={40}
          placeholder="Deck name"
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-lg font-semibold outline-none focus:border-brand-500"
        />
        <input
          type="text"
          value={description}
          maxLength={80}
          placeholder="Description (optional)"
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm outline-none focus:border-brand-500"
        />
      </div>

      <section>
        <div className="mb-2 text-sm font-medium text-slate-400">Find songs</div>
        <input
          type="text"
          value={query}
          placeholder="Search by song or artist…"
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-brand-500"
        />
        {searchError && <p className="mt-2 text-sm text-rose-400">{searchError}</p>}
        {searching && <p className="mt-2 text-sm text-slate-500">Searching…</p>}
        <ul className="mt-3 flex flex-col gap-2">
          {results.map((track) => {
            const added = tracks.some((t) => t.id === track.id);
            return (
              <li key={track.id} className="flex items-center gap-3 rounded-xl bg-slate-800/60 p-2">
                <button
                  type="button"
                  onClick={() => toggle(track.previewUrl)}
                  aria-label={playingUrl === track.previewUrl ? 'Stop preview' : 'Preview'}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white hover:bg-brand-500"
                >
                  {playingUrl === track.previewUrl ? '■' : '▶'}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{track.title}</div>
                  <div className="truncate text-xs text-slate-500">
                    {track.artist} · {track.album} · {track.releaseYear}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={added}
                  onClick={() => addTrack(track)}
                  className="shrink-0 rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold hover:bg-slate-600 disabled:opacity-40"
                >
                  {added ? 'Added' : 'Add'}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-400">In this deck</span>
          <span className="text-xs text-slate-500">
            {tracks.length} songs · {verifiedCount} year-verified
          </span>
        </div>
        {tracks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-700 p-4 text-center text-sm text-slate-500">
            Search above and tap Add to build your deck.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tracks.map((track) => (
              <li key={track.id} className="flex items-center gap-2 rounded-xl bg-slate-800/60 p-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{track.title}</div>
                  <div className="truncate text-xs text-slate-500">{track.artist}</div>
                </div>
                <input
                  type="number"
                  value={track.releaseYear}
                  aria-label={`Release year for ${track.title}`}
                  onChange={(e) => setYear(track.id, Number(e.target.value))}
                  className="w-20 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-center text-sm outline-none focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={() => toggleVerified(track.id)}
                  title="Mark the year as verified to allow Pin the Year"
                  className={`shrink-0 rounded-lg px-2 py-1 text-xs font-semibold ${
                    track.yearVerified ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {track.yearVerified ? '✓ year' : 'verify'}
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${track.title}`}
                  onClick={() => removeTrack(track.id)}
                  className="shrink-0 rounded-lg bg-slate-800 px-2 py-1 text-slate-400 hover:bg-slate-700"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-slate-600">
          iTunes reports the album year, which can be wrong for hits on later compilations. Check and
          mark a year verified to use the song in Pin the Year.
        </p>
      </section>

      <button className="btn-primary text-lg" disabled={!canSave} onClick={save}>
        Save deck
      </button>
    </div>
  );
}
