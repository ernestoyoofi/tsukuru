import fs from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { ensureRuntime, ensureTemplate } from "./template.js";
import { existsSync, remove } from "./fs.js";
import { sessionPath } from "./platform.js";
import { openBrowser, spawnDetached, stopProcess } from "./process.js";
import {
  copyConfig,
  materializeSession,
  syncContent,
} from "./workspace.js";
import { log } from "./log.js";
import { preferredRuntime } from "./runtime.js";

function watchDirectory(directory, handler) {
  if (!existsSync(directory)) return null;

  try {
    return fs.watch(directory, { recursive: true }, handler);
  } catch {
    try {
      // Recursive watching is not available everywhere (older Node/Windows
      // combinations); fall back to top-level changes.
      return fs.watch(directory, handler);
    } catch {
      return null;
    }
  }
}

export async function runPreview({
  repo,
  branch,
  projectDir,
  port,
  host,
  install,
  refresh,
  offline,
  keepTemp,
  open,
}) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      `Invalid preview port: ${port}. Set --port or TSUKURU_PORT to a value between 1 and 65535.`,
    );
  }

  const runtime = preferredRuntime();

  const template = await ensureTemplate({
    repo,
    branch,
    refresh,
    offline,
  });

  const { nodeModules } = await ensureRuntime({
    templateDir: template.dir,
    repo,
    branch,
    install,
  });

  const contentDir = projectDir || template.dir;
  const usesLocalContent = Boolean(projectDir);
  const sessionDir = sessionPath("prev");

  try {
    await materializeSession({
      templateDir: template.dir,
      projectDir: contentDir,
      sessionDir,
      nodeModules,
    });
  } catch (error) {
    await remove(sessionDir);
    throw error;
  }

  log.step(`Preview workspace: ${sessionDir}`);
  if (usesLocalContent) {
    log.step("Layered in: posts/, public/, tsukuru.config.js");
  } else {
    log.step("Previewing the template with its own posts/ and public/ content.");
  }

  const nextBinary = path.join(
    sessionDir,
    "node_modules",
    "next",
    "dist",
    "bin",
    "next",
  );

  if (!existsSync(nextBinary)) {
    await remove(sessionDir);
    throw new Error(
      "Next.js was not found in the preview workspace. Try running again with --refresh.",
    );
  }

  const url = `http://${
    host === "0.0.0.0" || host === "::" ? "localhost" : host
  }:${port}`;

  let nextMajor = 0;
  try {
    const nextPackage = JSON.parse(
      fs.readFileSync(
        path.join(sessionDir, "node_modules", "next", "package.json"),
        "utf8",
      ),
    );
    nextMajor = Number.parseInt(nextPackage.version, 10) || 0;
  } catch {
    nextMajor = 0;
  }

  const nextArgs = [
    nextBinary,
    "dev",
    "--port",
    String(port),
    "--hostname",
    host,
  ];
  // Next.js 16 uses Turbopack by default, which refuses a node_modules
  // symlink that points outside the project root. Webpack handles it.
  if (nextMajor >= 16) nextArgs.push("--webpack");

  let child = null;
  let stopping = false;
  let restarting = false;
  let pendingRestart = false;
  let configTimer = null;
  let contentTimer = null;
  let openTimer = null;
  const watchers = [];

  function startServer() {
    child = spawnDetached(runtime.command, nextArgs, {
      cwd: sessionDir,
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: "1",
      },
    });

    const instance = child;
    instance.on("exit", (code, signal) => {
      if (instance !== child) return;
      if (stopping || restarting) return;
      const detail = signal ? `signal ${signal}` : `code ${code ?? 0}`;
      log.warn(`Dev server stopped (${detail}).`);
      void shutdown(typeof code === "number" ? code : 1);
    });
  }

  function scheduleContentSync() {
    clearTimeout(contentTimer);
    contentTimer = setTimeout(async () => {
      try {
        await syncContent(contentDir, sessionDir);
        log.step("Synced posts/ and public/ into the preview workspace.");
      } catch (error) {
        log.warn(`Could not sync content: ${error.message}`);
      }
    }, 300);
  }

  function scheduleRestart() {
    clearTimeout(configTimer);
    configTimer = setTimeout(() => {
      void requestRestart(
        "tsukuru.config.js changed — restarting the dev server…",
      );
    }, 350);
  }

  async function requestRestart(initialMessage) {
    if (stopping) return;
    if (restarting) {
      pendingRestart = true;
      return;
    }

    restarting = true;
    let message = initialMessage;

    try {
      do {
        pendingRestart = false;
        log.step(message);
        await stopProcess(child);
        if (stopping) return;
        await copyConfig(contentDir, sessionDir);
        startServer();
        message = "Configuration changed again — restarting…";
      } while (pendingRestart);
    } catch (error) {
      log.error(`Could not restart the dev server: ${error.message}`);
    } finally {
      restarting = false;
    }
  }

  async function shutdown(exitCode = 0) {
    if (stopping) return;
    stopping = true;

    clearTimeout(configTimer);
    clearTimeout(contentTimer);
    clearTimeout(openTimer);
    for (const watcher of watchers) {
      try {
        watcher.close();
      } catch {
        // Ignore closed watchers.
      }
    }

    log.step("Stopping preview…");
    await stopProcess(child);

    if (keepTemp) {
      log.info(`Preview workspace kept at ${sessionDir}`);
    } else {
      await remove(sessionDir);
    }

    process.exit(exitCode);
  }

  process.on("SIGINT", () => {
    if (stopping) process.exit(130);
    void shutdown(130);
  });
  process.on("SIGTERM", () => {
    if (stopping) process.exit(143);
    void shutdown(143);
  });

  if (usesLocalContent) {
    try {
      const configWatcher = fs.watch(contentDir, (_event, filename) => {
        if (!filename) return;
        if (filename.toString() === "tsukuru.config.js") scheduleRestart();
      });
      watchers.push(configWatcher);

      const postsWatcher = watchDirectory(
        path.join(contentDir, "posts"),
        scheduleContentSync,
      );
      if (postsWatcher) watchers.push(postsWatcher);

      const publicWatcher = watchDirectory(
        path.join(contentDir, "public"),
        scheduleContentSync,
      );
      if (publicWatcher) watchers.push(publicWatcher);
    } catch (error) {
      for (const watcher of watchers) {
        try {
          watcher.close();
        } catch {
          // Ignore closed watchers.
        }
      }
      await remove(sessionDir);
      throw new Error(`Could not watch the project folder: ${error.message}`);
    }

    log.step("Watching tsukuru.config.js for changes (auto-restart).");
    log.step("Watching posts/ and public/ for changes (auto-sync).");
  }

  startServer();

  if (open) {
    openTimer = setTimeout(async () => {
      const deadline = Date.now() + 60_000;
      while (Date.now() < deadline) {
        try {
          const response = await fetch(url, {
            signal: AbortSignal.timeout(3000),
          });
          if (response.status < 500) {
            openBrowser(url);
            return;
          }
        } catch {
          // The server is still compiling or starting.
        }
        await delay(1000);
      }
      openBrowser(url);
    }, 1500);
  }

  // The child process and watchers keep the Node.js event loop running.
  await new Promise(() => {});
}
