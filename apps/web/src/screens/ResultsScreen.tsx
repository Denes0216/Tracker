import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { totalScore } from '@mgg/game-core';
import { useGameStore } from '../store/gameStore';

export function ResultsScreen() {
  const navigate = useNavigate();
  const game = useGameStore((s) => s.game);
  const startGame = useGameStore((s) => s.startGame);
  const quit = useGameStore((s) => s.quit);

  useEffect(() => {
    if (!game) navigate('/setup', { replace: true });
  }, [game, navigate]);

  if (!game) return null;

  const player = game.players[0];
  const total = totalScore(game, player.id);
  const perfectRounds = game.results.filter((r) => r.score === 0).length;

  const playAgain = () => {
    if (startGame()) navigate('/play');
  };
  const goHome = () => {
    quit();
    navigate('/');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="card flex flex-col items-center gap-2 text-center">
        <div className="text-sm uppercase tracking-widest text-slate-500">Final score</div>
        <div className="text-6xl font-extrabold text-brand-300">{total}</div>
        <div className="text-sm text-slate-400">
          {perfectRounds} / {game.results.length} rounds nailed · lower is better
        </div>
      </div>

      <div className="card">
        <div className="mb-3 text-sm font-medium text-slate-400">Round breakdown</div>
        <ul className="divide-y divide-slate-800">
          {game.results.map((result) => {
            const round = game.rounds[result.roundIndex];
            return (
              <li key={result.roundIndex} className="flex items-center justify-between py-2">
                <div className="min-w-0">
                  <div className="truncate font-medium">{round.track.title}</div>
                  <div className="truncate text-xs text-slate-500">
                    {round.track.artist} · you said {String(result.answer.value)}
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
            );
          })}
        </ul>
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
