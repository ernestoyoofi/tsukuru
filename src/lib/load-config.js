const defaultTsukuruConfig = {
  base: {
    showauthor: false,
    maintenance: false,
    shortcode: false,
    stylecard: "basic",
  },
  metadata: {
    title: {
      default: "Tsukuru",
      template: "%s - Tsukuru",
    },
    description:
      "A highly customizable, aesthetic MDX blog template built with Next.js.",
    url: "",
    host: "",
    creator: "",
    twittercreator: "",
    googleverfication: "",
    analytics: {
      type: "none",
      id: "",
      script: "",
    },
  },
  giscus: {},
  categories: {},
};

const stylecards = ["basic", "full_cover", "no_image_cover"];
const analyticsTypes = ["none", "google", "umami", "plausible", "matomo"];

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const clone = (value) => structuredClone(value);

const warnInvalid = (path) =>
  console.warn(
    `[WARN] Invalid TsukuruConfig.${path}; using the default value.`,
  );

const validString = (value, path, { required = false } = {}) => {
  if (typeof value === "string" && (value.trim() || !required)) {
    return value.trim();
  }
  warnInvalid(path);
  return undefined;
};

function normalizeBase(configBase) {
  const base = clone(defaultTsukuruConfig.base);
  if (!isObject(configBase)) {
    if (configBase !== undefined) warnInvalid("base");
    return base;
  }

  for (const key of ["showauthor", "maintenance", "shortcode"]) {
    if (configBase[key] !== undefined) {
      if (typeof configBase[key] === "boolean") base[key] = configBase[key];
      else warnInvalid(`base.${key}`);
    }
  }
  if (configBase.stylecard !== undefined) {
    if (stylecards.includes(configBase.stylecard)) {
      base.stylecard = configBase.stylecard;
    } else {
      warnInvalid("base.stylecard");
    }
  }
  return base;
}

function normalizeMetadata(configMetadata) {
  const metadata = clone(defaultTsukuruConfig.metadata);
  if (!isObject(configMetadata)) {
    if (configMetadata !== undefined) warnInvalid("metadata");
    return metadata;
  }

  if (isObject(configMetadata.title)) {
    for (const key of ["default", "template"]) {
      if (configMetadata.title[key] !== undefined) {
        const value = validString(
          configMetadata.title[key],
          `metadata.title.${key}`,
          { required: true },
        );
        if (value !== undefined) metadata.title[key] = value;
      }
    }
  } else if (configMetadata.title !== undefined) {
    warnInvalid("metadata.title");
  }

  for (const key of ["description", "url", "host"]) {
    if (configMetadata[key] !== undefined) {
      const value = validString(configMetadata[key], `metadata.${key}`, {
        required: true,
      });
      if (value !== undefined) metadata[key] = value;
    }
  }
  for (const key of ["creator", "twittercreator", "googleverfication"]) {
    if (configMetadata[key] !== undefined) {
      const value = validString(configMetadata[key], `metadata.${key}`);
      if (value !== undefined) metadata[key] = value;
    }
  }

  if (configMetadata.analytics !== undefined) {
    const analytics = configMetadata.analytics;
    if (!isObject(analytics) || !analyticsTypes.includes(analytics.type)) {
      warnInvalid("metadata.analytics.type");
    } else {
      const needsId = analytics.type !== "none";
      const needsScript = ["umami", "plausible", "matomo"].includes(
        analytics.type,
      );
      const normalizedAnalytics = {
        type: analytics.type,
        id: needsId
          ? (validString(analytics.id, "metadata.analytics.id") ?? "")
          : typeof analytics.id === "string"
            ? analytics.id.trim()
            : "",
        script: needsScript
          ? (validString(analytics.script, "metadata.analytics.script") ?? "")
          : typeof analytics.script === "string"
            ? analytics.script.trim()
            : "",
      };
      if (
        (needsId && !normalizedAnalytics.id) ||
        (needsScript && !normalizedAnalytics.script)
      ) {
        warnInvalid("metadata.analytics");
      } else {
        metadata.analytics = normalizedAnalytics;
      }
    }
  }
  return metadata;
}

function normalizeCategories(configCategories) {
  if (configCategories === undefined) return {};
  if (!isObject(configCategories)) {
    warnInvalid("categories");
    return {};
  }

  const categories = {};
  for (const [name, category] of Object.entries(configCategories)) {
    if (!isObject(category)) {
      warnInvalid(`categories.${name}`);
      continue;
    }
    const image = validString(category.image, `categories.${name}.image`, {
      required: true,
    });
    const title = validString(category.title, `categories.${name}.title`, {
      required: true,
    });
    const description = validString(
      category.description,
      `categories.${name}.description`,
      { required: true },
    );
    if (!image || !title || !description) continue;

    const normalizedCategory = { image, title, description };
    if (category.pin !== undefined) {
      if (typeof category.pin === "boolean")
        normalizedCategory.pin = category.pin;
      else warnInvalid(`categories.${name}.pin`);
    }
    if (category.relate !== undefined) {
      if (
        Array.isArray(category.relate) &&
        category.relate.every((item) => typeof item === "string")
      ) {
        normalizedCategory.relate = [...category.relate];
      } else {
        warnInvalid(`categories.${name}.relate`);
      }
    }
    categories[name] = normalizedCategory;
  }

  const pinned = Object.keys(categories).filter((name) => categories[name].pin);
  for (const name of pinned.slice(4)) {
    categories[name].pin = false;
    warnInvalid(`categories.${name}.pin (maximum is 4)`);
  }
  return categories;
}

function normalizeConfig(config) {
  const normalized = clone(defaultTsukuruConfig);
  if (!isObject(config)) {
    warnInvalid("root");
    return normalized;
  }
  normalized.base = normalizeBase(config.base);
  normalized.metadata = normalizeMetadata(config.metadata);
  if (config.giscus !== undefined) {
    if (isObject(config.giscus)) normalized.giscus = clone(config.giscus);
    else warnInvalid("giscus");
  }
  normalized.categories = normalizeCategories(config.categories);
  return normalized;
}

export default async function loadConfig() {
  try {
    const { TsukuruConfig } = await import("../../tsukuru.config.js");
    return normalizeConfig(TsukuruConfig);
  } catch (_error) {
    console.warn(
      "[WARN] Tsukuru config (tsukuru.config.js) not found, switch to default configuration.",
    );
    return clone(defaultTsukuruConfig);
  }
}
