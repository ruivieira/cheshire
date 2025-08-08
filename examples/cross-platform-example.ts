#!/usr/bin/env -S deno run --allow-run --allow-read
// This example demonstrates cross-platform usage of Cheshire

import {
  detectPlatform,
  PipelineExecutor,
  type Run,
  setPlatformProvider,
  SimpleStep,
} from "../mod.ts";

// Example of custom platform provider for testing
class TestPlatformProvider {
  getOS(): string {
    return "linux";
  }

  readTextFileSync(path: string): string {
    if (path === "/etc/os-release") {
      return "ID=fedora\nVERSION_ID=38\n";
    }
    return "";
  }

  env(key: string): string | undefined {
    if (typeof (globalThis as any).process !== "undefined") {
      return (globalThis as any).process.env[key];
    }
    return undefined;
  }
}

// Set custom platform provider for testing
setPlatformProvider(new TestPlatformProvider());

// Detect current platform
const platform = detectPlatform();
console.log(`Current platform: ${platform}`);

// Create a simple pipeline
const pipeline: Run = {
  id: "cross-platform-example",
  name: "Cross-Platform Example Pipeline",
  platform: platform,
  steps: [
    new SimpleStep("step1", "Echo Hello", "echo 'Hello from Cheshire!'"),
    new SimpleStep("step2", "Show Platform", `echo "Running on: ${platform}"`),
    new SimpleStep("step3", "List Current Directory", "ls -la"),
  ],
};

// Execute the pipeline
async function main() {
  console.log("🚀 Starting Cross-Platform Example");
  console.log("=".repeat(50));

  const executor = new PipelineExecutor(true); // Enable verbose mode
  const result = await executor.executeRun(pipeline);

  console.log("=".repeat(50));
  console.log(`Pipeline ${result.success ? "✅ succeeded" : "❌ failed"}`);
  console.log(`Total duration: ${result.totalDuration}ms`);
  console.log(`Steps executed: ${result.stepResults.length}`);

  // Show step results
  for (const stepResult of result.stepResults) {
    const status = stepResult.success ? "✅" : "❌";
    console.log(`${status} ${stepResult.stepId}: ${stepResult.duration}ms`);
    if (stepResult.error) {
      console.log(`   Error: ${stepResult.error}`);
    }
  }
}

// Run the example
if (import.meta.main) {
  main().catch(console.error);
}
