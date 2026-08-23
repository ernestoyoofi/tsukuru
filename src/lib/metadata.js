import loadConfig from "./load-config";

const defaultMetadata = {
  title: {
    default: "Tsukuru",
    template: "%s - Tsukuru",
  },
  description:
    "A highly customizable, aesthetic MDX blog template built with Next.js.",
  referrer: "origin-when-cross-origin",
  publisher: "@ernestoyoofi",
  creator: "@ernestoyoofi",
  metadataBase: undefined,
  url: undefined,
  openGraph: {
    title: "Tsukuru",
    description:
      "A highly customizable, aesthetic MDX blog template built with Next.js.",
    images: [],
  },
  twitter: {
    title: "Tsukuru",
    description:
      "A highly customizable, aesthetic MDX blog template built with Next.js.",
    creator: "@ernestoyoofi",
    images: [],
  },
  verification: {
    google: undefined,
  },
};

const validText = (value) =>
  typeof value === "string" && value.trim().length > 2
    ? value.trim()
    : undefined;

const createMetadata = () => structuredClone(defaultMetadata);

export default async function GenerateMetadata({
  title,
  description,
  image,
} = {}) {
  const basicMetadata = createMetadata();
  const usedMetadata = (await loadConfig()).metadata;
  {
    // Default Title
    const configuredTitle = validText(usedMetadata?.title?.default);
    if (configuredTitle) {
      basicMetadata.title.default = configuredTitle;
      basicMetadata.openGraph.title = configuredTitle;
      basicMetadata.twitter.title = configuredTitle;
    }
    // Template Title
    const configuredTemplate = validText(usedMetadata?.title?.template);
    if (configuredTemplate) {
      basicMetadata.title.template = configuredTemplate;
    }
    // Description
    const configuredDescription = validText(usedMetadata?.description);
    if (configuredDescription) {
      basicMetadata.description = configuredDescription;
      basicMetadata.openGraph.description = configuredDescription;
      basicMetadata.twitter.description = configuredDescription;
    }
    // URL
    const configuredUrl = validText(usedMetadata?.url);
    if (configuredUrl) {
      try {
        basicMetadata.metadataBase = new URL(configuredUrl);
        basicMetadata.alternates = { canonical: configuredUrl };
        basicMetadata.openGraph.url = configuredUrl;
      } catch (_er) {
        console.warn("[WARN] Tsukuru metadata URL is invalid and was ignored.");
      }
    }
    const configuredHost = validText(usedMetadata?.host);
    if (configuredHost) basicMetadata.openGraph.siteName = configuredHost;

    // Image
    const configuredImage = validText(usedMetadata?.image);
    const metadataImage = validText(image) || configuredImage;
    if (metadataImage) {
      basicMetadata.openGraph.images = [metadataImage];
      basicMetadata.twitter.images = [metadataImage];
    }

    // Other Metadata
    const creator = validText(usedMetadata?.creator);
    const twitterCreator = validText(usedMetadata?.twittercreator) || creator;
    if (creator) {
      basicMetadata.creator = creator;
      basicMetadata.publisher = creator;
    }
    if (twitterCreator) {
      basicMetadata.twitter.creator = twitterCreator;
    }
    if (usedMetadata?.allowbot === false) {
      basicMetadata.robots = { index: false, follow: false };
    }
    const googleVerification = validText(usedMetadata?.googleverification);
    if (googleVerification) {
      basicMetadata.verification.google = googleVerification;
    }
  }

  // By parameters
  const pageTitle = validText(title);
  if (pageTitle) {
    basicMetadata.openGraph.title = String(
      basicMetadata.title.template,
    ).replace(/%s/g, pageTitle);
    basicMetadata.twitter.title = String(basicMetadata.title.template).replace(
      /%s/g,
      pageTitle,
    );
    basicMetadata.title = pageTitle;
  }
  const pageDescription = validText(description);
  if (pageDescription) {
    basicMetadata.description = pageDescription;
    basicMetadata.openGraph.description = pageDescription;
    basicMetadata.twitter.description = pageDescription;
  }
  const pageImage = validText(image);
  if (pageImage) {
    basicMetadata.openGraph.images = [pageImage];
    basicMetadata.twitter.images = [pageImage];
  }

  return basicMetadata;
}

export async function isMaintenance() {
  const usedMetadata = (await loadConfig()).base;
  return usedMetadata?.maintenance || false;
}
