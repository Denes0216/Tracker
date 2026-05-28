interface WordmarkProps {
  text: string;
  className?: string;
  /** When true, letters animate-breathe with a per-letter stagger. */
  animated?: boolean;
}

/**
 * Splits a wordmark into per-letter spans so each glyph can be individually
 * animated. Used for the hero title — gives it a slight handmade pulse.
 */
export function Wordmark({ text, className, animated = true }: WordmarkProps) {
  return (
    <span className={`letters ${className ?? ''}`} aria-label={text}>
      {[...text].map((ch, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={animated ? 'animate-breathe' : undefined}
          style={{
            animationDelay: `${(i * 0.12).toFixed(2)}s`,
            ...(ch === ' ' ? { width: '0.3em' } : null),
          }}
        >
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  );
}
