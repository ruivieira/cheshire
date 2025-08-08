import { Step, Test } from "./step.ts";
import { type Platform } from "./types.ts";

export class SimpleStep extends Step {
  private readonly command: string;
  constructor(
    id: string,
    name: string,
    command: string,
    options: {
      description?: string;
      platform?: Platform;
      timeout?: number;
      retries?: number;
      continueOnFailure?: boolean;
    } = {},
  ) {
    super(id, name, options);
    this.command = command;
  }
  getCommand(): string {
    return this.command;
  }
  validateParameters(): string[] {
    return [];
  }
}

export class TemplateStep extends Step {
  private readonly template: string;
  private readonly parameters: Record<string, string | number | boolean>;
  private readonly defaults: Record<string, string | number | boolean>;
  constructor(
    id: string,
    name: string,
    template: string,
    parameters: Record<string, string | number | boolean> = {},
    defaults: Record<string, string | number | boolean> = {},
    options: {
      description?: string;
      platform?: Platform;
      timeout?: number;
      retries?: number;
      continueOnFailure?: boolean;
    } = {},
  ) {
    super(id, name, options);
    this.template = template;
    this.parameters = parameters;
    this.defaults = defaults;
  }
  getCommand(): string {
    const mergedParams = { ...this.defaults, ...this.parameters };
    let result = this.template;
    for (const [key, value] of Object.entries(mergedParams)) {
      const pattern = new RegExp(`\\$\\{${key}\\}`, "g");
      result = result.replace(pattern, String(value));
    }
    for (const [key, value] of Object.entries(mergedParams)) {
      const pattern = new RegExp(`\\$${key}(?![a-zA-Z0-9_])`, "g");
      result = result.replace(pattern, String(value));
    }
    return result;
  }
  validateParameters(): string[] {
    const mergedParams = { ...this.defaults, ...this.parameters };
    const requiredParams = this.extractParameterNames(this.template);
    const missingParams: string[] = [];
    for (const param of requiredParams) {
      if (!(param in mergedParams)) {
        missingParams.push(param);
      }
    }
    return missingParams;
  }
  private extractParameterNames(template: string): string[] {
    const params = new Set<string>();

    // Extract ${param} syntax
    const curlyPattern = /\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
    let match;
    while ((match = curlyPattern.exec(template)) !== null) {
      params.add(match[1]);
    }

    // Extract $param syntax (but not $0, $1, etc. which are shell variables)
    const simplePattern = /\$([a-zA-Z_][a-zA-Z0-9_]*)(?![a-zA-Z0-9_])/g;
    while ((match = simplePattern.exec(template)) !== null) {
      params.add(match[1]);
    }

    return Array.from(params);
  }
}

export class PackageInstallStep extends Step {
  private readonly packageName: string;
  private readonly version?: string;
  private readonly packageManager: "dnf" | "apt" | "brew" | "yum";
  constructor(
    id: string,
    name: string,
    packageName: string,
    packageManager: "dnf" | "apt" | "brew" | "yum" = "dnf",
    version?: string,
    options: {
      description?: string;
      platform?: Platform;
      timeout?: number;
      retries?: number;
      continueOnFailure?: boolean;
    } = {},
  ) {
    super(id, name, options);
    this.packageName = packageName;
    this.version = version;
    this.packageManager = packageManager;
  }
  getCommand(): string {
    const versionSuffix = this.version ? `==${this.version}` : "";
    switch (this.packageManager) {
      case "dnf":
      case "yum":
        return `sudo ${this.packageManager} install -y ${this.packageName}${versionSuffix}`;
      case "apt":
        return `sudo apt-get install -y ${this.packageName}${versionSuffix}`;
      case "brew":
        return `brew install ${this.packageName}${versionSuffix}`;
      default:
        throw new Error(`Unsupported package manager: ${this.packageManager}`);
    }
  }
  validateParameters(): string[] {
    return [];
  }
}

