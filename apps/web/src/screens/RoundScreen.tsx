import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  currentPlayer,
  getCurrentRound,
  getLastResult,
  roundNumber,
  totalRounds,
  totalScore,
  type Criterion,
  type Round,
} from '@mgg/game-core';
import { useGameStore } from '../store/gameStore';
import { useClipPlayer } from '../hooks/useClipPlayer';
import { Vinyl } from '../components/Vinyl';
import { Waveform } from '../components/Waveform';
import { Counter } from '../components/Counter';
import { Choices } from '../components/Choices';
import { FreeTextAnswer } from '../components/FreeTextAnswer';
import { YearPicker } from '../components/YearPicker';
import { Reveal } from '../components/Reveal';
import { PassInterstitial } from '../components/PassInterstitial';

const CRITERION_PROMPT: Record<Criterion, string> = {
  year: 'What year was it cut?',
  title: 'What is this record?',
  artist: 'Whose record is it?',
};

const CRITERION_PLACEHOLDER: Record<Criterion, string> = {
  year: 'e.g. 1991',
  title: 'song title',
  artist: 'artist name',
};

function prompt(round: Round): string {
  if (round.mode === 'pin-the-year') return 'Pin the release year.';
  return CRITERION_PROMPT[round.criterion ?? 'title'];
}

function revealDetail(round: Round, answerValue: string | number, score: number): string {
  if (round.mode === 'pin-the-year') {
    return `You guessed ${answerValue}. It was cut in ${round.track.releaseYear} — ${score} off.`;
  }
  if (score === 0) return 'Spot on.';
  return `The answer was "${round.correctAnswer}". You said "${answerValue}".`;
}

export function RoundScreen() {
  const navigate = useNavigate();
  const game = useGameStore((s) => s.game);
  const submitAnswer = useGameStore((s) => s.submitAnswer);
  const next = useGameStore((s) => s.next);
  const beginTurn = useGameStore((s) => s.beginTurn);

  const clipMs = game?.config.clipMs ?? 15000;
  const { isPlaying, isLoading, error, playCount, load, play, stop } = useClipPlayer(clipMs);

  const inPlay = game?.phase === 'playing' || game?.phase === 'reveal';
  const round = game ? getCurrentRound(game) : undefined;
  const previewUrl = inPlay ? round?.track.previewUrl : undefined;

  useEffect(() => {
    if (!game) navigate('/setup', { replace: true });
  }, [game, navigate]);

  useEffect(() => {
    if (game?.phase === 'finished') navigate('/results', { replace: true });
  }, [game?.phase, navigate]);

  useEffect(() => {
    if (!previewUrl) return;
    void load(previewUrl);
    return () => stop();
  }, [previewUrl, load, stop]);

  if (!game) return null;

  if (game.phase === 'pass') {
    return (
      <PassInterstitial
        playerName={currentPlayer(game).name}
        isFirst={game.currentPlayerIndex === 0}
        onBegin={beginTurn}
      />
    );
  }
  if (!round) return null;

  const revealed = game.phase === 'reveal';
  const lastResult = getLastResult(game);
  const total = totalScore(game, currentPlayer(game).id);
  const multiplayer = game.players.length > 1;
  const isLastRound = roundNumber(game) >= totalRounds(game);
  const isLastPlayer = game.currentPlayerIndex >= game.players.length - 1;
  const advanceLabel = !isLastRound
    ? 'Next side'
    : isLastPlayer
      ? 'Read the score'
      : 'Hand off';

  // Side A / B based on round half (just a stylistic touch).
  const side = roundNumber(game) <= totalRounds(game) / 2 ? 'A' : 'B';
  const clipSeconds = Math.round(clipMs / 1000);

  return (
    <div className="flex flex-col gap-10">
      {/* Top hi-fi readout */}
      <div className="flex items-center justify-between border-b border-rule pb-3">
        <div className="flex items-baseline gap-3">
          {multiplayer && (
            <span className="font-serif text-base text-amber-warm">
              {currentPlayer(game).name}
            </span>
          )}
          <span className="serial">
            side {side} · round{' '}
            <span className="numeric text-paper">
              {String(roundNumber(game)).padStart(2, '0')}
            </span>{' '}
            / {String(totalRounds(game)).padStart(2, '0')}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="serial">score</span>
          <span className="font-mono text-2xl tabular-nums text-paper">
            <Counter value={total} />
          </span>
        </div>
      </div>

      {/* The vinyl + waveform */}
      <div className="flex flex-col items-center gap-6 pt-2">
        <Vinyl
          spinning={isPlaying}
          disabled={isLoading}
          artwork={revealed ? round.track.artworkUrl : undefined}
          caption={revealed ? '' : '33 1/3'}
          ariaLabel={isPlaying ? 'Playing clip' : 'Play clip'}
          onClick={play}
          size={15}
        />
        <Waveform active={isPlaying} />
        <div className="font-mono text-[11px] uppercase tracking-widest2 text-paper-mute">
          {error ? (
            <span className="text-amber-warm">{error}</span>
          ) : isLoading ? (
            'cueing…'
          ) : (
            <>
              {clipSeconds}s preview · played {playCount}×
            </>
          )}
        </div>
      </div>

      {/* Prompt */}
      <h2 className="display text-center text-3xl">{prompt(round)}</h2>

      {/* Answer input (hidden after reveal, except multiple-choice which stays for color-coded feedback) */}
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
        <div className="flex flex-col gap-6 animate-riseIn">
          <Reveal
            track={round.track}
            roundScore={lastResult.score}
            detail={revealDetail(round, lastResult.answer.value, lastResult.score)}
          />
          <button className="btn-primary w-full animate-glow" onClick={next}>
            {advanceLabel}
          </button>
        </div>
      )}
    </div>
  );
}
