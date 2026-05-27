import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CriterionSelection, InputType, ModeSelection, TurnStructure } from '@mgg/game-core';
import { eligibleTracks } from '@mgg/game-core';
import { useGameStore } from '../store/gameStore';
import { DECKS, getDeck } from '../services/decks';
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
  const { deckId, config, players, selectDeck, setConfig, startGame } = useGameStore();

  useEffect(() => {
    if (!deckId) selectDeck(DECKS[0].id);
  }, [deckId, selectDeck]);

  const activeDeckId = deckId ?? DECKS[0].id;
  const deck = getDeck(activeDeckId);
  const available = deck ? eligibleTracks(deck, config.mode).length : 0;
  const usesNameIt = config.mode !== 'pin-the-year';

  const handleStart = () => {
    if (startGame()) navigate('/play');
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold">Game setup</h2>

      <PlayerRoster />

      <section>
        <div className="mb-2 text-sm font-medium text-slate-400">Deck</div>
        <div className="grid gap-3">
          {DECKS.map((d) => {
            const active = d.id === activeDeckId;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => selectDeck(d.id)}
                className={`card flex flex-col gap-1 text-left transition ${
                  active ? 'ring-2 ring-brand-500' : 'hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{d.name}</span>
                  <span className="text-xs text-slate-500">{d.tracks.length} songs</span>
                </div>
                <span className="text-sm text-slate-400">{d.description}</span>
              </button>
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

      {config.mode !== 'name-it' && available < config.roundCount && (
        <p className="text-sm text-amber-400">
          Only {available} year-verified songs in this deck — you&apos;ll play {available} rounds.
        </p>
      )}

      <button className="btn-primary mt-2 text-lg" onClick={handleStart}>
        Start game
      </button>
    </div>
  );
}
