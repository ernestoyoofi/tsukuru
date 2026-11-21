# Tsukuru

An article publishing engine for static sites built with Next.js.

### Project structure

```txt
tsukuru/                                   → Init project
├─ .github
│   └─ workflows
│       └─ tsukuru.yml                     → GitHub Actions workflow (optional if you build locally)
├─ posts/*                                 → Blog posts
├─ public/
│   ├─ assets/                             → Site-wide assets, such as header and footer icons
│   │   ├─ icon-header.svg (or .webp/.png) → Custom header title image or icon
│   │   └─ icon-footer.svg (or .webp/.png) → Custom footer title image or icon
│   └─ images/                             → Images used in blog posts
├─ favicon.ico                             → Site favicon
├─ CNAME                                   → Custom domain for GitHub Pages
└─ tsukuru.config.js                       → Tsukuru template configuration
```

### Validate Posts

Run the validation script from the project root to check all `.mdx` files in
`posts/`:

```sh
bun tsukuru.valid.test.js
```

You can also run it with Node.js:

```sh
node tsukuru.valid.test.js
```

The script uses the same article parser and loading pipeline as the site. It
reports the overall validation count, valid and invalid posts, and posts that
are ready to publish. Draft posts are considered valid but are excluded from
the publish list. Invalid posts include the validation errors that need to be
fixed.

Use these options to show only the section you need:

```sh
node tsukuru.valid.test.js --valid
node tsukuru.valid.test.js --unvalid
node tsukuru.valid.test.js --publish
```

Combine options to show multiple sections. For example, to review invalid posts
and the posts ready to publish:

```sh
node tsukuru.valid.test.js --unvalid --publish
```

When no options are provided, all sections are shown. Terminal colors are
enabled automatically when supported; set `FORCE_COLOR=1` to force colors or
`NO_COLOR=1` to disable them.

### Analytics

Analytics are disabled by default. Configure one provider in
`metadata.analytics` in `tsukuru.config.js`:

```js
analytics: {
  type: "umami",
  id: "your-website-id",
  script: "https://analytics.example/script.js",
},
```

Use the provider's expected value for `id`: a Google measurement ID, Umami
website ID, Plausible site domain, or Matomo site ID. Google uses Google's
gtag.js automatically; Umami, Plausible, and Matomo use the custom `script`
URL, so self-hosted and proxy URLs are supported. Plausible's `script` is its
script endpoint (commonly `/js/script.js`); Matomo's URL must end in `.js`,
with the matching `.php` tracker endpoint beside it. Page views are tracked
across client-side navigation. Since the site is statically exported, scripts
are loaded in the visitor's browser and no analytics server runtime is needed.

### Target

- [x] Search feature with `minisearch`
- [x] Detailing indexing google & SEO
- [x] Add information image cannot be fetch
- [x] More configuration for link footer, copyright info and specifict description
- [x] More configuration for costumization svg/png/webp for icon header & footer
- [x] Adding support highlight code
- [x] Support costum destination folder
- [x] Shortlink detected and redirect it
- [x] Validate posts
- [x] Create script init for installer, preview and check validate format (`tsukuru init`, `tsukuru view`, `tsukuru build`, `tsukuru validate`), [please check here!](https://github.com/ernestoyoofi/tsukuru/tree/setup/script)
- [x] Adding analytics
- [x] Add dark mode
- [ ] Add page pad to limit view
- [ ] Adding option llms.txt generator

<!--
> Named after Tsukuru (創る) the Japanese art of bringing something meaningful into existence. Built for those who want full creative control over both their words and the canvas they live on.

An article publishing engine for static sites built with Next.js.
-->