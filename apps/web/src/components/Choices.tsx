interface ChoicesProps {
  choices: string[];
  revealed: boolean;
  picked: string | null;
  correct: string;
  onPick: (value: string) => void;
}

export function Choices({ choices, revealed, picked, correct, onPick }: ChoicesProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {choices.map((choice) => {
        let cls = 'bg-slate-800 text-slate-100 hover:bg-slate-700';
        if (revealed) {
          if (choice === correct) cls = 'bg-emerald-600 text-white';
          else if (choice === picked) cls = 'bg-rose-600 text-white';
          else cls = 'bg-slate-800/50 text-slate-500';
        }
        return (
          <button
            key={choice}
            type="button"
            disabled={revealed}
            onClick={() => onPick(choice)}
            className={`rounded-xl px-4 py-4 text-center font-semibold transition active:scale-[0.98] ${cls}`}
          >
            {choice}
          </button>
        );
      })}
    </div>
  );
}
