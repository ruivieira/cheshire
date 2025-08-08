import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import {
  commandText,
  emojis,
  failureText,
  infoText,
  preConditionText,
  runningText,
  stepText,
  successText,
  testText,
  waitingText,
  warningText,
} from "../colours.ts";

Deno.test("Emojis are defined", () => {
  assertEquals(typeof emojis.success, "string");
  assertEquals(typeof emojis.failure, "string");
  assertEquals(typeof emojis.warning, "string");
  assertEquals(typeof emojis.info, "string");
  assertEquals(typeof emojis.running, "string");
  assertEquals(typeof emojis.waiting, "string");
  assertEquals(typeof emojis.command, "string");
  assertEquals(typeof emojis.step, "string");
  assertEquals(typeof emojis.test, "string");
  assertEquals(typeof emojis.preCondition, "string");
});

Deno.test("Success text includes emoji and formatting", () => {
  const result = successText("Test success");
  assertEquals(result.includes(emojis.success), true);
  assertEquals(result.includes("Test success"), true);
});

Deno.test("Failure text includes emoji and formatting", () => {
  const result = failureText("Test failure");
  assertEquals(result.includes(emojis.failure), true);
  assertEquals(result.includes("Test failure"), true);
});

Deno.test("Warning text includes emoji and formatting", () => {
  const result = warningText("Test warning");
  assertEquals(result.includes(emojis.warning), true);
  assertEquals(result.includes("Test warning"), true);
});

Deno.test("Info text includes emoji and formatting", () => {
  const result = infoText("Test info");
  assertEquals(result.includes(emojis.info), true);
  assertEquals(result.includes("Test info"), true);
});

Deno.test("Command text includes emoji and formatting", () => {
  const result = commandText("Test command");
  assertEquals(result.includes(emojis.command), true);
  assertEquals(result.includes("Test command"), true);
});

Deno.test("Step text includes emoji and formatting", () => {
  const result = stepText("Test step");
  assertEquals(result.includes(emojis.step), true);
  assertEquals(result.includes("Test step"), true);
});

Deno.test("Test text includes emoji and formatting", () => {
  const result = testText("Test test");
  assertEquals(result.includes(emojis.test), true);
  assertEquals(result.includes("Test test"), true);
});

Deno.test("PreCondition text includes emoji and formatting", () => {
  const result = preConditionText("Test preCondition");
  assertEquals(result.includes(emojis.preCondition), true);
  assertEquals(result.includes("Test preCondition"), true);
});

Deno.test("Running text includes emoji and formatting", () => {
  const result = runningText("Test running");
  assertEquals(result.includes(emojis.running), true);
  assertEquals(result.includes("Test running"), true);
});

Deno.test("Waiting text includes emoji and formatting", () => {
  const result = waitingText("Test waiting");
  assertEquals(result.includes(emojis.waiting), true);
  assertEquals(result.includes("Test waiting"), true);
});

Deno.test("All text functions return strings", () => {
  assertEquals(typeof successText("test"), "string");
  assertEquals(typeof failureText("test"), "string");
  assertEquals(typeof warningText("test"), "string");
  assertEquals(typeof infoText("test"), "string");
  assertEquals(typeof commandText("test"), "string");
  assertEquals(typeof stepText("test"), "string");
  assertEquals(typeof testText("test"), "string");
  assertEquals(typeof preConditionText("test"), "string");
  assertEquals(typeof runningText("test"), "string");
  assertEquals(typeof waitingText("test"), "string");
});
