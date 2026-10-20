import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { promises as fsp } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  DEFAULT_REPO,
  DEFAULT_STRUCTURE_BRANCH,
  DEFAULT_TEMPLATE_BRANCH,
  DEFAULT_TEMPLATE_TTL_MINUTES,
} from "./constants.js";
import { ensureDir, pathExists, remove } from "./fs.js";
import { slugify } from "./platform.js";
import { log } from "./log.js";

const GITHUB_URL =
  /github\.com[/:]([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?(?:$|[/?#])/;

export {
  DEFAULT_REPO,
  DEFAULT_STRUCTURE_BRANCH,
  DEFAULT_TEMPLATE_BRANCH,
  DEFAULT_TEMPLATE_TTL_MINUTES,
};

let gitAvailable = null;

export function hasGit() {
  if (gitAvailable !== null) return gitAvailable;
  const result = spawnSync("git", ["--version"], { stdio: "ignore" });
  gitAvailable = !result.error && result.status === 0;
  return gitAvailable;
}

export function resolveRepo(input) {
  const raw = input || process.env.TSUKURU_REPO || DEFAULT_REPO;
  const trimmed = String(raw).trim();
  let ownerRepo = null;

  if (/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(trimmed)) {
    ownerRepo = trimmed.replace(/\.git$/i, "");
  } else {
    const match = trimmed.match(GITHUB_URL);
    if (match) ownerRepo = `${match[1]}/${match[2].replace(/\.git$/i, "")}`;
  }

  const gitUrl = ownerRepo ? `https://github.com/${ownerRepo}.git` : trimmed;
  const slug = slugify(ownerRepo ? ownerRepo.replace("/", "__") : trimmed);

  return {
    raw: trimmed,
    ownerRepo,
    gitUrl,
    slug: slug || "tsukuru",
    archiveBase: ownerRepo
      ? `https://codeload.github.com/${ownerRepo}/tar.gz/refs/heads/`
      : null,
  };
}

function gitSpawn(args, { cwd, inherit = false } = {}) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: inherit ? "inherit" : "pipe",
    env: {
      ...process.env,
      ...(inherit ? {} : { GIT_TERMINAL_PROMPT: "0" }),
    },
  });

  if (result.error) {
    throw new Error(`Could not run git: ${result.error.message}`);
  }

  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || "").trim();
    throw new Error(
      `git ${args.join(" ")} failed${detail ? `:\n${detail}` : "."}`,
    );
  }

  return result.stdout || "";
}

function git(args, options = {}) {
  return gitSpawn(args, options).trim();
}

export function gitOutput(args, { cwd } = {}) {
  return git(args, { cwd });
}

export function gitRaw(args, { cwd } = {}) {
  return gitSpawn(args, { cwd });
}

export function gitRun(args, { cwd } = {}) {
  gitSpawn(args, { cwd, inherit: true });
}

export function cloneShallow(repo, branch, destination) {
  git([
    "clone",
    "--depth",
    "1",
    "--single-branch",
    "--no-tags",
    "--branch",
    branch,
    repo.gitUrl,
    destination,
  ]);
}

export function updateShallow(directory, branch) {
  const before = getCommit(directory);
  git(["fetch", "--depth", "1", "--no-tags", "origin", branch], {
    cwd: directory,
  });
  const after = git(["rev-parse", "FETCH_HEAD"], { cwd: directory });

  if (before && before === after) {
    return { updated: false, before, after };
  }

  git(["reset", "--hard", "FETCH_HEAD"], { cwd: directory });
  return { updated: true, before, after };
}

export function getCommit(directory) {
  try {
    return git(["rev-parse", "HEAD"], { cwd: directory });
  } catch {
    return null;
  }
}

export function gitInit(directory) {
  if (!hasGit()) return false;
  try {
    git(["init", "--initial-branch=main"], { cwd: directory });
  } catch {
    git(["init"], { cwd: directory });
    try {
      git(["symbolic-ref", "HEAD", "refs/heads/main"], { cwd: directory });
    } catch {
      // Older git versions may not allow this; the default branch is fine.
    }
  }
  return true;
}

export async function downloadArchive(repo, branch, destination) {
  if (!repo.archiveBase) {
    throw new Error(
      "Automatic archive download only works with GitHub repositories. Install git or use a github.com repository URL.",
    );
  }

  const url = `${repo.archiveBase}${branch
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/")}`;

  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(120_000),
    headers: { "user-agent": "tsukuru-cli" },
  });

  if (!response.ok) {
    throw new Error(
      `Could not download ${url} (HTTP ${response.status}). Check the repository and branch name.`,
    );
  }

  const archiveFile = path.join(
    os.tmpdir(),
    `tsukuru-${randomBytes(4).toString("hex")}.tar.gz`,
  );
  const staging = `${destination}.tmp-${randomBytes(4).toString("hex")}`;

  try {
    await fsp.writeFile(archiveFile, Buffer.from(await response.arrayBuffer()));
    await ensureDir(path.dirname(destination));
    await remove(staging);
    await ensureDir(staging);

    const result = spawnSync(
      "tar",
      ["-xzf", archiveFile, "-C", staging, "--strip-components=1"],
      { encoding: "utf8" },
    );

    if (result.error) {
      throw new Error(`Could not extract archive: ${result.error.message}`);
    }
    if (result.status !== 0) {
      throw new Error(
        `Could not extract archive: ${(result.stderr || "").trim()}`,
      );
    }

    await remove(destination);
    await fsp.rename(staging, destination);
  } catch (error) {
    await remove(staging);
    throw error;
  } finally {
    await fsp.rm(archiveFile, { force: true }).catch(() => {});
  }
}

export async function getLatestSource(repo, branch, destination) {
  if (hasGit()) {
    try {
      await remove(destination);
      cloneShallow(repo, branch, destination);
      return "git";
    } catch (error) {
      log.warn(
        `git clone failed, trying an archive download instead. (${error.message.split("\n")[0]})`,
      );
    }
  } else {
    log.warn("git was not found; downloading a source archive instead.");
  }

  await downloadArchive(repo, branch, destination);
  return "archive";
}

export async function refreshSource(repo, branch, destination) {
  if (await pathExists(path.join(destination, ".git"))) {
    const result = updateShallow(destination, branch);
    return { kind: "git", ...result };
  }
  await downloadArchive(repo, branch, destination);
  return { kind: "archive", updated: null, before: null, after: null };
}
