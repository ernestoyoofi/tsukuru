import { promises as fsp } from "node:fs";
import path from "node:path";
import {
  copyTree,
  ensureDir,
  existsSync,
  isDirectory,
  pathExists,
  remove,
  replaceDirectory,
} from "./fs.js";
import { isWindows } from "./platform.js";
import { log } from "./log.js";

const TEMPLATE_OMIT = new Set([
  ".git",
  "node_modules",
  ".next",
  "out",
  "posts",
  "public",
]);

export async function linkNodeModules(sessionDir, nodeModules) {
  const destination = path.join(sessionDir, "node_modules");
  await remove(destination);

  try {
    await fsp.symlink(
      nodeModules,
      destination,
      isWindows ? "junction" : "dir",
    );
  } catch (error) {
    log.warn(
      `Could not link node_modules (${error.message.split("\n")[0]}); copying instead (this can be slow).`,
    );
    await copyTree(nodeModules, destination);
  }
}

export async function copyConfig(projectDir, sessionDir) {
  const configFile = path.join(projectDir, "tsukuru.config.js");
  const destination = path.join(sessionDir, "tsukuru.config.js");

  if (await pathExists(configFile)) {
    await fsp.copyFile(configFile, destination);
    return true;
  }

  await remove(destination);
  log.warn(
    "tsukuru.config.js was not found in the project; the template default will be used.",
  );
  return false;
}

export async function syncContent(projectDir, sessionDir) {
  await replaceDirectory(
    path.join(projectDir, "posts"),
    path.join(sessionDir, "posts"),
  );
  await replaceDirectory(
    path.join(projectDir, "public"),
    path.join(sessionDir, "public"),
  );

  await copyConfig(projectDir, sessionDir);

  const favicon = path.join(projectDir, "favicon.ico");
  if (existsSync(favicon)) {
    await fsp.copyFile(favicon, path.join(sessionDir, "src", "app", "favicon.ico"));
  }

  const cname = path.join(projectDir, "CNAME");
  if (existsSync(cname)) {
    await ensureDir(path.join(sessionDir, "public"));
    await fsp.copyFile(cname, path.join(sessionDir, "public", "CNAME"));
  }
}

export async function materializeSession({
  templateDir,
  projectDir,
  sessionDir,
  nodeModules,
}) {
  await remove(sessionDir);
  await ensureDir(sessionDir);

  const entries = await fsp.readdir(templateDir, { withFileTypes: true });
  for (const entry of entries) {
    if (TEMPLATE_OMIT.has(entry.name)) continue;
    await fsp.cp(
      path.join(templateDir, entry.name),
      path.join(sessionDir, entry.name),
      { recursive: true, force: true },
    );
  }

  await ensureDir(path.join(sessionDir, "posts"));
  await ensureDir(path.join(sessionDir, "public"));
  await syncContent(projectDir, sessionDir);
  await linkNodeModules(sessionDir, nodeModules);

  return sessionDir;
}

export async function isTsukuruProject(directory) {
  return (
    existsSync(path.join(directory, "tsukuru.config.js")) ||
    (await isDirectory(path.join(directory, "posts")))
  );
}

export async function findProjectDir(input) {
  let directory = path.resolve(input || process.cwd());
  if (!(await isDirectory(directory))) return null;

  while (true) {
    if (await isTsukuruProject(directory)) return directory;
    const parent = path.dirname(directory);
    if (parent === directory) return null;
    directory = parent;
  }
}

export async function resolveProjectDir(input) {
  const start = path.resolve(input || process.cwd());

  if (!(await isDirectory(start))) {
    throw new Error(`Project directory does not exist: ${start}`);
  }

  const directory = await findProjectDir(start);
  if (!directory) {
    throw new Error(
      `No Tsukuru project found in ${start} or its parent folders.\n` +
        "Expected tsukuru.config.js or a posts/ directory. Run \"tsukuru init <name>\" first, or pass --dir <path>.",
    );
  }

  return directory;
}
