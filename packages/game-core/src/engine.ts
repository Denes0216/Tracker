import type {
  GameConfig,
  GameModeId,
  PlayerAnswer,
  Round,
  Rng,
  Track,
} from './types.js';
import { getMode } from './modes/index.js';
import { mathRandomRng, sample } from './random.js';

export interface Player {
  id: string;
  name: string;
}

export interface RoundResult {
  roundIndex: number;
  playerId: string;
  answer: PlayerAnswer;
  score: number;
}

export type GamePhase = 'playing' | 'reveal' | 'finished';

export interface GameState {
  config: GameConfig;
  players: Player[];
  rounds: Round[];
  currentRoundIndex: number;
  currentPlayerIndex: number;
  results: RoundResult[];
  phase: GamePhase;
}

export interface NewGameInput {
  config: GameConfig;
  players: Player[];
  tracks: Track[];
}

export const DEFAULT_CONFIG: GameConfig = {
  mode: 'mixed',
  criterion: 'mixed',
  inputType: 'multiple-choice',
  roundCount: 10,
  rangeWidth: 18,
  penalty: 10,
  clipMs: 15000,
  earliestYear: 1900,
  currentYear: new Date().getFullYear(),
};

function resolveMode(config: GameConfig, rng: Rng): GameModeId {
  if (config.mode === 'mixed') {
    return rng.next() < 0.5 ? 'name-it' : 'pin-the-year';
  }
  return config.mode;
}

/** Select tracks and build the round list. Does not mutate inputs. */
export function buildRounds(tracks: Track[], config: GameConfig, rng: Rng): Round[] {
  const count = Math.min(config.roundCount, tracks.length);
  const chosen = sample(rng, tracks, count);
  return chosen.map((track, i) => getMode(resolveMode(config, rng)).buildRound(track, tracks, i, config, rng));
}

export function createGame(input: NewGameInput, rng: Rng = mathRandomRng): GameState {
  const rounds = buildRounds(input.tracks, input.config, rng);
  return {
    config: input.config,
    players: input.players,
    rounds,
    currentRoundIndex: 0,
    currentPlayerIndex: 0,
    results: [],
    phase: rounds.length > 0 ? 'playing' : 'finished',
  };
}

/** Score the current round for the current player and move to the reveal phase. */
export function submitAnswer(state: GameState, answer: PlayerAnswer): GameState {
  if (state.phase !== 'playing') return state;
  const round = state.rounds[state.currentRoundIndex];
  const player = state.players[state.currentPlayerIndex];
  const score = getMode(round.mode).score(round, answer, state.config);
  const result: RoundResult = {
    roundIndex: round.index,
    playerId: player.id,
    answer,
    score,
  };
  return { ...state, results: [...state.results, result], phase: 'reveal' };
}

/** Advance from the reveal phase to the next round, or finish the game. */
export function nextRound(state: GameState): GameState {
  if (state.phase !== 'reveal') return state;
  const next = state.currentRoundIndex + 1;
  if (next >= state.rounds.length) {
    return { ...state, phase: 'finished' };
  }
  return { ...state, currentRoundIndex: next, phase: 'playing' };
}

// --- Selectors -------------------------------------------------------------

export function getCurrentRound(state: GameState): Round | undefined {
  return state.rounds[state.currentRoundIndex];
}

export function getLastResult(state: GameState): RoundResult | undefined {
  return state.results.at(-1);
}

export function totalScore(state: GameState, playerId: string): number {
  return state.results
    .filter((r) => r.playerId === playerId)
    .reduce((sum, r) => sum + r.score, 0);
}

export interface Standing {
  player: Player;
  total: number;
  /** 1-based rank; ties share a rank. */
  rank: number;
}

/** Players ranked ascending by total score (golf — lowest wins). */
export function ranking(state: GameState): Standing[] {
  const sorted = state.players
    .map((player) => ({ player, total: totalScore(state, player.id) }))
    .sort((a, b) => a.total - b.total);

  let rank = 0;
  let prevTotal = Number.NaN;
  return sorted.map((entry, i) => {
    if (entry.total !== prevTotal) {
      rank = i + 1;
      prevTotal = entry.total;
    }
    return { ...entry, rank };
  });
}

/** 1-based current round number, for display. */
export function roundNumber(state: GameState): number {
  return Math.min(state.currentRoundIndex + 1, state.rounds.length);
}
