import confetti from 'canvas-confetti';

export function triggerTaskConfetti(x = 0.5, y = 0.6): void {
  try {
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { x, y },
      colors: ['#f43f5e', '#ec4899', '#8b5cf6', '#6366f1', '#fbbf24'],
      disableForReducedMotion: true,
    });
  } catch (err) {
    console.debug('Confetti suppressed:', err);
  }
}

export function triggerWinnerCelebration(): void {
  try {
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#f43f5e', '#ec4899', '#f59e0b', '#ec4899'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#8b5cf6', '#3b82f6', '#10b981', '#f43f5e'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch (err) {
    console.debug('Winner celebration suppressed:', err);
  }
}
