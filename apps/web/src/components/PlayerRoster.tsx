import { useGameStore } from '../store/gameStore';

const MAX_PLAYERS = 8;

export function PlayerRoster() {
  const players = useGameStore((s) => s.players);
  const addPlayer = useGameStore((s) => s.addPlayer);
  const removePlayer = useGameStore((s) => s.removePlayer);
  const renamePlayer = useGameStore((s) => s.renamePlayer);

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">Players</span>
        <span className="text-xs text-slate-500">
          {players.length === 1 ? 'Solo' : `${players.length} players · pass-and-play`}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {players.map((player, i) => (
          <div key={player.id} className="flex items-center gap-2">
            <span className="w-6 shrink-0 text-center text-sm text-slate-500">{i + 1}</span>
            <input
              type="text"
              value={player.name}
              maxLength={20}
              onChange={(e) => renamePlayer(player.id, e.target.value)}
              placeholder={`Player ${i + 1}`}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-brand-500"
            />
            <button
              type="button"
              aria-label={`Remove ${player.name || `player ${i + 1}`}`}
              disabled={players.length <= 1}
              onClick={() => removePlayer(player.id)}
              className="rounded-lg bg-slate-800 px-3 py-2 text-slate-400 hover:bg-slate-700 disabled:opacity-30"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={players.length >= MAX_PLAYERS}
        onClick={addPlayer}
        className="btn-ghost mt-3 w-full text-sm disabled:opacity-40"
      >
        + Add player
      </button>
    </section>
  );
}
