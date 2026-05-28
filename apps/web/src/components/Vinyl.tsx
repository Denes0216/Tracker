interface VinylProps {
  spinning: boolean;
  artwork?: string;
  /** Tiny caption shown on the label when there's no artwork. */
  caption?: string;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  /** Diameter in rem. */
  size?: number;
}

/**
 * Vinyl-record affordance — the focal element of the round screen.
 * Spins at 33⅓ RPM when `spinning` is true.
 */
export function Vinyl({
  spinning,
  artwork,
  caption,
  onClick,
  disabled,
  ariaLabel,
  size = 14,
}: VinylProps) {
  const dim = `${size}rem`;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{ width: dim, height: dim }}
      className="group relative rounded-full transition-transform active:scale-[0.99] disabled:opacity-60"
    >
      <span
        className={`absolute inset-0 rounded-full ${spinning ? 'animate-spin333' : ''}`}
        style={{ transformOrigin: '50% 50%' }}
      >
        {/* Disc + grooves */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          <defs>
            <radialGradient id="disc" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1a1611" />
              <stop offset="60%" stopColor="#0a0907" />
              <stop offset="100%" stopColor="#000" />
            </radialGradient>
            <radialGradient id="sheen" cx="35%" cy="30%" r="60%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="50" fill="url(#disc)" />
          {/* Concentric grooves */}
          {[46, 42, 38, 34, 30, 26].map((r) => (
            <circle
              key={r}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke="rgba(237,228,211,0.045)"
              strokeWidth="0.4"
            />
          ))}
          {/* Subtle sheen */}
          <circle cx="50" cy="50" r="50" fill="url(#sheen)" />
        </svg>

        {/* Label */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber/40 bg-amber/10 backdrop-blur-sm"
          style={{ width: '38%', height: '38%' }}
        >
          {artwork ? (
            <img
              src={artwork}
              alt=""
              className="absolute inset-0 h-full w-full rounded-full object-cover opacity-90"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-2 text-center">
              <span className="font-mono text-[8px] uppercase tracking-widest2 text-amber-warm">
                {caption ?? '33 1/3'}
              </span>
            </div>
          )}
          {/* Spindle hole */}
          <span className="absolute left-1/2 top-1/2 h-[6%] w-[6%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" />
        </div>
      </span>

      {/* Soft amber glow on hover when idle, signalling interactivity */}
      {!disabled && (
        <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ boxShadow: '0 0 60px -10px rgba(245,166,35,0.4)' }} />
      )}
    </button>
  );
}
