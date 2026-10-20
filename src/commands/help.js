import { VERSION } from "../version.js";

export function printVersion() {
  console.log(VERSION);
}

export function printHelp() {
  console.log(`
Tsukuru CLI ${VERSION} — initialize, preview, and validate Tsukuru blogs.

Usage
  tsukuru <command> [options]
  tsukuru --init --name <name>

Commands
  init <name>         Create a project from the content structure branch
                      (posts/, public/, tsukuru.config.js, GitHub workflow).
  serve [dir]         Run the Next.js template in a temporary workspace with
                      your posts/, public/, and tsukuru.config.js layered in.
                      Editing tsukuru.config.js restarts the server.
  template-preview    Preview a custom template repository. If the current
                      folder is a Tsukuru content project, its posts/,
                      public/, and config are layered into the template.
                      Otherwise the template's own content is previewed.
  validate [dir]      Run tsukuru.valid.test.js against your posts.
  config              Show the persistent config in ~/.tsukuru/config.json.
  help                Show this help.

Aliases
  create, new         init
  preview, look       serve
  template, tpl       template-preview
  test, check         validate
  settings            config

Options
  -h, --help                 Show help.
  -v, --version              Show the CLI version.
      --init                 Init command (used with --name).
      --name <name>          Project name for init.
      --dir <path>           Target directory (init) or project directory
                             (serve/validate/template-preview).
      --repo <owner/repo>    Source repository. For template-preview this is
                             the template repository to preview.
                             Default: ernestoyoofi/tsukuru
      --branch <branch>      Template branch for template-preview.
                             Default: main
      --structure-branch <b> Structure branch used by init.
                             Default: setup/structure
      --template-branch <b>  Template branch used by serve/validate.
                             Default: main
      --save                 template-preview: save --repo/--branch as the
                             default template preview in ~/.tsukuru/config.json.
  -p, --port <port>          Preview port. Default: 3000
  -H, --host <host>          Preview hostname. Default: 0.0.0.0
      --force                Allow init into a non-empty directory.
      --refresh              Refresh the cached template before serving.
      --offline              Use only the cached template (no network).
      --keep-temp            Keep the temporary preview/validation workspace.
      --no-install           Fail instead of installing dependencies.
      --open                 Open the preview URL in a browser.
      --valid                validate: show valid posts.
      --unvalid              validate: show invalid posts.
      --publish              validate: show posts ready to publish.

Storage
  ~/.tsukuru/config.json   Persistent defaults (repo, branches, port, host).
  ~/.tsukuru/templates/    Cached template repositories.
  ~/.tsukuru/runtime/      Installed template dependencies.
  Temporary preview and validation workspaces are created in the OS temp
  directory and removed when the command exits (unless --keep-temp).

Environment
  TSUKURU_HOME, TSUKURU_REPO, TSUKURU_STRUCTURE_BRANCH,
  TSUKURU_TEMPLATE_BRANCH, TSUKURU_PREVIEW_REPO, TSUKURU_PREVIEW_BRANCH,
  TSUKURU_TMP_DIR, TSUKURU_PORT, TSUKURU_HOST,
  TSUKURU_TEMPLATE_TTL_MINUTES, NO_COLOR, FORCE_COLOR

Examples
  tsukuru init first-article
  tsukuru create first-article
  tsukuru --init --name first-article
  cd first-article
  tsukuru serve
  tsukuru preview --port 4000 --open
  tsukuru test --unvalid --publish

  tsukuru template-preview \\
    --repo https://github.com/yourname/template-tsukuru --branch main

  tsukuru template-preview \\
    --repo yourname/template-tsukuru --branch main --save
`);
}
