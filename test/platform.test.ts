import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import {
  detectPlatform,
  getPlatformDisplayName,
  getPlatformFamily,
  isPlatformCompatible,
} from "../platform.ts";
import { type Platform } from "../types.ts";

Deno.test("Platform detection - returns valid platform", () => {
  const platform = detectPlatform();
  const validPlatforms: Platform[] = [
    "fedora",
    "mac",
    "ubuntu",
    "debian",
    "centos",
    "rhel",
    "windows",
    "linux",
    "unix",
  ];
  assertEquals(validPlatforms.includes(platform), true);
});

Deno.test("Platform family - linux returns all linux variants", () => {
  const family = getPlatformFamily("linux");
  assertEquals(family.sort(), ["centos", "debian", "fedora", "rhel", "ubuntu"].sort());
});

Deno.test("Platform family - unix returns all unix variants", () => {
  const family = getPlatformFamily("unix");
  assertEquals(family.sort(), ["centos", "debian", "fedora", "mac", "rhel", "ubuntu"].sort());
});

Deno.test("Platform family - specific platform returns itself", () => {
  const family = getPlatformFamily("fedora");
  assertEquals(family, ["fedora"]);
});

Deno.test("Platform family - mac returns itself", () => {
  const family = getPlatformFamily("mac");
  assertEquals(family, ["mac"]);
});

Deno.test("Platform family - windows returns itself", () => {
  const family = getPlatformFamily("windows");
  assertEquals(family, ["windows"]);
});

Deno.test("Platform compatibility - same platform", () => {
  const compatible = isPlatformCompatible("fedora", "fedora");
  assertEquals(compatible, true);
});

Deno.test("Platform compatibility - linux with fedora", () => {
  const compatible = isPlatformCompatible("fedora", "linux");
  assertEquals(compatible, true);
});

Deno.test("Platform compatibility - fedora with linux", () => {
  const compatible = isPlatformCompatible("linux", "fedora");
  assertEquals(compatible, false);
});

Deno.test("Platform compatibility - no platform specified", () => {
  const compatible = isPlatformCompatible("fedora");
  assertEquals(compatible, true);
});

Deno.test("Platform compatibility - incompatible platforms", () => {
  const compatible = isPlatformCompatible("fedora", "windows");
  assertEquals(compatible, false);
});

Deno.test("Platform compatibility - mac with unix", () => {
  const compatible = isPlatformCompatible("mac", "unix");
  assertEquals(compatible, true);
});

Deno.test("Platform display names", () => {
  assertEquals(getPlatformDisplayName("fedora"), "Fedora");
  assertEquals(getPlatformDisplayName("ubuntu"), "Ubuntu");
  assertEquals(getPlatformDisplayName("debian"), "Debian");
  assertEquals(getPlatformDisplayName("centos"), "CentOS");
  assertEquals(getPlatformDisplayName("rhel"), "Red Hat Enterprise Linux");
  assertEquals(getPlatformDisplayName("mac"), "macOS");
  assertEquals(getPlatformDisplayName("windows"), "Windows");
  assertEquals(getPlatformDisplayName("linux"), "Linux");
  assertEquals(getPlatformDisplayName("unix"), "Unix-like");
});
