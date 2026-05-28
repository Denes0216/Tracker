import { useEffect, useRef, useState } from 'react';

interface CounterProps {
  value: number;
  duration?: number;
  className?: string;
}

/**
 * Animated number ticker. Eases from the previously-shown value to `value`
 * with a cubic-out curve. Tabular numerics so nothing jumps.
 */
export function Counter({ value, duration = 900, className }: CounterProps) {
  const [display, setDisplay] = useState(value);
  const startRef = useRef(value);

  useEffect(() => {
    const from = startRef.current;
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + (value - from) * eased);
      setDisplay(next);
      if (t < 1) frame = requestAnimationFrame(step);
      else startRef.current = value;
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <span className={`tnum ${className ?? ''}`}>{display}</span>;
}
