import type { Track } from '@mgg/game-core';

interface RevealProps {
  track: Track;
  roundScore: number;
  detail: string;
}

export function Reveal({ track, roundScore, detail }: RevealProps) {
  const perfect = roundScore === 0;
  return (
    <div className="card flex flex-col items-center gap-3 text-center">
      {track.artworkUrl && (
        <img
          src={track.artworkUrl}
          alt={`${track.album} cover`}
          className="h-32 w-32 rounded-xl object-cover shadow"
        />
      )}
      <div>
        <div className="text-lg font-bold">{track.title}</div>
        <div className="text-slate-400">{track.artist}</div>
        <div className="text-sm text-slate-500">
          {track.album} · {track.releaseYear}
        </div>
      </div>
      <div
        className={`mt-1 rounded-full px-4 py-1 text-sm font-bold ${
          perfect ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-200'
        }`}
      >
        +{roundScore} {roundScore === 1 ? 'point' : 'points'}
      </div>
      <p className="text-sm text-slate-400">{detail}</p>
    </div>
  );
}
