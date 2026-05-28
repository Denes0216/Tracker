import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CriterionSelection, InputType, ModeSelection, TurnStructure } from '@mgg/game-core';
import { eligibleTracks } from '@mgg/game-core';
import { useGameStore } from '../store/gameStore';
import { DECKS } from '../services/decks';
import { Segmented } from '../components/Segmented';
import { PlayerRoster } from '../components/PlayerRoster';

const MODE_OPTIONS: ReadonlyArray<{ value: ModeSelection; label: string }> = [
  { value: 'name-it', label: 'Name it' },
  { value: 'pin-the-year', label: 'Pin the year' },
  { value: 'mixed', label: 'Mixed' },
];

const CRITERION_OPTIONS: ReadonlyArray<{ value: CriterionSelection; label: string }> = [
  { value: 'mixed', label: 'Mixed' },
  { value: 'year', label: 'Year' },
  { value: 'title', label: 'Title' },
  { value: 'artist', label: 'Artist' },
];

const INPUT_OPTIONS: ReadonlyArray<{ value: InputType; label: string }> = [
  { value: 'multiple-choice', label: 'Multiple choice' },
  { value: 'free-text', label: 'Free text' },
];

const TURN_OPTIONS: ReadonlyArray<{ value: TurnStructure; label: string }> = [
  { value: 'same-songs', label: 'Same songs' },
  { value: 'different-songs', label: 'Different songs' },
];

const ROUND_OPTIONS = [5, 10, 15].map((n) => ({ value: n, label: String(n) }));

const CLIP_OPTIONS = [
  { value: 5000, label: '5s' },
  { value: 10000, label: '10s' },
  { value: 15000, label: '15s' },
  { value: 30000, label: '30s' },
];

export function SetupScreen() {
  const navigate = useNavigate();
  const { deckId, config, players, customDecks, selectDeck, setConfig, startGame } = useGameStore();

  const allDecks = [...DECKS, ...customDecks];
  const deck = allDecks.find((d) => d.id === deckId) ?? DECKS[0];
  const activeDeckId = deck.id;

  useEffect(() => {
    if (deckId !== deck.id) selectDeck(deck.id);
  }, [deckId, deck.id, selectDeck]);

  const available = eligibleTracks(deck, config.mode).length;
  const usesNameIt = config.mode !== 'pin-the-year';

  const handleStart = () => {
    if (startGame()) navigate('/play');
  };

  return (
    <div className="flex flex-col gap-10">
      <div>
        <div className="eyebrow mb-3">session setup</div>
        <h2 className="display text-4xl">Pick a deck, set the mood.</h2>
      </div>

      <PlayerRoster />

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <span className="eyebrow">deck</span>
          <button
            type="button"
            onClick={() => navigate('/decks')}
            className="font-mono text-[11px] uppercase tracking-widest2 text-amber-warm hover:text-amber"
          >
            crates →
          </button>
        </div>
        <div className="flex flex-col gap-px overflow-hidden border border-rule bg-rule">
          {allDecks.map((d) => {
            const active = d.id === activeDeckId;
            const custom = d.id.startsWith('custom:');
            return (
              <div
                key={d.id}
                role="button"
                tabIndex={0}
                onClick={() => selectDeck(d.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectDeck(d.id);
                  }
                }}
                className={`flex cursor-pointer items-center gap-4 px-4 py-4 transition-colors ${
                  active
                    ? 'bg-amber/10 ring-1 ring-amber'
                    : 'bg-ink-100/60 hover:bg-ink-200'
                }`}
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full transition-colors ${
                    active ? 'bg-amber shadow-[0_0_12px_2px_rgba(245,166,35,0.6)]' : 'bg-rule'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-lg text-paper">{d.name}</span>
                    {custom && (
                      <span className="font-mono text-[9px] uppercase tracking-widest2 text-paper-mute">
                        custom
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-paper-dim">{d.description}</div>
                </div>
                <div className="text-right">
                  <div className="serial">{String(d.tracks.length).padStart(3, '0')}</div>
                  {custom && (
                    <button
                      type="button"
                      className="font-mono text-[10px] uppercase tracking-widest2 text-amber-warm hover:text-amber"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/decks/edit/${encodeURIComponent(d.id)}`);
                      }}
                    >
                      edit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <Segmented<ModeSelection>
          label="mode"
          value={config.mode}
          options={MODE_OPTIONS}
          onChange={(mode) => setConfig({ mode })}
        />
        <Segmented<CriterionSelection>
          label="guess"
          value={config.criterion}
          options={CRITERION_OPTIONS}
          onChange={(criterion) => setConfig({ criterion })}
          disabled={!usesNameIt}
        />
        <Segmented<InputType>
          label="answers"
          value={config.inputType}
          options={INPUT_OPTIONS}
          onChange={(inputType) => setConfig({ inputType })}
          disabled={!usesNameIt}
        />
        {players.length > 1 && (
          <Segmented<TurnStructure>
            label="turns"
            value={config.turnStructure}
            options={TURN_OPTIONS}
            onChange={(turnStructure) => setConfig({ turnStructure })}
          />
        )}
        <Segmented<number>
          label="rounds"
          value={config.roundCount}
          options={ROUND_OPTIONS}
          onChange={(roundCount) => setConfig({ roundCount })}
        />
        <Segmented<number>
          label="clip length"
          value={config.clipMs}
          options={CLIP_OPTIONS}
          onChange={(clipMs) => setConfig({ clipMs })}
        />
      </div>

      {available === 0 ? (
        <p className="border-l-2 border-amber pl-4 font-serif italic-soft text-amber-warm">
          {config.mode === 'name-it'
            ? 'This deck has no songs yet — head to the crates to add some.'
            : 'No year-verified songs in this deck. Verify some, or switch to Name it.'}
        </p>
      ) : (
        config.mode !== 'name-it' &&
        available < config.roundCount && (
          <p className="border-l-2 border-amber pl-4 font-serif italic-soft text-amber-warm">
            Only {available} year-verified {available === 1 ? 'song' : 'songs'} in this deck.
            You&apos;ll play {available} {available === 1 ? 'round' : 'rounds'}.
          </p>
        )
      )}

      <button
        className="btn-primary mt-2 text-base animate-glow"
        disabled={available === 0}
        onClick={handleStart}
      >
        Start the session
      </button>
    </div>
  );
}
