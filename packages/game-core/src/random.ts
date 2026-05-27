import type { Rng } from './types.js';

/** Non-deterministic RNG backed by Math.random — for real play. */
export const mathRandomRng: Rng = {
  next: () => Math.random(),
};

/**
 * Deterministic, seedable RNG (mulberry32). Used in tests and anywhere a
 * reproducible sequence is wanted (e.g. a "daily" deterministic game).
 */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return {
    next() {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
  };
}

/** Random integer in [min, max], inclusive on both ends. */
export function randomInt(rng: Rng, min: number, max: number): number {
  if (max < min) throw new Error(`randomInt: max (${max}) < min (${min})`);
  return min + Math.floor(rng.next() * (max - min + 1));
}

/** Fisher–Yates shuffle returning a new array (does not mutate input). */
export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(rng, 0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Pick up to `count` distinct items from `items`. */
export function sample<T>(rng: Rng, items: readonly T[], count: number): T[] {
  return shuffle(rng, items).slice(0, Math.max(0, count));
}
