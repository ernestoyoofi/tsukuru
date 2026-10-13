import loadConfig from "@/lib/load-config";
import {
  Fn_GetListArticleCard,
  Fn_GetListCategories,
} from "@/lib/posts/globals";

export const dynamic = "force-static";

export default async function sitemap() {
  const loadconfig = await loadConfig();
  const urlOrigin = loadconfig?.metadata?.url || "http://localhost";

  const listCategory = await Fn_GetListCategories({ limit: 60 }); // Get Category
  const listArticle = await Fn_GetListArticleCard({ limit: 60 }); // Get Article

  const listCategoryXML = listCategory.map((items) => ({
    url: new URL(`/category/${items.name}`, urlOrigin).toString(),
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  const listArticleXML = listArticle.map((items) => ({
    url: new URL(`/${items.slug}`, urlOrigin).toString(),
    lastModified: new Date(items.date),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: urlOrigin,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...listArticleXML,
    ...listCategoryXML,
  ];
}
