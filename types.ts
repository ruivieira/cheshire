import {
  type PreCondition as PreConditionClass,
  type Step as StepClass,
  type Test as TestClass,
} from "./step.ts";

export type Platform =
  | "fedora"
  | "mac"
  | "ubuntu"
  | "debian"
  | "centos"
  | "rhel"
  | "windows"
  | "linux"
  | "unix";

export interface StepParameters {
  [key: string]: string | number | boolean;
}

/**
 * Type for executable functions that can be passed to the executor
 * This allows for dependency injection of command execution logic
 */
export type ExecutableFunction = (
  command: string,
  timeout?: number,
) => Promise<{ success: boolean; output: string; error?: string }>;

export interface Step {
  id: string;
  name: string;
  command: string;
  description?: string;
  platform?: Platform;
  timeout?: number;
  retries?: number;
  continueOnFailure?: boolean;
  parameters?: StepParameters;
  parameterDefaults?: StepParameters;
}

export interface PreCondition {
  id: string;
  name: string;
  command: string;
  description?: string;
  platform?: Platform;
  timeout?: number;
  retries?: number;
  parameters?: StepParameters;
  parameterDefaults?: StepParameters;
}

export interface Test {
  id: string;
  name: string;
  command: string;
  description?: string;
  platform?: Platform;
  timeout?: number;
  retries?: number;
  parameters?: StepParameters;
  parameterDefaults?: StepParameters;
}

export type StepLike = Step | StepClass;
export type PreConditionLike = PreCondition | PreConditionClass;
export type TestLike = Test | TestClass;

export interface Run {
  id: string;
  name: string;
  description?: string;
  platform: Platform;
  preConditions?: PreConditionLike[];
  steps: StepLike[];
  tests?: TestLike[];
  timeout?: number;
}

export interface StepResult {
  stepId: string;
  success: boolean;
  output: string;
  error?: string;
  duration: number;
  retryCount: number;
}

export interface PreConditionResult {
  preConditionId: string;
  success: boolean;
  output: string;
  error?: string;
  duration: number;
  retryCount: number;
}

export interface TestResult {
  testId: string;
  success: boolean;
  output: string;
  error?: string;
  duration: number;
  retryCount: number;
}

export interface RunResult {
  runId: string;
  success: boolean;
  preConditionResults: PreConditionResult[];
  stepResults: StepResult[];
  testResults: TestResult[];
  totalDuration: number;
  startTime: Date;
  endTime: Date;
  error?: string;
}



