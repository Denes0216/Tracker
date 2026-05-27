import { useCallback, useEffect, useRef, useState } from 'react';
import { WebAudioPlayer } from '../services/audioPlayer';

/**
 * React wrapper around WebAudioPlayer. Owns one audio engine for the component
 * lifetime and exposes reactive playback state plus a play count (how many
 * times the current clip has been heard).
 */
export function useClipPlayer(clipMs: number) {
  const playerRef = useRef<WebAudioPlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playCount, setPlayCount] = useState(0);

  useEffect(() => {
    const player = new WebAudioPlayer({
      onPlayStateChange: setIsPlaying,
      onError: (err) => setError(err.message),
    });
    playerRef.current = player;
    return () => player.dispose();
  }, []);

  const load = useCallback(async (url: string) => {
    setError(null);
    setPlayCount(0);
    setIsLoading(true);
    try {
      await playerRef.current?.load(url);
    } catch {
      // surfaced via onError
    } finally {
      setIsLoading(false);
    }
  }, []);

  const play = useCallback(async () => {
    setPlayCount((n) => n + 1);
    await playerRef.current?.playClip(clipMs);
  }, [clipMs]);

  const stop = useCallback(() => playerRef.current?.stop(), []);

  return { isPlaying, isLoading, error, playCount, load, play, stop };
}
