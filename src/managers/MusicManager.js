// =============================================================================
// ZOMBIE FARM - Music Manager (ZzFXM playback with looping)
// =============================================================================
import { zzfxM } from '../utils/zzfxm.js';
import { zzfxX, zzfxR, zzfxV } from '../utils/zzfx.js';

export class MusicManager {
  constructor() {
    this.source = null;
    this.gainNode = null;
    this.buffer = null;
    this.volume = 0.35;   // music volume (relative to master)
    this.isPlaying = false;
  }

  /**
   * Pre-render a song so playback is instant later.
   * @param {Array} songData - ZzFXM song data [instruments, patterns, sequence, bpm?]
   */
  prepareSong(songData) {
    try {
      const [left, right] = zzfxM(...songData);
      this.buffer = zzfxX.createBuffer(2, left.length, zzfxR);
      this.buffer.getChannelData(0).set(left);
      this.buffer.getChannelData(1).set(right);
    } catch (e) {
      console.warn('MusicManager: Failed to render song', e);
      this.buffer = null;
    }
  }

  /**
   * Start playing the prepared song, looping forever.
   */
  play() {
    if (!this.buffer || this.isPlaying) return;

    // Resume context if suspended (browser autoplay policy)
    if (zzfxX.state === 'suspended') {
      zzfxX.resume();
    }

    // Create gain node for volume control
    this.gainNode = zzfxX.createGain();
    this.gainNode.gain.value = this.volume * zzfxV;
    this.gainNode.connect(zzfxX.destination);

    // Create and start the source
    this.source = zzfxX.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.loop = true;
    this.source.connect(this.gainNode);
    this.source.start();
    this.isPlaying = true;
  }

  /**
   * Stop the music.
   */
  stop() {
    if (this.source) {
      try { this.source.stop(); } catch {}
      this.source.disconnect();
      this.source = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    this.isPlaying = false;
  }

  /**
   * Set music volume (0–1).
   */
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume * zzfxV;
    }
  }

  /**
   * Fade out and stop.
   */
  fadeOut(durationMs = 1000) {
    if (!this.gainNode || !this.isPlaying) return;
    const now = zzfxX.currentTime;
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.linearRampToValueAtTime(0, now + durationMs / 1000);

    // Stop after fade completes
    setTimeout(() => this.stop(), durationMs + 50);
  }
}

