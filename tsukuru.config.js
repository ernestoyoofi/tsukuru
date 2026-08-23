export const TsukuruConfig = {
  base: {
    maintenance: true, // Force all content rendered in the layout to be processed by Maintenance.jsx
    shortcode: true, // Enable shortlink like 'https://example.com/this-is-my-blog' to 'https://example.com/7b37d4c6cf0e' if metadata on mdx set 'codelink'
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
    url: "https://writes.yupibknpermen.my.id", // Set as origin public website
    host: "writes.yupibknpermen.my.id", // Set as host public website
    creator: "@ernestoyoofi", // Required, set your username or other something for SEO
    twittercreator: "@ernestoyoofi", // Optional, set blank string if you want
    googleverfication: "", // Optional: For google indexing
    analytics: {
      type: "google", // Types of analytics providers on the web 'google' | 'umami' | 'plausible' | 'matomo' (default: 'none' as undefined)
      id: "", // Required if you fill this
      script: "", // Required if type 'umami' | 'plausible' | 'matomo'
    },
  },
  // Reference to @giscus/react
  // Try generate on: https://giscus.app
  giscus: {
    id: "comments-section",
    repo: "",
    repoId: "",
    category: "Comments...",
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
    tutorial: {
      pin: true, // The maximum number of categories that can be pinned is 4
      image: "/image/cate/tutorial-cF7z.webp",
      title: "Tutorial",
      description: "A basic information for tutorial",
      relate: ["basic-knowledge", "informatif", "technology", "how-to-use"],
    },
  },
};

export default TsukuruConfig;
