class AudioSystem {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private enabled: boolean = true;
  private currentTheme: 'a' | 'b' = 'a';
  private stepCount: number = 0;
  private musicTimer: number | null = null;

  private notes = {
    a: { r: [60, 57, 65, 67], iv: [0, 4, 7, 12], tempo: 200 },
    b: { r: [57, 53, 60, 55], iv: [0, 3, 7, 12], tempo: 135 }
  };

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = this.enabled ? 0.05 : 0;
        this.musicGain.connect(this.ctx.destination);
        this.startMusicLoop();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (this.musicGain) {
      this.musicGain.gain.value = enabled ? 0.05 : 0;
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public toggle(): boolean {
    this.init();
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  public setTheme(theme: 'a' | 'b') {
    this.currentTheme = theme;
  }

  private tone(freq: number, startTime: number, duration: number, type: OscillatorType = 'square', vol = 0.05, slideFreq?: number) {
    if (!this.ctx || !this.enabled) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      if (slideFreq) {
        osc.frequency.exponentialRampToValueAtTime(slideFreq, startTime + duration);
      }
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch {
      // AudioContext not ready or browser restriction
    }
  }

  public playSfx(type: 'sel' | 'ok' | 'err' | 'step' | 'go' | 'win') {
    this.init();
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    switch (type) {
      case 'sel':
        this.tone(523, t, 0.08, 'sine', 0.06);
        break;
      case 'ok':
        this.tone(523, t, 0.08, 'triangle', 0.08);
        this.tone(659, t + 0.08, 0.12, 'triangle', 0.08);
        break;
      case 'err':
        this.tone(220, t, 0.1, 'sawtooth', 0.08, 110);
        break;
      case 'step':
        this.tone(150 + Math.random() * 40, t, 0.03, 'sine', 0.02);
        break;
      case 'go':
        this.tone(440, t, 0.06, 'square', 0.05);
        this.tone(880, t + 0.06, 0.1, 'square', 0.05);
        break;
      case 'win':
        [523, 659, 783, 1046].forEach((f, i) => {
          this.tone(f, t + i * 0.08, 0.15, 'triangle', 0.07);
        });
        break;
    }
  }

  public playFanfare() {
    this.init();
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    [523, 659, 783, 1046, 1318].forEach((f, i) => {
      this.tone(f, t + i * 0.1, 0.3, 'triangle', 0.08);
    });
  }

  private noteToFreq(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  private startMusicLoop() {
    if (this.musicTimer) return;
    const tick = () => {
      if (this.ctx && this.enabled && this.ctx.state === 'running') {
        const config = this.notes[this.currentTheme];
        const rootNote = config.r[Math.floor(this.stepCount / 4) % config.r.length]!;
        const interval = config.iv[this.stepCount % config.iv.length]!;
        const freq = this.noteToFreq(rootNote + interval);
        const t = this.ctx.currentTime;

        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.015, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + config.tempo / 1000);
          osc.connect(gain);
          if (this.musicGain) osc.connect(this.musicGain);
          osc.start(t);
          osc.stop(t + config.tempo / 1000);
        } catch {
          // ignore audio frame errors
        }
        this.stepCount++;
      }
      this.musicTimer = window.setTimeout(tick, this.notes[this.currentTheme].tempo);
    };
    tick();
  }
}

export const audioSystem = new AudioSystem();
