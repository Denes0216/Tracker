interface WaveformProps {
  active: boolean;
  bars?: number;
  /** rem height of the tallest bar */
  height?: number;
}

/** Tiny vertical-bar level meter — animates while a clip plays. */
export function Waveform({ active, bars = 9, height = 1.5 }: WaveformProps) {
  // Pseudo-random delays for a non-uniform, organic look.
  const delays = [0, 220, 90, 340, 140, 60, 280, 170, 50];
  return (
    <div
      className="flex items-end justify-center gap-[5px]"
      style={{ height: `${height}rem` }}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={`w-[3px] origin-bottom ${
            active ? 'animate-bar bg-amber' : 'bg-paper/15'
          }`}
          style={{
            height: '100%',
            animationDelay: `${delays[i % delays.length]}ms`,
            animationDuration: `${700 + (i % 4) * 120}ms`,
            transform: active ? undefined : 'scaleY(0.18)',
          }}
        />
      ))}
    </div>
  );
}
