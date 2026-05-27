import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentRound,
  getLastResult,
  roundNumber,
  totalScore,
  type Criterion,
  type Round,
} from '@mgg/game-core';
import { useGameStore } from '../store/gameStore';
import { useClipPlayer } from '../hooks/useClipPlayer';
import { ClipPlayer } from '../components/ClipPlayer';
import { Choices } from '../components/Choices';
import { FreeTextAnswer } from '../components/FreeTextAnswer';
import { YearPicker } from '../components/YearPicker';
import { Reveal } from '../components/Reveal';

const CRITERION_PROMPT: Record<Criterion, string> = {
  year: 'What year was this released?',
  title: "What's the song title?",
  artist: "Who's the artist?",
};

const CRITERION_PLACEHOLDER: Record<Criterion, string> = {
  year: 'e.g. 1991',
  title: 'Song title…',
  artist: 'Artist name…',
};

function prompt(round: Round): string {
  if (round.mode === 'pin-the-year') return 'Pin the exact release year';
  return CRITERION_PROMPT[round.criterion ?? 'title'];
}

function revealDetail(round: Round, answerValue: string | number, score: number): string {
  if (round.mode === 'pin-the-year') {
    return `You guessed ${answerValue} — it came out in ${round.track.releaseYear} (${score} off).`;
  }
  if (score === 0) return 'Correct!';
  return `The answer was "${round.correctAnswer}". You said "${answerValue}".`;
}

export function RoundScreen() {
  const navigate = useNavigate();
  const game = useGameStore((s) => s.game);
  const submitAnswer = useGameStore((s) => s.submitAnswer);
  const next = useGameStore((s) => s.next);

  const clipMs = game?.config.clipMs ?? 15000;
  const { isPlaying, isLoading, error, playCount, load, play, stop } = useClipPlayer(clipMs);

  const round = game ? getCurrentRound(game) : undefined;
  const previewUrl = round?.track.previewUrl;

  useEffect(() => {
    if (!game) navigate('/setup', { replace: true });
  }, [game, navigate]);

  useEffect(() => {
    if (game?.phase === 'finished') navigate('/results', { replace: true });
  }, [game?.phase, navigate]);

  // Load each clip when the round changes; the player taps to play (autoplay
  // with sound is blocked until a user gesture).
  useEffect(() => {
    if (!previewUrl) return;
    void load(previewUrl);
    return () => stop();
  }, [previewUrl, load, stop]);

  if (!game || !round) return null;

  const revealed = game.phase === 'reveal';
  const lastResult = getLastResult(game);
  const total = totalScore(game, game.players[game.currentPlayerIndex].id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>
          Round {roundNumber(game)} / {game.rounds.length}
        </span>
        <span>
          Score: <span className="font-bold text-slate-200">{total}</span>
        </span>
      </div>

      <ClipPlayer
        isPlaying={isPlaying}
        isLoading={isLoading}
        error={error}
        playCount={playCount}
        clipSeconds={Math.round(clipMs / 1000)}
        onPlay={play}
      />

      <h2 className="text-center text-xl font-bold">{prompt(round)}</h2>

      {round.mode === 'pin-the-year' && round.yearRange ? (
        revealed ? null : (
          <YearPicker
            key={round.index}
            start={round.yearRange.start}
            end={round.yearRange.end}
            disabled={false}
            onSubmit={(year) => submitAnswer({ value: year })}
          />
        )
      ) : round.choices ? (
        <Choices
          choices={round.choices}
          revealed={revealed}
          picked={lastResult ? String(lastResult.answer.value) : null}
          correct={String(round.correctAnswer)}
          onPick={(value) => submitAnswer({ value })}
        />
      ) : (
        !revealed && (
          <FreeTextAnswer
            key={round.index}
            placeholder={CRITERION_PLACEHOLDER[round.criterion ?? 'title']}
            disabled={false}
            onSubmit={(value) => submitAnswer({ value })}
          />
        )
      )}

      {revealed && lastResult && (
        <>
          <Reveal
            track={round.track}
            roundScore={lastResult.score}
            detail={revealDetail(round, lastResult.answer.value, lastResult.score)}
          />
          <button className="btn-primary text-lg" onClick={next}>
            {roundNumber(game) >= game.rounds.length ? 'See results' : 'Next round'}
          </button>
        </>
      )}
    </div>
  );
}
