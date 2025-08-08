import { type Platform } from "./types.ts";

export abstract class Step {
  public readonly id: string;
  public readonly name: string;
  public readonly description?: string;
  public readonly platform?: Platform;
  public readonly timeout?: number;
  public readonly retries?: number;
  public readonly continueOnFailure?: boolean;

  constructor(
    id: string,
    name: string,
    options: {
      description?: string;
      platform?: Platform;
      timeout?: number;
      retries?: number;
      continueOnFailure?: boolean;
    } = {},
  ) {
    this.id = id;
    this.name = name;
    this.description = options.description;
    this.platform = options.platform;
    this.timeout = options.timeout;
    this.retries = options.retries;
    this.continueOnFailure = options.continueOnFailure;
  }

  abstract getCommand(): string;

  execute(): Promise<{ success: boolean; output?: string; error?: string }> | { success: boolean; output?: string; error?: string } {
    return { success: false };
  }

  isTypeScriptStep(): boolean {
    return this.execute !== Step.prototype.execute;
  }

  abstract validateParameters(): string[];

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      command: this.getCommand(),
      description: this.description,
      platform: this.platform,
      timeout: this.timeout,
      retries: this.retries,
      continueOnFailure: this.continueOnFailure,
      isTypeScriptStep: this.isTypeScriptStep(),
    };
  }
}

export abstract class PreCondition {
  public readonly id: string;
  public readonly name: string;
  public readonly description?: string;
  public readonly platform?: Platform;
  public readonly timeout?: number;
  public readonly retries?: number;

  constructor(
    id: string,
    name: string,
    options: {
      description?: string;
      platform?: Platform;
      timeout?: number;
      retries?: number;
    } = {},
  ) {
    this.id = id;
    this.name = name;
    this.description = options.description;
    this.platform = options.platform;
    this.timeout = options.timeout;
    this.retries = options.retries;
  }

  abstract getCommand(): string;

  abstract validateParameters(): string[];

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      command: this.getCommand(),
      description: this.description,
      platform: this.platform,
      timeout: this.timeout,
      retries: this.retries,
    };
  }
}

export abstract class Test {
  public readonly id: string;
  public readonly name: string;
  public readonly description?: string;
  public readonly platform?: Platform;
  public readonly timeout?: number;
  public readonly retries?: number;

  constructor(
    id: string,
    name: string,
    options: {
      description?: string;
      platform?: Platform;
      timeout?: number;
      retries?: number;
    } = {},
  ) {
    this.id = id;
    this.name = name;
    this.description = options.description;
    this.platform = options.platform;
    this.timeout = options.timeout;
    this.retries = options.retries;
  }

  abstract getCommand(): string;

  abstract validateParameters(): string[];

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      command: this.getCommand(),
      description: this.description,
      platform: this.platform,
      timeout: this.timeout,
      retries: this.retries,
    };
  }
}


