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
import { cacheRoot, slugify } from "./platform.js";
import { log } from "./log.js";
import { VERSION } from "../version.js";

const TEMPLATE_TTL_MS = (() => {
  const minutes = Number(process.env.TSUKURU_TEMPLATE_TTL_MINUTES || 10);
  return (Number.isFinite(minutes) && minutes >= 0 ? minutes : 10) * 60 * 1000;
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

  if (!sourceExists) {
    if (offline) {
      throw new Error(
        `Template ${repo.raw}#${branch} is not cached and --offline was used. Run once without --offline.`,
      );
    }
    log.step(`Downloading template ${repo.raw} (${branch})…`);
    await ensureDir(base);
    await getLatestSource(repo, branch, sourceDir);
  } else {
    const stale =
      !meta?.checkedAt ||
      Date.now() - Number(meta.checkedAt) > TEMPLATE_TTL_MS;
    if (!offline && (refresh || stale)) {
      try {
        await refreshSource(repo, branch, sourceDir);
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
    checkedAt: Date.now(),
  });

  return { dir: sourceDir, commit };
}

function detectManager(templateDir) {
  const hasBunLock = existsSync(path.join(templateDir, "bun.lock"));
  const bun = spawnSync("bun", ["--version"], { stdio: "ignore" });
  const bunAvailable = !bun.error && bun.status === 0;

  if (bunAvailable && hasBunLock) {
    return { name: "bun", args: ["install"] };
  }

  return { name: "npm", args: ["install", "--no-audit", "--no-fund", "--prefer-online"] };
}

function runInstall(manager, cwd) {
  log.step(`Installing template dependencies with ${manager.name}…`);
  const result = spawnSync(manager.name, manager.args, {
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

  const key = sha256([
    packageJson,
    ...lockContents,
    process.platform,
    process.arch,
    process.versions.node.split(".")[0],
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

  const preferred = detectManager(templateDir);
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
