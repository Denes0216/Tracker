interface ClipPlayerProps {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  playCount: number;
  clipSeconds: number;
  onPlay: () => void;
}

export function ClipPlayer({
  isPlaying,
  isLoading,
  error,
  playCount,
  clipSeconds,
  onPlay,
}: ClipPlayerProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={onPlay}
        disabled={isLoading || isPlaying}
        aria-label={isPlaying ? 'Playing clip' : 'Play clip'}
        className="relative flex h-28 w-28 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition hover:bg-brand-500 disabled:opacity-70"
      >
        {isPlaying && (
          <span className="absolute inset-0 animate-ping rounded-full bg-brand-500/50" />
        )}
        <span className="relative text-4xl">
          {isLoading ? '…' : isPlaying ? '♪' : '▶'}
        </span>
      </button>
      <div className="text-center text-sm text-slate-400">
        {error ? (
          <span className="text-rose-400">{error}</span>
        ) : isLoading ? (
          'Loading clip…'
        ) : (
          <>
            {clipSeconds}s clip · played {playCount}×
          </>
        )}
      </div>
    </div>
  );
}
