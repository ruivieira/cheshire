const spinnerFrames = {
  running: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  success: ["✅"],
  failure: ["❌"],
  waiting: ["⏳"],
} as const;

export class Spinner {
  private interval: number | null = null;
  private frameIndex = 0;
  private message: string;
  private isRunning = false;

  constructor(message: string) {
    this.message = message;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.frameIndex = 0;
    Deno.stdout.writeSync(new TextEncoder().encode(`${spinnerFrames.running[0]} ${this.message}`));
    this.interval = setInterval(() => {
      this.frameIndex = (this.frameIndex + 1) % spinnerFrames.running.length;
      const frame = spinnerFrames.running[this.frameIndex];
      Deno.stdout.writeSync(new TextEncoder().encode("\r"));
      Deno.stdout.writeSync(new TextEncoder().encode(`${frame} ${this.message}`));
    }, 100);
  }

  stop(success: boolean = true, showMessage: boolean = true): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    Deno.stdout.writeSync(new TextEncoder().encode("\r"));
    if (showMessage) {
      const finalFrame = success ? spinnerFrames.success[0] : spinnerFrames.failure[0];
      Deno.stdout.writeSync(new TextEncoder().encode(`${finalFrame} ${this.message}`));
    }
  }

  updateMessage(message: string): void {
    this.message = message;
    if (this.isRunning) {
      Deno.stdout.writeSync(new TextEncoder().encode("\r"));
      const frame = spinnerFrames.running[this.frameIndex];
      Deno.stdout.writeSync(new TextEncoder().encode(`${frame} ${this.message}`));
    }
  }
}
