import { describe, it, expect, beforeEach } from 'vitest';
import { currentPlayerRounds, getCurrentRound } from '@mgg/game-core';
import { useGameStore } from './gameStore';
import { DECKS } from '../services/decks';

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.setState({ game: null, players: [{ id: 'p1', name: 'Player 1' }] });
  });

  it('builds a solo game from the selected deck', () => {
    const store = useGameStore.getState();
    store.selectDeck(DECKS[0].id);
    store.setConfig({ mode: 'name-it', criterion: 'title', inputType: 'multiple-choice', roundCount: 5 });
    expect(useGameStore.getState().startGame()).toBe(true);

    const game = useGameStore.getState().game!;
    expect(currentPlayerRounds(game)).toHaveLength(5);
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

    const rounds = currentPlayerRounds(useGameStore.getState().game!);
    expect(rounds.every((r) => r.track.yearVerified === true)).toBe(true);
    expect(rounds.every((r) => r.yearRange !== undefined)).toBe(true);
  });

  it('starts a multiplayer game on the pass screen and begins on demand', () => {
    useGameStore.setState({
      players: [
        { id: 'a', name: 'Alice' },
        { id: 'b', name: 'Bob' },
      ],
    });
    const store = useGameStore.getState();
    store.selectDeck(DECKS[0].id);
    store.setConfig({ mode: 'name-it', inputType: 'multiple-choice', roundCount: 2, turnStructure: 'same-songs' });
    store.startGame();

    expect(useGameStore.getState().game!.phase).toBe('pass');
    useGameStore.getState().beginTurn();
    expect(useGameStore.getState().game!.phase).toBe('playing');
  });
});
