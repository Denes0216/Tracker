import { useState } from 'react';

interface YearPickerProps {
  start: number;
  end: number;
  disabled: boolean;
  onSubmit: (year: number) => void;
}

export function YearPicker({ start, end, disabled, onSubmit }: YearPickerProps) {
  const [year, setYear] = useState(Math.round((start + end) / 2));

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <div className="serial mb-2">your guess</div>
        <div className="font-serif text-[7rem] leading-none tabular-nums text-amber-warm">
          {year}
        </div>
      </div>

      <div className="w-full px-1">
        <input
          type="range"
          min={start}
          max={end}
          step={1}
          value={year}
          disabled={disabled}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-full"
          aria-label="Pick a year"
        />
        <div className="mt-3 flex justify-between font-mono text-[11px] tracking-widest2 text-paper-mute">
          <span>{start}</span>
          <span>{end}</span>
        </div>
      </div>

      <button
        className="btn-primary w-full"
        disabled={disabled}
        onClick={() => onSubmit(year)}
      >
        Lock in {year}
      </button>
    </div>
  );
}
