interface SegmentedProps<T extends string | number> {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
  disabled?: boolean;
}

export function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
  disabled,
}: SegmentedProps<T>) {
  return (
    <div className={disabled ? 'opacity-40' : undefined}>
      <div className="mb-2 text-sm font-medium text-slate-400">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => onChange(opt.value)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                active ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
