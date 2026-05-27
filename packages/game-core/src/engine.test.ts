import { describe, it, expect } from 'vitest';
import {
  DEFAULT_CONFIG,
  createGame,
  submitAnswer,
  nextRound,
  getCurrentRound,
  getLastResult,
  totalScore,
  ranking,
  roundNumber,
  type GameState,
  type Player,
} from './engine.js';
import type { GameConfig } from './types.js';
import { seededRng } from './random.js';
import { fakePool } from './test-fixtures.js';

const player: Player = { id: 'p1', name: 'Alice' };

function newSinglePlayerGame(config: Partial<GameConfig> = {}): GameState {
  return createGame(
    {
      config: { ...DEFAULT_CONFIG, mode: 'pin-the-year', roundCount: 5, ...config },
      players: [player],
      tracks: fakePool(10),
    },
    seededRng(99),
  );
}

describe('createGame', () => {
  it('builds roundCount rounds and starts in the playing phase', () => {
    const state = newSinglePlayerGame();
    expect(state.rounds).toHaveLength(5);
    expect(state.phase).toBe('playing');
    expect(roundNumber(state)).toBe(1);
  });

  it('clamps round count to the available track pool', () => {
    const state = createGame(
      { config: { ...DEFAULT_CONFIG, roundCount: 20 }, players: [player], tracks: fakePool(3) },
      seededRng(1),
    );
    expect(state.rounds).toHaveLength(3);
  });

  it('finishes immediately with an empty deck', () => {
    const state = createGame(
      { config: DEFAULT_CONFIG, players: [player], tracks: [] },
      seededRng(1),
    );
    expect(state.phase).toBe('finished');
  });
});

describe('round flow', () => {
  it('scores perfect pin-the-year answers as 0 across a full game', () => {
    let state = newSinglePlayerGame();
    while (state.phase !== 'finished') {
      const round = getCurrentRound(state)!;
      state = submitAnswer(state, { value: round.correctAnswer });
      expect(state.phase).toBe('reveal');
      expect(getLastResult(state)!.score).toBe(0);
      state = nextRound(state);
    }
    expect(totalScore(state, 'p1')).toBe(0);
    expect(state.results).toHaveLength(5);
  });

  it('accumulates penalty distance for wrong pin-the-year answers', () => {
    let state = newSinglePlayerGame({ roundCount: 1 });
    const round = getCurrentRound(state)!;
    const wrong = Number(round.correctAnswer) + 3;
    state = submitAnswer(state, { value: wrong });
    expect(getLastResult(state)!.score).toBe(3);
    state = nextRound(state);
    expect(state.phase).toBe('finished');
    expect(totalScore(state, 'p1')).toBe(3);
  });

  it('ignores submitAnswer outside the playing phase', () => {
    let state = newSinglePlayerGame({ roundCount: 1 });
    state = submitAnswer(state, { value: 0 });
    const afterReveal = submitAnswer(state, { value: 0 });
    expect(afterReveal.results).toHaveLength(1);
  });

  it('ignores nextRound outside the reveal phase', () => {
    const state = newSinglePlayerGame();
    expect(nextRound(state)).toBe(state);
  });
});

describe('ranking', () => {
  it('orders players ascending by total score (lowest wins) with shared ranks for ties', () => {
    const players: Player[] = [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
      { id: 'c', name: 'C' },
    ];
    const state: GameState = {
      config: DEFAULT_CONFIG,
      players,
      rounds: [],
      currentRoundIndex: 0,
      currentPlayerIndex: 0,
      phase: 'finished',
      results: [
        { roundIndex: 0, playerId: 'a', answer: { value: 0 }, score: 10 },
        { roundIndex: 0, playerId: 'b', answer: { value: 0 }, score: 3 },
        { roundIndex: 0, playerId: 'c', answer: { value: 0 }, score: 3 },
      ],
    };
    const standings = ranking(state);
    expect(standings.map((s) => s.player.id)).toEqual(['b', 'c', 'a']);
    expect(standings.map((s) => s.rank)).toEqual([1, 1, 3]);
  });
});
