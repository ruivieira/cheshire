import { type Platform } from "./types.ts";

export function detectPlatform(): Platform {
  const os = Deno.build.os;
  if (os === "linux") {
    try {
      const osRelease = Deno.readTextFileSync("/etc/os-release");
      if (osRelease.includes("ID=fedora")) return "fedora";
      if (osRelease.includes("ID=ubuntu")) return "ubuntu";
      if (osRelease.includes("ID=debian")) return "debian";
      if (osRelease.includes("ID=centos")) return "centos";
      if (osRelease.includes("ID=rhel") || osRelease.includes("ID=\"rhel\"")) return "rhel";
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



