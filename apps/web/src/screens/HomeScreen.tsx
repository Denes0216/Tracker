import { useNavigate } from 'react-router-dom';
import { Wordmark } from '../components/Wordmark';

export function HomeScreen() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-14 pt-6">
      <section className="relative">
        <div className="eyebrow mb-6">a song-guessing record · est. 2026</div>

        <h1 className="display text-[clamp(3rem,10vw,6rem)] leading-[0.95]">
          <Wordmark text="Name" />
          <br />
          <span className="italic-soft text-amber-warm">
            <Wordmark text="that" />
          </span>
          <br />
          <Wordmark text="Tune." />
        </h1>

        <p className="mt-8 max-w-md font-serif text-lg italic-soft text-paper-dim">
          Thirty seconds of music. Guess the year, the title, the artist, or pin the
          release year inside a sliding window. Lowest score wins.
        </p>
      </section>

      <section className="grid gap-px overflow-hidden border border-rule bg-rule sm:grid-cols-2">
        <button
          type="button"
          onClick={() => navigate('/setup')}
          className="group relative flex flex-col items-start gap-2 bg-ink-100/70 p-6 text-left transition-colors hover:bg-ink-200"
        >
          <span className="serial">01 / play a side</span>
          <span className="font-serif text-2xl text-paper transition-colors group-hover:text-amber-warm">
            Begin a session
          </span>
          <span className="text-sm text-paper-dim">
            Solo or pass-and-play. Pick a deck, set the mode, drop the needle.
          </span>
          <span className="mt-3 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest2 text-amber-warm">
            <span>begin</span>
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/decks')}
          className="group relative flex flex-col items-start gap-2 bg-ink-100/70 p-6 text-left transition-colors hover:bg-ink-200"
        >
          <span className="serial">02 / crate digging</span>
          <span className="font-serif text-2xl text-paper transition-colors group-hover:text-amber-warm">
            Build a deck
          </span>
          <span className="text-sm text-paper-dim">
            Search the iTunes catalog. Audition previews. Save your own crate.
          </span>
          <span className="mt-3 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest2 text-amber-warm">
            <span>open the crates</span>
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </span>
        </button>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ModeBlurb
          num="i"
          title="Name it"
          body="Year, title or artist — multiple choice or free text, configurable per session."
        />
        <ModeBlurb
          num="ii"
          title="Pin the year"
          body="You see a 15–20 year window. The closer your guess, the lower your score."
        />
        <ModeBlurb
          num="iii"
          title="Golf scoring"
          body="Lower wins. Penalty points for wrong answers, distance points for off years."
        />
      </section>
    </div>
  );
}

function ModeBlurb({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div className="border-t border-rule pt-3">
      <div className="serial mb-2">section {num}</div>
      <div className="font-serif text-lg text-paper">{title}</div>
      <div className="mt-1 text-sm text-paper-dim">{body}</div>
    </div>
  );
}
