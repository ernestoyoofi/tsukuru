import path from "node:path";
import { spawn } from "node:child_process";
import { DEFAULT_TEMPLATE_BRANCH, resolveRepo } from "../lib/git.js";
import { loadConfig } from "../lib/config.js";
import { ensureRuntime, ensureTemplate } from "../lib/template.js";
import { existsSync, remove } from "../lib/fs.js";
import { sessionPath } from "../lib/platform.js";
import {
  materializeSession,
  resolveProjectDir,
} from "../lib/workspace.js";
import { color, log } from "../lib/log.js";

export async function validateCommand(options) {
  const { config } = await loadConfig();
  const repo = resolveRepo(
    options.repo || process.env.TSUKURU_REPO || config.repository,
  );
  const templateBranch =
    options.templateBranch ||
    options.branch ||
    process.env.TSUKURU_TEMPLATE_BRANCH ||
    config.templateBranch ||
    DEFAULT_TEMPLATE_BRANCH;

  const projectDir = await resolveProjectDir(options.dir);
  log.step(`Project: ${color.bold(projectDir)}`);

  const template = await ensureTemplate({
    repo,
    branch: templateBranch,
    refresh: options.refresh,
    offline: options.offline,
  });

  const { nodeModules } = await ensureRuntime({
    templateDir: template.dir,
    repo,
    branch: templateBranch,
    install: options.install,
  });

  const sessionDir = sessionPath("check");

  try {
    await materializeSession({
      templateDir: template.dir,
      projectDir,
      sessionDir,
      nodeModules,
    });

    const script = path.join(sessionDir, "tsukuru.valid.test.js");
    if (!existsSync(script)) {
      throw new Error(
        `tsukuru.valid.test.js was not found in the ${templateBranch} template.`,
      );
    }

    log.step(`Validating posts from ${path.join(projectDir, "posts")}…`);
    log.blank();

    const child = spawn(
      process.execPath,
      [script, ...options.passthrough],
      {
        cwd: sessionDir,
        stdio: "inherit",
        env: {
          ...process.env,
          NEXT_TELEMETRY_DISABLED: "1",
        },
      },
    );

    const code = await new Promise((resolve) => {
      child.on("exit", (exitCode, signal) => {
        if (signal) {
          resolve(1);
          return;
        }
        resolve(exitCode ?? 0);
      });
    });

    process.exitCode = code;
  } finally {
    if (options.keepTemp) {
      log.info(`Validation workspace kept at ${sessionDir}`);
    } else {
      await remove(sessionDir);
    }
  }
}
