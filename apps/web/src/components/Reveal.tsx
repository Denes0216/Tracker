import type { Track } from '@mgg/game-core';

interface RevealProps {
  track: Track;
  roundScore: number;
  detail: string;
}

export function Reveal({ track, roundScore, detail }: RevealProps) {
  const perfect = roundScore === 0;
  return (
    <div className="panel flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <span className="serial">now playing</span>
        <span className="serial">{track.releaseDate?.slice(0, 4)}</span>
      </div>

      <div className="flex gap-5">
        {track.artworkUrl && (
          <img
            src={track.artworkUrl}
            alt=""
            className="h-24 w-24 shrink-0 object-cover ring-1 ring-rule"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="overflow-hidden">
            <div className="animate-unmask font-serif text-2xl leading-tight text-paper">
              {track.title}
            </div>
          </div>
          <div className="overflow-hidden">
            <div
              className="animate-unmask text-paper-dim"
              style={{ animationDelay: '160ms' }}
            >
              {track.artist}
            </div>
          </div>
          <div className="serial mt-2">{track.album}</div>
        </div>
      </div>

      <div className="flex items-end justify-between border-t border-rule pt-4">
        <div className="text-sm text-paper-dim">{detail}</div>
        <div className="text-right">
          <div className="serial">round</div>
          <div
            className={`font-mono text-4xl tabular-nums ${
              perfect ? 'text-amber-warm' : 'text-paper'
            }`}
          >
            +{roundScore}
          </div>
        </div>
      </div>
    </div>
  );
}
