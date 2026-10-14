const MUTED_KEY = "snake.muted";

/**
 * Small synthesized sound effects and the mute toggle. No audio files:
 * every sound is a short oscillator envelope.
 */
export class SoundManager {
  private ctx: AudioContext | null = null;
  private muted: boolean;
  private readonly toggle = document.getElementById("sound-toggle")!;

  constructor() {
    this.muted = localStorage.getItem(MUTED_KEY) === "1";
    this.renderToggle();

    this.toggle.addEventListener("click", () => {
      this.toggle.blur(); // keep Space from re-triggering the button
      this.muted = !this.muted;
      localStorage.setItem(MUTED_KEY, this.muted ? "1" : "0");
      this.renderToggle();
      this.unlock();
      if (!this.muted) this.start();
    });
  }

  /**
   * Browsers only allow audio after a user gesture, so the context is
   * created on the first start or click.
   */
  public unlock(): void {
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  public start(): void {
    this.tone(440, 0, 0.12, "triangle", 0.12, 660);
  }

  public eat(): void {
    this.tone(660, 0, 0.09, "triangle", 0.14);
    this.tone(880, 0.07, 0.12, "triangle", 0.14);
  }

  public gameOver(): void {
    this.tone(300, 0, 0.5, "sawtooth", 0.1, 80);
  }

  public win(): void {
    [523, 659, 784, 1047].forEach((freq, i) =>
      this.tone(freq, i * 0.1, 0.2, "triangle", 0.14),
    );
  }

  private renderToggle(): void {
    this.toggle.textContent = this.muted ? "Sound off" : "Sound on";
  }

  private tone(
    freq: number,
    delay: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    slideTo?: number,
  ): void {
    if (this.muted || !this.ctx) return;

    const start = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(gain).connect(this.ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }
}
