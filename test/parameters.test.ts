import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { substituteParameters, validateParameters } from "../parameters.ts";

Deno.test("Parameter substitution - simple syntax", () => {
  const command = "docker run --name $name -p $port:8080 $image";
  const parameters = { name: "my-app", port: "3000", image: "nginx:latest" };
  const result = substituteParameters(command, parameters);
  assertEquals(result, "docker run --name my-app -p 3000:8080 nginx:latest");
});

Deno.test("Parameter substitution - curly brace syntax", () => {
  const command = "docker run --name ${name} -p ${port}:8080 ${image}";
  const parameters = { name: "my-app", port: "3000", image: "nginx:latest" };
  const result = substituteParameters(command, parameters);
  assertEquals(result, "docker run --name my-app -p 3000:8080 nginx:latest");
});

Deno.test("Parameter substitution - mixed syntax", () => {
  const command = "docker run --name ${name} -p $port:8080 $image";
  const parameters = { name: "my-app", port: "3000", image: "nginx:latest" };
  const result = substituteParameters(command, parameters);
  assertEquals(result, "docker run --name my-app -p 3000:8080 nginx:latest");
});

Deno.test("Parameter substitution - with defaults", () => {
  const command = "docker run --name $name -p $port:8080 $image";
  const parameters = { name: "my-app" };
  const defaults = { port: "3000", image: "nginx:latest" };
  const result = substituteParameters(command, parameters, defaults);
  assertEquals(result, "docker run --name my-app -p 3000:8080 nginx:latest");
});

Deno.test("Parameter substitution - defaults only", () => {
  const command = "docker run --name $name -p $port:8080 $image";
  const defaults = { name: "my-app", port: "3000", image: "nginx:latest" };
  const result = substituteParameters(command, undefined, defaults);
  assertEquals(result, "docker run --name my-app -p 3000:8080 nginx:latest");
});

Deno.test("Parameter substitution - no parameters", () => {
  const command = "echo 'Hello World'";
  const result = substituteParameters(command);
  assertEquals(result, "echo 'Hello World'");
});

Deno.test("Parameter substitution - number parameters", () => {
  const command = "sleep $duration";
  const parameters = { duration: 5 };
  const result = substituteParameters(command, parameters);
  assertEquals(result, "sleep 5");
});

Deno.test("Parameter substitution - boolean parameters", () => {
  const command = "docker run --rm $detached $image";
  const parameters = { detached: true, image: "nginx" };
  const result = substituteParameters(command, parameters);
  assertEquals(result, "docker run --rm true nginx");
});

Deno.test("Parameter validation - all parameters provided", () => {
  const command = "docker run --name $name -p $port:8080 $image";
  const parameters = { name: "my-app", port: "3000", image: "nginx:latest" };
  const missing = validateParameters(command, parameters);
  assertEquals(missing, []);
});

Deno.test("Parameter validation - missing parameters", () => {
  const command = "docker run --name $name -p $port:8080 $image";
  const parameters = { name: "my-app" };
  const missing = validateParameters(command, parameters);
  assertEquals(missing.sort(), ["image", "port"].sort());
});

Deno.test("Parameter validation - with defaults", () => {
  const command = "docker run --name $name -p $port:8080 $image";
  const parameters = { name: "my-app" };
  const defaults = { port: "3000", image: "nginx:latest" };
  const missing = validateParameters(command, parameters, defaults);
  assertEquals(missing, []);
});

Deno.test("Parameter validation - complex command", () => {
  const command = "docker run --name ${app_name} -p ${port}:8080 -e ENV=${environment} $image";
  const parameters = { app_name: "my-app", port: "3000" };
  const missing = validateParameters(command, parameters);
  assertEquals(missing.sort(), ["environment", "image"].sort());
});

Deno.test("Parameter substitution - multiple occurrences", () => {
  const command = "echo $message && echo $message";
  const parameters = { message: "Hello" };
  const result = substituteParameters(command, parameters);
  assertEquals(result, "echo Hello && echo Hello");
});

Deno.test("Parameter substitution - shell variable protection", () => {
  const command = "echo $0 $1 $name";
  const parameters = { name: "test" };
  const result = substituteParameters(command, parameters);
  assertEquals(result, "echo $0 $1 test");
});
