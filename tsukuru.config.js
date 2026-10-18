/*
  ┌──────────────────────────────────────────────┐
  │       TsukuruConfig Types (Ver. 0.1.3)       │
  └──────────────────────────────────────────────┘
  [Old at 0.1.0 configuration still valid]
  Reference: github.com/ernestoyoofi/tsukuru/blob/main/tsukuru.config.js

  TsukuruConfig {
    base {
      dist: string (optional, default undefined for static build)
      showauthor: boolean (default: false, optional)
      maintenance: boolean (default: false, optional)
      shortcode: boolean (default: false, optional)
      stylecard: 'basic' | 'full_cover' | 'no_image_cover' (default: 'basic', optional)
    }
    metadata {
      title {
        default: string (required)
        template: string (required)
      }
      description: string (required)
      url: string (required)
      host: string (required)
      creator: string (optional)
      twittercreator: string (optional)
      googleverfication: string (optional)
      analytics {
        type: 'none' | 'google' | 'umami' | 'plausible' | 'matomo' (default: 'none')
        id: string (required if type is set not 'none')
        script: string (required if type is 'umami' | 'plausible' | 'matomo')
      }
    }
    giscus {}
    categories {
      [key: string] {
        pin: boolean (optional)
        image: string (required)
        title: string (required)
        description: string (required)
        relate: string[] (optional)
      }
    }
    footer {
      yourname: string (optional, default: <TsukuruConfig>.metadata.creator)
      fromyear: number (optional, default: new Date().getFullYear())
      title_as: 'text' | 'image' | 'both' (optional, default: 'text')
      title: (optional, default: <TsukuruConfig>.metadata.title.default)
      description: (optional, default: <TsukuruConfig>.metadata.description)
      link0: {
        label: string (require)
        list: [ (require, need 1 object on array)
          {
            label: string (require)
            href: string (require)
          }
        ]
      }
      link1: {
        label: string (require)
        list: [ (require, need 1 object on array)
          {
            label: string (require)
            href: string (require)
          }
        ]
      }
      link2: {
        label: string (require)
        list: [ (require, need 1 object on array)
          {
            label: string (require)
            href: string (require)
          }
        ]
      }
    }
  }
*/

export const TsukuruConfig = {
  base: {
    dist: "/blog", // The default is "/", all pages will be indexed under "/", but if you want to use a custom path—for example, "/blog" you can still do so.
    showauthor: false, // By default, author not show in card article
    maintenance: false, // Force all content rendered in the layout to be processed by Maintenance.jsx
    shortcode: true, // Enable shortlink like 'https://example.com/this-is-my-blog' to 'https://example.com/c/7b37d4c6cf0e' if metadata on mdx set 'codelink'
    // -- [ stylecard ] --
    // Basic: just a standard card, small image, title only, summary/description, date, category, and tags
    // full_cover: large image as a banner, title and description directly below, followed by metadata such as date, category, and tags as usual
    // no_image_cover: a card that displays the title, description, and category only
    //
    stylecard: "basic", // 'basic' | 'full_cover' | 'no_image_cover'
  },
  metadata: {
    title: {
      // Reference to Next.js title metadata
      default: "Tsukuru", // Default title on layout base
      template: "%s - Tsukuru", // Template title on layout
    },
    description:
      "A highly customizable, aesthetic MDX blog template built with Next.js.",
    url: "https://blog.yupiipi.id", // Set as origin public website
    host: "blog.yupiipi.id", // Set as host public website
    creator: "@ernestoyoofi", // Required, set your username or other something for SEO
    twittercreator: "@ernestoyoofi", // Optional, set blank string if you want
    googleverfication: "", // Optional: For google indexing
    analytics: {
      type: "none", // Types of analytics providers on the web 'google' | 'umami' | 'plausible' | 'matomo' (default: 'none' as undefined)
      id: "", // Required if you fill this
      script: "", // Required if type 'umami' | 'plausible' | 'matomo'
    },
  },
  // Reference to @giscus/react
  // Try generate on: https://giscus.app
  giscus: {
    // By default, giscus is '{}' as disable feature comments
    id: "comments-section",
    repo: "",
    repoId: "",
    category: "Leave your comments...",
    categoryId: "",
    mapping: "pathname",
    strict: "0",
    reactionsEnabled: "1",
    emitMetadata: "0",
    inputPosition: "top",
    theme: "light",
    lang: "id",
    loading: "lazy",
  },
  categories: {
    // Each key is the category identifier used in article metadata and URLs.
    tutorial: {
      pin: true, // Pin this category, a maximum of four categories can be pinned.
      image: "/image/cate/tutorial-cF7z.webp", // Image used to represent the category.
      title: "Tutorial", // Display name for the category.
      description: "A basic information for tutorial", // Short description shown for the category.
      relate: ["basic-knowledge", "informatif", "technology", "how-to-use"], // Optional related topic identifiers.
    },
  },
  footer: {
    yourname: "@ernestoyoofi <costum for footer>", // Name or attribution displayed in the copyright notice.
    fromyear: 2026, // Starting year displayed in the copyright notice.
    title_as: "image", // Footer title format: 'text', 'image', or 'both'.
    title: "Tsukuru <costum for footer>", // Footer title, defaults to metadata.title.default.
    description:
      "A highly customizable, aesthetic MDX blog template built with Next.js. <costum for footer>", // Footer description, defaults to metadata.description.
    link0: {
      label: "Other", // Heading for the first link column.
      list: [
        { label: "Support", href: "#" }, // Each item has a display label and destination URL.
        { label: "Contact", href: "#" },
        { label: "Documentation", href: "#" },
      ],
    },
    link1: {
      label: "Links", // Heading for the second link column.
      list: [
        { label: "Get Apps", href: "#" },
        { label: "About Tsukuru", href: "#" },
        {
          label: "Repository",
          href: "https://github.com/ernestoyoofi/tsukuru", // Link destination, use a full URL for external sites.
        },
      ],
    },
    link2: {
      label: "Social Media", // Heading for the third link column.
      list: [
        { label: "Github", href: "#" },
        { label: "Instagram", href: "#" },
        { label: "Linked-In", href: "#" },
      ],
    },
  },
};

export default TsukuruConfig;
