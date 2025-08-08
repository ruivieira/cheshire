# Cheshire
[![tests](https://github.com/ruivieira/cheshire/actions/workflows/ci.yml/badge.svg)](https://github.com/ruivieira/cheshire/actions/workflows/ci.yml)

A flexible pipeline execution system for Deno that supports both command-based and TypeScript-based
steps.

## Features

- **Flexible Execution**: Support for both command-based and TypeScript-based steps
- **Platform Compatibility**: Automatic platform detection and filtering
- **Parameter Substitution**: Dynamic parameter replacement in commands
- **Retry Logic**: Configurable retry mechanisms for failed steps
- **Dependency Injection**: Custom executable functions for command execution
- **Real-time Output**: Live command output with spinners and progress indicators

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd cheshire

# Run with Deno
deno run --allow-run --allow-read --allow-write mod.ts
```

## Basic Usage

### Simple Pipeline

```typescript
import { PipelineExecutor, type Run, SimpleStep } from "./mod.ts";

const pipeline: Run = {
  id: "example",
  name: "Example Pipeline",
  platform: "linux",
  steps: [
    new SimpleStep("step1", "Echo Hello", "echo 'Hello, World!'"),
    new SimpleStep("step2", "List Files", "ls -la"),
  ],
};

const executor = new PipelineExecutor();
const result = await executor.executeRun(pipeline);
console.log(`Pipeline ${result.success ? "succeeded" : "failed"}`);
```

### Using Custom Executable Function

You can inject your own command execution logic:

```typescript
import { type ExecutableFunction, PipelineExecutor, type Run, SimpleStep } from "./mod.ts";

// Custom executable function that uses your own run implementation
const customExecutable: ExecutableFunction = async (command: string, timeout?: number) => {
  // Use your own run function from @core.ts
  const { run } = await import("../ubik/src/libs/core.ts");

  const success = await run(command.split(" "));
  return {
    success,
    output: success ? "Command executed successfully" : "Command failed",
    error: success ? undefined : "Command failed with exit code",
  };
};

const pipeline: Run = {
  id: "example",
  name: "Example Pipeline",
  platform: "linux",
  steps: [
    new SimpleStep("step1", "Echo Hello", "echo 'Hello, World!'"),
  ],
};

// Pass the custom executable function to the executor
const executor = new PipelineExecutor(false, customExecutable);
const result = await executor.executeRun(pipeline);
```

### Template Steps with Parameters

```typescript
import { type Run, TemplateStep } from "./mod.ts";

const pipeline: Run = {
  id: "template-example",
  name: "Template Pipeline",
  platform: "linux",
  steps: [
    new TemplateStep(
      "greet",
      "Greet User",
      "echo 'Hello, ${name}! Welcome to ${project}.'",
      { name: "Alice", project: "Cheshire" },
    ),
  ],
};
```

### TypeScript Steps

```typescript
import { type Run, Step } from "./mod.ts";

class CustomTypeScriptStep extends Step {
  constructor() {
    super("custom", "Custom TypeScript Step", {
      description: "A custom TypeScript step",
    });
  }

  getCommand(): string {
    return "echo 'This is a fallback command'";
  }

  async execute(): Promise<{ success: boolean; output?: string; error?: string }> {
    // Custom TypeScript logic here
    const result = await someAsyncOperation();
    return {
      success: result.success,
      output: result.output,
      error: result.error,
    };
  }

  validateParameters(): string[] {
    return [];
  }
}

const pipeline: Run = {
  id: "typescript-example",
  name: "TypeScript Pipeline",
  platform: "linux",
  steps: [new CustomTypeScriptStep()],
};
```

## API Reference

### Core Types

- `Run`: Main pipeline configuration
- `Step`: Base class for pipeline steps
- `PreCondition`: Base class for pre-conditions
- `Test`: Base class for tests
- `ExecutableFunction`: Type for custom command execution functions

### Executor

- `PipelineExecutor`: Main executor class
  - `constructor(verbose?: boolean, executableFunction?: ExecutableFunction)`
  - `executeRun(run: Run): Promise<RunResult>`

### Step Classes

- `SimpleStep`: Basic command step
- `TemplateStep`: Step with parameter substitution
- `PackageInstallStep`: Package installation step
- `DockerStep`: Docker container step
- `ShellStep`: Shell command step

### CLI Functions

- `runPipelineFromFile(filePath: string, executableFunction?: ExecutableFunction)`
- `runPipelineDirectly(pipeline: Run, executableFunction?: ExecutableFunction)`

## Examples

See the `examples/` directory for more detailed examples.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

Apache License 2.0 - see LICENSE file for details.
