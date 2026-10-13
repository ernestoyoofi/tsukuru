/*
  |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|
  |            TsukuruConfig Types             |
  |____________________________________________|

  TsukuruConfig {
    base {
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
    giscus {} // third party parameter reference to @giscus/react
    categories {  // default: '{}' as no special categories
      [key: string] {
        pin: boolean (optional) // max 4 pinned categories
        image: string (required)
        title: string (required)
        description: string (required)
        relate: string[] (optional)
      }
    }
    footer { // Footer on page (optional, default: {})
      yourname: string (optional, default: <TsukuruConfig>.metadata.creator)
      fromyear: number (optional, default: new Date().getFullYear())
      title_as: 'text' | 'image' | 'both' (optional, default: 'text')
      title: (optional, default: <TsukuruConfig>.metadata.title.default)
      description: (optional, default: <TsukuruConfig>.metadata.description)
      link0: { // For column footer 1 (optional, default: {}, require all parameter require in here for showing costumization)
        label: string (require) // For label title
        list: [ (require, need 1 object on array)
          {
            label: string (require)
            href: string (require)
          }
        ]
      }
      link1: { // For column footer 2 (optional, default: {}, require all parameter require in here for showing costumization)
        label: string (require) // For label title
        list: [ (require, need 1 object on array)
          {
            label: string (require)
            href: string (require)
          }
        ]
      }
      link2: { // For column footer 3 (optional, default: {}, require all parameter require in here for showing costumization)
        label: string (require) // For label title
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
    // By default, categories is '{}' as no special categories
    tutorial: {
      pin: true, // The maximum number of categories that can be pinned is 4
      image: "/image/cate/tutorial-cF7z.webp",
      title: "Tutorial",
      description: "A basic information for tutorial",
      relate: ["basic-knowledge", "informatif", "technology", "how-to-use"],
    },
  },
  footer: {
    yourname: "@ernestoyoofi <costum for footer>",
    fromyear: 2026,
    title_as: "text",
    title: "Tsukuru <costum for footer>",
    description:
      "A highly customizable, aesthetic MDX blog template built with Next.js. <costum for footer>",
    link0: {
      label: "Other",
      list: [
        { label: "Support", href: "#" },
        { label: "Contact", href: "#" },
        { label: "Documentation", href: "#" },
      ],
    },
    link1: {
      label: "Links",
      list: [
        { label: "Get Apps", href: "#" },
        { label: "About Tsukuru", href: "#" },
        {
          label: "Repository",
          href: "https://github.com/ernestoyoofi/tsukuru",
        },
      ],
    },
    link2: {
      label: "Social Media",
      list: [
        { label: "Github", href: "#" },
        { label: "Instagram", href: "#" },
        { label: "Linked-In", href: "#" },
      ],
    },
  },
};

export default TsukuruConfig;
