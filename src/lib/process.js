import { spawn, spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { isWindows } from "./platform.js";

export function spawnDetached(command, args, options = {}) {
  return spawn(command, args, {
    ...options,
    detached: !isWindows,
    stdio: "inherit",
  });
}

function waitForExit(child, timeoutMs) {
  if (child.exitCode !== null) return Promise.resolve(true);
  return Promise.race([
    new Promise((resolve) => child.once("exit", () => resolve(true))),
    delay(timeoutMs).then(() => false),
  ]);
}

export async function stopProcess(child) {
  if (!child || child.exitCode !== null) return;

  if (isWindows) {
    spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
      stdio: "ignore",
    });
    await waitForExit(child, 3000);
    return;
  }

  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    try {
      child.kill("SIGTERM");
    } catch {
      // The process may already be gone.
    }
  }

  if (await waitForExit(child, 4000)) return;

  try {
    process.kill(-child.pid, "SIGKILL");
  } catch {
    try {
      child.kill("SIGKILL");
    } catch {
      // The process may already be gone.
    }
  }

  await waitForExit(child, 2000);
}

export function openBrowser(url) {
  const command = isWindows ? "cmd" : process.platform === "darwin" ? "open" : "xdg-open";
  const args = isWindows ? ["/c", "start", "", url] : [url];

  try {
    const child = spawn(command, args, {
      detached: true,
      stdio: "ignore",
    });
    child.on("error", () => {});
    child.unref();
  } catch {
    // Opening a browser is a convenience; ignore failures.
  }
}
