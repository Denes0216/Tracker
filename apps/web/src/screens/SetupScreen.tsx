import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CriterionSelection, InputType, ModeSelection, TurnStructure } from '@mgg/game-core';
import { eligibleTracks } from '@mgg/game-core';
import { useGameStore } from '../store/gameStore';
import { DECKS } from '../services/decks';
import { Segmented } from '../components/Segmented';
import { PlayerRoster } from '../components/PlayerRoster';

const MODE_OPTIONS: ReadonlyArray<{ value: ModeSelection; label: string }> = [
  { value: 'name-it', label: 'Name It' },
  { value: 'pin-the-year', label: 'Pin the Year' },
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

  // Keep a valid deck selected even if the stored id was deleted.
  useEffect(() => {
    if (deckId !== deck.id) selectDeck(deck.id);
  }, [deckId, deck.id, selectDeck]);

  const available = eligibleTracks(deck, config.mode).length;
  const usesNameIt = config.mode !== 'pin-the-year';

  const handleStart = () => {
    if (startGame()) navigate('/play');
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold">Game setup</h2>

      <PlayerRoster />

      <section>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-400">Deck</span>
          <button
            type="button"
            className="text-sm font-semibold text-brand-400 hover:text-brand-300"
            onClick={() => navigate('/decks')}
          >
            Build a deck
          </button>
        </div>
        <div className="grid gap-3">
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
                  if (e.key === 'Enter' || e.key === ' ') selectDeck(d.id);
                }}
                className={`card flex cursor-pointer flex-col gap-1 text-left transition ${
                  active ? 'ring-2 ring-brand-500' : 'hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-semibold">
                    {d.name}
                    {custom && (
                      <span className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] uppercase text-slate-300">
                        Custom
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    {d.tracks.length} songs
                    {custom && (
                      <button
                        type="button"
                        className="text-brand-400 hover:text-brand-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/decks/edit/${encodeURIComponent(d.id)}`);
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </span>
                </div>
                <span className="text-sm text-slate-400">{d.description}</span>
              </div>
            );
          })}
        </div>
      </section>

      <Segmented<ModeSelection>
        label="Mode"
        value={config.mode}
        options={MODE_OPTIONS}
        onChange={(mode) => setConfig({ mode })}
      />

      <Segmented<CriterionSelection>
        label="Guess what?"
        value={config.criterion}
        options={CRITERION_OPTIONS}
        onChange={(criterion) => setConfig({ criterion })}
        disabled={!usesNameIt}
      />

      <Segmented<InputType>
        label="Answer style"
        value={config.inputType}
        options={INPUT_OPTIONS}
        onChange={(inputType) => setConfig({ inputType })}
        disabled={!usesNameIt}
      />

      {players.length > 1 && (
        <Segmented<TurnStructure>
          label="Turn structure"
          value={config.turnStructure}
          options={TURN_OPTIONS}
          onChange={(turnStructure) => setConfig({ turnStructure })}
        />
      )}

      <Segmented<number>
        label="Rounds"
        value={config.roundCount}
        options={ROUND_OPTIONS}
        onChange={(roundCount) => setConfig({ roundCount })}
      />

      <Segmented<number>
        label="Clip length"
        value={config.clipMs}
        options={CLIP_OPTIONS}
        onChange={(clipMs) => setConfig({ clipMs })}
      />

      {available === 0 ? (
        <p className="text-sm text-rose-400">
          {config.mode === 'name-it'
            ? 'This deck has no songs yet — add some in the deck builder.'
            : 'This deck has no year-verified songs. Verify some years, or switch to Name It.'}
        </p>
      ) : (
        config.mode !== 'name-it' &&
        available < config.roundCount && (
          <p className="text-sm text-amber-400">
            Only {available} year-verified {available === 1 ? 'song' : 'songs'} in this deck — you&apos;ll
            play {available} {available === 1 ? 'round' : 'rounds'}.
          </p>
        )
      )}

      <button
        className="btn-primary mt-2 text-lg"
        disabled={available === 0}
        onClick={handleStart}
      >
        Start game
      </button>
    </div>
  );
}
