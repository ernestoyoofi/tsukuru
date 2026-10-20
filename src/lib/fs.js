import fs from "node:fs";
import { promises as fsp } from "node:fs";
import path from "node:path";

export function existsSync(target) {
  try {
    return fs.existsSync(target);
  } catch {
    return false;
  }
}

export async function pathExists(target) {
  try {
    await fsp.access(target);
    return true;
  } catch {
    return false;
  }
}

export async function isDirectory(target) {
  try {
    return (await fsp.stat(target)).isDirectory();
  } catch {
    return false;
  }
}

export async function isEmptyDirectory(target) {
  try {
    const entries = await fsp.readdir(target);
    return entries.length === 0;
  } catch {
    return false;
  }
}

export async function remove(target) {
  await fsp.rm(target, { recursive: true, force: true });
}

export function removeSync(target) {
  try {
    fs.rmSync(target, { recursive: true, force: true });
  } catch {
    // Best effort cleanup (for example, locked files on Windows).
  }
}

export async function ensureDir(target) {
  await fsp.mkdir(target, { recursive: true });
}

export async function copyTree(source, destination, filter) {
  await fsp.cp(source, destination, {
    recursive: true,
    force: true,
    filter,
  });
}

export async function copyDirectoryContents(source, destination) {
  await ensureDir(destination);
  const entries = await fsp.readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    await fsp.cp(
      path.join(source, entry.name),
      path.join(destination, entry.name),
      { recursive: true, force: true },
    );
  }
}

export async function replaceDirectory(source, destination) {
  await remove(destination);
  if (source && (await isDirectory(source))) {
    await fsp.cp(source, destination, { recursive: true, force: true });
  } else {
    await ensureDir(destination);
  }
}

export async function writeJson(target, value) {
  await ensureDir(path.dirname(target));
  await fsp.writeFile(target, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function readJson(target) {
  try {
    return JSON.parse(await fsp.readFile(target, "utf8"));
  } catch {
    return null;
  }
}
