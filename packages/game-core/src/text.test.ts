import { describe, it, expect } from 'vitest';
import { normalizeText, levenshtein, similarity, isFuzzyMatch } from './text.js';

describe('normalizeText', () => {
  it('lowercases, strips punctuation and collapses spaces', () => {
    expect(normalizeText('  Hello,  World! ')).toBe('hello world');
  });

  it('removes accents', () => {
    expect(normalizeText('Beyoncé')).toBe('beyonce');
  });

  it('strips feat. credits', () => {
    expect(normalizeText('Umbrella (feat. Jay-Z)')).toBe('umbrella');
    expect(normalizeText('Stay ft. Mikky Ekko')).toBe('stay');
  });

  it('expands ampersand', () => {
    expect(normalizeText('Florence & the Machine')).toBe('florence and the machine');
  });
});

describe('levenshtein', () => {
  it('is zero for equal strings', () => {
    expect(levenshtein('abc', 'abc')).toBe(0);
  });
  it('counts single edits', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
  });
  it('handles empty strings', () => {
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('abc', '')).toBe(3);
  });
});

describe('similarity', () => {
  it('is 1 for identical strings', () => {
    expect(similarity('abc', 'abc')).toBe(1);
  });
  it('is between 0 and 1 otherwise', () => {
    const s = similarity('abc', 'abd');
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThan(1);
  });
});

describe('isFuzzyMatch', () => {
  it('accepts exact matches ignoring case and punctuation', () => {
    expect(isFuzzyMatch('hey jude!', 'Hey Jude')).toBe(true);
  });
  it('accepts near-misses (typos)', () => {
    expect(isFuzzyMatch('bohemian rapsody', 'Bohemian Rhapsody')).toBe(true);
  });
  it('accepts a guess contained in a longer official title', () => {
    expect(isFuzzyMatch('hey jude', 'Hey Jude (Remastered 2015)')).toBe(true);
  });
  it('ignores feat. artists on both sides', () => {
    expect(isFuzzyMatch('umbrella', 'Umbrella (feat. Jay-Z)')).toBe(true);
  });
  it('rejects clearly wrong answers', () => {
    expect(isFuzzyMatch('yesterday', 'Bohemian Rhapsody')).toBe(false);
  });
  it('rejects empty guesses', () => {
    expect(isFuzzyMatch('', 'Hey Jude')).toBe(false);
  });
});
