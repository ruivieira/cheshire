export const emojis = {
  success: "✅",
  failure: "❌",
  warning: "⚠️",
  info: "ℹ️",
  running: "🔄",
  waiting: "⏳",
  command: "💻",
  step: "📋",
  test: "🧪",
  preCondition: "🔍",
} as const;

const ansi = {
  reset: "\u001b[0m",
  bold: ["\u001b[1m", "\u001b[22m"] as const,
  dim: ["\u001b[2m", "\u001b[22m"] as const,
  red: ["\u001b[31m", "\u001b[39m"] as const,
  green: ["\u001b[32m", "\u001b[39m"] as const,
  yellow: ["\u001b[33m", "\u001b[39m"] as const,
  blue: ["\u001b[34m", "\u001b[39m"] as const,
  magenta: ["\u001b[35m", "\u001b[39m"] as const,
  cyan: ["\u001b[36m", "\u001b[39m"] as const,
};

function wrap(open: string, close: string, text: string): string {
  return `${open}${text}${close}`;
}

export function colourText(text: string, style: (s: string) => string): string {
  return style(text);
}

const bold = (s: string) => wrap(ansi.bold[0], ansi.bold[1], s);
const dim = (s: string) => wrap(ansi.dim[0], ansi.dim[1], s);
const red = (s: string) => wrap(ansi.red[0], ansi.red[1], s);
const green = (s: string) => wrap(ansi.green[0], ansi.green[1], s);
const yellow = (s: string) => wrap(ansi.yellow[0], ansi.yellow[1], s);
const blue = (s: string) => wrap(ansi.blue[0], ansi.blue[1], s);
const magenta = (s: string) => wrap(ansi.magenta[0], ansi.magenta[1], s);
const cyan = (s: string) => wrap(ansi.cyan[0], ansi.cyan[1], s);

export function successText(text: string): string {
  return `${emojis.success} ${bold(green(text))}`;
}

export function failureText(text: string): string {
  return `${emojis.failure} ${bold(red(text))}`;
}

export function warningText(text: string): string {
  return `${emojis.warning} ${bold(yellow(text))}`;
}

export function infoText(text: string): string {
  return `${emojis.info} ${bold(blue(text))}`;
}

export function commandText(text: string): string {
  return `${emojis.command} ${bold(cyan(text))}`;
}

export function stepText(text: string): string {
  return `${emojis.step} ${bold(magenta(text))}`;
}

export function testText(text: string): string {
  return `${emojis.test} ${bold(blue(text))}`;
}

export function preConditionText(text: string): string {
  return `${emojis.preCondition} ${bold(blue(text))}`;
}

export function runningText(text: string): string {
  return `${emojis.running} ${bold(yellow(text))}`;
}

export function waitingText(text: string): string {
  return `${emojis.waiting} ${dim(text)}`;
}


