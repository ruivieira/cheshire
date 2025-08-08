const spinnerFrames = {
  running: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  success: ["✅"],
  failure: ["❌"],
  waiting: ["⏳"],
} as const;

// Type declarations for cross-platform compatibility
interface DenoLike {
  stdout?: {
    writeSync?: (data: Uint8Array) => void;
  };
}

interface ProcessLike {
  stdout?: {
    write?: (data: string) => void;
  };
}

interface GlobalThisWithRuntimes {
  Deno?: DenoLike;
  process?: ProcessLike;
}

// Cross-platform stdout write function
function writeToStdout(data: string | Uint8Array): void {
  const globalWithRuntimes = globalThis as GlobalThisWithRuntimes;
  
  if (globalWithRuntimes.Deno?.stdout?.writeSync) {
    globalWithRuntimes.Deno.stdout.writeSync(
      typeof data === "string" ? new TextEncoder().encode(data) : data,
    );
  } else if (globalWithRuntimes.process?.stdout?.write) {
    globalWithRuntimes.process.stdout.write(
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
