interface PassInterstitialProps {
  playerName: string;
  isFirst: boolean;
  onBegin: () => void;
}

export function PassInterstitial({ playerName, isFirst, onBegin }: PassInterstitialProps) {
  return (
    <div className="flex flex-col items-center gap-6 pt-12 text-center">
      <div className="text-6xl">🎧</div>
      <div>
        <div className="text-sm uppercase tracking-widest text-slate-500">
          {isFirst ? 'Get ready' : 'Pass the device'}
        </div>
        <h2 className="mt-2 text-3xl font-extrabold text-brand-300">{playerName}</h2>
        <p className="mt-2 text-slate-400">
          {isFirst ? "You're up first." : 'No peeking — only you should see your clip and answers.'}
        </p>
      </div>
      <button className="btn-primary w-56 text-lg" onClick={onBegin}>
        Start my turn
      </button>
    </div>
  );
}
