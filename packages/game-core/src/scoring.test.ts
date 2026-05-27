import { describe, it, expect } from 'vitest';
import { scorePinYear, scoreNameIt, isNameItCorrect } from './scoring.js';
import { DEFAULT_CONFIG } from './engine.js';
import type { GameConfig, Round } from './types.js';
import { fakeTrack } from './test-fixtures.js';

const config: GameConfig = { ...DEFAULT_CONFIG, penalty: 10 };

describe('scorePinYear', () => {
  it('is 0 for a perfect guess', () => {
    expect(scorePinYear(1985, 1985)).toBe(0);
  });
  it('is the absolute distance otherwise', () => {
    expect(scorePinYear(1985, 1990)).toBe(5);
    expect(scorePinYear(1985, 1980)).toBe(5);
  });
});

function nameItRound(criterion: Round['criterion'], correctAnswer: string | number): Round {
  return { index: 0, track: fakeTrack(), mode: 'name-it', criterion, correctAnswer };
}

describe('scoreNameIt + isNameItCorrect', () => {
  it('scores 0 when correct, penalty when wrong', () => {
    const round = nameItRound('artist', 'Queen');
    const mc: GameConfig = { ...config, inputType: 'multiple-choice' };
    expect(scoreNameIt(round, { value: 'Queen' }, mc)).toBe(0);
    expect(scoreNameIt(round, { value: 'ABBA' }, mc)).toBe(10);
  });

  it('compares years numerically regardless of string/number input', () => {
    const round = nameItRound('year', 1991);
    expect(isNameItCorrect(round, { value: '1991' }, config)).toBe(true);
    expect(isNameItCorrect(round, { value: 1991 }, config)).toBe(true);
    expect(isNameItCorrect(round, { value: 1992 }, config)).toBe(false);
  });

  it('multiple-choice requires an exact string match', () => {
    const round = nameItRound('title', 'Hey Jude');
    const mc: GameConfig = { ...config, inputType: 'multiple-choice' };
    expect(isNameItCorrect(round, { value: 'Hey Jude' }, mc)).toBe(true);
    expect(isNameItCorrect(round, { value: 'hey jude' }, mc)).toBe(false);
  });

  it('free-text uses fuzzy matching', () => {
    const round = nameItRound('title', 'Bohemian Rhapsody');
    const ft: GameConfig = { ...config, inputType: 'free-text' };
    expect(isNameItCorrect(round, { value: 'bohemian rapsody' }, ft)).toBe(true);
    expect(isNameItCorrect(round, { value: 'we will rock you' }, ft)).toBe(false);
  });
});
