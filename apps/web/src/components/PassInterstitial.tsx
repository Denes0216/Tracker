import { Waveform } from './Waveform';

interface PassInterstitialProps {
  playerName: string;
  isFirst: boolean;
  onBegin: () => void;
}

export function PassInterstitial({ playerName, isFirst, onBegin }: PassInterstitialProps) {
  return (
    <div className="flex flex-col items-center gap-10 pt-16 text-center">
      <div className="serial">{isFirst ? 'first up' : 'next on the platter'}</div>

      <div className="space-y-3">
        <Waveform active bars={13} height={2.5} />
        <h2 className="display text-6xl text-amber-warm">{playerName}</h2>
        <div className="font-serif italic-soft text-paper-dim">
          {isFirst
            ? 'Take the seat. The needle is waiting.'
            : 'Pass the device. No peeking at the clip or the answer.'}
        </div>
      </div>

      <button
        className="btn-primary w-72 text-lg animate-glow"
        onClick={onBegin}
      >
        Drop the needle
      </button>
    </div>
  );
}
