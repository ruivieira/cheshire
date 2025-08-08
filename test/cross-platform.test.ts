import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { detectPlatform, setPlatformProvider, type PlatformProvider } from "../platform.ts";

Deno.test("Platform detection - Deno runtime", () => {
  const platform = detectPlatform();
  // Should detect a valid platform
  assertEquals(typeof platform, "string");
  assertEquals(platform.length > 0, true);
});

Deno.test("Platform detection - custom provider", () => {
  const customProvider: PlatformProvider = {
    getOS: () => "darwin",
    readTextFileSync: () => "",
    env: () => undefined,
  };
  
  setPlatformProvider(customProvider);
  const platform = detectPlatform();
  assertEquals(platform, "mac");
});

Deno.test("Platform detection - Linux Fedora", () => {
  const fedoraProvider: PlatformProvider = {
    getOS: () => "linux",
    readTextFileSync: (path: string) => {
      if (path === "/etc/os-release") {
        return "ID=fedora\nVERSION_ID=38\n";
      }
      return "";
    },
    env: () => undefined,
  };
  
  setPlatformProvider(fedoraProvider);
  const platform = detectPlatform();
  assertEquals(platform, "fedora");
});

Deno.test("Platform detection - Windows", () => {
  const windowsProvider: PlatformProvider = {
    getOS: () => "windows",
    readTextFileSync: () => "",
    env: () => undefined,
  };
  
  setPlatformProvider(windowsProvider);
  const platform = detectPlatform();
  assertEquals(platform, "windows");
});
