/**
 * Deck builder — resolves curated song seeds against the iTunes Search API,
 * rejects compilations/covers, and writes verified deck JSON to data/decks/.
 *
 * Usage:
 *   pnpm deck-builder                      # build every spec in data/deck-specs
 *   pnpm deck-builder path/to/spec.json    # build specific spec files
 *
 * Each track's year is taken from the human-supplied seed (the verification
 * step), so output decks are safe for Pin-the-Year (yearVerified: true).
 */
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { HttpClient, Track } from '@mgg/game-core';
import { normalizeText, similarity, isFuzzyMatch } from '@mgg/game-core';
import { ITunesProvider } from '@mgg/music';
import type { DeckSpec, Seed } from './spec.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '../../..');
const SPECS_DIR = join(REPO_ROOT, 'data/deck-specs');
const DECKS_DIR = join(REPO_ROOT, 'data/decks');

const COMPILATION_RE =
  /greatest hits|best of|the best|\bcollection\b|anthology|essential|\bhits\b|\blive\b|karaoke|tribute|originally performed|made famous|\bcovers?\b|\bremix(es)?\b|now that.?s what/i;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const httpClient: HttpClient = {
  async get(url: string) {
    const res = await fetch(url, { headers: { 'User-Agent': 'mgg-deck-builder/0.1' } });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.json();
  },
};

const provider = new ITunesProvider(httpClient);

interface Candidate {
  track: Track;
  artistScore: number;
  titleMatch: boolean;
  compilation: boolean;
  yearGap: number;
}

function scoreCandidate(track: Track, seed: Seed): Candidate {
  const artistScore = similarity(normalizeText(track.artist), normalizeText(seed.artist));
  const titleMatch = isFuzzyMatch(track.title, seed.term);
  const compilation = COMPILATION_RE.test(track.album) || COMPILATION_RE.test(track.title);
  return { track, artistScore, titleMatch, compilation, yearGap: Math.abs(track.releaseYear - seed.year) };
}

/** Rank: real artist + title match + not a compilation, then closest year. */
function pickBest(candidates: Candidate[]): Candidate | undefined {
  return candidates
    .filter((c) => c.artistScore >= 0.6 && c.titleMatch && !c.compilation)
    .sort((a, b) => a.yearGap - b.yearGap || b.artistScore - a.artistScore)[0];
}

interface SeedReport {
  seed: Seed;
  matched: boolean;
  chosen?: Track;
  alternatives: Array<{ title: string; artist: string; album: string; year: number }>;
}

async function resolveSeed(seed: Seed): Promise<SeedReport> {
  const results = await provider.search(`${seed.artist} ${seed.term}`, { limit: 25 });
  const candidates = results.map((t) => scoreCandidate(t, seed));
  const best = pickBest(candidates);

  const alternatives = candidates
    .slice(0, 5)
    .map((c) => ({ title: c.track.title, artist: c.track.artist, album: c.track.album, year: c.track.releaseYear }));

  if (!best) {
    return { seed, matched: false, alternatives };
  }

  // Stamp the human-verified year — this is the verification step.
  const chosen: Track = { ...best.track, releaseYear: seed.year, yearVerified: true };
  return { seed, matched: true, chosen, alternatives };
}

async function buildDeck(spec: DeckSpec): Promise<void> {
  console.log(`\nBuilding deck "${spec.name}" (${spec.seeds.length} seeds)…`);
  const reports: SeedReport[] = [];
  for (const seed of spec.seeds) {
    try {
      const report = await resolveSeed(seed);
      const flag = report.matched ? 'ok ' : 'MISS';
      console.log(`  [${flag}] ${seed.artist} — ${seed.term} (${seed.year})`);
      reports.push(report);
    } catch (err) {
      console.warn(`  [ERR] ${seed.artist} — ${seed.term}: ${(err as Error).message}`);
      reports.push({ seed, matched: false, alternatives: [] });
    }
    await delay(250); // be polite to the iTunes API
  }

  const tracks = reports.filter((r) => r.chosen).map((r) => r.chosen!);
  const deck = { id: spec.id, name: spec.name, description: spec.description, tracks };

  await mkdir(DECKS_DIR, { recursive: true });
  await writeFile(join(DECKS_DIR, `${spec.id}.json`), JSON.stringify(deck, null, 2) + '\n');
  await writeFile(
    join(DECKS_DIR, `${spec.id}.review.json`),
    JSON.stringify({ id: spec.id, reports }, null, 2) + '\n',
  );

  const misses = reports.filter((r) => !r.matched).length;
  console.log(`  → wrote ${tracks.length} tracks${misses ? `, ${misses} unmatched (see review file)` : ''}`);
}

async function loadSpec(path: string): Promise<DeckSpec> {
  return JSON.parse(await readFile(path, 'utf8')) as DeckSpec;
}

async function specPaths(): Promise<string[]> {
  const args = process.argv.slice(2);
  if (args.length > 0) return args.map((a) => resolve(process.cwd(), a));
  const files = await readdir(SPECS_DIR);
  return files.filter((f) => f.endsWith('.json')).map((f) => join(SPECS_DIR, f));
}

async function main(): Promise<void> {
  const paths = await specPaths();
  if (paths.length === 0) {
    console.error(`No deck specs found in ${SPECS_DIR}`);
    process.exit(1);
  }
  for (const path of paths) {
    await buildDeck(await loadSpec(path));
  }
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
