import type {
  Criterion,
  GameConfig,
  GameMode,
  PlayerAnswer,
  Round,
  Rng,
  Track,
} from '../types.js';
import { randomInt, sample, shuffle } from '../random.js';
import { scoreNameIt } from '../scoring.js';

const CRITERIA: Criterion[] = ['year', 'title', 'artist'];

function resolveCriterion(config: GameConfig, rng: Rng): Criterion {
  if (config.criterion === 'mixed') {
    return CRITERIA[randomInt(rng, 0, CRITERIA.length - 1)];
  }
  return config.criterion;
}

function correctValue(track: Track, criterion: Criterion): string | number {
  switch (criterion) {
    case 'year':
      return track.releaseYear;
    case 'title':
      return track.title;
    case 'artist':
      return track.artist;
  }
}

/** Build 4 multiple-choice options (correct + 3 distractors), shuffled. */
function buildChoices(
  track: Track,
  pool: Track[],
  criterion: Criterion,
  config: GameConfig,
  rng: Rng,
): string[] {
  const correct = String(correctValue(track, criterion));
  let distractors: string[];

  if (criterion === 'year') {
    distractors = yearDistractors(track.releaseYear, config, rng);
  } else {
    const others = pool
      .filter((t) => t.id !== track.id)
      .map((t) => (criterion === 'title' ? t.title : t.artist))
      .filter((v) => v !== correct);
    distractors = dedupe(sample(rng, others, 8)).slice(0, 3);
  }

  return shuffle(rng, dedupe([correct, ...distractors]));
}

function yearDistractors(trueYear: number, config: GameConfig, rng: Rng): string[] {
  const out = new Set<number>();
  let guard = 0;
  while (out.size < 3 && guard < 100) {
    guard++;
    const offset = randomInt(rng, 1, 12) * (rng.next() < 0.5 ? -1 : 1);
    const candidate = trueYear + offset;
    if (candidate >= config.earliestYear && candidate <= config.currentYear && candidate !== trueYear) {
      out.add(candidate);
    }
  }
  return [...out].map(String);
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}

export const nameItMode: GameMode = {
  id: 'name-it',

  buildRound(track: Track, pool: Track[], index: number, config: GameConfig, rng: Rng): Round {
    const criterion = resolveCriterion(config, rng);
    const round: Round = {
      index,
      track,
      mode: 'name-it',
      criterion,
      correctAnswer: correctValue(track, criterion),
    };
    if (config.inputType === 'multiple-choice') {
      round.choices = buildChoices(track, pool, criterion, config, rng);
    }
    return round;
  },

  score(round: Round, answer: PlayerAnswer, config: GameConfig): number {
    return scoreNameIt(round, answer, config);
  },
};
