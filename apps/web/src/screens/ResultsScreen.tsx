import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { detailedResults, ranking, totalScore, type DetailedResult } from '@mgg/game-core';
import { useGameStore } from '../store/gameStore';

const MEDALS = ['🥇', '🥈', '🥉'];

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
    <div className="flex flex-col gap-6">
      {multiplayer ? (
        <div className="card flex flex-col gap-4">
          <div className="text-center text-2xl font-extrabold text-brand-300">
            {winners.length > 1
              ? "It's a tie!"
              : `🏆 ${winners[0]?.player.name ?? 'Nobody'} wins!`}
          </div>
          <ul className="flex flex-col gap-2">
            {standings.map((s, i) => (
              <li
                key={s.player.id}
                className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                  s.rank === 1 ? 'bg-brand-600/30 ring-1 ring-brand-500' : 'bg-slate-800/60'
                }`}
              >
                <span className="flex items-center gap-2 font-semibold">
                  <span className="w-6 text-center">{MEDALS[i] ?? `${s.rank}.`}</span>
                  {s.player.name}
                </span>
                <span className="font-bold tabular-nums">{s.total}</span>
              </li>
            ))}
          </ul>
          <p className="text-center text-xs text-slate-500">Lowest score wins.</p>
        </div>
      ) : (
        <SoloSummary
          total={totalScore(game, game.players[0].id)}
          perfect={game.results.filter((r) => r.score === 0).length}
          rounds={game.results.length}
        />
      )}

      <div className="card">
        <div className="mb-3 text-sm font-medium text-slate-400">Round breakdown</div>
        {multiplayer ? (
          standings.map((s) => (
            <PlayerBreakdown
              key={s.player.id}
              name={s.player.name}
              total={s.total}
              results={detailed.filter((d) => d.playerId === s.player.id)}
            />
          ))
        ) : (
          <Breakdown results={detailed} />
        )}
      </div>

      <div className="flex gap-3">
        <button className="btn-primary flex-1" onClick={playAgain}>
          Play again
        </button>
        <button className="btn-ghost flex-1" onClick={goHome}>
          Home
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
    <div className="card flex flex-col items-center gap-2 text-center">
      <div className="text-sm uppercase tracking-widest text-slate-500">Final score</div>
      <div className="text-6xl font-extrabold text-brand-300">{total}</div>
      <div className="text-sm text-slate-400">
        {perfect} / {rounds} rounds nailed · lower is better
      </div>
    </div>
  );
}

function PlayerBreakdown({
  name,
  total,
  results,
}: {
  name: string;
  total: number;
  results: DetailedResult[];
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-semibold text-brand-300">{name}</span>
        <span className="text-slate-400">total {total}</span>
      </div>
      <Breakdown results={results} />
    </div>
  );
}

function Breakdown({ results }: { results: DetailedResult[] }) {
  return (
    <ul className="divide-y divide-slate-800">
      {results.map((result) => (
        <li key={`${result.playerId}-${result.roundIndex}`} className="flex items-center justify-between py-2">
          <div className="min-w-0">
            <div className="truncate font-medium">{result.round.track.title}</div>
            <div className="truncate text-xs text-slate-500">
              {result.round.track.artist} · you said {String(result.answer.value)}
            </div>
          </div>
          <span
            className={`ml-3 shrink-0 rounded-full px-3 py-1 text-sm font-bold ${
              result.score === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-200'
            }`}
          >
            +{result.score}
          </span>
        </li>
      ))}
    </ul>
  );
}
