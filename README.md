# Tsukuru CLI

Initialize, preview, validate, and publish
[Tsukuru](https://github.com/ernestoyoofi/tsukuru) blogs.

**Bun is recommended.** If Bun is installed, the CLI uses it automatically,
even when started through Node. Set `TSUKURU_RUNTIME=node` to force Node.js.

## Requirements

- **Bun 1.1+ (recommended)**
- Node.js **20.9+** for the `tsukuru` launcher, or as a full fallback
- `git`

## Install

```sh
bun install -g "github:ernestoyoofi/tsukuru#setup/script"
```

Without Bun:

```sh
npm install -g "github:ernestoyoofi/tsukuru#setup/script"
```

The command is `tsukuru`.

## Quick start

```sh
tsukuru init first_article
cd first_article
tsukuru serve
tsukuru validate
tsukuru publish
```

Project names may contain only `A-Z`, `a-z`, `0-9`, `_`, and `.`. Spaces,
hyphens, and other symbols are not allowed. Use `first_article`, not
`first-article`.

## Commands

### `tsukuru init <name>`

Aliases: `create`, `new`.

```sh
tsukuru init first_article
tsukuru create first_article
tsukuru --init --name first_article
```

- Clones the latest `setup/structure`, removes its `.git`, and initializes a
  new repository on `main`.
- If the name is omitted in an interactive terminal, the CLI asks for it.
- Use `--force` to allow a non-empty target directory.

### `tsukuru serve [dir]`

Aliases: `preview`, `look`.

```sh
tsukuru serve
tsukuru preview --port 4000 --open
```

Next.js runs in a temporary workspace with only your `posts/`, `public/`, and
`tsukuru.config.js` copied in. Editing the config restarts the server; editing
posts or public files syncs them automatically. Next.js logs are shown
directly.

### `tsukuru validate [dir]`

Aliases: `test`, `check`.

```sh
tsukuru validate
tsukuru test --valid
tsukuru test --unvalid --publish
```

Runs the template's `tsukuru.valid.test.js` against your posts.

### `tsukuru publish [dir]`

Aliases: `push`.

```sh
tsukuru publish
tsukuru publish --remote git@github.com:yourname/blog.git
```

- Initializes git and asks for a repository URL (SSH or HTTPS) when needed.
- Creates separate commits:
  - `tsukuru-post-new: <names>`
  - `tsukuru-post-edit: <names>`
  - `tsukuru-post-del: <names>`
  - `tsukuru: update site content (...)` for config, public files, and workflow
- Only stages content paths, so files like `.env` are not committed.
- Pushes the current branch and sets its upstream.

Use `--remote <url>` and `--protocol <ssh|https>` for non-interactive setup.

### `tsukuru template-preview`

Aliases: `template`, `tpl`.

```sh
tsukuru template-preview \
  --repo https://github.com/yourname/template-tsukuru \
  --branch main
```

Uses your content when run inside a Tsukuru project; otherwise previews the
template's own content. `--save` stores the choice in
`~/.tsukuru/config.json`.

## Template cache

Templates are cached in `~/.tsukuru/templates` and checked for updates after
24 hours. If the remote has no new commit, the cached version is reused.
Use `--force` or `--refresh` on `serve`, `validate`, or `template-preview` to
check immediately.

Change the interval with `TSUKURU_TEMPLATE_TTL_MINUTES`.

## Storage

```txt
~/.tsukuru/
├─ config.json     defaults (repo, branches, port, host)
├─ templates/      cached templates
└─ runtime/        cached dependencies
```

Set `TSUKURU_HOME` to use a different folder.

## Options

```txt
--dir <path>          Project directory
--repo <owner/repo>   Template repository
--branch <branch>     Template branch
--port <port>         Preview port (default 3000)
--host <host>         Preview hostname (default 0.0.0.0)
--force               Allow non-empty init, or force template refresh
--refresh             Force template refresh
--offline             Use the cached template only
--keep-temp           Keep the temporary workspace
--no-install          Do not install dependencies
--open                Open the preview in a browser
```

Run `tsukuru help` for the full list.

## License

MIT
