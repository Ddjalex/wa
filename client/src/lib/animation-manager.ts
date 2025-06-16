export class AnimationManager {
  private isAnimating: boolean = false;
  private animationQueue: Array<() => Promise<void>> = [];
  private drawnNumbers: Set<number> = new Set();

  // Prevent animation stacking by using a queue system
  async drawNumber(number: number, delay: number = 0): Promise<void> {
    return new Promise((resolve) => {
      const executeAnimation = async () => {
        if (this.isAnimating) {
          // Add to queue if currently animating
          this.animationQueue.push(() => this.drawNumber(number, 0));
          return;
        }

        this.isAnimating = true;

        try {
          const ball = document.querySelector(`button[data-number="${number}"]`) as HTMLElement;
          
          if (ball) {
            // Clear any existing animation classes
            ball.classList.remove('ball-draw', 'ball-bounce', 'ball-winner');
            
            // Force reflow to ensure class removal takes effect
            ball.offsetHeight;
            
            // Add drawing animation with proper timing
            ball.classList.add('ball-draw');
            
            this.drawnNumbers.add(number);
          }
        } catch (error) {
          console.error('Animation error:', error);
        }

        // Complete animation and process queue
        setTimeout(() => {
          this.isAnimating = false;
          resolve();
          
          // Process next animation in queue
          if (this.animationQueue.length > 0) {
            const nextAnimation = this.animationQueue.shift();
            if (nextAnimation) {
              nextAnimation();
            }
          }
        }, 2000);
      };

      // Execute with delay
      setTimeout(executeAnimation, delay);
    });
  }

  // Mark numbers as winners with special animation
  markWinners(numbers: number[]): void {
    numbers.forEach((number) => {
      const ball = document.querySelector(`button[data-number="${number}"]`) as HTMLElement;
      if (ball && this.drawnNumbers.has(number)) {
        ball.classList.remove('ball-draw', 'ball-bounce');
        ball.classList.add('ball-winner');
        ball.style.backgroundColor = 'rgb(16, 185, 129)'; // game-green
        ball.style.borderColor = 'rgb(251, 191, 36)'; // game-gold
      }
    });
  }

  // Reset all animations and state
  reset(): void {
    this.isAnimating = false;
    this.animationQueue = [];
    this.drawnNumbers.clear();
    
    // Reset all balls to default state
    document.querySelectorAll('button[data-number]').forEach((ball) => {
      const htmlBall = ball as HTMLElement;
      htmlBall.classList.remove('ball-draw', 'ball-bounce', 'ball-winner');
      htmlBall.style.backgroundColor = '';
      htmlBall.style.borderColor = '';
    });
  }

  // Check if currently animating
  get isCurrentlyAnimating(): boolean {
    return this.isAnimating;
  }

  // Get current queue length
  get queueLength(): number {
    return this.animationQueue.length;
  }
}
