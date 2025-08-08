import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { PipelineExecutor } from "../executor.ts";
import { type Run, type Step } from "../types.ts";

// Mock executable function for testing
const mockExecutableFunction = (
  command: string,
  _timeout?: number,
): Promise<{ success: boolean; output: string; error?: string }> => {
  if (command.includes("success")) {
    return Promise.resolve({ success: true, output: "Success output" });
  } else if (command.includes("failure")) {
    return Promise.resolve({ success: false, output: "", error: "Command failed" });
  } else {
    return Promise.resolve({ success: true, output: "Default output" });
  }
};

Deno.test("PipelineExecutor constructor", () => {
  const executor = new PipelineExecutor(true);
  assertEquals(executor instanceof PipelineExecutor, true);
});

Deno.test("PipelineExecutor with custom executable function", () => {
  const executor = new PipelineExecutor(false, mockExecutableFunction);
  assertEquals(executor instanceof PipelineExecutor, true);
});

Deno.test("Execute step with retries - success", async () => {
  const executor = new PipelineExecutor(false, mockExecutableFunction);
  const step: Step = {
    id: "test-step",
    name: "Test Step",
    command: "echo success",
    retries: 2,
  };

  const result = await executor.executeStepWithRetries(step);
  assertEquals(result.stepId, "test-step");
  assertEquals(result.success, true);
  assertEquals(result.output, "Success output");
  assertEquals(result.retryCount, 0);
  assertExists(result.duration);
});

Deno.test("Execute step with retries - failure", async () => {
  const executor = new PipelineExecutor(false, mockExecutableFunction);
  const step: Step = {
    id: "test-step",
    name: "Test Step",
    command: "echo failure",
    retries: 2,
  };

  const result = await executor.executeStepWithRetries(step);
  assertEquals(result.stepId, "test-step");
  assertEquals(result.success, false);
  assertEquals(result.error, "Command failed");
  assertEquals(result.retryCount, 2);
  assertExists(result.duration);
});

Deno.test("Execute step with continueOnFailure", async () => {
  const executor = new PipelineExecutor(false, mockExecutableFunction);
  const step: Step = {
    id: "test-step",
    name: "Test Step",
    command: "echo failure",
    continueOnFailure: true,
  };

  const result = await executor.executeStepWithRetries(step);
  assertEquals(result.stepId, "test-step");
  assertEquals(result.success, false);
});

Deno.test("Execute run - complete pipeline", async () => {
  const executor = new PipelineExecutor(false, mockExecutableFunction);
  const run: Run = {
    id: "test-run",
    name: "Test Run",
    platform: "linux",
    preConditions: [
      {
        id: "pre-1",
        name: "PreCondition 1",
        command: "echo success",
      },
    ],
    steps: [
      {
        id: "step-1",
        name: "Step 1",
        command: "echo success",
      },
    ],
    tests: [
      {
        id: "test-1",
        name: "Test 1",
        command: "echo success",
      },
    ],
  };

  const result = await executor.executeRun(run);
  assertEquals(result.runId, "test-run");
  assertEquals(result.success, true);
  assertEquals(result.preConditionResults.length, 1);
  assertEquals(result.stepResults.length, 1);
  assertEquals(result.testResults.length, 1);
  assertEquals(result.preConditionResults[0].success, true);
  assertEquals(result.stepResults[0].success, true);
  assertEquals(result.testResults[0].success, true);
  assertExists(result.totalDuration);
  assertExists(result.startTime);
  assertExists(result.endTime);
});

Deno.test("Execute run - platform filtering", async () => {
  const executor = new PipelineExecutor(false, mockExecutableFunction);
  const run: Run = {
    id: "test-run",
    name: "Test Run",
    platform: "fedora",
    steps: [
      {
        id: "step-1",
        name: "Step 1",
        command: "echo success",
        platform: "fedora",
      },
      {
        id: "step-2",
        name: "Step 2",
        command: "echo success",
        platform: "ubuntu",
      },
    ],
  };

  const result = await executor.executeRun(run);
  assertEquals(result.runId, "test-run");
  assertEquals(result.success, true);
  assertEquals(result.stepResults.length, 1);
  assertEquals(result.stepResults[0].stepId, "step-1");
});

Deno.test("Execute run - with timeout", async () => {
  const executor = new PipelineExecutor(false, mockExecutableFunction);
  const run: Run = {
    id: "test-run",
    name: "Test Run",
    platform: "linux",
    steps: [
      {
        id: "step-1",
        name: "Step 1",
        command: "echo success",
        timeout: 5000,
      },
    ],
  };

  const result = await executor.executeRun(run);
  assertEquals(result.runId, "test-run");
  assertEquals(result.success, true);
  assertEquals(result.stepResults.length, 1);
});
