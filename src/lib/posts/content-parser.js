import matter from "gray-matter";
import readingTime from "reading-time";
import { remark } from "remark";
import strip from "strip-markdown";

const RE_SLUG = /^[a-z0-9._-]+$/;
const RE_CODELINK = /^[a-zA-Z0-9]+$/;
const RE_AUTHOR_CHAR = /^[a-zA-Z0-9._\-@/:|<>\s]+$/;
const RE_TAG_CHAR = /^[a-zA-Z0-9._-]+$/;
const RE_CATEGORY_CHAR = /^[a-zA-Z0-9._-]+$/;
const RE_AUTHOR_PARSE = /^(@[^ ]+)\s*<([^/]+)\/([^>]+)>$/;
const RE_MDX_IMPORT = /^import\s+.*$/gm;
const RE_MDX_EXPORT = /^export\s+.*$/gm;
const RE_MDX_TAG = /<[^>]+\/?>/g;

const PLATFORM_PICTURE = {
  github: (u) => `https://github.com/${u}.png`,
  gitlab: (u) => `https://gitlab.com/${u}.png`,
  bitbucket: (u) => `https://bitbucket.org/${u}/avatar.png`,
  twitter: (u) => `https://unavatar.io/twitter/${u}`,
  x: (u) => `https://unavatar.io/twitter/${u}`,
};

function parseAuthor(raw) {
  const match = raw.match(RE_AUTHOR_PARSE);
  if (!match) return { label: raw, pict: null };
  const [, label, platform, username] = match;
  const genPict = PLATFORM_PICTURE[platform.toLowerCase()];
  return { label, pict: genPict ? genPict(username) : null };
}

async function stripMdxTags(str) {
  const noMdx = str
    .replace(RE_MDX_IMPORT, "")
    .replace(RE_MDX_EXPORT, "")
    .replace(RE_MDX_TAG, "");
  const file = await remark().use(strip).process(noMdx);
  return String(file).replace(/\s+/g, " ").trim();
}

function isValidDate(str) {
  if (typeof str !== "string") return false;
  const t = new Date(str).getTime();
  return !Number.isNaN(t);
}

function isValidUrl(str) {
  if (typeof str !== "string") return false;
  try {
    const u = new URL(str);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidStringArray(val) {
  if (!Array.isArray(val)) return false;
  for (let i = 0; i < val.length; i++) {
    if (typeof val[i] !== "string" || val[i].length === 0) return false;
  }
  return true;
}

function validateRequiredString(value, name, minLen) {
  if (typeof value !== "string" || value.length < minLen) {
    return `${name}: must be a string with minimum length ${minLen}`;
  }
  return null;
}

export default async function ContentParser(strFileMDX = "", fileName = "") {
  const readerStr = String(strFileMDX).trim();

  if (!readerStr.startsWith("---")) {
    return { unvalid: true, error: "Missing frontmatter delimiter" };
  }

  let data, content;
  try {
    ({ data, content } = matter(readerStr));
  } catch (e) {
    return { unvalid: true, error: `Frontmatter parse error: ${e.message}` };
  }

  const errors = [];

  const imgErr = validateRequiredString(data.image, "image", 2);
  if (imgErr) errors.push(imgErr);

  const titleErr = validateRequiredString(data.title, "title", 2);
  if (titleErr) errors.push(titleErr);

  const descErr = validateRequiredString(data.description, "description", 16);
  if (descErr) errors.push(descErr);

  if (typeof data.date !== "string" || !isValidDate(data.date)) {
    errors.push(
      "date: must be a valid date string (ISO/timestamp/date format)",
    );
  }

  if (errors.length > 0) {
    return { unvalid: true, errors };
  }

  const meta = {
    image: data.image,
    title: data.title,
    description: data.description,
    date: data.date,
    author: null,
    tags: [],
    category: "global",
    canonical: null,
    slug: null,
    codelink: null,
    draft: false,
    reading_time: null,
  };

  if (data.author !== undefined && data.author !== null) {
    if (typeof data.author === "string") {
      if (data.author.length < 2) {
        errors.push("author: string must have minimum length 2");
      } else if (!RE_AUTHOR_CHAR.test(data.author)) {
        errors.push(
          "author: string must only contain a-zA-Z0-9._-@/:|<> and spaces",
        );
      } else {
        meta.author = [parseAuthor(data.author)];
      }
    } else if (isValidStringArray(data.author)) {
      const parsed = [];
      let hasError = false;
      for (let i = 0; i < data.author.length; i++) {
        if (!RE_AUTHOR_CHAR.test(data.author[i])) {
          errors.push(
            "author: array items must only contain a-zA-Z0-9._-@/:|<> and spaces",
          );
          hasError = true;
          break;
        }
        parsed.push(parseAuthor(data.author[i]));
      }
      if (!hasError) meta.author = parsed;
    } else {
      errors.push(
        "author: must be a string (min length 2) or array of strings",
      );
    }
  }

  if (data.tags !== undefined && data.tags !== null) {
    if (isValidStringArray(data.tags)) {
      for (let i = 0; i < data.tags.length; i++) {
        if (!RE_TAG_CHAR.test(data.tags[i])) {
          errors.push("tags: array items must only contain a-zA-Z0-9._-");
          break;
        }
      }
      if (errors.length === 0) meta.tags = data.tags;
    } else {
      errors.push("tags: must be an array of strings");
    }
  }

  if (data.category !== undefined && data.category !== null) {
    if (typeof data.category === "string") {
      if (!RE_CATEGORY_CHAR.test(data.category)) {
        errors.push("category: must only contain a-zA-Z0-9._-");
      } else {
        meta.category = data.category;
      }
    } else {
      errors.push("category: must be a string");
    }
  }

  if (data.canonical !== undefined && data.canonical !== null) {
    if (isValidUrl(data.canonical)) {
      meta.canonical = data.canonical;
    } else {
      errors.push("canonical: must be a valid http/https URL");
    }
  }

  if (data.slug !== undefined && data.slug !== null) {
    if (typeof data.slug === "string" && RE_SLUG.test(data.slug)) {
      meta.slug = data.slug;
    } else {
      errors.push("slug: must match pattern a-z0-9._-");
    }
  } else {
    const fallback = fileName.replace(/\.mdx$/, "");
    if (RE_SLUG.test(fallback)) meta.slug = fallback;
  }

  if (data.codelink !== undefined && data.codelink !== null) {
    if (typeof data.codelink === "string" && RE_CODELINK.test(data.codelink)) {
      meta.codelink = data.codelink;
    } else {
      errors.push("codelink: must contain only a-zA-Z0-9");
    }
  }

  if (data.draft !== undefined && data.draft !== null) {
    if (typeof data.draft === "boolean") {
      meta.draft = data.draft;
    } else {
      errors.push("draft: must be a boolean (true/false)");
    }
  }

  const trimmedContent = content.trim();
  if (trimmedContent.length < 16) {
    errors.push("content: minimum content length is 16 characters");
  }

  if (errors.length > 0) {
    return { unvalid: true, errors };
  }

  const cleanContent = await stripMdxTags(trimmedContent);
  const stats = readingTime(cleanContent);
  meta.reading_time = {
    text: stats.text,
    minutes: stats.minutes,
    words: stats.words,
    time: stats.time,
  };

  return { metadata: meta, content: trimmedContent };
}
