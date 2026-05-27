import { describe, it, expect } from 'vitest';
import { nameItMode } from './name-it.js';
import { pinTheYearMode, buildYearRange } from './pin-the-year.js';
import { DEFAULT_CONFIG } from '../engine.js';
import { seededRng } from '../random.js';
import type { GameConfig } from '../types.js';
import { fakeTrack, fakePool } from '../test-fixtures.js';

const baseConfig: GameConfig = { ...DEFAULT_CONFIG, earliestYear: 1900, currentYear: 2025 };

describe('name-it buildRound', () => {
  it('uses the configured criterion and sets the correct answer', () => {
    const track = fakeTrack({ title: 'Song A', artist: 'Artist A', releaseYear: 1999 });
    const config: GameConfig = { ...baseConfig, criterion: 'title', inputType: 'free-text' };
    const round = nameItMode.buildRound(track, [track], 0, config, seededRng(1));
    expect(round.mode).toBe('name-it');
    expect(round.criterion).toBe('title');
    expect(round.correctAnswer).toBe('Song A');
    expect(round.choices).toBeUndefined(); // free-text has no choices
  });

  it('builds 4 unique multiple-choice options including the correct one', () => {
    const pool = fakePool(10);
    const track = pool[0];
    const config: GameConfig = { ...baseConfig, criterion: 'artist', inputType: 'multiple-choice' };
    const round = nameItMode.buildRound(track, pool, 0, config, seededRng(2));
    expect(round.choices).toBeDefined();
    expect(round.choices!.length).toBe(4);
    expect(new Set(round.choices)).toHaveLength(4);
    expect(round.choices).toContain('Artist 1');
  });

  it('builds numeric year choices for the year criterion', () => {
    const track = fakeTrack({ releaseYear: 1999 });
    const config: GameConfig = { ...baseConfig, criterion: 'year', inputType: 'multiple-choice' };
    const round = nameItMode.buildRound(track, [track], 0, config, seededRng(3));
    expect(round.choices).toContain('1999');
    expect(round.choices!.length).toBeGreaterThanOrEqual(2);
    for (const c of round.choices!) {
      const y = Number(c);
      expect(y).toBeGreaterThanOrEqual(baseConfig.earliestYear);
      expect(y).toBeLessThanOrEqual(baseConfig.currentYear);
    }
  });
});

describe('pin-the-year buildYearRange', () => {
  it('produces a range of the configured width', () => {
    const range = buildYearRange(1985, { ...baseConfig, rangeWidth: 18 }, seededRng(5));
    expect(range.end - range.start).toBe(18);
  });

  it('always contains the true year with the exact width, across many seeds', () => {
    for (let seed = 0; seed < 500; seed++) {
      const trueYear = 1900 + (seed % 126); // 1900..2025
      const range = buildYearRange(trueYear, baseConfig, seededRng(seed));
      expect(range.end - range.start).toBe(baseConfig.rangeWidth);
      expect(trueYear).toBeGreaterThanOrEqual(range.start);
      expect(trueYear).toBeLessThanOrEqual(range.end);
    }
  });

  it('keeps the true year at least 2 years from each edge away from the clamps', () => {
    // Interior years (far from earliestYear/currentYear) are never on an edge.
    for (let trueYear = 1950; trueYear <= 1990; trueYear++) {
      const range = buildYearRange(trueYear, baseConfig, seededRng(trueYear));
      expect(trueYear - range.start).toBeGreaterThanOrEqual(2);
      expect(range.end - trueYear).toBeGreaterThanOrEqual(2);
    }
  });

  it('clamps to [earliestYear, currentYear]', () => {
    const low = buildYearRange(1901, baseConfig, seededRng(11));
    expect(low.start).toBeGreaterThanOrEqual(1900);
    const high = buildYearRange(2024, baseConfig, seededRng(13));
    expect(high.end).toBeLessThanOrEqual(2025);
  });

  it('buildRound carries the range and correct answer', () => {
    const track = fakeTrack({ releaseYear: 1977 });
    const round = pinTheYearMode.buildRound(track, [track], 0, baseConfig, seededRng(17));
    expect(round.mode).toBe('pin-the-year');
    expect(round.correctAnswer).toBe(1977);
    expect(round.yearRange).toBeDefined();
  });
});
