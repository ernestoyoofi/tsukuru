import path from "node:path";
import {
  DEFAULT_HOST,
  DEFAULT_PORT,
  DEFAULT_REPO,
  DEFAULT_STRUCTURE_BRANCH,
  DEFAULT_TEMPLATE_BRANCH,
} from "./constants.js";
import { ensureDir, pathExists, readJson, writeJson } from "./fs.js";
import { tsukuruHome } from "./platform.js";

export const DEFAULT_CONFIG = {
  repository: DEFAULT_REPO,
  structureBranch: DEFAULT_STRUCTURE_BRANCH,
  templateBranch: DEFAULT_TEMPLATE_BRANCH,
  previewRepository: null,
  previewBranch: null,
  port: DEFAULT_PORT,
  host: DEFAULT_HOST,
};

export function configPath() {
  return path.join(tsukuruHome(), "config.json");
}

function cleanupConfig(value) {
  const config = { ...DEFAULT_CONFIG };
  if (!value || typeof value !== "object") return config;

  for (const key of ["repository", "structureBranch", "templateBranch"]) {
    if (typeof value[key] === "string" && value[key].trim()) {
      config[key] = value[key].trim();
    }
  }

  for (const key of ["previewRepository", "previewBranch"]) {
    if (value[key] === null || value[key] === "") {
      config[key] = null;
    } else if (typeof value[key] === "string" && value[key].trim()) {
      config[key] = value[key].trim();
    }
  }

  if (Number.isInteger(value.port) && value.port > 0 && value.port < 65536) {
    config.port = value.port;
  }
  if (typeof value.host === "string" && value.host.trim()) {
    config.host = value.host.trim();
  }

  return config;
}

export async function loadConfig({ create = true } = {}) {
  const file = configPath();
  const stored = (await pathExists(file)) ? await readJson(file) : null;
  const config = cleanupConfig(stored);

  if (!stored && create) {
    await ensureDir(path.dirname(file));
    await writeJson(file, config);
  }

  return { config, file };
}

export async function saveConfig(patch) {
  const file = configPath();
  const stored = (await pathExists(file)) ? await readJson(file) : null;
  const config = cleanupConfig({ ...(stored || {}), ...patch });
  await ensureDir(path.dirname(file));
  await writeJson(file, config);
  return { config, file };
}
