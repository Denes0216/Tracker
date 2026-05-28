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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        autoFocus
        type="text"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        className="field flex-1 font-serif text-lg italic-soft placeholder:text-paper-mute"
      />
      <button type="submit" className="btn-primary sm:px-8" disabled={disabled || !value.trim()}>
        Lock it in
      </button>
    </form>
  );
}
