import type { Deck, ModeSelection, Track } from './types.js';

/** Tracks whose year a human has verified (safe for Pin-the-Year). */
export function verifiedTracks(deck: Deck): Track[] {
  return deck.tracks.filter((t) => t.yearVerified !== false);
}

/**
 * Tracks eligible for a given mode. Pin-the-Year (and Mixed, which may emit
 * Pin rounds) require verified years; Name-It accepts everything.
 */
export function eligibleTracks(deck: Deck, mode: ModeSelection): Track[] {
  return mode === 'name-it' ? deck.tracks : verifiedTracks(deck);
}
