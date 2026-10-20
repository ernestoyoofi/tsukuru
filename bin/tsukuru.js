#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const script = fileURLToPath(import.meta.url);
const requestedRuntime = String(process.env.TSUKURU_RUNTIME || "")
  .trim()
  .toLowerCase();
const runningBun = Boolean(process.versions.bun || globalThis.Bun);

// Bun is the preferred runtime. When both Bun and Node are installed, relaunch
// the CLI with Bun so dependency installation and the dev server use it too.
if (!runningBun && !process.env.TSUKURU_REEXEC && requestedRuntime !== "node") {
  const bun = spawnSync("bun", ["--version"], { stdio: "ignore" });

  if (!bun.error && bun.status === 0) {
    const result = spawnSync("bun", [script, ...args], {
      stdio: "inherit",
      env: {
        ...process.env,
        TSUKURU_REEXEC: "1",
      },
    });

    if (!result.error) {
      process.exit(typeof result.status === "number" ? result.status : 1);
    }
  }
}

if (requestedRuntime === "bun" && !runningBun) {
  console.error(
    "\n[tsukuru] TSUKURU_RUNTIME=bun was set, but Bun could not be found.",
  );
  process.exit(1);
}

const { main } = await import("../src/cli.js");

main(args).catch((error) => {
  console.error(`\n[tsukuru] ${error?.message || error}`);
  if (process.env.TSUKURU_DEBUG === "1" && error?.stack) {
    console.error(error.stack);
  }
  process.exitCode = 1;
});
