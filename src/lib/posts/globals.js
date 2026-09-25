import ContentParser from "./content-parser";
import { readAllArticle } from "./read-dir";
import loadConfig from "../load-config";

async function parseAllPosts() {
  const { base: baseMeta = {} } = await loadConfig();
  const list = readAllArticle();
  const posts = await Promise.all(
    list.map(([filePath, fileName]) => ContentParser(filePath, fileName)),
  );

  detectDuplicateSlugs(posts);

  return posts.map((post) => ({
    ...post,
    metadata: {
      ...post.metadata,
      cardtype: baseMeta.stylecard ?? "basic",
      showauthor: Boolean(baseMeta.showauthor),
    },
  }));
}

function detectDuplicateSlugs(posts) {
  const slugCount = new Map();
  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    if (p.unvalid || !p.metadata?.slug) continue;
    const slug = p.metadata.slug;
    slugCount.set(slug, (slugCount.get(slug) || 0) + 1);
  }

  const slugIndex = new Map();
  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    if (p.unvalid || !p.metadata?.slug) continue;
    const slug = p.metadata.slug;
    const count = slugCount.get(slug);
    if (count > 1) {
      const idx = (slugIndex.get(slug) || 0) + 1;
      slugIndex.set(slug, idx);
      if (idx > 1) {
        p.metadata.slug = `${slug}-${idx - 1}`;
        p.metadata.duplicate = true;
      }
    }
  }
}

function normalizeAuthorLabel(label) {
  return String(label || "")
    .trim()
    .toLowerCase()
    .replace(/^@/, "");
}

function extractAuthorLabel(author) {
  if (typeof author === "object" && author !== null) {
    return author.label || "";
  }
  return String(author || "");
}

export async function Fn_ReadingAllContent({
  filteringUnvalid = true,
  hiddenDraft = true,
  metadataOnly = false,
} = {}) {
  const all = await parseAllPosts();

  if (!filteringUnvalid && !metadataOnly) return all;

  const result = [];
  for (let i = 0; i < all.length; i++) {
    const post = all[i];
    if (filteringUnvalid) {
      if (post.unvalid) continue;
      if (hiddenDraft && post?.metadata?.draft === true) continue;
    }
    if (metadataOnly && !post.unvalid) {
      result.push({ metadata: post.metadata });
    } else {
      result.push(post);
    }
  }

  return result;
}

function filterArticleList(allPosts, filter_by = null, filter_value = null) {
  const filter_by_matching = ["category", "tags", "author"];
  const filter_value_str = String(filter_value).trim().toLowerCase();

  if (
    !filter_by_matching.includes(filter_by) ||
    filter_value_str.length === 0
  ) {
    return allPosts;
  }

  const filtered = [];
  for (let i = 0; i < allPosts.length; i++) {
    const post = allPosts[i];
    let values = post.metadata?.[filter_by];

    if (values === undefined || values === null) continue;

    if (filter_by === "author") {
      if (Array.isArray(values)) {
        values = values.map((a) => extractAuthorLabel(a));
      } else {
        values = [extractAuthorLabel(values)];
      }
      const searchNorm = normalizeAuthorLabel(filter_value_str);
      const matched = values.some(
        (v) => normalizeAuthorLabel(v) === searchNorm,
      );
      if (matched) filtered.push(post);
      continue;
    } else if (!Array.isArray(values)) {
      values = [String(values)];
    } else {
      values = values.map((v) => String(v));
    }

    const normalized = values
      .map((v) => v.trim().toLowerCase())
      .filter((v) => v.length > 0);

    if (normalized.includes(filter_value_str)) {
      filtered.push(post);
    }
  }
  return filtered;
}

export async function Fn_ListArticle({
  filter_by = null,
  filter_value = null,
  disabled_padpage = true,
  page = 1,
  limit = 50,
  unvalid_metadata = false,
  ...otherparams
} = {}) {
  const allPosts = await Fn_ReadingAllContent({
    ...otherparams,
    filteringUnvalid: !unvalid_metadata,
  });
  const result = filterArticleList(allPosts, filter_by, filter_value);

  const total = result.length;

  if (disabled_padpage) {
    return { data: result, meta: { total, page: null, limit: null } };
  }

  const start = (page - 1) * limit;
  const paged = result.slice(start, start + limit);

  return { data: paged, meta: { total, page, limit } };
}

