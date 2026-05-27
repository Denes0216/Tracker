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
    <div className="flex flex-col items-center gap-5">
      <div className="text-6xl font-extrabold tabular-nums text-brand-300">{year}</div>
      <input
        type="range"
        min={start}
        max={end}
        step={1}
        value={year}
        disabled={disabled}
        onChange={(e) => setYear(Number(e.target.value))}
        className="w-full accent-brand-500"
        aria-label="Pick a year"
      />
      <div className="flex w-full justify-between text-sm text-slate-500">
        <span>{start}</span>
        <span>{end}</span>
      </div>
      <button className="btn-primary w-full" disabled={disabled} onClick={() => onSubmit(year)}>
        Lock in {year}
      </button>
    </div>
  );
}
