import { promises as fsp } from "node:fs";
import path from "node:path";
import {
  DEFAULT_REPO,
  DEFAULT_STRUCTURE_BRANCH,
  getLatestSource,
  gitInit,
  hasGit,
  resolveRepo,
} from "../lib/git.js";
import { loadConfig } from "../lib/config.js";
import {
  ensureDir,
  isEmptyDirectory,
  isDirectory,
  pathExists,
  remove,
} from "../lib/fs.js";
import { sessionPath } from "../lib/platform.js";
import { log, color } from "../lib/log.js";

async function copyStructure(source, destination) {
  await ensureDir(destination);
  const entries = await fsp.readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === ".git") continue;
    await fsp.cp(
      path.join(source, entry.name),
      path.join(destination, entry.name),
      { recursive: true, force: true },
    );
  }
}

export async function initCommand(options) {
  if (!options.name && !options.dir) {
    throw new Error(
      "Missing project name.\nUsage: tsukuru init <name>\n       tsukuru --init --name <name>",
    );
  }

  const { config } = await loadConfig();
  const repo = resolveRepo(
    options.repo || process.env.TSUKURU_REPO || config.repository || DEFAULT_REPO,
  );
  const branch =
    options.structureBranch ||
    process.env.TSUKURU_STRUCTURE_BRANCH ||
    config.structureBranch ||
    DEFAULT_STRUCTURE_BRANCH;

  const target = options.dir
    ? path.resolve(options.dir)
    : path.resolve(process.cwd(), options.name);

  if (await pathExists(target)) {
    if (!(await isDirectory(target))) {
      throw new Error(`Target exists and is not a directory: ${target}`);
    }
    if (!(await isEmptyDirectory(target)) && !options.force) {
      throw new Error(
        `Target directory is not empty: ${target}\n` +
          "Choose another name or pass --force to merge the structure into it.",
      );
    }
  }

  const temporary = sessionPath("init");
  let completed = false;

  try {
    log.step(`Fetching ${repo.raw} (${branch})…`);
    await getLatestSource(repo, branch, temporary);

    await copyStructure(temporary, target);
    completed = true;
  } finally {
    await remove(temporary);
  }

  if (!completed) {
    throw new Error("Could not create the project structure.");
  }

  let initializedGit = false;
  if (hasGit()) {
    if (!(await pathExists(path.join(target, ".git")))) {
      initializedGit = gitInit(target);
    }
  } else {
    log.warn("git was not found; skipping git repository initialization.");
  }

  const name = path.basename(target);
  log.blank();
  log.success(`Created ${color.bold(name)} at ${target}`);
  log.out(`  ${color.dim("posts/")}            your articles (*.mdx)`);
  log.out(`  ${color.dim("public/")}           images, icons, CNAME`);
  log.out(`  ${color.dim("tsukuru.config.js")}  site configuration`);
  if (initializedGit) {
    log.out(`  ${color.dim(".git/")}             initialized repository (branch: main)`);
  }
  log.blank();
  log.info("Next steps:");
  const relative = path.relative(process.cwd(), target);
  if (relative && !relative.startsWith("..") && relative !== "") {
    log.out(`  cd ${relative}`);
  }
  log.out("  tsukuru serve       # preview the site");
  log.out("  tsukuru validate    # check post metadata");
  log.out("  git add -A && git commit -m \"Initial commit\"");
}
