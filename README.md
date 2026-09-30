# Tsukuru

Article Engine for Github static page with Next.js

---

### Template structure for build article

```txt
tsukuru/
├─ .github
│   └─ workflows
│       └─ tsukuru.yml  → Github Workflows (Optional if not build on github pages)
├─ posts/*              → List Posts Article
├─ public/
│   ├─ assets/          → For Global Assets Like Icon Header / Icon Footer
│   └─ images/          → For Assets Article
├─ favicon.ico          → Icon Website / Favicon
├─ CNAME                → Github static page CNAME
└─ tsukuru.config.js    → Configuration Tsukuru Template
```

### Target

- [x] Search feature with `minisearch`
- [ ] Detailing indexing google & SEO
- [x] Add information image cannot be fetch
- [ ] Create script init for installer
- [ ] More configuration for link footer, copyright info and specifict description
- [ ] More configuration for costumization svg/png/jpg for icon header & footer
- [ ] Add page pad to limit view

<!-- > Named after Tsukuru (創る) the Japanese art of bringing something meaningful into existence. Built for those who want full creative control over both their words and the canvas they live on.

Article Engine for Github static page with Next.js -->