export class DockerStep extends Step {
  private readonly image: string;
  private readonly tag: string;
  private readonly containerName?: string;
  private readonly port?: string;
  private readonly environment?: Record<string, string>;
  private readonly volumes?: string[];
  private readonly command?: string;
  constructor(
    id: string,
    name: string,
    image: string,
    tag: string = "latest",
    options: {
      containerName?: string;
      port?: string;
      environment?: Record<string, string>;
      volumes?: string[];
      command?: string;
      description?: string;
      platform?: Platform;
      timeout?: number;
      retries?: number;
      continueOnFailure?: boolean;
    } = {},
  ) {
    super(id, name, options);
    this.image = image;
    this.tag = tag;
    this.containerName = options.containerName;
    this.port = options.port;
    this.environment = options.environment;
    this.volumes = options.volumes;
    this.command = options.command;
  }
  getCommand(): string {
    let cmd = "docker run";
    if (this.containerName) {
      cmd += ` --name ${this.containerName}`;
    }
    if (this.port) {
      cmd += ` -p ${this.port}:${this.port}`;
    }
    if (this.environment) {
      for (const [key, value] of Object.entries(this.environment)) {
        cmd += ` -e ${key}=${value}`;
      }
    }
    if (this.volumes) {
      for (const volume of this.volumes) {
        cmd += ` -v ${volume}`;
      }
    }
    cmd += ` ${this.image}:${this.tag}`;
    if (this.command) {
      cmd += ` ${this.command}`;
    }
    return cmd;
  }
  validateParameters(): string[] {
    return [];
  }
}

export class ShellStep extends Step {
  private readonly command: string;
  private readonly environment: Record<string, string>;
  constructor(
    id: string,
    name: string,
    command: string,
    environment: Record<string, string> = {},
    options: {
      description?: string;
      platform?: Platform;
      timeout?: number;
      retries?: number;
      continueOnFailure?: boolean;
    } = {},
  ) {
    super(id, name, options);
    this.command = command;
    this.environment = environment;
  }
  getCommand(): string {
    if (Object.keys(this.environment).length === 0) {
      return this.command;
    }
    const envVars = Object.entries(this.environment).map(([key, value]) => `${key}=${value}`).join(
      " ",
    );
    return `${envVars} ${this.command}`;
  }
  validateParameters(): string[] {
    return [];
  }
}

export class SimpleTest extends Test {
  private readonly command: string;
  constructor(
    id: string,
    name: string,
    command: string,
    options: {
      description?: string;
      platform?: Platform;
      timeout?: number;
      retries?: number;
    } = {},
  ) {
    super(id, name, options);
    this.command = command;
  }
  getCommand(): string {
    return this.command;
  }
  validateParameters(): string[] {
    return [];
  }
}

export class TemplateTest extends Test {
  private readonly template: string;
  private readonly parameters: Record<string, string | number | boolean>;
  private readonly defaults: Record<string, string | number | boolean>;
  constructor(
    id: string,
    name: string,
    template: string,
    parameters: Record<string, string | number | boolean> = {},
    defaults: Record<string, string | number | boolean> = {},
    options: {
      description?: string;
      platform?: Platform;
      timeout?: number;
      retries?: number;
    } = {},
  ) {
    super(id, name, options);
    this.template = template;
    this.parameters = parameters;
    this.defaults = defaults;
  }
  getCommand(): string {
    const mergedParams = { ...this.defaults, ...this.parameters };
    let result = this.template;
    for (const [key, value] of Object.entries(mergedParams)) {
      const pattern = new RegExp(`\\$\\{${key}\\}`, "g");
      result = result.replace(pattern, String(value));
    }
    for (const [key, value] of Object.entries(mergedParams)) {
      const pattern = new RegExp(`\\$${key}(?![a-zA-Z0-9_])`, "g");
      result = result.replace(pattern, String(value));
    }
    return result;
  }
  validateParameters(): string[] {
    const mergedParams = { ...this.defaults, ...this.parameters };
    const requiredParams = this.extractParameterNames(this.template);
    const missingParams: string[] = [];
    for (const param of requiredParams) {
      if (!(param in mergedParams)) {
        missingParams.push(param);
      }
    }
    return missingParams;
  }
  private extractParameterNames(template: string): string[] {
    const params = new Set<string>();

    // Extract ${param} syntax
    const curlyPattern = /\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
    let match;
    while ((match = curlyPattern.exec(template)) !== null) {
      params.add(match[1]);
    }

    // Extract $param syntax (but not $0, $1, etc. which are shell variables)
    const simplePattern = /\$([a-zA-Z_][a-zA-Z0-9_]*)(?![a-zA-Z0-9_])/g;
    while ((match = simplePattern.exec(template)) !== null) {
      params.add(match[1]);
    }

    return Array.from(params);
  }
}
