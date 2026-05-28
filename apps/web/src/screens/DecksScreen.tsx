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
    <div className="flex flex-col gap-10">
      <div className="flex items-end justify-between">
        <div>
          <div className="eyebrow mb-3">the crates</div>
          <h2 className="display text-4xl">Your decks.</h2>
        </div>
        <button className="btn-primary" onClick={() => navigate('/decks/new')}>
          New deck
        </button>
      </div>

      {customDecks.length === 0 ? (
        <div className="border border-dashed border-rule p-10 text-center">
          <p className="font-serif italic-soft text-lg text-paper-dim">
            The crates are empty.
          </p>
          <p className="mt-2 text-sm text-paper-mute">
            Tap <span className="text-amber-warm">New deck</span> to dig through iTunes and save
            your own.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-px overflow-hidden border border-rule bg-rule">
          {customDecks.map((deck) => (
            <li
              key={deck.id}
              className="flex items-center justify-between gap-4 bg-ink-100/60 px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-serif text-lg text-paper">{deck.name}</div>
                <div className="truncate text-sm text-paper-dim">{deck.description}</div>
                <div className="serial mt-1">
                  {String(deck.tracks.length).padStart(3, '0')} songs ·{' '}
                  {verifiedTracks(deck).length} year-verified
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  className="font-mono text-[11px] uppercase tracking-widest2 text-paper-dim hover:text-amber-warm"
                  onClick={() => navigate(`/decks/edit/${encodeURIComponent(deck.id)}`)}
                >
                  edit
                </button>
                <button
                  className="font-mono text-[11px] uppercase tracking-widest2 text-paper-mute hover:text-amber-warm"
                  onClick={() => confirmDelete(deck.id, deck.name)}
                >
                  delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-3 border-t border-rule pt-6">
        <button className="btn-ghost flex-1" onClick={() => navigate('/setup')}>
          Session setup
        </button>
        <button className="btn-ghost flex-1" onClick={() => navigate('/')}>
          Front of house
        </button>
      </div>
    </div>
  );
}
