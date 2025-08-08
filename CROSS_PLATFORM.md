# Cross-Platform Support

This document explains the cross-platform changes made to Cheshire to support Deno, Bun, and Node.js.

## Changes Made

### 1. Platform Abstraction Layer

Created a platform abstraction layer in `platform.ts` that provides:
- Runtime detection (Deno, Bun, Node.js)
- Cross-platform file system operations
- Environment variable access
- Custom platform provider support

### 2. Command Execution Abstraction

Updated `executor.ts` to support multiple runtimes:
- **Deno**: Uses `Deno.Command` for process execution
- **Bun**: Uses `Bun.spawn` for process execution
- **Node.js**: Uses `child_process.spawn` for process execution

### 3. Cross-Platform I/O

Updated `spinner.ts` and other I/O operations to work across platforms:
- Cross-platform stdout writing
- Runtime-specific implementations

### 4. Package Configuration

Added `package.json` for npm/Bun support:
- ES modules support
- Proper exports configuration
- TypeScript declarations

### 5. CI/CD Integration

Added comprehensive CI testing for all supported platforms:
- **Deno**: Full test suite with coverage
- **Bun**: Cross-platform compatibility tests
- **Node.js**: Cross-platform compatibility tests (Node.js 18, 20, 21)

## Usage Examples

### Deno

```typescript
import { PipelineExecutor, type Run, SimpleStep } from "jsr:@rui/cheshire@^0.2.0";

const pipeline: Run = {
  id: "example",
  name: "Example Pipeline",
  platform: "linux",
  steps: [
    new SimpleStep("step1", "Echo Hello", "echo 'Hello, World!'"),
  ],
};

const executor = new PipelineExecutor();
const result = await executor.executeRun(pipeline);
```

### Bun

```typescript
import { PipelineExecutor, type Run, SimpleStep } from "@rui/cheshire";

const pipeline: Run = {
  id: "example",
  name: "Example Pipeline",
  platform: "linux",
  steps: [
    new SimpleStep("step1", "Echo Hello", "echo 'Hello, World!'"),
  ],
};

const executor = new PipelineExecutor();
const result = await executor.executeRun(pipeline);
```

### Node.js

```typescript
import { PipelineExecutor, type Run, SimpleStep } from "@rui/cheshire";

const pipeline: Run = {
  id: "example",
  name: "Example Pipeline",
  platform: "linux",
  steps: [
    new SimpleStep("step1", "Echo Hello", "echo 'Hello, World!'"),
  ],
};

const executor = new PipelineExecutor();
const result = await executor.executeRun(pipeline);
```

## Platform Detection

The library automatically detects the current platform:

```typescript
import { detectPlatform, setPlatformProvider } from "@rui/cheshire";

// Automatic detection
const platform = detectPlatform();
console.log(`Current platform: ${platform}`);

// Custom platform provider (for testing)
setPlatformProvider({
  getOS: () => "linux",
  readTextFileSync: (path: string) => "ID=fedora",
  env: (key: string) => process.env[key],
});
```

## Testing

### Local Testing

Run tests with the appropriate runtime:

```bash
# Deno
deno test -A

# Bun
bun run test/simple-cross-platform.test.ts

# Node.js
node test/simple-cross-platform.test.ts
```

### CI Testing

The CI pipeline automatically tests all supported platforms:

1. **Deno**: Full test suite with coverage reporting
2. **Bun**: Cross-platform compatibility tests
3. **Node.js**: Cross-platform compatibility tests (Node.js 18, 20, 21)

### Test Structure

- `test/cross-platform.test.ts`: Deno-specific tests
- `test/simple-cross-platform.test.ts`: Cross-platform tests that work on all runtimes
- `test/node-compatible.test.ts`: Node.js-specific tests (if needed)

## Building for Distribution

### Deno (JSR)

```bash
# Publish to JSR
deno publish
```

### npm

```bash
# Build and publish to npm
npm run build
npm publish
```

### Bun

```bash
# Publish to Bun registry
bun publish
```

## Compatibility Notes

- **Deno**: Requires `--allow-run` permission for command execution
- **Bun**: Native support for TypeScript and ES modules
- **Node.js**: Requires Node.js 18+ for ES modules support

## Future Enhancements

1. **WebAssembly Support**: Add WASM runtime support
2. **Cloud Functions**: Optimize for serverless environments
3. **Docker Integration**: Add Docker container support
4. **Plugin System**: Allow custom platform providers
5. **Extended Testing**: Add more comprehensive tests for each platform
6. **Performance Testing**: Add performance benchmarks across platforms
