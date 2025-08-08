import {
  type ExecutableFunction,
  ParallelStep,
  PipelineExecutor,
  type Run,
  SimpleStep,
  TemplateStep,
} from "./mod.ts";

// Example of a custom executable function
const customExecutable: ExecutableFunction = (command: string, _timeout?: number) => {
  // This is just an example - in practice you might want to implement
  // actual command execution logic here
  console.log(`Executing: ${command}`);
  return Promise.resolve({ success: true, output: "Example output" });
};

// Example 1: Simple pipeline with basic steps
async function example1() {
  const run: Run = {
    id: "example-1",
    name: "Simple Example",
    platform: "linux",
    steps: [
      new SimpleStep("step-1", "Echo Hello", "echo 'Hello, World!'"),
      new SimpleStep("step-2", "List Files", "ls -la"),
    ],
  };

  const executor = new PipelineExecutor(true);
  const result = await executor.executeRun(run);
  console.log(`Pipeline ${result.success ? "succeeded" : "failed"}`);
}

// Example 2: Pipeline with custom executable function
async function example2() {
  const run: Run = {
    id: "example-2",
    name: "Custom Executable Example",
    platform: "linux",
    steps: [
      new SimpleStep("step-1", "Custom Step", "echo 'Custom execution'"),
    ],
  };

  const executor = new PipelineExecutor(false, customExecutable);
  const result = await executor.executeRun(run);
  console.log(`Pipeline ${result.success ? "succeeded" : "failed"}`);
}

// Example 3: Template step with parameters
async function example3() {
  const run: Run = {
    id: "example-3",
    name: "Template Example",
    platform: "linux",
    steps: [
      new TemplateStep(
        "greeting",
        "Greeting",
        "echo 'Hello, ${name}! Welcome to ${project}.'",
        { name: "Alice", project: "Cheshire" },
      ),
    ],
  };

  const executor = new PipelineExecutor(true);
  const result = await executor.executeRun(run);
  console.log(`Pipeline ${result.success ? "succeeded" : "failed"}`);
}

// Example 4: Custom step implementation
class CustomStep extends SimpleStep {
  constructor(id: string, name: string, command: string) {
    super(id, name, command);
  }

  override execute(): Promise<{ success: boolean; output?: string; error?: string }> {
    // Custom execution logic
    console.log(`Custom execution for step: ${this.name}`);
    return Promise.resolve({ success: true, output: "Custom step executed successfully" });
  }
}

async function example4() {
  const run: Run = {
    id: "example-4",
    name: "Custom Step Example",
    platform: "linux",
    steps: [
      new CustomStep("custom-1", "Custom Step", "echo 'This will be overridden'"),
    ],
  };

  const executor = new PipelineExecutor(true);
  const result = await executor.executeRun(run);
  console.log(`Pipeline ${result.success ? "succeeded" : "failed"}`);
}

// Example 5: Parallel step execution
async function example5() {
  console.log("\n=== Example 5: Parallel Step Execution ===");

  // Create individual steps with different execution times
  const step1 = new SimpleStep(
    "step1",
    "Install package A",
    "echo 'Installing package A' && sleep 2",
  );
  const step2 = new SimpleStep(
    "step2",
    "Install package B",
    "echo 'Installing package B' && sleep 3",
  );
  const step3 = new SimpleStep(
    "step3",
    "Install package C",
    "echo 'Installing package C' && sleep 1",
  );

  // Create a parallel step that executes all three steps simultaneously
  // This will complete in ~3 seconds (longest step) instead of 6 seconds (sequential)
  const parallelStep = new ParallelStep("parallel-install", "Install packages in parallel", [
    step1,
    step2,
    step3,
  ], {
    description: "Installs multiple packages simultaneously to save time",
  });

  // Create a step that runs after the parallel execution
  const finalStep = new SimpleStep(
    "final",
    "Final setup",
    "echo 'All packages installed, performing final setup'",
  );

  // Execute the parallel step with verbose output to see the execution flow
  const executor = new PipelineExecutor(true);

  console.log("Executing parallel step...");
  const result = await executor.executeStepWithRetries(parallelStep);

  console.log(`Parallel step result: ${result.success ? "SUCCESS" : "FAILED"}`);
  if (result.output) {
    console.log("Output:", result.output);
  }
  if (result.error) {
    console.log("Error:", result.error);
  }

  console.log("\nExecuting final step...");
  const finalResult = await executor.executeStepWithRetries(finalStep);
  console.log(`Final step result: ${finalResult.success ? "SUCCESS" : "FAILED"}`);
}

// Example 6: Pipeline with parallel steps
async function example6() {
  console.log("\n=== Example 6: Pipeline with Parallel Steps ===");

  const run: Run = {
    id: "example-6",
    name: "Parallel Pipeline Example",
    platform: "linux",
    steps: [
      new SimpleStep("prep", "Preparation", "echo 'Preparing environment...'"),
      new ParallelStep(
        "parallel-tasks",
        "Execute tasks in parallel",
        [
          new SimpleStep("task1", "Task 1", "echo 'Task 1 completed' && sleep 2"),
          new SimpleStep("task2", "Task 2", "echo 'Task 2 completed' && sleep 1"),
          new SimpleStep("task3", "Task 3", "echo 'Task 3 completed' && sleep 3"),
        ],
        { description: "Executing multiple tasks simultaneously" },
      ),
      new SimpleStep(
        "post",
        "Post-processing",
        "echo 'All tasks completed, performing post-processing'",
      ),
    ],
  };

  const executor = new PipelineExecutor(true);
  const result = await executor.executeRun(run);
  console.log(`Parallel Pipeline ${result.success ? "succeeded" : "failed"}`);
}

// Run all examples
async function main() {
  console.log("=== Example 1: Simple Pipeline ===");
  await example1();

  console.log("\n=== Example 2: Custom Executable ===");
  await example2();

  console.log("\n=== Example 3: Template Step ===");
  await example3();

  console.log("\n=== Example 4: Custom Step ===");
  await example4();

  console.log("\n=== Example 5: Parallel Step Execution ===");
  await example5();

  console.log("\n=== Example 6: Pipeline with Parallel Steps ===");
  await example6();
}

if (import.meta.main) {
  main().catch(console.error);
}
