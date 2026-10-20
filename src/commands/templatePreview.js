import path from "node:path";
import { DEFAULT_TEMPLATE_BRANCH, resolveRepo } from "../lib/git.js";
import { loadConfig, saveConfig } from "../lib/config.js";
import { runPreview } from "../lib/preview.js";
import { findProjectDir } from "../lib/workspace.js";
import { log, color } from "../lib/log.js";

export async function templatePreviewCommand(options) {
  const { config } = await loadConfig();

  const repo = resolveRepo(
    options.repo ||
      process.env.TSUKURU_PREVIEW_REPO ||
      config.previewRepository ||
      config.repository,
  );
  const branch =
    options.branch ||
    options.templateBranch ||
    process.env.TSUKURU_PREVIEW_BRANCH ||
    config.previewBranch ||
    config.templateBranch ||
    DEFAULT_TEMPLATE_BRANCH;

  if (options.save) {
    const saved = await saveConfig({
      previewRepository: repo.raw,
      previewBranch: branch,
    });
    log.success(
      `Saved default template preview: ${repo.raw} (${branch}) in ${saved.file}`,
    );
  }

  const requestedDir = path.resolve(options.dir || process.cwd());
  const foundProject = await findProjectDir(requestedDir);

  if (options.dir && !foundProject) {
    throw new Error(
      `No Tsukuru content project found in ${requestedDir}.\n` +
        "Remove --dir to preview the template with its own content.",
    );
  }

  const projectDir = foundProject;

  const port = options.port ?? Number(process.env.TSUKURU_PORT || config.port);
  const host = options.host || process.env.TSUKURU_HOST || config.host;

  log.step(`Template: ${color.bold(repo.raw)} (${branch})`);
  if (projectDir) {
    log.step(`Content project: ${color.bold(projectDir)}`);
  } else {
    log.step(
      "No content project found here; previewing the template's own content.",
    );
  }

  await runPreview({
    repo,
    branch,
    projectDir,
    port,
    host,
    install: options.install,
    refresh: options.refresh || options.force,
    offline: options.offline,
    keepTemp: options.keepTemp,
    open: options.open,
  });
}
