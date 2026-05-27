/**
 * Domain types for the game engine.
 *
 * `game-core` is the dependency root: it owns the `Track` contract and the
 * injected platform-service interfaces. The `music` package depends on these
 * types (and re-exports `Track`), never the other way around — this keeps the
 * dependency graph acyclic while matching the plan's ergonomics.
 */

export type MusicSourceId = 'itunes' | 'deezer';

/** A single playable song with the metadata the game needs. */
export interface Track {
  /** Provider-scoped id, e.g. "itunes:123456". */
  id: string;
  title: string;
  artist: string;
  album: string;
  /** Best-known original release year (see deck-builder year verification). */
  releaseYear: number;
  /** ISO date string for the release. */
  releaseDate: string;
  /** 30-second MP3/AAC preview clip URL. */
  previewUrl: string;
  artworkUrl: string;
  durationMs: number;
  source: MusicSourceId;
  /** True once a human has confirmed the year. Required for Pin-the-Year. */
  yearVerified?: boolean;
}

/** A curated, pre-verified pool of songs with a theme. */
export interface Deck {
  id: string;
  name: string;
  description: string;
  tracks: Track[];
}

export type GameModeId = 'name-it' | 'pin-the-year';
export type Criterion = 'year' | 'title' | 'artist';
export type InputType = 'multiple-choice' | 'free-text';

/** A configured game mode. `'mixed'` randomizes per round. */
export type ModeSelection = GameModeId | 'mixed';
export type CriterionSelection = Criterion | 'mixed';

export interface GameConfig {
  mode: ModeSelection;
  /** Criterion for Name-It rounds. Ignored by Pin-the-Year. */
  criterion: CriterionSelection;
  inputType: InputType;
  roundCount: number;
  /** Pin-the-Year visible range width, 15–20. */
  rangeWidth: number;
  /** Penalty points for a wrong Name-It answer (golf scoring). */
  penalty: number;
  /** Clip length to play, in milliseconds. */
  clipMs: number;
  /** Lower clamp for generated year ranges. */
  earliestYear: number;
  /** Upper clamp for generated year ranges. */
  currentYear: number;
}

export interface YearRange {
  start: number;
  end: number;
}

export interface Round {
  index: number;
  track: Track;
  mode: GameModeId;
  /** Present for Name-It rounds. */
  criterion?: Criterion;
  /** Present for Pin-the-Year rounds. */
  yearRange?: YearRange;
  /** Present when input type is multiple-choice (Name-It only). */
  choices?: string[];
  /** Canonical correct answer used by scoring. */
  correctAnswer: string | number;
}

export interface PlayerAnswer {
  /** Free-text/multiple-choice → string; Pin-the-Year → number. */
  value: string | number;
}

/**
 * A pluggable game mode. New modes implement this and register in the mode map
 * (see modes/index.ts) — the engine and UI iterate generically.
 */
export interface GameMode {
  readonly id: GameModeId;
  buildRound(track: Track, pool: Track[], index: number, config: GameConfig, rng: Rng): Round;
  /** Penalty points for this answer; lower is better. */
  score(round: Round, answer: PlayerAnswer, config: GameConfig): number;
}

// --- Injected platform services (4.4) -------------------------------------
// The core never calls fetch / localStorage / Audio directly; platforms supply
// these so the shared packages stay 100% portable.

export interface HttpClient {
  get(url: string): Promise<unknown>;
}

export interface KeyValueStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

export interface AudioPlayer {
  load(url: string): Promise<void>;
  play(): void;
  stop(): void;
  /** Play the first `ms` milliseconds of the loaded clip, then stop. */
  playClip(ms: number): Promise<void>;
}

// --- Randomness (injected for deterministic tests) ------------------------

/** A source of floats in [0, 1). */
export interface Rng {
  next(): number;
}
