# Tsukuru CLI

A small, dependency-free CLI to **initialize**, **preview**, and **validate**
[Tsukuru](https://github.com/ernestoyoofi/tsukuru) blogs.

- `init` clones only the content structure branch (`setup/structure`), removes
  its `.git`, and starts a fresh git repository for your blog.
- `serve` runs the full Next.js template in a temporary workspace and layers
  in your `posts/`, `public/`, and `tsukuru.config.js`.
- `template-preview` does the same with any template repository you own.
- `validate` runs the template's `tsukuru.valid.test.js` against your posts.

## Requirements

- Node.js **20.9+**
- `git` recommended (the CLI falls back to a GitHub source archive when git is
  unavailable)
- `bun` is used for dependency installation when available; otherwise `npm` is
  used

## Install

```sh
npm install -g tsukuru-cli
```

The command is still called `tsukuru`. The npm name `tsukuru` is already used
by an unrelated package, so this CLI is published as `tsukuru-cli`.

Install directly from a git branch instead (no npm publish needed):

```sh
npm install -g "github:ernestoyoofi/tsukuru#setup/script"
```

From a local checkout:

```sh
npm install
npm link            # exposes the `tsukuru` command
# or run directly:
node bin/tsukuru.js --help
```

## Quick start

```sh
tsukuru init first-article
cd first-article

tsukuru serve              # http://localhost:3000
tsukuru validate           # check post metadata
```

`init` creates the same content layout as the upstream structure branch:

```txt
first-article/
├─ .github/workflows/tsukuru.yml
├─ posts/
├─ public/
│  ├─ assets/
│  └─ images/
├─ tsukuru.config.js
└─ .git/                    # new repository, branch: main
```

## Commands

### `tsukuru init <name>`

Aliases: `create`, `new`.

```sh
tsukuru init first-article
tsukuru create first-article
tsukuru --init --name first-article
tsukuru init . --dir /home/user/first-article
```

- Downloads the **latest commit** of `setup/structure` (shallow clone).
- Removes the structure repository's `.git`.
- Initializes a new git repository with `main` as the branch.
- Only allows empty target folders unless `--force` is passed.

### `tsukuru serve [dir]`

Aliases: `preview`, `look`.

```sh
tsukuru serve
tsukuru preview --port 4000 --open
tsukuru look /home/user/first-article
```

How it works:

1. The template from `ernestoyoofi/tsukuru:main` is copied to a temporary
   folder such as `/tmp/47221321-tsukuru-prev` (or the platform temp folder).
2. Only your `posts/`, `public/`, `tsukuru.config.js`, `favicon.ico`, and
   `CNAME` are copied into that workspace. The rest comes from the template.
3. Next.js starts from the temporary workspace, leaving your content folder
   untouched.
4. Editing `tsukuru.config.js` **automatically restarts the dev server**.
5. Editing `posts/` or `public/` automatically re-syncs them into the
   workspace, so Next.js can re-render without a restart.
6. The workspace is deleted when the command exits (use `--keep-temp` to keep
   it for debugging).

Use a custom template with `serve` directly:

```sh
tsukuru serve --repo yourname/template-tsukuru --template-branch main
```

### `tsukuru template-preview`

Aliases: `template`, `tpl`.

Preview a **template repository you own** instead of the default
`ernestoyoofi/tsukuru:main`.

```sh
tsukuru template-preview \
  --repo https://github.com/yourname/template-tsukuru \
  --branch main
```

- If you run it inside a Tsukuru content project, your `posts/`, `public/`,
  and `tsukuru.config.js` are layered into that template.
- If you run it outside a content project, the template is previewed with its
  own content.
- `--repo` also accepts `owner/repo`.
- `--save` stores the repository and branch in `~/.tsukuru/config.json` as the
  default for future `template-preview` runs.

```sh
tsukuru template-preview \
  --repo yourname/template-tsukuru --branch main --save

# later, without flags:
tsukuru template-preview
```

### `tsukuru validate [dir]`

Aliases: `test`, `check`.

Runs the template's `tsukuru.valid.test.js` in a temporary workspace with your
posts.

```sh
tsukuru validate
tsukuru test --valid
tsukuru test --unvalid --publish
```

### `tsukuru config`

Prints `~/.tsukuru/config.json` and the locations of cached templates and
runtime dependencies.

## Persistent storage (`~/.tsukuru`)

Everything that should survive between runs lives in `~/.tsukuru` (or
`%USERPROFILE%\.tsukuru` on Windows):

```txt
~/.tsukuru/
├─ config.json             default repository, branches, port, host
├─ templates/              cached shallow clones of template repositories
└─ runtime/                installed template dependencies (node_modules)
```

`config.json` is created automatically on first use:

```json
{
  "repository": "ernestoyoofi/tsukuru",
  "structureBranch": "setup/structure",
  "templateBranch": "main",
  "previewRepository": null,
  "previewBranch": null,
  "port": 3000,
  "host": "0.0.0.0"
}
```

Set `TSUKURU_HOME` to use a different folder.

Preview and validation **workspaces** are intentionally created in the OS
temporary directory (for example `/tmp`), not in `~/.tsukuru`, and are removed
on exit.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `TSUKURU_HOME` | Override the `~/.tsukuru` folder. |
| `TSUKURU_REPO` | Default source repository. |
| `TSUKURU_STRUCTURE_BRANCH` | Structure branch for `init`. |
| `TSUKURU_TEMPLATE_BRANCH` | Template branch for `serve`/`validate`. |
| `TSUKURU_PREVIEW_REPO` | Default template repository for `template-preview`. |
| `TSUKURU_PREVIEW_BRANCH` | Default template branch for `template-preview`. |
| `TSUKURU_TMP_DIR` | Override the workspace temp folder. |
| `TSUKURU_PORT` | Preview port. |
| `TSUKURU_HOST` | Preview hostname. |
| `TSUKURU_TEMPLATE_TTL_MINUTES` | Cache refresh interval (default 10 minutes). |
| `NO_COLOR` / `FORCE_COLOR` | Control colored output. |

## Notes

- **Why webpack?** Next.js 16 enables Turbopack by default, and Turbopack
  rejects a `node_modules` symlink that points outside the project root. The
  CLI uses webpack for Next.js 16+ so the dependency cache can be shared
  between runs. Older Next.js versions use their default bundler.
- **Offline mode:** `--offline` skips network refreshes and uses the cached
  template. The first run still needs network access.
- **Windows / macOS / Linux / Android (Termux):** paths use Node's `os.tmpdir()`
  and `os.homedir()`, so the same commands work on all platforms. On Windows,
  `node_modules` is linked as a junction.
- **Private template repositories:** `git` must be installed and authenticated
  for cloning; the archive fallback only supports public GitHub repositories.

## Development

```sh
node bin/tsukuru.js --help
node bin/tsukuru.js init /tmp/demo-blog
node bin/tsukuru.js validate /tmp/demo-blog
node bin/tsukuru.js serve /tmp/demo-blog --port 3100
```

## License

MIT
