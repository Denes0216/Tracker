import type { AudioPlayer } from '@mgg/game-core';

export interface AudioCallbacks {
  onPlayStateChange?(playing: boolean): void;
  onError?(error: Error): void;
}

/**
 * HTML5 `<audio>` implementation of the engine's AudioPlayer interface.
 * `playClip(ms)` plays the first `ms` of the loaded preview then stops —
 * that is what powers the variable clip-length difficulty option.
 */
export class WebAudioPlayer implements AudioPlayer {
  private readonly audio: HTMLAudioElement;
  private clipTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly callbacks: AudioCallbacks = {}) {
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.addEventListener('ended', () => this.callbacks.onPlayStateChange?.(false));
  }

  load(url: string): Promise<void> {
    this.stop();
    return new Promise((resolve, reject) => {
      const onReady = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        const err = new Error('Failed to load audio clip');
        this.callbacks.onError?.(err);
        reject(err);
      };
      const cleanup = () => {
        this.audio.removeEventListener('canplaythrough', onReady);
        this.audio.removeEventListener('error', onError);
      };
      this.audio.addEventListener('canplaythrough', onReady, { once: true });
      this.audio.addEventListener('error', onError, { once: true });
      this.audio.src = url;
      this.audio.load();
    });
  }

  play(): void {
    void this.audio
      .play()
      .then(() => this.callbacks.onPlayStateChange?.(true))
      .catch((err: unknown) => this.callbacks.onError?.(err as Error));
  }

  stop(): void {
    this.clearTimer();
    this.audio.pause();
    this.audio.currentTime = 0;
    this.callbacks.onPlayStateChange?.(false);
  }

  async playClip(ms: number): Promise<void> {
    this.clearTimer();
    this.audio.currentTime = 0;
    try {
      await this.audio.play();
    } catch (err) {
      this.callbacks.onError?.(err as Error);
      return;
    }
    this.callbacks.onPlayStateChange?.(true);
    await new Promise<void>((resolve) => {
      this.clipTimer = setTimeout(() => {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.clipTimer = null;
        this.callbacks.onPlayStateChange?.(false);
        resolve();
      }, ms);
    });
  }

  dispose(): void {
    this.stop();
    this.audio.removeAttribute('src');
    this.audio.load();
  }

  private clearTimer(): void {
    if (this.clipTimer) {
      clearTimeout(this.clipTimer);
      this.clipTimer = null;
    }
  }
}
