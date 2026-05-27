import type { GameConfig, PlayerAnswer, Round } from './types.js';
import { isFuzzyMatch } from './text.js';

/** Golf score for a Pin-the-Year round: distance from the true year. */
export function scorePinYear(trueYear: number, guessedYear: number): number {
  return Math.abs(guessedYear - trueYear);
}

/**
 * Score for a Name-It round. 0 when correct, `penalty` when wrong.
 * Multiple-choice compares exact strings; free-text uses fuzzy matching;
 * the `year` criterion compares numbers.
 */
export function scoreNameIt(round: Round, answer: PlayerAnswer, config: GameConfig): number {
  const correct = isNameItCorrect(round, answer, config);
  return correct ? 0 : config.penalty;
}

export function isNameItCorrect(
  round: Round,
  answer: PlayerAnswer,
  config: GameConfig,
): boolean {
  const expected = round.correctAnswer;

  if (round.criterion === 'year') {
    return Number(answer.value) === Number(expected);
  }

  const guess = String(answer.value);
  const expectedStr = String(expected);

  if (config.inputType === 'multiple-choice') {
    return guess === expectedStr;
  }
  return isFuzzyMatch(guess, expectedStr);
}
