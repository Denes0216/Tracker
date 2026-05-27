import { useCallback, useEffect, useRef, useState } from 'react';
import { WebAudioPlayer } from '../services/audioPlayer';

const PREVIEW_MS = 12000;

/** Audition a single preview URL at a time (used in the deck builder). */
export function usePreview() {
  const playerRef = useRef<WebAudioPlayer | null>(null);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);

  useEffect(() => {
    const player = new WebAudioPlayer();
    playerRef.current = player;
    return () => player.dispose();
  }, []);

  const toggle = useCallback(
    async (url: string) => {
      const player = playerRef.current;
      if (!player) return;
      if (playingUrl === url) {
        player.stop();
        setPlayingUrl(null);
        return;
      }
      await player.load(url);
      setPlayingUrl(url);
      await player.playClip(PREVIEW_MS);
      setPlayingUrl((current) => (current === url ? null : current));
    },
    [playingUrl],
  );

  return { playingUrl, toggle };
}
