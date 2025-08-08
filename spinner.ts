const spinnerFrames = {
  running: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  success: ["✅"],
  failure: ["❌"],
  waiting: ["⏳"],
} as const;

// Cross-platform stdout write function
function writeToStdout(data: string | Uint8Array): void {
  if (typeof (globalThis as any).Deno !== "undefined") {
    (globalThis as any).Deno.stdout.writeSync(
      typeof data === "string" ? new TextEncoder().encode(data) : data,
    );
  } else if (typeof (globalThis as any).process !== "undefined") {
    (globalThis as any).process.stdout.write(
      typeof data === "string" ? data : new TextDecoder().decode(data),
    );
  }
}

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
    writeToStdout(`${spinnerFrames.running[0]} ${this.message}`);
    this.interval = setInterval(() => {
      this.frameIndex = (this.frameIndex + 1) % spinnerFrames.running.length;
      const frame = spinnerFrames.running[this.frameIndex];
      writeToStdout("\r");
      writeToStdout(`${frame} ${this.message}`);
    }, 100);
  }

  stop(success: boolean = true, showMessage: boolean = true): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    writeToStdout("\r");
    if (showMessage) {
      const finalFrame = success ? spinnerFrames.success[0] : spinnerFrames.failure[0];
      writeToStdout(`${finalFrame} ${this.message}`);
    }
  }

  updateMessage(message: string): void {
    this.message = message;
    if (this.isRunning) {
      writeToStdout("\r");
      const frame = spinnerFrames.running[this.frameIndex];
      writeToStdout(`${frame} ${this.message}`);
    }
  }
}
