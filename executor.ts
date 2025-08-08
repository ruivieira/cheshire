import {
  type Platform,
  type PreCondition,
  type PreConditionLike,
  type PreConditionResult,
  type Run,
  type RunResult,
  type Step,
  type StepLike,
  type StepResult,
  type Test,
  type TestLike,
  type TestResult,
  type ExecutableFunction,
} from "./types.ts";
import { isPlatformCompatible } from "./platform.ts";
import { substituteParameters, validateParameters } from "./parameters.ts";
import {
  commandText,
  failureText,
  infoText,
  preConditionText,
  runningText,
  stepText,
  successText,
  testText,
  waitingText,
  warningText,
} from "./colours.ts";
import { Spinner } from "./spinner.ts";

async function runVerbose(command: string): Promise<boolean> {
  const process = new Deno.Command("sh", {
    args: ["-c", command],
    stdout: "piped",
    stderr: "piped",
  }).spawn();

  // Stream output to the console in real time
  const stdoutPump = process.stdout.pipeTo(
    new WritableStream<Uint8Array>({
      write: (chunk) => {
        Deno.stdout.writeSync(chunk);
      },
    }),
  );
  const stderrPump = process.stderr.pipeTo(
    new WritableStream<Uint8Array>({
      write: (chunk) => {
        Deno.stderr.writeSync(chunk);
      },
    }),
  );

  await Promise.all([stdoutPump, stderrPump]);
  const status = await process.status;
  return status.success;
}

export class PipelineExecutor {
  private verbose: boolean;
  private executableFunction?: ExecutableFunction;

  constructor(verbose: boolean = false, executableFunction?: ExecutableFunction) {
    this.verbose = verbose;
    this.executableFunction = executableFunction;
  }

