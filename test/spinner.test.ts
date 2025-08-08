import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { Spinner } from "../spinner.ts";

Deno.test("Spinner constructor", () => {
  const spinner = new Spinner("Test message");
  assertEquals(spinner instanceof Spinner, true);
});

Deno.test("Spinner start and stop", () => {
  const spinner = new Spinner("Test message");

  // Mock the stdout.writeSync to capture output
  const originalWriteSync = Deno.stdout.writeSync;
  const capturedOutput: Uint8Array[] = [];

  Deno.stdout.writeSync = (data: Uint8Array) => {
    capturedOutput.push(data);
    return data.length;
  };

  try {
    spinner.start();
    spinner.stop(true);

    // Verify that some output was captured
    assertEquals(capturedOutput.length > 0, true);
  } finally {
    // Restore original function
    Deno.stdout.writeSync = originalWriteSync;
  }
});

Deno.test("Spinner updateMessage", () => {
  const spinner = new Spinner("Initial message");

  // Mock the stdout.writeSync to capture output
  const originalWriteSync = Deno.stdout.writeSync;
  const capturedOutput: Uint8Array[] = [];

  Deno.stdout.writeSync = (data: Uint8Array) => {
    capturedOutput.push(data);
    return data.length;
  };

  try {
    spinner.start();
    spinner.updateMessage("Updated message");
    spinner.stop(true);

    // Verify that some output was captured
    assertEquals(capturedOutput.length > 0, true);
  } finally {
    // Restore original function
    Deno.stdout.writeSync = originalWriteSync;
  }
});

Deno.test("Spinner stop with failure", () => {
  const spinner = new Spinner("Test message");

  // Mock the stdout.writeSync to capture output
  const originalWriteSync = Deno.stdout.writeSync;
  const capturedOutput: Uint8Array[] = [];

  Deno.stdout.writeSync = (data: Uint8Array) => {
    capturedOutput.push(data);
    return data.length;
  };

  try {
    spinner.start();
    spinner.stop(false);

    // Verify that some output was captured
    assertEquals(capturedOutput.length > 0, true);
  } finally {
    // Restore original function
    Deno.stdout.writeSync = originalWriteSync;
  }
});

Deno.test("Spinner stop without showing message", () => {
  const spinner = new Spinner("Test message");

  // Mock the stdout.writeSync to capture output
  const originalWriteSync = Deno.stdout.writeSync;
  const capturedOutput: Uint8Array[] = [];

  Deno.stdout.writeSync = (data: Uint8Array) => {
    capturedOutput.push(data);
    return data.length;
  };

  try {
    spinner.start();
    spinner.stop(true, false);

    // Verify that some output was captured
    assertEquals(capturedOutput.length > 0, true);
  } finally {
    // Restore original function
    Deno.stdout.writeSync = originalWriteSync;
  }
});
