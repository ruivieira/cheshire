import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { PipelineExecutor } from "../executor.ts";
import { type Run } from "../types.ts";

// Mock executable function for integration testing
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

Deno.test("Integration Tests", async (t) => {
  await t.step("Complete pipeline execution", async () => {
    const executor = new PipelineExecutor(false, mockExecutableFunction);
    const run: Run = {
      id: "integration-test",
      name: "Integration Test Pipeline",
      description: "A complete pipeline test with platform-specific steps",
      platform: "fedora",
      preConditions: [
        {
          id: "check-docker",
          name: "Check Docker",
          command: "docker --version",
          description: "Verify Docker is installed",
        },
      ],
      steps: [
        {
          id: "step-1",
          name: "Step 1",
          command: "echo success",
          description: "First step",
          platform: "fedora",
        },
        {
          id: "step-2",
          name: "Step 2",
          command: "echo success",
          description: "Second step",
        },
      ],
      tests: [
        {
          id: "test-1",
          name: "Test 1",
          command: "echo success",
          description: "First test",
        },
      ],
    };

    const result = await executor.executeRun(run);
    assertEquals(result.runId, "integration-test");
    assertEquals(result.success, true);
    assertEquals(result.preConditionResults.length, 1);
    assertEquals(result.stepResults.length, 2);
    assertEquals(result.testResults.length, 1);
    assertExists(result.totalDuration);
    assertExists(result.startTime);
    assertExists(result.endTime);
  });

  await t.step("Platform filtering", async () => {
    const executor = new PipelineExecutor(false, mockExecutableFunction);
    const run: Run = {
      id: "platform-test",
      name: "Platform Test",
      platform: "fedora",
      steps: [
        {
          id: "fedora-step",
          name: "Fedora Step",
          command: "echo success",
          platform: "fedora",
        },
        {
          id: "ubuntu-step",
          name: "Ubuntu Step",
          command: "echo success",
          platform: "ubuntu",
        },
      ],
    };

    const result = await executor.executeRun(run);
    assertEquals(result.runId, "platform-test");
    assertEquals(result.success, true);
    assertEquals(result.stepResults.length, 1);
    assertEquals(result.stepResults[0].stepId, "fedora-step");
  });

  await t.step("Step with retries", async () => {
    const executor = new PipelineExecutor(false, mockExecutableFunction);
    const run: Run = {
      id: "retry-test",
      name: "Retry Test",
      platform: "linux",
      steps: [
        {
          id: "retry-step",
          name: "Retry Step",
          command: "echo success",
          retries: 3,
        },
      ],
    };

    const result = await executor.executeRun(run);
    assertEquals(result.runId, "retry-test");
    assertEquals(result.success, true);
    assertEquals(result.stepResults.length, 1);
    assertEquals(result.stepResults[0].retryCount, 0);
  });

  await t.step("Step with continueOnFailure", async () => {
    const executor = new PipelineExecutor(false, mockExecutableFunction);
    const run: Run = {
      id: "continue-test",
      name: "Continue Test",
      platform: "linux",
      steps: [
        {
          id: "fail-step",
          name: "Fail Step",
          command: "echo failure",
          continueOnFailure: true,
        },
        {
          id: "success-step",
          name: "Success Step",
          command: "echo success",
        },
      ],
    };

    const result = await executor.executeRun(run);
    assertEquals(result.runId, "continue-test");
    assertEquals(result.success, true);
    assertEquals(result.stepResults.length, 2);
    assertEquals(result.stepResults[0].success, false);
    assertEquals(result.stepResults[1].success, true);
  });
});
