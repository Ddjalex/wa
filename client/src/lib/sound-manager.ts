export class SoundManager {
  private static instance: SoundManager;
  private audioContext: AudioContext | null = null;
  private masterVolume: number = 0.3;
  private isEnabled: boolean = true;

  private constructor() {
    this.initializeAudioContext();
  }

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  // Generate a ball bounce sound effect
  playBallBounce(): void {
    if (!this.isEnabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Bouncy sound parameters
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);

    oscillator.type = 'sine';
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.15);
  }

  // Generate a number selection sound
  playNumberSelect(): void {
    if (!this.isEnabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(this.masterVolume * 0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);

    oscillator.type = 'triangle';
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  // Generate a winning number sound
  playWinningNumber(): void {
    if (!this.isEnabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Cheerful ascending sound
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(600, this.audioContext.currentTime + 0.1);
    oscillator.frequency.linearRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(this.masterVolume * 0.4, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.25);

    oscillator.type = 'square';
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.25);
  }

  // Generate a drawing start sound
  playDrawingStart(): void {
    if (!this.isEnabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Dramatic drum roll effect
    oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(200, this.audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(this.masterVolume * 0.5, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);

    oscillator.type = 'sawtooth';
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  // Generate a drawing complete sound
  playDrawingComplete(): void {
    if (!this.isEnabled || !this.audioContext) return;

    // Play a sequence of ascending notes
    const frequencies = [400, 500, 600, 800];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);

        oscillator.frequency.setValueAtTime(freq, this.audioContext!.currentTime);
        gainNode.gain.setValueAtTime(this.masterVolume * 0.3, this.audioContext!.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.2);

        oscillator.type = 'sine';
        oscillator.start();
        oscillator.stop(this.audioContext!.currentTime + 0.2);
      }, index * 100);
    });
  }

  // Generate a bet placed sound
  playBetPlaced(): void {
    if (!this.isEnabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Success sound
    oscillator.frequency.setValueAtTime(500, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(700, this.audioContext.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(this.masterVolume * 0.4, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);

    oscillator.type = 'triangle';
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  // Generate an error sound
  playError(): void {
    if (!this.isEnabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Error buzzer sound
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(150, this.audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

    oscillator.type = 'square';
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  // Resume audio context if suspended (required for some browsers)
  async resumeAudioContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
}