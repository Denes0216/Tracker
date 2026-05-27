/**
 * Text normalization and fuzzy matching for free-text answers.
 * Pure functions, no platform deps — used by the Name-It scorer.
 */

/** Strip the trailing "(feat. …)" / "ft." credit from a title or artist. */
function stripFeat(input: string): string {
  return input.replace(/[([]?\s*(feat\.?|ft\.?|featuring)\b.*$/i, '').trim();
}

/**
 * Normalize for comparison: lowercase, drop accents, remove "feat." credits,
 * strip punctuation, collapse whitespace.
 */
export function normalizeText(input: string): string {
  return stripFeat(input)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // combining diacritics
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s]/g, ' ') // punctuation → space
    .replace(/\s+/g, ' ')
    .trim();
}

/** Levenshtein edit distance between two strings. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

/** Similarity in [0, 1] derived from edit distance over the longer string. */
export function similarity(a: string, b: string): number {
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

/**
 * Whether a free-text guess matches the expected answer.
 * Accepts exact (normalized) matches, containment (e.g. "hey jude" inside a
 * longer official title), and near-misses above the similarity threshold.
 */
export function isFuzzyMatch(guess: string, expected: string, threshold = 0.82): boolean {
  const g = normalizeText(guess);
  const e = normalizeText(expected);
  if (g.length === 0 || e.length === 0) return false;
  if (g === e) return true;
  // Containment, but only when the shorter side is substantial (avoids "a"
  // matching everything).
  if (g.length >= 4 && e.length >= 4 && (e.includes(g) || g.includes(e))) return true;
  return similarity(g, e) >= threshold;
}
