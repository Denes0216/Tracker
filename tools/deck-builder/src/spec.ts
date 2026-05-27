/** A single song to resolve. `year` is the human-verified release year. */
export interface Seed {
  term: string;
  artist: string;
  year: number;
}

/** Input spec for a deck; the builder resolves each seed against iTunes. */
export interface DeckSpec {
  id: string;
  name: string;
  description: string;
  seeds: Seed[];
}
