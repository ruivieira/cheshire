import {
  type ExecutableFunction,
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
}

if (import.meta.main) {
  main().catch(console.error);
}
