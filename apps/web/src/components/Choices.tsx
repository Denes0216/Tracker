interface ChoicesProps {
  choices: string[];
  revealed: boolean;
  picked: string | null;
  correct: string;
  onPick: (value: string) => void;
}

const LABELS = ['a', 'b', 'c', 'd', 'e', 'f'];

export function Choices({ choices, revealed, picked, correct, onPick }: ChoicesProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {choices.map((choice, i) => {
        let tone = 'border-rule bg-ink-100/60 text-paper hover:border-amber/60 hover:text-amber-warm';
        if (revealed) {
          if (choice === correct) tone = 'border-amber bg-amber/15 text-amber-warm';
          else if (choice === picked) tone = 'border-paper/30 bg-ink-200 text-paper-dim line-through decoration-paper-mute';
          else tone = 'border-rule bg-ink-100/40 text-paper-mute';
        }
        return (
          <button
            key={choice}
            type="button"
            disabled={revealed}
            onClick={() => onPick(choice)}
            className={`group flex items-baseline gap-3 border px-4 py-4 text-left font-serif text-lg transition-colors duration-200 ${tone}`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="serial w-4 shrink-0">{LABELS[i]}</span>
            <span className="flex-1">{choice}</span>
            {revealed && choice === correct && <span className="serial text-amber-warm">correct</span>}
          </button>
        );
      })}
    </div>
  );
}
