import { useGameStore } from '../store/gameStore';

const MAX_PLAYERS = 8;

export function PlayerRoster() {
  const players = useGameStore((s) => s.players);
  const addPlayer = useGameStore((s) => s.addPlayer);
  const removePlayer = useGameStore((s) => s.removePlayer);
  const renamePlayer = useGameStore((s) => s.renamePlayer);

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="eyebrow">listeners</span>
        <span className="serial">
          {players.length === 1 ? 'solo' : `${players.length} players · pass-and-play`}
        </span>
      </div>

      <div className="flex flex-col gap-px overflow-hidden border border-rule bg-rule">
        {players.map((player, i) => (
          <div key={player.id} className="flex items-center gap-2 bg-ink-100/60 px-3 py-2">
            <span className="serial w-6 text-center">{String(i + 1).padStart(2, '0')}</span>
            <input
              type="text"
              value={player.name}
              maxLength={20}
              onChange={(e) => renamePlayer(player.id, e.target.value)}
              placeholder={`Player ${i + 1}`}
              className="flex-1 border-b border-transparent bg-transparent px-1 py-1 font-serif text-base text-paper outline-none transition-colors focus:border-amber"
            />
            <button
              type="button"
              aria-label={`Remove ${player.name || `player ${i + 1}`}`}
              disabled={players.length <= 1}
              onClick={() => removePlayer(player.id)}
              className="font-mono text-[11px] uppercase tracking-widest2 text-paper-mute hover:text-amber-warm disabled:opacity-20"
            >
              remove
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={players.length >= MAX_PLAYERS}
        onClick={addPlayer}
        className="btn-ghost mt-3 w-full disabled:opacity-30"
      >
        Add another listener
      </button>
    </section>
  );
}
