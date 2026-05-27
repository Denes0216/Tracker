import { create } from 'zustand';
import {
  DEFAULT_CONFIG,
  beginTurn as engineBeginTurn,
  createGame,
  eligibleTracks,
  nextRound as engineNextRound,
  submitAnswer as engineSubmitAnswer,
  type Deck,
  type GameConfig,
  type GameState,
  type Player,
  type PlayerAnswer,
} from '@mgg/game-core';
import { getDeck } from '../services/decks';
import { localKeyValueStore } from '../services/keyValueStore';

const CONFIG_KEY = 'mgg:config';
const DECK_KEY = 'mgg:deckId';
const PLAYERS_KEY = 'mgg:players';
const CUSTOM_DECKS_KEY = 'mgg:customDecks';
const MAX_PLAYERS = 8;

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `p-${Math.random().toString(36).slice(2)}`;
}

const initialPlayers: Player[] = [{ id: newId(), name: 'Player 1' }];

interface GameStore {
  deckId: string | null;
  config: GameConfig;
  players: Player[];
  customDecks: Deck[];
  game: GameState | null;
  hydrated: boolean;

  /** Load last-used config, deck, roster, and custom decks from storage. */
  hydrate(): Promise<void>;
  selectDeck(id: string): void;
  setConfig(patch: Partial<GameConfig>): void;

  saveCustomDeck(deck: Deck): void;
  deleteCustomDeck(id: string): void;

  addPlayer(): void;
  removePlayer(id: string): void;
  renamePlayer(id: string, name: string): void;

  /** Build a new game from the selected deck. Returns false if not possible. */
  startGame(): boolean;
  beginTurn(): void;
  submitAnswer(answer: PlayerAnswer): void;
  next(): void;
  quit(): void;
}

function persistPlayers(players: Player[]): void {
  void localKeyValueStore.set(PLAYERS_KEY, JSON.stringify(players));
}

/** Find a deck by id across the built-in and custom collections. */
function findDeck(id: string | null, customDecks: Deck[]): Deck | undefined {
  if (!id) return undefined;
  return getDeck(id) ?? customDecks.find((d) => d.id === id);
}

export const useGameStore = create<GameStore>((set, get) => ({
  deckId: null,
  config: { ...DEFAULT_CONFIG },
  players: initialPlayers,
  customDecks: [],
  game: null,
  hydrated: false,

  async hydrate() {
    const [savedConfig, savedDeck, savedPlayers, savedDecks] = await Promise.all([
      localKeyValueStore.get(CONFIG_KEY),
      localKeyValueStore.get(DECK_KEY),
      localKeyValueStore.get(PLAYERS_KEY),
      localKeyValueStore.get(CUSTOM_DECKS_KEY),
    ]);
    set((s) => {
      const players = savedPlayers ? (JSON.parse(savedPlayers) as Player[]) : s.players;
      return {
        config: savedConfig ? { ...s.config, ...(JSON.parse(savedConfig) as Partial<GameConfig>) } : s.config,
        deckId: savedDeck ?? s.deckId,
        players: players.length > 0 ? players : s.players,
        customDecks: savedDecks ? (JSON.parse(savedDecks) as Deck[]) : s.customDecks,
        hydrated: true,
      };
    });
  },

  saveCustomDeck(deck) {
    set((s) => {
      const existing = s.customDecks.findIndex((d) => d.id === deck.id);
      const customDecks =
        existing >= 0
          ? s.customDecks.map((d) => (d.id === deck.id ? deck : d))
          : [...s.customDecks, deck];
      void localKeyValueStore.set(CUSTOM_DECKS_KEY, JSON.stringify(customDecks));
      return { customDecks };
    });
  },

  deleteCustomDeck(id) {
    set((s) => {
      const customDecks = s.customDecks.filter((d) => d.id !== id);
      void localKeyValueStore.set(CUSTOM_DECKS_KEY, JSON.stringify(customDecks));
      return { customDecks, deckId: s.deckId === id ? null : s.deckId };
    });
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

  addPlayer() {
    set((s) => {
      if (s.players.length >= MAX_PLAYERS) return s;
      const players = [...s.players, { id: newId(), name: `Player ${s.players.length + 1}` }];
      persistPlayers(players);
      return { players };
    });
  },

  removePlayer(id) {
    set((s) => {
      if (s.players.length <= 1) return s;
      const players = s.players.filter((p) => p.id !== id);
      persistPlayers(players);
      return { players };
    });
  },

  renamePlayer(id, name) {
    set((s) => {
      const players = s.players.map((p) => (p.id === id ? { ...p, name } : p));
      persistPlayers(players);
      return { players };
    });
  },

  startGame() {
    const { deckId, config, players, customDecks } = get();
    const deck = findDeck(deckId, customDecks);
    if (!deck) return false;
    const tracks = eligibleTracks(deck, config.mode);
    if (tracks.length === 0) return false;
    const roster = players.map((p, i) => ({ ...p, name: p.name.trim() || `Player ${i + 1}` }));
    set({ game: createGame({ config, players: roster, tracks }) });
    return true;
  },

  beginTurn() {
    set((s) => (s.game ? { game: engineBeginTurn(s.game) } : s));
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
