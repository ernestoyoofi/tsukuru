import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { promises as fsp } from "node:fs";
import path from "node:path";
import {
  ensureDir,
  existsSync,
  pathExists,
  readJson,
  remove,
  writeJson,
} from "./fs.js";
import { getCommit, getLatestSource, refreshSource } from "./git.js";
import { DEFAULT_TEMPLATE_TTL_MINUTES } from "./constants.js";
import { cacheRoot, slugify } from "./platform.js";
import { log } from "./log.js";
import { preferredRuntime } from "./runtime.js";
import { VERSION } from "../version.js";

const TEMPLATE_TTL_MS = (() => {
  const minutes = Number(
    process.env.TSUKURU_TEMPLATE_TTL_MINUTES || DEFAULT_TEMPLATE_TTL_MINUTES,
  );
  const safeMinutes =
    Number.isFinite(minutes) && minutes >= 0
      ? minutes
      : DEFAULT_TEMPLATE_TTL_MINUTES;
  return safeMinutes * 60 * 1000;
})();

function sha256(values) {
  const hash = createHash("sha256");
  for (const value of values) hash.update(String(value));
  return hash.digest("hex");
}

function lockfiles(directory) {
  return ["bun.lock", "bun.lockb", "package-lock.json", "pnpm-lock.yaml", "yarn.lock"]
    .map((name) => path.join(directory, name))
    .filter((file) => existsSync(file));
}

export async function ensureTemplate({ repo, branch, refresh, offline }) {
  const base = path.join(cacheRoot(), "templates", repo.slug);
  const sourceDir = path.join(base, slugify(branch));
  const metaFile = path.join(base, `${slugify(branch)}.meta.json`);
  const meta = await readJson(metaFile);

  let sourceExists = await pathExists(sourceDir);
  if (sourceExists) {
    try {
      sourceExists = (await fsp.readdir(sourceDir)).length > 0;
    } catch {
      sourceExists = false;
    }
  }

  let checkedAt = Number(meta?.checkedAt);
  if (!Number.isFinite(checkedAt)) checkedAt = sourceExists ? 0 : Date.now();

  if (!sourceExists) {
    if (offline) {
      throw new Error(
        `Template ${repo.raw}#${branch} is not cached and --offline was used. Run once without --offline.`,
      );
    }
    log.step(`Downloading template ${repo.raw} (${branch})…`);
    await ensureDir(base);
    await getLatestSource(repo, branch, sourceDir);
    checkedAt = Date.now();
  } else {
    const stale = Date.now() - checkedAt > TEMPLATE_TTL_MS;

    if (!offline && (refresh || stale)) {
      if (refresh) {
        log.step(`Forcing a template check for ${repo.raw} (${branch})…`);
      } else {
        log.step(
          "Template cache is older than the configured interval; checking for updates…",
        );
      }

      try {
        const result = await refreshSource(repo, branch, sourceDir);
        checkedAt = Date.now();

        if (result.kind === "git" && result.updated === false) {
          log.info(
            `Template is already up to date (${String(result.after).slice(0, 7)}); using the cached version.`,
          );
        } else if (result.kind === "git") {
          log.success(
            `Template updated to ${String(result.after).slice(0, 7)}.`,
          );
        } else {
          log.info("Template archive refreshed.");
        }
      } catch (error) {
        log.warn(
          `Could not refresh the template cache; using the local copy. (${error.message.split("\n")[0]})`,
        );
      }
    }
  }

  const commit = getCommit(sourceDir);
  await writeJson(metaFile, {
    repo: repo.raw,
    branch,
    commit,
    checkedAt,
  });

  return { dir: sourceDir, commit };
}

function detectManager(runtime) {
  if (runtime.name === "bun") {
    return { name: "bun", command: runtime.command, args: ["install"] };
  }

  return {
    name: "npm",
    command: "npm",
    args: ["install", "--no-audit", "--no-fund", "--prefer-online"],
  };
}

function runInstall(manager, cwd) {
  log.step(`Installing template dependencies with ${manager.name}…`);
  const result = spawnSync(manager.command || manager.name, manager.args, {
    cwd,
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: "1",
      npm_config_update_notifier: "false",
    },
  });

  if (result.error) {
    throw new Error(`Could not run ${manager.name}: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(
      `${manager.name} install exited with code ${result.status}.`,
    );
  }
}

export async function ensureRuntime({ templateDir, repo, branch, install }) {
  const packageJsonPath = path.join(templateDir, "package.json");
  const packageJson = await fsp.readFile(packageJsonPath, "utf8");
  const locks = lockfiles(templateDir);
  const lockContents = await Promise.all(
    locks.map((file) => fsp.readFile(file, "utf8").catch(() => "")),
  );

  const runtime = preferredRuntime();

  const key = sha256([
    packageJson,
    ...lockContents,
    process.platform,
    process.arch,
    runtime.name,
    String(runtime.version).split(".")[0],
    VERSION,
  ]);
  const runtimeDir = path.join(
    cacheRoot(),
    "runtime",
    repo.slug,
    slugify(branch),
    key.slice(0, 16),
  );
  const nodeModules = path.join(runtimeDir, "node_modules");
  const nextBinary = path.join(nodeModules, "next", "dist", "bin", "next");
  const marker = path.join(runtimeDir, ".tsukuru-runtime.json");

  if (await pathExists(nextBinary)) {
    return { nodeModules, runtimeDir };
  }

  if (!install) {
    throw new Error(
      "Template dependencies are not installed yet. Run again without --no-install.",
    );
  }

  await remove(runtimeDir);
  await ensureDir(runtimeDir);
  await fsp.copyFile(packageJsonPath, path.join(runtimeDir, "package.json"));
  for (const lock of locks) {
    await fsp.copyFile(lock, path.join(runtimeDir, path.basename(lock)));
  }

  const preferred = detectManager(runtime);
  try {
    runInstall(preferred, runtimeDir);
  } catch (error) {
    if (preferred.name === "bun") {
      log.warn("bun install failed; retrying with npm…");
      await remove(nodeModules);
      runInstall(
        {
          name: "npm",
          args: [
            "install",
            "--no-audit",
            "--no-fund",
            "--prefer-online",
          ],
        },
        runtimeDir,
      );
    } else {
      await remove(runtimeDir);
      throw error;
    }
  }

  if (!(await pathExists(nextBinary))) {
    await remove(runtimeDir);
    throw new Error(
      "Dependency installation finished but Next.js was not found. Try removing the cache and running again.",
    );
  }

  await writeJson(marker, {
    key,
    installedAt: new Date().toISOString(),
    manager: preferred.name,
    platform: process.platform,
    arch: process.arch,
  });

  return { nodeModules, runtimeDir };
}
