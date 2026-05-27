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

/** `pass` is the "hand the device to the next player" interstitial. */
export type GamePhase = 'pass' | 'playing' | 'reveal' | 'finished';

export interface GameState {
  config: GameConfig;
  players: Player[];
  /** Rounds each player will answer, indexed by player. */
  playerRounds: Round[][];
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
  turnStructure: 'same-songs',
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

/** Build the rounds each player will answer, honoring the turn structure. */
function buildPlayerRounds(input: NewGameInput, rng: Rng): Round[][] {
  if (input.config.turnStructure === 'same-songs') {
    const shared = buildRounds(input.tracks, input.config, rng);
    return input.players.map(() => shared);
  }
  return input.players.map(() => buildRounds(input.tracks, input.config, rng));
}

export function createGame(input: NewGameInput, rng: Rng = mathRandomRng): GameState {
  const playerRounds = buildPlayerRounds(input, rng);
  const hasRounds = playerRounds.some((rounds) => rounds.length > 0);
  // Solo games start playing immediately; multiplayer opens on the pass screen
  // so the first player gets a clean "you're up" hand-off.
  const multiplayer = input.players.length > 1;
  return {
    config: input.config,
    players: input.players,
    playerRounds,
    currentRoundIndex: 0,
    currentPlayerIndex: 0,
    results: [],
    phase: !hasRounds ? 'finished' : multiplayer ? 'pass' : 'playing',
  };
}

/** Score the current round for the current player and move to the reveal phase. */
export function submitAnswer(state: GameState, answer: PlayerAnswer): GameState {
  if (state.phase !== 'playing') return state;
  const round = currentPlayerRounds(state)[state.currentRoundIndex];
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

/**
 * Advance from reveal: to the next round, to the next player's pass screen,
 * or to the finished state.
 */
export function nextRound(state: GameState): GameState {
  if (state.phase !== 'reveal') return state;
  const nextIndex = state.currentRoundIndex + 1;
  if (nextIndex < currentPlayerRounds(state).length) {
    return { ...state, currentRoundIndex: nextIndex, phase: 'playing' };
  }
  if (state.currentPlayerIndex + 1 < state.players.length) {
    return {
      ...state,
      currentPlayerIndex: state.currentPlayerIndex + 1,
      currentRoundIndex: 0,
      phase: 'pass',
    };
  }
  return { ...state, phase: 'finished' };
}

/** Leave the pass interstitial and start the current player's turn. */
export function beginTurn(state: GameState): GameState {
  if (state.phase !== 'pass') return state;
  return { ...state, phase: 'playing' };
}

// --- Selectors -------------------------------------------------------------

export function currentPlayerRounds(state: GameState): Round[] {
  return state.playerRounds[state.currentPlayerIndex] ?? [];
}

export function currentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex];
}

export function getCurrentRound(state: GameState): Round | undefined {
  return currentPlayerRounds(state)[state.currentRoundIndex];
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

/** 1-based current round number within the current player's turn. */
export function roundNumber(state: GameState): number {
  return Math.min(state.currentRoundIndex + 1, currentPlayerRounds(state).length);
}

/** Number of rounds in the current player's turn. */
export function totalRounds(state: GameState): number {
  return currentPlayerRounds(state).length;
}

export interface DetailedResult extends RoundResult {
  round: Round;
  playerName: string;
}

/** Results enriched with their round and player name, for the end screen. */
export function detailedResults(state: GameState): DetailedResult[] {
  const indexById = new Map(state.players.map((p, i) => [p.id, i]));
  return state.results.map((result) => {
    const playerIndex = indexById.get(result.playerId) ?? 0;
    return {
      ...result,
      round: state.playerRounds[playerIndex][result.roundIndex],
      playerName: state.players[playerIndex]?.name ?? 'Player',
    };
  });
}
