import { useState, type FormEvent } from 'react';

interface FreeTextAnswerProps {
  placeholder: string;
  disabled: boolean;
  onSubmit: (value: string) => void;
}

export function FreeTextAnswer({ placeholder, disabled, onSubmit }: FreeTextAnswerProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        autoFocus
        type="text"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none focus:border-brand-500 disabled:opacity-50"
      />
      <button type="submit" className="btn-primary" disabled={disabled || !value.trim()}>
        Guess
      </button>
    </form>
  );
}
