import path from "node:path";
import {
  gitInit,
  gitOutput,
  gitRaw,
  gitRun,
  hasGit,
} from "../lib/git.js";
import { resolveProjectDir } from "../lib/workspace.js";
import { canPrompt, promptText } from "../lib/prompt.js";
import { log, color } from "../lib/log.js";

const POST_SITE_PATHS = [
  "public",
  "images",
  "tsukuru.config.js",
  "CNAME",
  "favicon.ico",
  ".github",
  ".gitignore",
  "README.md",
];

function parseStatus(raw) {
  const parts = raw.split("\0");
  const entries = [];

  for (let index = 0; index < parts.length; index++) {
    const item = parts[index];
    if (!item) continue;

    const code = item.slice(0, 2);
    const file = item.slice(3);
    if (code[0] === "R" || code[0] === "C") {
      const oldFile = parts[index + 1] || "";
      index += 1;
      entries.push({ code, file, oldFile });
    } else {
      entries.push({ code, file });
    }
  }

  return entries;
}

function statusFor(root, paths) {
  const raw = gitRaw(
    [
      "status",
      "--porcelain=v1",
      "-z",
      "--untracked-files=all",
      "--",
      ...paths,
    ],
    { cwd: root },
  );
  return parseStatus(raw);
}

function collectPostChanges(root, prefix) {
  const postsPath = prefix ? `${prefix}/posts` : "posts";
  const entries = statusFor(root, [postsPath]);
  const groups = {
    new: new Set(),
    edit: new Set(),
    del: new Set(),
  };

  for (const entry of entries) {
    const indexCode = entry.code[0];
    const worktreeCode = entry.code[1];

    if (indexCode === "?" || indexCode === "A") {
      groups.new.add(entry.file);
      continue;
    }
    if (indexCode === "R") {
      groups.new.add(entry.file);
      if (entry.oldFile) groups.del.add(entry.oldFile);
      continue;
    }
    if (indexCode === "C") {
      groups.new.add(entry.file);
      continue;
    }
    if (indexCode === "D" || worktreeCode === "D") {
      groups.del.add(entry.file);
      continue;
    }
    groups.edit.add(entry.file);
  }

  return groups;
}

function summarizeFiles(files, { stripExtension = false } = {}) {
  const names = [
    ...new Set(
      [...files].map((file) => {
        const base = path.basename(file);
        if (!stripExtension) return base;
        const extension = path.extname(base);
        return extension ? base.slice(0, -extension.length) : base;
      }),
    ),
  ]
    .filter(Boolean)
    .sort();

  if (names.length <= 5) return names.join(", ");
  return `${names.slice(0, 5).join(", ")}, +${names.length - 5} more`;
}

function commitPaths(root, files, message) {
  const list = [...files];
  if (list.length === 0) return false;

  gitRun(["add", "-A", "--", ...list], { cwd: root });
  gitRun(["commit", "-m", message, "--", ...list], { cwd: root });
  log.success(message);
  return true;
}

function ensureGitIdentity(root) {
  let name = null;
  let email = null;

  try {
    name = gitOutput(["config", "user.name"], { cwd: root });
  } catch {
    name = null;
  }
  try {
    email = gitOutput(["config", "user.email"], { cwd: root });
  } catch {
    email = null;
  }

  if (!name || !email) {
    throw new Error(
      "Git author identity is not configured.\n" +
        "Set it globally, then run the command again:\n" +
        '  git config --global user.name "Your Name"\n' +
        '  git config --global user.email "you@example.com"',
    );
  }
}

