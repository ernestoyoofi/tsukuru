import { VERSION } from "../version.js";

export function printVersion() {
  console.log(VERSION);
}

export function printHelp() {
  console.log(`
Tsukuru CLI ${VERSION} — initialize, preview, publish, and validate Tsukuru blogs.

Usage
  tsukuru <command> [options]
  tsukuru --init --name <name>

Runtime
  Bun is preferred. When Bun is installed, the CLI relaunches itself with Bun,
  and Bun is also used for dependency installation and the Next.js dev server.
  Set TSUKURU_RUNTIME=node to force Node.js.

Commands
  init <name>         Create a project from the content structure branch
                      (posts/, public/, tsukuru.config.js, GitHub workflow).
                      Project names allow A-Z, a-z, 0-9, underscore, and dot.
                      If the name is omitted, an interactive prompt asks for it.
  serve [dir]         Run the Next.js template in a temporary workspace with
                      your posts/, public/, and tsukuru.config.js layered in.
                      Editing tsukuru.config.js restarts the server.
  template-preview    Preview a custom template repository. If the current
                      folder is a Tsukuru content project, its posts/,
                      public/, and config are layered into the template.
                      Otherwise the template's own content is previewed.
  validate [dir]      Run tsukuru.valid.test.js against your posts.
  publish [dir]       Commit post and site changes, then push to origin.
                      Initializes git and asks for a repository URL (SSH or
                      HTTPS) when no origin remote is configured.
  config              Show the persistent config in ~/.tsukuru/config.json.
  help                Show this help.

Aliases
  create, new         init
  preview, look       serve
  template, tpl       template-preview
  test, check         validate
  push                publish
  settings            config

Options
  -h, --help                 Show help.
  -v, --version              Show the CLI version.
      --init                 Init command (used with --name).
      --name <name>          Project name for init.
      --dir <path>           Target directory (init) or project directory
                             (serve/validate/template-preview/publish).
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
      --remote <url>         publish: add or replace the origin remote.
      --protocol <protocol>  publish: ssh or https when using owner/repo.
  -p, --port <port>          Preview port. Default: 3000
  -H, --host <host>          Preview hostname. Default: 0.0.0.0
      --force                init: allow a non-empty target directory.
                             serve/validate/template-preview: force a template
                             update check (same as --refresh).
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
  Cached templates are checked for updates after 24 hours. If the remote has
  no new commit, the cached version is reused. Use --force to check now.
  Temporary preview and validation workspaces are created in the OS temp
  directory and removed when the command exits (unless --keep-temp).

Environment
  TSUKURU_RUNTIME (bun|node), TSUKURU_HOME, TSUKURU_REPO,
  TSUKURU_STRUCTURE_BRANCH, TSUKURU_TEMPLATE_BRANCH,
  TSUKURU_PREVIEW_REPO, TSUKURU_PREVIEW_BRANCH, TSUKURU_TMP_DIR,
  TSUKURU_PORT, TSUKURU_HOST, TSUKURU_TEMPLATE_TTL_MINUTES,
  NO_COLOR, FORCE_COLOR

Examples
  tsukuru init first_article
  tsukuru create first_article
  tsukuru --init --name first_article
  cd first_article
  tsukuru serve
  tsukuru preview --port 4000 --open
  tsukuru validate --unvalid --publish
  tsukuru publish

  tsukuru template-preview \\
    --repo https://github.com/yourname/template-tsukuru --branch main

  tsukuru template-preview \\
    --repo yourname/template-tsukuru --branch main --save

  tsukuru publish --remote git@github.com:yourname/blog.git
`);
}
