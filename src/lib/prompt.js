import { createInterface } from "node:readline/promises";
import process from "node:process";
import { color, log } from "./log.js";

export function canPrompt() {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

export async function promptText(question, { defaultValue = "", validate } = {}) {
  if (!canPrompt()) {
    throw new Error(
      "Interactive input is required but no terminal is available. Pass the value as an option instead.",
    );
  }

  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.on("SIGINT", () => {
    readline.close();
    process.exit(130);
  });

  try {
    while (true) {
      const hint = defaultValue ? ` ${color.dim(`[${defaultValue}]`)}` : "";
      const answer =
        (await readline.question(`${color.cyan("?")} ${question}:${hint} `)).trim() ||
        defaultValue;

      const error = validate ? validate(answer) : null;
      if (!error) return answer;
      log.warn(error);
    }
  } finally {
    readline.close();
  }
}
