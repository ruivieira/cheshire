// Node.js compatible test file
import { test, describe } from "node:test";
import assert from "node:assert";
import { detectPlatform, setPlatformProvider, type PlatformProvider } from "../platform.ts";

describe("Platform detection - Node.js runtime", () => {
  test("should detect a valid platform", async () => {
    const platform = detectPlatform();
    assert.strictEqual(typeof platform, "string");
    assert.strictEqual(platform.length > 0, true);
  });

  test("should work with custom provider", async () => {
    const customProvider: PlatformProvider = {
      getOS: () => "darwin",
      readTextFileSync: () => "",
      env: () => undefined,
    };
    
    setPlatformProvider(customProvider);
    const platform = detectPlatform();
    assert.strictEqual(platform, "mac");
  });

  test("should detect Linux Fedora", async () => {
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
    assert.strictEqual(platform, "fedora");
  });

  test("should detect Windows", async () => {
    const windowsProvider: PlatformProvider = {
      getOS: () => "windows",
      readTextFileSync: () => "",
      env: () => undefined,
    };
    
    setPlatformProvider(windowsProvider);
    const platform = detectPlatform();
    assert.strictEqual(platform, "windows");
  });
});
