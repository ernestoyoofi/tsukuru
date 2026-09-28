import loadConfig from "@/lib/load-config";
import { Fn_GetListArticleCard } from "@/lib/posts/globals";

export const dynamic = "force-static";

export default async function sitemap() {
  const loadconfig = await loadConfig();
  const urlOrigin = loadconfig?.metadata?.url || "http://localhost";

  const listArticle = await Fn_GetListArticleCard({ limit: 60 }); // Get Article

  const contentArticle = listArticle.map((items, key) => ({
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
    ...contentArticle,
  ];
}
