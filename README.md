# Tsukuru

An article publishing engine for static sites built with Next.js.

---

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

### Target

- [x] Search feature with `minisearch`
- [x] Detailing indexing google & SEO
- [x] Add information image cannot be fetch
- [x] More configuration for link footer, copyright info and specifict description
- [ ] More configuration for costumization svg/png/webp for icon header & footer
- [ ] Add dark mode
- [x] Adding support highlight code
- [ ] Create script init for installer
- [ ] Add page pad to limit view
- [x] Support costum destination folder

<!-- > Named after Tsukuru (創る) the Japanese art of bringing something meaningful into existence. Built for those who want full creative control over both their words and the canvas they live on.

An article publishing engine for static sites built with Next.js. -->