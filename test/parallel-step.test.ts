import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { ParallelStep, SimpleStep } from "../steps.ts";
import { PipelineExecutor } from "../executor.ts";

/**
 * Test suite for ParallelStep functionality.
 *
 * These tests verify that parallel steps execute correctly, handle failures
 * appropriately, and provide the expected interface and behaviour.
 */

Deno.test("ParallelStep - executes steps in parallel", async () => {
  const startTime = Date.now();

  // Create steps with different sleep durations
  const step1 = new SimpleStep("step1", "Fast step", "echo 'Fast step' && sleep 1");
  const step2 = new SimpleStep("step2", "Slow step", "echo 'Slow step' && sleep 3");
  const step3 = new SimpleStep("step3", "Medium step", "echo 'Medium step' && sleep 2");

  const parallelStep = new ParallelStep("parallel", "Parallel execution", [step1, step2, step3]);

  const executor = new PipelineExecutor(false); // Non-verbose for testing
  const result = await executor.executeStepWithRetries(parallelStep);

  const endTime = Date.now();
  const duration = endTime - startTime;

  // All steps should succeed
  assertEquals(result.success, true);
  assertExists(result.output);

  // The total duration should be approximately the longest step (3 seconds)
  // Allow some tolerance for overhead
  assertEquals(duration >= 3000, true);
  assertEquals(duration <= 5000, true); // Should not take much longer than 3 seconds
});

Deno.test("ParallelStep - handles step failures", async () => {
  const step1 = new SimpleStep("step1", "Successful step", "echo 'Success'");
  const step2 = new SimpleStep("step2", "Failing step", "echo 'Failure' && exit 1");
  const step3 = new SimpleStep("step3", "Another successful step", "echo 'Success 2'");

  const parallelStep = new ParallelStep("parallel", "Parallel with failure", [step1, step2, step3]);

  const executor = new PipelineExecutor(false);
  const result = await executor.executeStepWithRetries(parallelStep);

  // Should fail because one step failed
  assertEquals(result.success, false);
  assertExists(result.error);
});

Deno.test("ParallelStep - validates parameters correctly", () => {
  const step1 = new SimpleStep("step1", "Valid step", "echo 'valid'");
  const step2 = new SimpleStep("step2", "Another valid step", "echo 'also valid'");

  const parallelStep = new ParallelStep("parallel", "Valid parallel", [step1, step2]);

  const validationErrors = parallelStep.validateParameters();
  assertEquals(validationErrors.length, 0);
});

Deno.test("ParallelStep - returns correct command description", () => {
  const step1 = new SimpleStep("step1", "Step 1", "echo 'step1'");
  const step2 = new SimpleStep("step2", "Step 2", "echo 'step2'");

  const parallelStep = new ParallelStep("parallel", "Parallel steps", [step1, step2]);

  assertEquals(parallelStep.getCommand(), "parallel execution of 2 steps");
});

Deno.test("ParallelStep - identifies as TypeScript step", () => {
  const step1 = new SimpleStep("step1", "Step 1", "echo 'step1'");
  const parallelStep = new ParallelStep("parallel", "Parallel steps", [step1]);

  assertEquals(parallelStep.isTypeScriptStep(), true);
});
