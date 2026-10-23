/**
 * SoundVibe DJ Audio Engine
 * Provides Web Audio API synthesized sound effects (Airhorn, Scratch, Vinyl Brake, Siren, Drop)
 * and audio processing utilities for DJ mixing, tempo matching, and frequency splitting.
 */

class DJAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Airhorn sound effect (Classic Dancehall / Festival DJ Triple Airhorn)
  playAirhorn(volume = 0.8) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const blastNotes = [440, 523.25, 659.25]; // A4, C5, E5 triad
      const blastTimes = [0, 0.22, 0.44];

      blastTimes.forEach((blastDelay, blastIndex) => {
        const blastStart = now + blastDelay;
        const blastDuration = blastIndex === 2 ? 0.6 : 0.18;

        blastNotes.forEach((baseFreq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = 'sawtooth';
          // Pitch chirp upwards slightly
          osc.frequency.setValueAtTime(baseFreq * 0.95, blastStart);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.05, blastStart + 0.05);
          osc.frequency.setValueAtTime(baseFreq, blastStart + 0.06);

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1400, blastStart);
          filter.Q.setValueAtTime(2.5, blastStart);

          gain.gain.setValueAtTime(0.001, blastStart);
          gain.gain.linearRampToValueAtTime((volume / blastNotes.length) * 0.7, blastStart + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, blastStart + blastDuration);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(blastStart);
          osc.stop(blastStart + blastDuration + 0.05);
        });
      });
    } catch (e) {
      console.warn('Airhorn playback error:', e);
    }
  }

  // Vinyl Scratch effect (Wicka-wicka DJ scratch)
  playScratch(volume = 0.7) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Noise buffer for friction
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Bandpass filter with sweep
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(5, now);
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.1);
      filter.frequency.exponentialRampToValueAtTime(600, now + 0.2);
      filter.frequency.exponentialRampToValueAtTime(1800, now + 0.3);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.4);

      // Pitch modulated saw osc
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(volume * 0.8, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      noise.connect(filter);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      osc.start(now);
      noise.stop(now + 0.45);
      osc.stop(now + 0.45);
    } catch (e) {
      console.warn('Scratch error:', e);
    }
  }

  // Turntable Vinyl Brake / Power-off effect
  playVinylBrake(volume = 0.85) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const duration = 1.3;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(480, now);
      // Decelerating pitch down curve
      osc.frequency.exponentialRampToValueAtTime(40, now + duration);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2500, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + duration);

      gain.gain.setValueAtTime(volume, now);
      gain.gain.linearRampToValueAtTime(volume * 0.8, now + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch (e) {
      console.warn('Vinyl brake error:', e);
    }
  }

  // Dub Siren / Laser Alarm
  playSiren(volume = 0.75) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const duration = 1.2;

      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(7, now); // 7 Hz vibrato

      lfoGain.gain.setValueAtTime(250, now);

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(volume * 0.7, now + 0.05);
      gain.gain.setValueAtTime(volume * 0.7, now + duration * 0.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      lfo.start(now);
      osc.start(now);
      lfo.stop(now + duration);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('Siren error:', e);
    }
  }

  // DJ Voice Drop Announcement
  playVoiceDrop(phrase = 'DJ SoundVibe in the mix!') {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.pitch = 0.85; // slightly deeper DJ tone
      utterance.rate = 1.05;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback audio beep
      this.playAirhorn(0.5);
    }
  }

  // Audio preview generator for offline playback or mashup synthesis
  playOfflineTone(frequency = 440, duration = 0.5) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // AudioContext unavailable
    }
  }
}

export const djAudio = new DJAudioEngine();
