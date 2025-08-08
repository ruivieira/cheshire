// Simple cross-platform test that works with Deno, Bun, and Node.js
import { detectPlatform, type PlatformProvider, setPlatformProvider } from "../platform.ts";

// Test function that works across all platforms
function runTests() {
  console.log("🧪 Running cross-platform tests...");

  try {
    // Test 1: Basic platform detection
    const platform = detectPlatform();
    console.log(`✅ Platform detection: ${platform}`);

    // Test 2: Custom provider
    const customProvider: PlatformProvider = {
      getOS: () => "darwin",
      readTextFileSync: () => "",
      env: () => undefined,
    };

    setPlatformProvider(customProvider);
    const customPlatform = detectPlatform();
    console.log(`✅ Custom provider test: ${customPlatform}`);

    // Test 3: Linux Fedora detection
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
    const fedoraPlatform = detectPlatform();
    console.log(`✅ Fedora detection test: ${fedoraPlatform}`);

    // Test 4: Windows detection
    const windowsProvider: PlatformProvider = {
      getOS: () => "windows",
      readTextFileSync: () => "",
      env: () => undefined,
    };

    setPlatformProvider(windowsProvider);
    const windowsPlatform = detectPlatform();
    console.log(`✅ Windows detection test: ${windowsPlatform}`);

    console.log("🎉 All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    if (typeof (globalThis as any).process !== "undefined") {
      (globalThis as any).process.exit(1);
    } else {
      throw error;
    }
  }
}

// Run tests if this file is executed directly
if (
  import.meta.main ||
  (typeof (globalThis as any).process !== "undefined" &&
    (globalThis as any).process.argv[1] === new URL(import.meta.url).pathname)
) {
  runTests();
}

export { runTests };
