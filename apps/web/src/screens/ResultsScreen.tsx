import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { detailedResults, ranking, totalScore, type DetailedResult } from '@mgg/game-core';
import { useGameStore } from '../store/gameStore';
import { Counter } from '../components/Counter';

export function ResultsScreen() {
  const navigate = useNavigate();
  const game = useGameStore((s) => s.game);
  const startGame = useGameStore((s) => s.startGame);
  const quit = useGameStore((s) => s.quit);

  useEffect(() => {
    if (!game) navigate('/setup', { replace: true });
  }, [game, navigate]);

  if (!game) return null;

  const multiplayer = game.players.length > 1;
  const standings = ranking(game);
  const winners = standings.filter((s) => s.rank === 1);
  const detailed = detailedResults(game);

  const playAgain = () => {
    if (startGame()) navigate('/play');
  };
  const goHome = () => {
    quit();
    navigate('/');
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="eyebrow">session closed</div>

      {multiplayer ? (
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <div className="serial">winner</div>
            <h2 className="display mt-2 overflow-hidden text-5xl text-amber-warm">
              <span className="block animate-unmask">
                {winners.length > 1
                  ? 'A dead heat.'
                  : `${winners[0]?.player.name ?? 'No one'} takes the side.`}
              </span>
            </h2>
          </div>

          <ol className="flex flex-col gap-px overflow-hidden border border-rule bg-rule">
            {standings.map((s) => (
              <li
                key={s.player.id}
                className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                  s.rank === 1
                    ? 'bg-amber/10 ring-1 ring-amber'
                    : 'bg-ink-100/60'
                }`}
              >
                <span
                  className={`serial w-8 ${
                    s.rank === 1 ? 'text-amber-warm' : 'text-paper-mute'
                  }`}
                >
                  {String(s.rank).padStart(2, '0')}
                </span>
                <span className="flex-1 font-serif text-lg text-paper">{s.player.name}</span>
                <span
                  className={`font-mono text-2xl tabular-nums ${
                    s.rank === 1 ? 'text-amber-warm' : 'text-paper'
                  }`}
                >
                  <Counter value={s.total} />
                </span>
              </li>
            ))}
          </ol>

          <p className="text-center text-sm text-paper-mute">Lowest score wins.</p>
        </div>
      ) : (
        <SoloSummary
          total={totalScore(game, game.players[0].id)}
          perfect={game.results.filter((r) => r.score === 0).length}
          rounds={game.results.length}
        />
      )}

      <section>
        <div className="eyebrow mb-3">round breakdown</div>
        {multiplayer ? (
          <div className="flex flex-col gap-6">
            {standings.map((s) => (
              <PlayerBreakdown
                key={s.player.id}
                rank={s.rank}
                name={s.player.name}
                total={s.total}
                results={detailed.filter((d) => d.playerId === s.player.id)}
              />
            ))}
          </div>
        ) : (
          <Breakdown results={detailed} />
        )}
      </section>

      <div className="flex gap-3">
        <button className="btn-primary flex-1" onClick={playAgain}>
          Cue another side
        </button>
        <button className="btn-ghost flex-1" onClick={goHome}>
          Back to the front
        </button>
      </div>
    </div>
  );
}

function SoloSummary({
  total,
  perfect,
  rounds,
}: {
  total: number;
  perfect: number;
  rounds: number;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="serial">final score</div>
      <div className="mt-2 font-mono text-[8rem] leading-none tabular-nums text-amber-warm">
        <Counter value={total} duration={1200} />
      </div>
      <div className="mt-4 font-serif italic-soft text-paper-dim">
        {perfect} of {rounds} rounds nailed · lower wins
      </div>
    </div>
  );
}

function PlayerBreakdown({
  rank,
  name,
  total,
  results,
}: {
  rank: number;
  name: string;
  total: number;
  results: DetailedResult[];
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline gap-3 border-b border-rule pb-2">
        <span className="serial">{String(rank).padStart(2, '0')}</span>
        <span className="flex-1 font-serif text-lg text-paper">{name}</span>
        <span className="font-mono text-base tabular-nums text-paper-dim">total {total}</span>
      </div>
      <Breakdown results={results} />
    </div>
  );
}

function Breakdown({ results }: { results: DetailedResult[] }) {
  return (
    <ul className="flex flex-col">
      {results.map((result) => (
        <li
          key={`${result.playerId}-${result.roundIndex}`}
          className="flex items-center justify-between border-b border-rule/60 py-2 last:border-b-0"
        >
          <div className="min-w-0 flex-1 pr-3">
            <div className="truncate font-serif text-base text-paper">
              {result.round.track.title}
            </div>
            <div className="serial truncate">
              {result.round.track.artist} · you said {String(result.answer.value)}
            </div>
          </div>
          <span
            className={`shrink-0 font-mono text-base tabular-nums ${
              result.score === 0 ? 'text-amber-warm' : 'text-paper-dim'
            }`}
          >
            +{result.score}
          </span>
        </li>
      ))}
    </ul>
  );
}
