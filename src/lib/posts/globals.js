import ContentParser from "./content-parser";
import { invalidateCache, readAllArticle } from "./read-dir";

let _parsedCache = null;

function parseAllPosts(forceRefresh = false) {
  if (_parsedCache && !forceRefresh) return _parsedCache;

  const list = readAllArticle(forceRefresh);
  const posts = [];
  for (let i = 0; i < list.length; i++) {
    posts.push(ContentParser(list[i][0], list[i][1]));
  }

  detectDuplicateSlugs(posts);

  _parsedCache = posts;
  return _parsedCache;
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

export function Fn_ReadingAllContent({
  filteringUnvalid = true,
  hiddenDraft = true,
  metadataOnly = false,
  forceRefresh = false,
} = {}) {
  const all = parseAllPosts(forceRefresh);

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

export function Fn_InvalidateCache() {
  _parsedCache = null;
  invalidateCache();
}
