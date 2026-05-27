import { useNavigate } from 'react-router-dom';
import { verifiedTracks } from '@mgg/game-core';
import { useGameStore } from '../store/gameStore';

export function DecksScreen() {
  const navigate = useNavigate();
  const customDecks = useGameStore((s) => s.customDecks);
  const deleteCustomDeck = useGameStore((s) => s.deleteCustomDeck);

  const confirmDelete = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"? This can't be undone.`)) deleteCustomDeck(id);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your decks</h2>
        <button className="btn-primary" onClick={() => navigate('/decks/new')}>
          + New deck
        </button>
      </div>

      {customDecks.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
          You haven&apos;t built any decks yet. Tap <span className="font-semibold">New deck</span> to
          search songs and save your own.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {customDecks.map((deck) => (
            <li key={deck.id} className="card flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-semibold">{deck.name}</div>
                <div className="truncate text-sm text-slate-400">{deck.description}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {deck.tracks.length} songs · {verifiedTracks(deck).length} year-verified
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold hover:bg-slate-700"
                  onClick={() => navigate(`/decks/edit/${encodeURIComponent(deck.id)}`)}
                >
                  Edit
                </button>
                <button
                  className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-rose-300 hover:bg-slate-700"
                  onClick={() => confirmDelete(deck.id, deck.name)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-3">
        <button className="btn-ghost flex-1" onClick={() => navigate('/setup')}>
          Go to game setup
        </button>
        <button className="btn-ghost flex-1" onClick={() => navigate('/')}>
          Home
        </button>
      </div>
    </div>
  );
}
