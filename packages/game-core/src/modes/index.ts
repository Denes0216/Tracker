import type { GameMode, GameModeId } from '../types.js';
import { nameItMode } from './name-it.js';
import { pinTheYearMode } from './pin-the-year.js';

/** Registry of all game modes. Add a mode → register it here; nothing else changes. */
export const MODES: Record<GameModeId, GameMode> = {
  'name-it': nameItMode,
  'pin-the-year': pinTheYearMode,
};

export function getMode(id: GameModeId): GameMode {
  return MODES[id];
}

export { nameItMode, pinTheYearMode };
export { buildYearRange } from './pin-the-year.js';