  private async executeCommand(
    command: string,
    timeout?: number,
  ): Promise<{ success: boolean; output: string; error?: string }> {
    if (this.verbose) {
      console.log(commandText(`Executing: ${command}`));
    }

    // Use the provided executable function if available
    if (this.executableFunction) {
      return await this.executableFunction(command, timeout);
    }

    // Default implementation
    try {
      if (this.verbose) {
        const success = await runVerbose(command);
        return {
          success,
          output: "",
          error: success ? undefined : "Command failed with exit code",
        };
      } else {
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
      }
    } catch (err) {
      return {
        success: false,
        output: "",
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  private resolveStepCommand(step: StepLike): string {
    if ("getCommand" in step && typeof (step as any).getCommand === "function") {
      return (step as any).getCommand();
    }
    const legacyStep = step as Step;
    if (legacyStep.parameters || legacyStep.parameterDefaults) {
      return substituteParameters(
        legacyStep.command,
        legacyStep.parameters,
        legacyStep.parameterDefaults,
      );
    }
    return legacyStep.command;
  }

  private validateStepParameters(step: StepLike): string[] {
    if ("validateParameters" in step && typeof (step as any).validateParameters === "function") {
      return (step as any).validateParameters();
    }
    const legacyStep = step as Step;
    if (legacyStep.parameters || legacyStep.parameterDefaults) {
      return validateParameters(
        legacyStep.command,
        legacyStep.parameters,
        legacyStep.parameterDefaults,
      );
    }
    return [];
  }

  private resolvePreConditionCommand(preCondition: PreConditionLike): string {
    if (
      "getCommand" in preCondition &&
      typeof (preCondition as any).getCommand === "function"
    ) {
      return (preCondition as any).getCommand();
    }
    const legacyPreCondition = preCondition as PreCondition;
    if (legacyPreCondition.parameters || legacyPreCondition.parameterDefaults) {
      return substituteParameters(
        legacyPreCondition.command,
        legacyPreCondition.parameters,
        legacyPreCondition.parameterDefaults,
      );
    }
    return legacyPreCondition.command;
  }

  private validatePreConditionParameters(
    preCondition: PreConditionLike,
  ): string[] {
    if (
      "validateParameters" in preCondition &&
      typeof (preCondition as any).validateParameters === "function"
    ) {
      return (preCondition as any).validateParameters();
    }
    const legacyPreCondition = preCondition as PreCondition;
    if (legacyPreCondition.parameters || legacyPreCondition.parameterDefaults) {
      return validateParameters(
        legacyPreCondition.command,
        legacyPreCondition.parameters,
        legacyPreCondition.parameterDefaults,
      );
    }
    return [];
  }

  private async executePreConditionWithRetries(
    preCondition: PreConditionLike,
  ): Promise<PreConditionResult> {
    const startTime = Date.now();
    let lastError: string | undefined;
    let retryCount = 0;
    const maxRetries = (preCondition as any).retries || 0;
    let spinner: Spinner | null = null;

    const missingParams = this.validatePreConditionParameters(preCondition);
    if (missingParams.length > 0) {
      const error = `Missing required parameters: ${missingParams.join(", ")}`;
      return {
        preConditionId: (preCondition as any).id,
        success: false,
        output: "",
        error,
        duration: 0,
        retryCount: 0,
      };
    }

    const resolvedCommand = this.resolvePreConditionCommand(preCondition);

    if (this.verbose) {
      console.log(preConditionText(`Checking pre-condition: ${(preCondition as any).name}`));
      if ((preCondition as any).description) {
        console.log(infoText(`  ${(preCondition as any).description}`));
      }
      if (
        "parameters" in preCondition && (preCondition as any).parameters &&
        Object.keys((preCondition as any).parameters).length > 0
      ) {
        console.log(infoText(`  Parameters: ${JSON.stringify((preCondition as any).parameters)}`));
      }
    } else {
      spinner = new Spinner(`Checking: ${(preCondition as any).name}`);
      spinner.start();
    }

    while (retryCount <= maxRetries) {
      if (retryCount > 0) {
        if (this.verbose) {
          console.log(
            waitingText(
              `Retrying pre-condition (attempt ${retryCount + 1}/${maxRetries + 1})...`,
            ),
          );
        } else if (spinner) {
          spinner.updateMessage(`Checking: ${(preCondition as any).name} (retry ${retryCount + 1})`);
        }
      }

      const result = await this.executeCommand(
        resolvedCommand,
        (preCondition as any).timeout,
      );

      if (result.success) {
        const duration = Date.now() - startTime;
        if (this.verbose) {
          console.log(successText(`Pre-condition passed: ${(preCondition as any).name} (${duration}ms)`));
        } else if (spinner) {
          spinner.stop(true, false);
          Deno.stdout.writeSync(new TextEncoder().encode("\r"));
          console.log(preConditionText(`Checking: ${(preCondition as any).name} (${duration}ms)`));
        }
        return {
          preConditionId: (preCondition as any).id,
          success: true,
          output: result.output,
          duration,
          retryCount,
        };
      }

      lastError = result.error;
      retryCount++;

      if (retryCount <= maxRetries) {
        if (this.verbose) {
          console.log(warningText(`Pre-condition failed, retrying in ${Math.pow(2, retryCount)}s...`));
        } else if (spinner) {
          spinner.updateMessage(`Waiting: ${(preCondition as any).name} (retry in ${Math.pow(2, retryCount)}s)`);
        }
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }

    const duration = Date.now() - startTime;
    if (this.verbose) {
      console.log(failureText(`Pre-condition failed: ${(preCondition as any).name} (${duration}ms)`));
      if (lastError) {
        console.log(failureText(`  Error: ${lastError}`));
      }
    } else if (spinner) {
      spinner.stop(false);
      console.log(` (${duration}ms)`);
      if (lastError) {
        console.log(failureText(`    ${lastError}`));
      }
    }

    return {
      preConditionId: (preCondition as any).id,
      success: false,
      output: "",
      error: lastError,
      duration,
      retryCount: retryCount - 1,
    };
  }

  async executeStepWithRetries(step: StepLike): Promise<StepResult> {
    const startTime = Date.now();
    let lastError: string | undefined;
    let retryCount = 0;
    const maxRetries = (step as any).retries || 0;
    let spinner: Spinner | null = null;

    const missingParams = this.validateStepParameters(step);
    if (missingParams.length > 0) {
      const error = `Missing required parameters: ${missingParams.join(", ")}`;
      return {
        stepId: (step as any).id,
        success: false,
        output: "",
        error,
        duration: 0,
        retryCount: 0,
      };
    }

    const isTypeScriptStep = "isTypeScriptStep" in step && (step as any).isTypeScriptStep();

    if (this.verbose) {
      console.log(stepText(`Starting step: ${(step as any).name}`));
      if ((step as any).description) {
        console.log(infoText(`  ${(step as any).description}`));
      }
      if (isTypeScriptStep) {
        console.log(infoText("  TypeScript execution mode"));
      }
      if ("parameters" in step && (step as any).parameters && Object.keys((step as any).parameters).length > 0) {
        console.log(infoText(`  Parameters: ${JSON.stringify((step as any).parameters)}`));
      }
    } else {
      spinner = new Spinner(`${(step as any).name}`);
      spinner.start();
    }

    while (retryCount <= maxRetries) {
      if (retryCount > 0) {
        if (this.verbose) {
          console.log(waitingText(`Retrying step (attempt ${retryCount + 1}/${maxRetries + 1})...`));
        } else if (spinner) {
          spinner.updateMessage(`${(step as any).name} (retry ${retryCount + 1})`);
        }
      }

      let result: { success: boolean; output: string; error?: string };
      if (isTypeScriptStep) {
        try {
          const tsResult = await (step as any).execute();
          result = {
            success: !!tsResult.success,
            output: tsResult.output || "",
            error: tsResult.error,
          };
        } catch (error) {
          result = {
            success: false,
            output: "",
            error: error instanceof Error ? error.message : String(error),
          };
        }
      } else {
        const resolvedCommand = this.resolveStepCommand(step);
        result = await this.executeCommand(resolvedCommand, (step as any).timeout);
      }

      if (result.success) {
        const duration = Date.now() - startTime;
        if (this.verbose) {
          console.log(successText(`Step completed: ${(step as any).name} (${duration}ms)`));
        } else if (spinner) {
          spinner.stop(true);
          console.log(` (${duration}ms)`);
        }
        return {
          stepId: (step as any).id,
          success: true,
          output: result.output,
          duration,
          retryCount,
        };
      }

      lastError = result.error;
      retryCount++;

      if (retryCount <= maxRetries) {
        if (this.verbose) {
          console.log(warningText(`Step failed, retrying in ${Math.pow(2, retryCount)}s...`));
        } else if (spinner) {
          spinner.updateMessage(`Waiting: ${(step as any).name} (retry in ${Math.pow(2, retryCount)}s)`);
        }
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }

    const duration = Date.now() - startTime;
    if (this.verbose) {
      console.log(failureText(`Step failed: ${(step as any).name} (${duration}ms)`));
      if (lastError) {
        console.log(failureText(`  Error: ${lastError}`));
      }
    } else if (spinner) {
      spinner.stop(false);
      console.log(` (${duration}ms)`);
      if (lastError) {
        console.log(failureText(`    ${lastError}`));
      }
    }

    return {
      stepId: (step as any).id,
      success: false,
      output: "",
      error: lastError,
      duration,
      retryCount: retryCount - 1,
    };
  }

  private resolveTestCommand(test: TestLike): string {
    if ("getCommand" in test && typeof (test as any).getCommand === "function") {
      return (test as any).getCommand();
    }
    const legacyTest = test as Test;
    if (legacyTest.parameters || legacyTest.parameterDefaults) {
      return substituteParameters(
        legacyTest.command,
        legacyTest.parameters,
        legacyTest.parameterDefaults,
      );
    }
    return legacyTest.command;
  }

  private validateTestParameters(test: TestLike): string[] {
    if ("validateParameters" in test && typeof (test as any).validateParameters === "function") {
      return (test as any).validateParameters();
    }
    const legacyTest = test as Test;
    if (legacyTest.parameters || legacyTest.parameterDefaults) {
      return validateParameters(
        legacyTest.command,
        legacyTest.parameters,
        legacyTest.parameterDefaults,
      );
    }
    return [];
  }

  private async executeTestWithRetries(test: TestLike): Promise<TestResult> {
    const startTime = Date.now();
    let lastError: string | undefined;
    let retryCount = 0;
    const maxRetries = (test as any).retries || 0;
    let spinner: Spinner | null = null;

    const missingParams = this.validateTestParameters(test);
    if (missingParams.length > 0) {
      const error = `Missing required parameters: ${missingParams.join(", ")}`;
      return {
        testId: (test as any).id,
        success: false,
        output: "",
        error,
        duration: 0,
        retryCount: 0,
      };
    }

    const resolvedCommand = this.resolveTestCommand(test);

    if (this.verbose) {
      console.log(testText(`Starting test: ${(test as any).name}`));
      if ((test as any).description) {
        console.log(infoText(`  ${(test as any).description}`));
      }
      if ("parameters" in test && (test as any).parameters && Object.keys((test as any).parameters).length > 0) {
        console.log(infoText(`  Parameters: ${JSON.stringify((test as any).parameters)}`));
      }
    } else {
      spinner = new Spinner(`Testing: ${(test as any).name}`);
      spinner.start();
    }

    while (retryCount <= maxRetries) {
      if (retryCount > 0) {
        if (this.verbose) {
          console.log(waitingText(`Retrying test (attempt ${retryCount + 1}/${maxRetries + 1})...`));
        } else if (spinner) {
          spinner.updateMessage(`Testing: ${(test as any).name} (retry ${retryCount + 1})`);
        }
      }

      const result = await this.executeCommand(resolvedCommand, (test as any).timeout);

      if (result.success) {
        const duration = Date.now() - startTime;
        if (this.verbose) {
          console.log(successText(`Test passed: ${(test as any).name} (${duration}ms)`));
        } else if (spinner) {
          spinner.stop(true);
          console.log(` (${duration}ms)`);
        }
        return {
          testId: (test as any).id,
          success: true,
          output: result.output,
          duration,
          retryCount,
        };
      }

      lastError = result.error;
      retryCount++;

      if (retryCount <= maxRetries) {
        if (this.verbose) {
          console.log(warningText(`Test failed, retrying in ${Math.pow(2, retryCount)}s...`));
        } else if (spinner) {
          spinner.updateMessage(`Waiting: ${(test as any).name} (retry in ${Math.pow(2, retryCount)}s)`);
        }
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }

    const duration = Date.now() - startTime;
    if (this.verbose) {
      console.log(failureText(`Test failed: ${(test as any).name} (${duration}ms)`));
      if (lastError) {
        console.log(failureText(`  Error: ${lastError}`));
      }
    } else if (spinner) {
      spinner.stop(false);
      console.log(` (${duration}ms)`);
      if (lastError) {
        console.log(failureText(`    ${lastError}`));
      }
    }

    return {
      testId: (test as any).id,
      success: false,
      output: "",
      error: lastError,
      duration,
      retryCount: retryCount - 1,
    };
  }

  private filterStepsByPlatform(steps: StepLike[], targetPlatform: Platform): StepLike[] {
    return steps.filter((step) => isPlatformCompatible(targetPlatform, (step as any).platform));
  }

  private filterPreConditionsByPlatform(preConditions: PreConditionLike[], targetPlatform: Platform): PreConditionLike[] {
    return preConditions.filter((preCondition) => isPlatformCompatible(targetPlatform, (preCondition as any).platform));
  }

  private filterTestsByPlatform(tests: TestLike[], targetPlatform: Platform): TestLike[] {
    return tests.filter((test) => isPlatformCompatible(targetPlatform, (test as any).platform));
  }

  async executeRun(run: Run): Promise<RunResult> {
    const startTime = new Date();
    const preConditionResults: PreConditionResult[] = [];
    const stepResults: StepResult[] = [];
    const testResults: TestResult[] = [];
    let runSuccess = true;
    let runError: string | undefined;

    if (this.verbose) {
      console.log(runningText(`Starting pipeline: ${run.name}`));
      if (run.description) {
        console.log(infoText(`  ${run.description}`));
      }
      console.log(infoText(`  Platform: ${run.platform}`));
      console.log("");
    } else {
      console.log(runningText(`${run.name}...`));
    }

    try {
      if (run.preConditions) {
        const platformPreConditions = this.filterPreConditionsByPlatform(
          run.preConditions,
          run.platform,
        );
        if (platformPreConditions.length > 0) {
          if (this.verbose) {
            console.log(infoText(`Checking ${platformPreConditions.length} pre-conditions...`));
            console.log("");
          }
          for (const preCondition of platformPreConditions) {
            const preConditionResult = await this.executePreConditionWithRetries(preCondition);
            preConditionResults.push(preConditionResult);
            if (!preConditionResult.success) {
              runSuccess = false;
              runError = `Pre-condition '${(preCondition as any).name}' failed: ${preConditionResult.error}`;
              break;
            }
            if (this.verbose) {
              console.log("");
            }
          }
        }
      }

      if (runSuccess) {
        const platformSteps = this.filterStepsByPlatform(run.steps, run.platform);
        if (run.steps.length > 0 && platformSteps.length === 0) {
          throw new Error(`No steps found for platform: ${run.platform}`);
        }
        if (platformSteps.length > 0) {
          if (this.verbose) {
            console.log(infoText(`Executing ${platformSteps.length} steps...`));
            console.log("");
          }
          for (const step of platformSteps) {
            const stepResult = await this.executeStepWithRetries(step);
            stepResults.push(stepResult);
            if (!stepResult.success && !(step as any).continueOnFailure) {
              runSuccess = false;
              runError = `Step '${(step as any).name}' failed: ${stepResult.error}`;
              break;
            }
            if (this.verbose) {
              console.log("");
            }
          }
        }

        if (runSuccess && run.tests) {
          const platformTests = this.filterTestsByPlatform(run.tests, run.platform);
          if (platformTests.length > 0 && this.verbose) {
            console.log(infoText(`Running ${platformTests.length} tests...`));
            console.log("");
          }
          for (const test of platformTests) {
            const testResult = await this.executeTestWithRetries(test);
            testResults.push(testResult);
            if (!testResult.success) {
              runSuccess = false;
              runError = `Test '${(test as any).name}' failed: ${testResult.error}`;
              break;
            }
            if (this.verbose) {
              console.log("");
            }
          }
        }
      }
    } catch (err) {
      runSuccess = false;
      runError = err instanceof Error ? err.message : String(err);
    }

    const endTime = new Date();
    const totalDuration = endTime.getTime() - startTime.getTime();

    if (this.verbose) {
      console.log("");
    }
    if (runSuccess) {
      console.log(`🏁 ${run.name} completed (${totalDuration}ms)`);
    } else {
      console.log(`😵 ${run.name} failed (${totalDuration}ms)`);
      if (runError && this.verbose) {
        console.log(failureText(`  Error: ${runError}`));
      }
    }

    return {
      runId: run.id,
      success: runSuccess,
      preConditionResults,
      stepResults,
      testResults,
      totalDuration,
      startTime,
      endTime,
      error: runError,
    };
  }
}


