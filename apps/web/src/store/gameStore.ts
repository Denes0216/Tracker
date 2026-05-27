import { create } from 'zustand';
import {
  DEFAULT_CONFIG,
  createGame,
  eligibleTracks,
  nextRound as engineNextRound,
  submitAnswer as engineSubmitAnswer,
  type GameConfig,
  type GameState,
  type Player,
  type PlayerAnswer,
} from '@mgg/game-core';
import { getDeck } from '../services/decks';
import { localKeyValueStore } from '../services/keyValueStore';

const CONFIG_KEY = 'mgg:config';
const DECK_KEY = 'mgg:deckId';
const SOLO_PLAYER: Player = { id: 'p1', name: 'You' };

interface GameStore {
  deckId: string | null;
  config: GameConfig;
  game: GameState | null;
  hydrated: boolean;

  /** Load last-used config + deck from the KeyValueStore. */
  hydrate(): Promise<void>;
  selectDeck(id: string): void;
  setConfig(patch: Partial<GameConfig>): void;
  /** Build a new game from the selected deck. Returns false if not possible. */
  startGame(): boolean;
  submitAnswer(answer: PlayerAnswer): void;
  next(): void;
  quit(): void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  deckId: null,
  config: { ...DEFAULT_CONFIG },
  game: null,
  hydrated: false,

  async hydrate() {
    const [savedConfig, savedDeck] = await Promise.all([
      localKeyValueStore.get(CONFIG_KEY),
      localKeyValueStore.get(DECK_KEY),
    ]);
    set((s) => ({
      config: savedConfig ? { ...s.config, ...(JSON.parse(savedConfig) as Partial<GameConfig>) } : s.config,
      deckId: savedDeck ?? s.deckId,
      hydrated: true,
    }));
  },

  selectDeck(id) {
    set({ deckId: id });
    void localKeyValueStore.set(DECK_KEY, id);
  },

  setConfig(patch) {
    set((s) => {
      const config = { ...s.config, ...patch };
      void localKeyValueStore.set(CONFIG_KEY, JSON.stringify(config));
      return { config };
    });
  },

  startGame() {
    const { deckId, config } = get();
    const deck = deckId ? getDeck(deckId) : undefined;
    if (!deck) return false;
    const tracks = eligibleTracks(deck, config.mode);
    if (tracks.length === 0) return false;
    set({ game: createGame({ config, players: [SOLO_PLAYER], tracks }) });
    return true;
  },

  submitAnswer(answer) {
    set((s) => (s.game ? { game: engineSubmitAnswer(s.game, answer) } : s));
  },

  next() {
    set((s) => (s.game ? { game: engineNextRound(s.game) } : s));
  },

  quit() {
    set({ game: null });
  },
}));
