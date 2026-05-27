import { describe, it, expect } from 'vitest';
import { seededRng, randomInt, shuffle, sample } from './random.js';

describe('seededRng', () => {
  it('is deterministic for a given seed', () => {
    const a = seededRng(42);
    const b = seededRng(42);
    const seqA = [a.next(), a.next(), a.next()];
    const seqB = [b.next(), b.next(), b.next()];
    expect(seqA).toEqual(seqB);
  });

  it('produces values in [0, 1)', () => {
    const rng = seededRng(7);
    for (let i = 0; i < 100; i++) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('randomInt', () => {
  it('stays within inclusive bounds', () => {
    const rng = seededRng(1);
    for (let i = 0; i < 200; i++) {
      const v = randomInt(rng, 3, 7);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(7);
    }
  });

  it('can return both endpoints', () => {
    const rng = seededRng(123);
    const seen = new Set<number>();
    for (let i = 0; i < 200; i++) seen.add(randomInt(rng, 0, 1));
    expect(seen).toEqual(new Set([0, 1]));
  });

  it('throws when max < min', () => {
    expect(() => randomInt(seededRng(1), 5, 2)).toThrow();
  });
});

describe('shuffle', () => {
  it('preserves all elements and does not mutate input', () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(seededRng(9), input);
    expect(out).toHaveLength(5);
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5]);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('sample', () => {
  it('returns at most count distinct items', () => {
    const out = sample(seededRng(3), [1, 2, 3, 4, 5], 3);
    expect(out).toHaveLength(3);
    expect(new Set(out).size).toBe(3);
  });
  it('caps at the input length', () => {
    expect(sample(seededRng(3), [1, 2], 10)).toHaveLength(2);
  });
});