export async function Fn_GetListArticleCard({
  filter_by = null,
  filter_value = null,
  disabled_padpage = true,
  page = 1,
  limit = 50,
  unvalid_metadata = false,
  ...otherparams
} = {}) {
  const getArts = await Fn_ListArticle({
    filter_by,
    filter_value,
    disabled_padpage,
    page,
    limit,
    unvalid_metadata,
    ...otherparams,
  });

  return getArts.data.map((a) => a.metadata);
}

export async function Fn_GetContentArticles({ slug = "" } = {}) {
  const posts = await Fn_ReadingAllContent({
    filteringUnvalid: true,
    hiddenDraft: true,
  });
  const searchSlug = String(slug).trim();
  for (let i = 0; i < posts.length; i++) {
    if (posts[i].metadata?.slug === searchSlug) {
      return { metadata: posts[i].metadata, content: posts[i].content };
    }
  }
  return null;
}

export async function Fn_GetListArticlePad({
  filter_by = null,
  filter_value = null,
  limit = 50,
  disabled_padpage = true,
  unvalid_metadata = false,
  ...otherparams
} = {}) {
  if (disabled_padpage) return [];
  const allPosts = await Fn_ReadingAllContent({
    ...otherparams,
    filteringUnvalid: !unvalid_metadata,
  });
  const result = filterArticleList(allPosts, filter_by, filter_value);
  const totalPages = Math.ceil(result.length / limit);
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(String(i));
  }
  return pages;
}

export async function Fn_GetListSlugArticles() {
  const posts = await Fn_ReadingAllContent({
    filteringUnvalid: true,
    hiddenDraft: true,
    metadataOnly: true,
  });
  const slugs = [];
  for (let i = 0; i < posts.length; i++) {
    const slug = posts[i].metadata?.slug;
    if (slug) slugs.push(slug);
  }
  return slugs;
}

export async function Fn_GetListCategories() {
  const posts = await Fn_ReadingAllContent({
    filteringUnvalid: true,
    hiddenDraft: true,
    metadataOnly: true,
  });
  const categories = new Map();
  for (let i = 0; i < posts.length; i++) {
    const cat = posts[i].metadata?.category;
    if (cat) categories.set(cat, (categories.get(cat) || 0) + 1);
  }
  return Array.from(categories.entries()).map(([name, count]) => ({
    name,
    count,
  }));
}

export async function Fn_GetListTags() {
  const posts = await Fn_ReadingAllContent({
    filteringUnvalid: true,
    hiddenDraft: true,
    metadataOnly: true,
  });
  const tags = new Map();
  for (let i = 0; i < posts.length; i++) {
    const tagList = posts[i].metadata?.tags;
    if (!Array.isArray(tagList)) continue;
    for (let j = 0; j < tagList.length; j++) {
      const tag = tagList[j];
      if (tag) tags.set(tag, (tags.get(tag) || 0) + 1);
    }
  }
  return Array.from(tags.entries()).map(([name, count]) => ({
    name,
    count,
  }));
}

export async function Fn_GetListAuthors() {
  const posts = await Fn_ReadingAllContent({
    filteringUnvalid: true,
    hiddenDraft: true,
    metadataOnly: true,
  });
  const authors = new Map();
  for (let i = 0; i < posts.length; i++) {
    const authorList = posts[i].metadata?.author;
    if (!Array.isArray(authorList)) continue;
    for (let j = 0; j < authorList.length; j++) {
      const a = authorList[j];
      const label = extractAuthorLabel(a);
      const key = normalizeAuthorLabel(label);
      if (!key) continue;
      if (!authors.has(key)) {
        authors.set(key, { label, pict: a?.pict || null, count: 0 });
      }
      authors.get(key).count++;
    }
  }
  return Array.from(authors.values());
}
