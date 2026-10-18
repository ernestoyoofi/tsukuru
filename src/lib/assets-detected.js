import { opendir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

function normalizeDirectory(dir) {
  if (typeof dir !== "string" || !dir.trim()) {
    throw new TypeError("dir must be a non-empty path starting with '~'.");
  }

  const normalizedDir = dir.trim().replace(/\\/g, "/");
  const recursive = normalizedDir.endsWith("*");
  const directoryAlias = (
    recursive ? normalizedDir.slice(0, -1) : normalizedDir
  ).replace(/\/+$/, "");

  if (directoryAlias.includes("*")) {
    throw new TypeError(
      "The recursive wildcard '*' is only allowed at the end of dir.",
    );
  }
  if (directoryAlias !== "~" && !directoryAlias.startsWith("~/")) {
    throw new TypeError(
      "dir must start with '~' to refer to the project root.",
    );
  }

  const segments = directoryAlias.slice(1).split("/").filter(Boolean);
  if (segments.some((segment) => segment === "." || segment === "..")) {
    throw new TypeError("dir cannot contain '.' or '..' path segments.");
  }

  const directoryPath = path.resolve(projectRoot, ...segments);
  const relativeDirectory = path.relative(projectRoot, directoryPath);
  if (
    relativeDirectory === ".." ||
    relativeDirectory.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativeDirectory)
  ) {
    throw new TypeError("dir must resolve to a location inside the project.");
  }

  return {
    recursive,
    directoryPath,
    directoryAlias: segments.length > 0 ? `~/${segments.join("/")}` : "~",
  };
}

function normalizeExtensions(matchExt) {
  if (!Array.isArray(matchExt) || matchExt.length === 0) {
    throw new TypeError("match_ext must be a non-empty array of extensions.");
  }

  const extensions = [];
  const seen = new Set();
  for (const extension of matchExt) {
    if (typeof extension !== "string" || !extension.trim()) {
      throw new TypeError("Every match_ext item must be a non-empty string.");
    }
    const normalizedExtension = extension
      .trim()
      .replace(/^\.+/, "")
      .toLowerCase();
    if (!normalizedExtension || /[./\\]/.test(normalizedExtension)) {
      throw new TypeError(`Invalid file extension: ${extension}`);
    }
    if (!seen.has(normalizedExtension)) {
      seen.add(normalizedExtension);
      extensions.push(normalizedExtension);
    }
  }
  return extensions;
}

function validateFilename(filename) {
  const normalizedFilename =
    typeof filename === "string" ? filename.trim() : "";
  if (
    !normalizedFilename ||
    normalizedFilename === "." ||
    normalizedFilename === ".." ||
    /[\\/]/.test(normalizedFilename)
  ) {
    throw new TypeError(
      "filename must be a non-empty file name without a path.",
    );
  }
  return normalizedFilename;
}

export async function detectAssets({
  dir,
  filename,
  match_ext: matchExt,
} = {}) {
  const { recursive, directoryPath, directoryAlias } = normalizeDirectory(dir);
  const targetFilename = validateFilename(filename);
  const extensions = normalizeExtensions(matchExt);
  const extensionPriority = new Map(
    extensions.map((extension, index) => [extension, index]),
  );
  const matches = [];
  const directories = [directoryPath];

  while (directories.length > 0) {
    const currentDirectory = directories.pop();
    const directory = await opendir(currentDirectory);

    for await (const entry of directory) {
      const entryPath = path.join(currentDirectory, entry.name);
      if (entry.isDirectory()) {
        if (recursive) directories.push(entryPath);
        continue;
      }
      if (!entry.isFile() || path.parse(entry.name).name !== targetFilename) {
        continue;
      }

      const extension = path.extname(entry.name).slice(1).toLowerCase();
      if (!extensionPriority.has(extension)) continue;

      const relativePath = path
        .relative(directoryPath, entryPath)
        .split(path.sep)
        .join("/");
      matches.push({
        name: entry.name,
        ext_match: extension,
        path: entryPath,
        path_form: `${directoryAlias}/${relativePath}`,
        _priority: extensionPriority.get(extension),
      });
    }
  }

  matches.sort(
    (first, second) =>
      first._priority - second._priority ||
      first.path.localeCompare(second.path),
  );

  return matches.map(({ _priority, ...match }) => match);
}

export default detectAssets;