function validateRepositoryInput(value) {
  if (!value) return "Repository cannot be empty.";

  if (/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(value)) return null;
  if (/^(https?|ssh|git|file):\/\//i.test(value)) return null;
  if (/^[^@\s]+@[^:\s]+:.+/.test(value)) return null;
  if (
    path.isAbsolute(value) ||
    value.startsWith("./") ||
    value.startsWith("../")
  ) {
    return null;
  }

  return "Use owner/repo, a full git URL, or a local path.";
}

function buildRepositoryUrl(input, protocol) {
  const ownerRepo = input.replace(/\.git$/i, "");
  if (protocol === "ssh") {
    return `git@github.com:${ownerRepo}.git`;
  }
  return `https://github.com/${ownerRepo}.git`;
}

function normalizeProtocol(value) {
  const protocol = String(value || "").toLowerCase();
  if (protocol === "http") return "https";
  return protocol;
}

async function ensureRemote(root, options) {
  let existing = null;
  try {
    existing = gitOutput(["remote", "get-url", "origin"], { cwd: root });
  } catch {
    existing = null;
  }

  if (options.remote) {
    if (existing) {
      gitRun(["remote", "set-url", "origin", options.remote], { cwd: root });
    } else {
      gitRun(["remote", "add", "origin", options.remote], { cwd: root });
    }
    log.success(`Origin: ${options.remote}`);
    return options.remote;
  }

  if (existing) return existing;

  if (!canPrompt()) {
    throw new Error(
      "No origin remote is configured.\n" +
        "Run with --remote <url>, or add it manually:\n" +
        "  git remote add origin <url>",
    );
  }

  log.info("No origin remote is configured. Let's set one up.");
  const input = await promptText("Repository URL or owner/repo", {
    validate: validateRepositoryInput,
  });

  let url = input;
  if (/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(input)) {
    const requestedProtocol = normalizeProtocol(
      options.protocol ||
        (await promptText("Protocol (ssh/https)", {
          defaultValue: "ssh",
          validate: (value) =>
            ["ssh", "https", "http"].includes(value.toLowerCase())
              ? null
              : "Use ssh or https.",
        })),
    );

    if (!["ssh", "https"].includes(requestedProtocol)) {
      throw new Error(`Unsupported protocol: ${requestedProtocol}`);
    }

    url = buildRepositoryUrl(input, requestedProtocol);
  }

  gitRun(["remote", "add", "origin", url], { cwd: root });
  log.success(`Origin: ${url}`);
  return url;
}

function currentBranch(root) {
  try {
    return gitOutput(["symbolic-ref", "--short", "HEAD"], { cwd: root });
  } catch {
    throw new Error(
      "Cannot publish from a detached HEAD. Check out a branch first.",
    );
  }
}

function hasCommit(root) {
  try {
    gitOutput(["rev-parse", "--verify", "HEAD"], { cwd: root });
    return true;
  } catch {
    return false;
  }
}

function push(root, branch) {
  let upstream = null;
  try {
    upstream = gitOutput(
      ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"],
      { cwd: root },
    );
  } catch {
    upstream = null;
  }

  log.step(`Pushing ${branch} to origin…`);
  if (upstream) {
    gitRun(["push"], { cwd: root });
  } else {
    gitRun(["push", "-u", "origin", branch], { cwd: root });
  }
}

export async function publishCommand(options) {
  if (!hasGit()) {
    throw new Error("git is required to publish. Install git and try again.");
  }

  const projectDir = await resolveProjectDir(options.dir);
  log.step(`Project: ${color.bold(projectDir)}`);

  let root;
  try {
    root = gitOutput(["rev-parse", "--show-toplevel"], { cwd: projectDir });
  } catch {
    log.step("No git repository found; initializing one…");
    gitInit(projectDir);
    root = projectDir;
  }

  const relative = path
    .relative(root, projectDir)
    .split(path.sep)
    .filter(Boolean)
    .join("/");
  const prefix = relative;
  const branch = currentBranch(root);
  const remote = await ensureRemote(root, options);

  const posts = collectPostChanges(root, prefix);
  const siteEntries = statusFor(
    root,
    POST_SITE_PATHS.map((item) => (prefix ? `${prefix}/${item}` : item)),
  );
  const siteFiles = new Set();
  for (const entry of siteEntries) {
    siteFiles.add(entry.file);
    if (entry.oldFile) siteFiles.add(entry.oldFile);
  }

  const totalChanges =
    posts.new.size +
    posts.edit.size +
    posts.del.size +
    siteFiles.size;

  let commits = 0;

  if (totalChanges > 0) {
    ensureGitIdentity(root);

    if (posts.new.size > 0) {
      commits += commitPaths(
        root,
        posts.new,
        `tsukuru-post-new: ${summarizeFiles(posts.new, { stripExtension: true })}`,
      )
        ? 1
        : 0;
    }
    if (posts.edit.size > 0) {
      commits += commitPaths(
        root,
        posts.edit,
        `tsukuru-post-edit: ${summarizeFiles(posts.edit, { stripExtension: true })}`,
      )
        ? 1
        : 0;
    }
    if (posts.del.size > 0) {
      commits += commitPaths(
        root,
        posts.del,
        `tsukuru-post-del: ${summarizeFiles(posts.del, { stripExtension: true })}`,
      )
        ? 1
        : 0;
    }
    if (siteFiles.size > 0) {
      commits += commitPaths(
        root,
        siteFiles,
        `tsukuru: update site content (${summarizeFiles(siteFiles)})`,
      )
        ? 1
        : 0;
    }
  } else {
    log.info("No post or site changes to commit.");
  }

  if (!hasCommit(root)) {
    log.warn("Nothing to publish yet.");
    return;
  }

  push(root, branch);

  log.blank();
  log.success(
    `Published to ${remote} (${branch})${commits ? ` with ${commits} commit(s)` : ""}.`,
  );
}
