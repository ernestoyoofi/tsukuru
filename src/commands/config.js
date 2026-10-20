import path from "node:path";
import { configPath, loadConfig, saveConfig } from "../lib/config.js";
import { resolvePreviewRoot, tsukuruHome } from "../lib/platform.js";
import { log, color } from "../lib/log.js";

function persistentPreviewDir(value) {
  const text = String(value).trim();
  if (!text) return "tmp";
  if (
    text === "home" ||
    text === "tmp" ||
    text === "~" ||
    text.startsWith("~/") ||
    text.startsWith("~\\")
  ) {
    return text;
  }
  return path.resolve(text);
}

export async function configCommand(options = {}) {
  let { config, file } = await loadConfig();

  if (options.previewDir != null) {
    const previewDir = persistentPreviewDir(options.previewDir);
    const saved = await saveConfig({ previewDir });
    config = saved.config;
    file = saved.file;
    log.success(`Saved previewDir = ${previewDir} in ${file}`);
    log.blank();
  }

  const home = tsukuruHome();
  const preview = resolvePreviewRoot({ configured: config.previewDir });

  log.out(`${color.bold("Tsukuru home")}  ${home}`);
  log.out(`${color.bold("Config file")}   ${file}`);
  log.out(`${color.bold("Preview")}       ${preview}`);
  log.out(`${color.bold("Templates")}     ${path.join(home, "templates")}`);
  log.out(`${color.bold("Runtime")}       ${path.join(home, "runtime")}`);
  log.blank();
  log.out(JSON.stringify(config, null, 2));
  log.blank();
  log.info(
    `Set the preview location with: tsukuru config --preview-dir home`,
  );
  log.info(`Config file: ${configPath()}`);
}
