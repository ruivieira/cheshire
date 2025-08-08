import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { PreCondition, Step, Test } from "../step.ts";
import { type Platform } from "../types.ts";

// Concrete implementations for testing
class TestStep extends Step {
  constructor(
    id: string,
    name: string,
    private command: string,
    options: {
      description?: string;
      platform?: Platform;
      timeout?: number;
      retries?: number;
      continueOnFailure?: boolean;
    } = {},
  ) {
    super(id, name, options);
  }

  getCommand(): string {
    return this.command;
  }

  validateParameters(): string[] {
    return [];
  }
}

class TestPreCondition extends PreCondition {
  constructor(
    id: string,
    name: string,
    private command: string,
    options: {
      description?: string;
      platform?: Platform;
      timeout?: number;
      retries?: number;
    } = {},
  ) {
    super(id, name, options);
  }

  getCommand(): string {
    return this.command;
  }

  validateParameters(): string[] {
    return [];
  }
}

class TestTest extends Test {
  constructor(
    id: string,
    name: string,
    private command: string,
    options: {
      description?: string;
      platform?: Platform;
      timeout?: number;
      retries?: number;
    } = {},
  ) {
    super(id, name, options);
  }

  getCommand(): string {
    return this.command;
  }

  validateParameters(): string[] {
    return [];
  }
}

Deno.test("Step constructor and properties", () => {
  const step = new TestStep("test-step", "Test Step", "echo 'test'", {
    description: "Test description",
    platform: "linux",
    timeout: 30,
    retries: 3,
    continueOnFailure: true,
  });

  assertEquals(step.id, "test-step");
  assertEquals(step.name, "Test Step");
  assertEquals(step.description, "Test description");
  assertEquals(step.platform, "linux");
  assertEquals(step.timeout, 30);
  assertEquals(step.retries, 3);
  assertEquals(step.continueOnFailure, true);
});

Deno.test("Step getCommand", () => {
  const step = new TestStep("test-step", "Test Step", "echo 'test'");
  assertEquals(step.getCommand(), "echo 'test'");
});

Deno.test("Step isTypeScriptStep", () => {
  const step = new TestStep("test-step", "Test Step", "echo 'test'");
  assertEquals(step.isTypeScriptStep(), false);
});

Deno.test("Step toJSON", () => {
  const step = new TestStep("test-step", "Test Step", "echo 'test'", {
    description: "Test description",
    platform: "linux",
    timeout: 30,
    retries: 3,
    continueOnFailure: true,
  });

  const json = step.toJSON();
  assertEquals(json.id, "test-step");
  assertEquals(json.name, "Test Step");
  assertEquals(json.command, "echo 'test'");
  assertEquals(json.description, "Test description");
  assertEquals(json.platform, "linux");
  assertEquals(json.timeout, 30);
  assertEquals(json.retries, 3);
  assertEquals(json.continueOnFailure, true);
  assertEquals(json.isTypeScriptStep, false);
});

Deno.test("PreCondition constructor and properties", () => {
  const preCondition = new TestPreCondition("test-pre", "Test PreCondition", "echo 'test'", {
    description: "Test description",
    platform: "linux",
    timeout: 30,
    retries: 3,
  });

  assertEquals(preCondition.id, "test-pre");
  assertEquals(preCondition.name, "Test PreCondition");
  assertEquals(preCondition.description, "Test description");
  assertEquals(preCondition.platform, "linux");
  assertEquals(preCondition.timeout, 30);
  assertEquals(preCondition.retries, 3);
});

Deno.test("PreCondition getCommand", () => {
  const preCondition = new TestPreCondition("test-pre", "Test PreCondition", "echo 'test'");
  assertEquals(preCondition.getCommand(), "echo 'test'");
});

Deno.test("PreCondition toJSON", () => {
  const preCondition = new TestPreCondition("test-pre", "Test PreCondition", "echo 'test'", {
    description: "Test description",
    platform: "linux",
    timeout: 30,
    retries: 3,
  });

  const json = preCondition.toJSON();
  assertEquals(json.id, "test-pre");
  assertEquals(json.name, "Test PreCondition");
  assertEquals(json.command, "echo 'test'");
  assertEquals(json.description, "Test description");
  assertEquals(json.platform, "linux");
  assertEquals(json.timeout, 30);
  assertEquals(json.retries, 3);
});

Deno.test("Test constructor and properties", () => {
  const test = new TestTest("test-test", "Test Test", "echo 'test'", {
    description: "Test description",
    platform: "linux",
    timeout: 30,
    retries: 3,
  });

  assertEquals(test.id, "test-test");
  assertEquals(test.name, "Test Test");
  assertEquals(test.description, "Test description");
  assertEquals(test.platform, "linux");
  assertEquals(test.timeout, 30);
  assertEquals(test.retries, 3);
});

Deno.test("Test getCommand", () => {
  const test = new TestTest("test-test", "Test Test", "echo 'test'");
  assertEquals(test.getCommand(), "echo 'test'");
});

Deno.test("Test toJSON", () => {
  const test = new TestTest("test-test", "Test Test", "echo 'test'", {
    description: "Test description",
    platform: "linux",
    timeout: 30,
    retries: 3,
  });

  const json = test.toJSON();
  assertEquals(json.id, "test-test");
  assertEquals(json.name, "Test Test");
  assertEquals(json.command, "echo 'test'");
  assertEquals(json.description, "Test description");
  assertEquals(json.platform, "linux");
  assertEquals(json.timeout, 30);
  assertEquals(json.retries, 3);
});
