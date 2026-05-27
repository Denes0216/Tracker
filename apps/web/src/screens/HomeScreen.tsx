import { useNavigate } from 'react-router-dom';

export function HomeScreen() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center gap-8 pt-8 text-center">
      <div>
        <h1 className="bg-gradient-to-r from-brand-400 to-fuchsia-400 bg-clip-text text-5xl font-extrabold text-transparent">
          Name That Tune
        </h1>
        <p className="mt-3 text-slate-400">
          Hear a 30-second clip. Guess the year, title, or artist — or pin the exact release year.
          Lowest score wins.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <button className="btn-primary w-48 text-lg" onClick={() => navigate('/setup')}>
          Play
        </button>
        <button className="btn-ghost w-48" onClick={() => navigate('/decks')}>
          Build a deck
        </button>
      </div>

      <ul className="grid w-full grid-cols-1 gap-3 text-left text-sm text-slate-300 sm:grid-cols-2">
        <li className="card p-4">
          <span className="font-semibold text-brand-300">Name It</span> — multiple choice or free
          text for the song&apos;s year, title, or artist.
        </li>
        <li className="card p-4">
          <span className="font-semibold text-brand-300">Pin the Year</span> — you get a year range;
          the closer your guess, the lower your score.
        </li>
      </ul>
    </div>
  );
}
