import os from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";

export const isWindows = process.platform === "win32";

export function tsukuruHome() {
  if (process.env.TSUKURU_HOME) {
    return path.resolve(process.env.TSUKURU_HOME);
  }
  // Backwards-compatible alias for earlier previews.
  if (process.env.TSUKURU_CACHE_DIR) {
    return path.resolve(process.env.TSUKURU_CACHE_DIR);
  }
  return path.join(os.homedir(), ".tsukuru");
}

export function cacheRoot() {
  return tsukuruHome();
}

export function tempRoot() {
  return process.env.TSUKURU_TMP_DIR
    ? path.resolve(process.env.TSUKURU_TMP_DIR)
    : os.tmpdir();
}

export function sessionPath(kind) {
  const id = randomBytes(4).toString("hex");
  return path.join(tempRoot(), `${id}-tsukuru-${kind}`);
}

export function slugify(value) {
  return String(value)
    .replace(/\.git$/i, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function shortHash(value) {
  return String(value).slice(0, 12);
}
