// deno-lint-ignore-file no-explicit-any
import { type Platform } from "./types.ts";

// Platform abstraction interface
export interface PlatformProvider {
  getOS(): string;
  readTextFileSync(path: string): string;
  env(key: string): string | undefined;
}

// Default platform provider that detects the runtime
class DefaultPlatformProvider implements PlatformProvider {
  getOS(): string {
    // Check for Deno
    if (typeof (globalThis as any).Deno !== "undefined" && (globalThis as any).Deno.build) {
      return (globalThis as any).Deno.build.os;
    }

    // Check for Bun
    if (typeof (globalThis as any).Bun !== "undefined" && (globalThis as any).Bun.platform) {
      return (globalThis as any).Bun.platform;
    }

    // Check for Node.js
    if (
      typeof (globalThis as any).process !== "undefined" && (globalThis as any).process.platform
    ) {
      const platform = (globalThis as any).process.platform;
      if (platform === "win32") return "windows";
      if (platform === "darwin") return "darwin";
      return "linux";
    }

    return "unix";
  }

  readTextFileSync(path: string): string {
    // Check for Deno
    if (
      typeof (globalThis as any).Deno !== "undefined" && (globalThis as any).Deno.readTextFileSync
    ) {
      try {
        return (globalThis as any).Deno.readTextFileSync(path);
      } catch {
        return "";
      }
    }

    // Check for Bun
    if (typeof (globalThis as any).Bun !== "undefined" && (globalThis as any).Bun.file) {
      try {
        const file = (globalThis as any).Bun.file(path);
        return file.textSync();
      } catch {
        return "";
      }
    }

    // Check for Node.js
    if (typeof (globalThis as any).require !== "undefined") {
      try {
        const fs = (globalThis as any).require("node:fs");
        return fs.readFileSync(path, "utf8");
      } catch {
        return "";
      }
    }

    return "";
  }

  env(key: string): string | undefined {
    // Check for Deno
    if (typeof (globalThis as any).Deno !== "undefined" && (globalThis as any).Deno.env) {
      return (globalThis as any).Deno.env.get(key);
    }

    // Check for Bun
    if (typeof (globalThis as any).Bun !== "undefined" && (globalThis as any).Bun.env) {
      return (globalThis as any).Bun.env[key];
    }

    // Check for Node.js
    if (typeof (globalThis as any).process !== "undefined" && (globalThis as any).process.env) {
      return (globalThis as any).process.env[key];
    }

    return undefined;
  }
}

let platformProvider: PlatformProvider = new DefaultPlatformProvider();

export function setPlatformProvider(provider: PlatformProvider): void {
  platformProvider = provider;
}

export function detectPlatform(): Platform {
  const os = platformProvider.getOS();
  if (os === "linux") {
    try {
      const osRelease = platformProvider.readTextFileSync("/etc/os-release");
      if (osRelease.includes("ID=fedora")) return "fedora";
      if (osRelease.includes("ID=ubuntu")) return "ubuntu";
      if (osRelease.includes("ID=debian")) return "debian";
      if (osRelease.includes("ID=centos")) return "centos";
      if (osRelease.includes("ID=rhel") || osRelease.includes('ID="rhel"')) return "rhel";
    } catch {
      // fall through
    }
    return "linux";
  } else if (os === "darwin") {
    return "mac";
  } else if (os === "windows") {
    return "windows";
  }
  return "unix";
}

export function getPlatformFamily(platform: Platform): Platform[] {
  switch (platform) {
    case "linux":
      return ["fedora", "ubuntu", "debian", "centos", "rhel"];
    case "unix":
      return ["fedora", "ubuntu", "debian", "centos", "rhel", "mac"];
    case "fedora":
    case "ubuntu":
    case "debian":
    case "centos":
    case "rhel":
    case "mac":
    case "windows":
      return [platform];
    default:
      return [];
  }
}

export function isPlatformCompatible(targetPlatform: Platform, stepPlatform?: Platform): boolean {
  if (!stepPlatform) return true;
  if (targetPlatform === stepPlatform) return true;
  const stepFamily = getPlatformFamily(stepPlatform);
  return stepFamily.includes(targetPlatform);
}

export function getPlatformDisplayName(platform: Platform): string {
  switch (platform) {
    case "fedora":
      return "Fedora";
    case "ubuntu":
      return "Ubuntu";
    case "debian":
      return "Debian";
    case "centos":
      return "CentOS";
    case "rhel":
      return "Red Hat Enterprise Linux";
    case "mac":
      return "macOS";
    case "windows":
      return "Windows";
    case "linux":
      return "Linux";
    case "unix":
      return "Unix-like";
    default:
      return platform;
  }
}
