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
      <div className="eyebrow mb-3">{label}</div>
      <div className="flex flex-wrap gap-px overflow-hidden border border-rule bg-rule">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => onChange(opt.value)}
              className={`flex-1 px-4 py-3 font-mono text-[12px] uppercase tracking-widest2 transition-colors ${
                active
                  ? 'bg-amber/20 text-amber-warm'
                  : 'bg-ink-100/60 text-paper-dim hover:bg-ink-200 hover:text-paper'
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
