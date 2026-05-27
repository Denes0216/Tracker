import type { GameConfig, GameMode, PlayerAnswer, Round, Rng, Track, YearRange } from '../types.js';
import { randomInt } from '../random.js';
import { scorePinYear } from '../scoring.js';

/**
 * Build a year range `rangeWidth` wide that contains `trueYear` off-center
 * (centering would be a giveaway), clamped to [earliestYear, currentYear].
 */
export function buildYearRange(trueYear: number, config: GameConfig, rng: Rng): YearRange {
  const width = config.rangeWidth;
  const offset = randomInt(rng, 2, width - 2);
  let start = trueYear - offset;
  let end = start + width;

  if (end > config.currentYear) {
    end = config.currentYear;
    start = end - width;
  }
  if (start < config.earliestYear) {
    start = config.earliestYear;
    end = start + width;
  }
  return { start, end };
}

export const pinTheYearMode: GameMode = {
  id: 'pin-the-year',

  buildRound(track: Track, _pool: Track[], index: number, config: GameConfig, rng: Rng): Round {
    return {
      index,
      track,
      mode: 'pin-the-year',
      yearRange: buildYearRange(track.releaseYear, config, rng),
      correctAnswer: track.releaseYear,
    };
  },

  score(round: Round, answer: PlayerAnswer, _config: GameConfig): number {
    return scorePinYear(round.track.releaseYear, Number(answer.value));
  },
};
