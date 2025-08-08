import { PipelineExecutor, SimpleStep, TemplateStep, type Run, type ExecutableFunction } from "./mod.ts";

// Example of a custom executable function that could use your own run implementation
const customExecutable: ExecutableFunction = async (command: string, timeout?: number) => {
  console.log(`[Custom Executor] Running: ${command}`);
  
  try {
    const { success, stdout, stderr } = await new Deno.Command("sh", {
      args: ["-c", command],
      stdout: "piped",
      stderr: "piped",
    }).output();

    const output = new TextDecoder().decode(stdout);
    const error = new TextDecoder().decode(stderr);

    return {
      success,
      output: output.trim(),
      error: error.trim() || (success ? undefined : "Command failed with exit code"),
    };
  } catch (err) {
    return {
      success: false,
      output: "",
      error: err instanceof Error ? err.message : String(err),
    };
  }
};

// Example pipeline
const pipeline: Run = {
  id: "example-pipeline",
  name: "Example Pipeline",
  platform: "linux",
  steps: [
    new SimpleStep("step1", "Echo Hello", "echo 'Hello, World!'"),
    new TemplateStep(
      "step2",
      "Greet User",
      "echo 'Hello, ${name}! Welcome to ${project}.'",
      { name: "Alice", project: "Cheshire" }
    ),
    new SimpleStep("step3", "List Files", "ls -la"),
  ],
};

// Run the pipeline with custom executable function
async function runExample() {
  console.log("Running pipeline with custom executable function...\n");
  
  const executor = new PipelineExecutor(true, customExecutable);
  const result = await executor.executeRun(pipeline);
  
  console.log(`\n📊 Pipeline Results for: ${pipeline.name}`);
  console.log(`Overall Success: ${result.success ? '✅ Yes' : '❌ No'}`);
  console.log(`Total Duration: ${result.totalDuration}ms`);
  
  if (!result.success && result.error) {
    console.log(`Error: ${result.error}`);
  }
  
  console.log('\n📋 Step Results:');
  result.stepResults.forEach((stepResult, index) => {
    const step = pipeline.steps[index];
    console.log(
      `${stepResult.success ? '✅' : '❌'} ${step.name}: ${stepResult.duration}ms`
    );
    if (!stepResult.success && stepResult.error) {
      console.log(`  Error: ${stepResult.error}`);
    }
  });
}

// Run the example if this file is executed directly
if (import.meta.main) {
  await runExample();
}
