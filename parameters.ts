import { type StepParameters } from "./types.ts";

/**
 * Substitutes parameters in a command string
 * Supports both $param and ${param} syntax
 * Falls back to default values if parameters are not provided
 */
export function substituteParameters(
  command: string,
  parameters?: StepParameters,
  defaults?: StepParameters,
): string {
  if (!parameters && !defaults) {
    return command;
  }

  // Merge parameters with defaults, parameters take precedence
  const mergedParams = { ...defaults, ...parameters };

  if (!mergedParams || Object.keys(mergedParams).length === 0) {
    return command;
  }

  let result = command;

  // Replace ${param} syntax first (more specific)
  for (const [key, value] of Object.entries(mergedParams)) {
    const pattern = new RegExp(`\\$\\{${key}\\}`, "g");
    result = result.replace(pattern, String(value));
  }

  // Replace $param syntax (less specific, but common)
  for (const [key, value] of Object.entries(mergedParams)) {
    const pattern = new RegExp(`\\$${key}(?![a-zA-Z0-9_])`, "g");
    result = result.replace(pattern, String(value));
  }

  return result;
}

/**
 * Validates that all required parameters are provided
 * Returns missing parameter names
 */
export function validateParameters(
  command: string,
  parameters?: StepParameters,
  defaults?: StepParameters,
): string[] {
  const mergedParams = { ...defaults, ...parameters };
  const requiredParams = extractParameterNames(command);
  const missingParams: string[] = [];

  for (const param of requiredParams) {
    if (!(param in mergedParams)) {
      missingParams.push(param);
    }
  }

  return missingParams;
}

/**
 * Extracts parameter names from a command string
 * Supports both $param and ${param} syntax
 */
function extractParameterNames(command: string): string[] {
  const params = new Set<string>();

  // Extract ${param} syntax
  const curlyPattern = /\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
  let match;
  while ((match = curlyPattern.exec(command)) !== null) {
    params.add(match[1]);
  }

  // Extract $param syntax (but not $0, $1, etc. which are shell variables)
  const simplePattern = /\$([a-zA-Z_][a-zA-Z0-9_]*)(?![a-zA-Z0-9_])/g;
  while ((match = simplePattern.exec(command)) !== null) {
    params.add(match[1]);
  }

  return Array.from(params);
}
