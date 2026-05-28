import type { Deck } from '@mgg/game-core';
import acrossTheDecades from '../../../../data/decks/across-the-decades.json';
import popClassics from '../../../../data/decks/pop-classics.json';
import rockLegends from '../../../../data/decks/rock-legends.json';
import theVault from '../../../../data/decks/the-vault.json';

// JSON imports widen string fields, so cast through unknown to the Deck shape.
export const DECKS: Deck[] = [theVault, acrossTheDecades, popClassics, rockLegends] as unknown as Deck[];

export function getDeck(id: string): Deck | undefined {
  return DECKS.find((deck) => deck.id === id);
}
