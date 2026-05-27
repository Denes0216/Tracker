import { describe, it, expect, beforeEach } from 'vitest';
import { getCurrentRound } from '@mgg/game-core';
import { useGameStore } from './gameStore';
import { DECKS } from '../services/decks';

describe('gameStore', () => {
  beforeEach(() => useGameStore.getState().quit());

  it('builds a game from the selected deck', () => {
    const store = useGameStore.getState();
    store.selectDeck(DECKS[0].id);
    store.setConfig({ mode: 'name-it', criterion: 'title', inputType: 'multiple-choice', roundCount: 5 });
    expect(useGameStore.getState().startGame()).toBe(true);

    const game = useGameStore.getState().game!;
    expect(game.rounds).toHaveLength(5);
    expect(game.phase).toBe('playing');
  });

  it('scores a correct multiple-choice answer as 0 and moves to reveal', () => {
    const store = useGameStore.getState();
    store.selectDeck(DECKS[0].id);
    store.setConfig({ mode: 'name-it', criterion: 'artist', inputType: 'multiple-choice', roundCount: 3 });
    store.startGame();

    const round = getCurrentRound(useGameStore.getState().game!)!;
    useGameStore.getState().submitAnswer({ value: String(round.correctAnswer) });

    const game = useGameStore.getState().game!;
    expect(game.phase).toBe('reveal');
    expect(game.results[0].score).toBe(0);
  });

  it('only offers year-verified tracks for pin-the-year', () => {
    const store = useGameStore.getState();
    store.selectDeck('across-the-decades');
    store.setConfig({ mode: 'pin-the-year', roundCount: 5 });
    store.startGame();

    const game = useGameStore.getState().game!;
    expect(game.rounds.every((r) => r.track.yearVerified === true)).toBe(true);
    expect(game.rounds.every((r) => r.yearRange !== undefined)).toBe(true);
  });
});
