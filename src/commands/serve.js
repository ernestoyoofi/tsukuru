import { DEFAULT_TEMPLATE_BRANCH, resolveRepo } from "../lib/git.js";
import { loadConfig } from "../lib/config.js";
import { runPreview } from "../lib/preview.js";
import { resolveProjectDir } from "../lib/workspace.js";
import { resolvePreviewRoot } from "../lib/platform.js";
import { log, color } from "../lib/log.js";

export async function serveCommand(options) {
  const { config } = await loadConfig();
  const repo = resolveRepo(
    options.repo || process.env.TSUKURU_REPO || config.repository,
  );
  const branch =
    options.templateBranch ||
    options.branch ||
    process.env.TSUKURU_TEMPLATE_BRANCH ||
    config.templateBranch ||
    DEFAULT_TEMPLATE_BRANCH;
  const port = options.port ?? Number(process.env.TSUKURU_PORT || config.port);
  const host = options.host || process.env.TSUKURU_HOST || config.host;

  const projectDir = await resolveProjectDir(options.dir);
  log.step(`Project: ${color.bold(projectDir)}`);

  const previewRoot = resolvePreviewRoot({
    override: options.previewDir,
    configured: config.previewDir,
  });

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
    previewRoot,
  });
}
