/*
  ┌──────────────────────────────────────────────┐
  │       TsukuruConfig Types (Ver. 0.1.3)       │
  └──────────────────────────────────────────────┘
  [Old at 0.1.0 configuration still valid]
  Reference: github.com/ernestoyoofi/tsukuru/blob/main/tsukuru.config.js
*/

export const TsukuruConfig = {
  base: {
    dist: undefined,
    showauthor: false,
    maintenance: false,
    shortcode: true,
    stylecard: "basic",
  },
  metadata: {
    title: {
      default: "Tsukuru",
      template: "%s - Tsukuru",
    },
    description:
      "A highly customizable, aesthetic MDX blog template built with Next.js.",
    url: "https://yourwebsiteorgithub.github.io",
    host: "yourwebsiteorgithub.github.io",
    creator: "@yourusername",
    twittercreator: "@yourusername",
    googleverfication: "",
    analytics: {
      type: "none",
      id: "",
      script: "",
    },
  },
  giscus: {},
  categories: {},
  footer: {
    yourname: "Yourname!",
    fromyear: 2026,
    title_as: "image",
    link0: {
      label: "Other",
      list: [
        { label: "Profile", href: "#" },
      ],
    },
    link1: {
      label: "Links",
      list: [
        { label: "Links", href: "#" },
      ],
    },
    link2: {
      label: "Social Media",
      list: [
        { label: "Github", href: "#" },
      ],
    },
  },
};

export default TsukuruConfig;