import loadConfig from "@/lib/load-config";

export const dynamic = "force-static";

export default async function robots() {
  const loadconfig = await loadConfig();
  const urlOrigin = loadconfig?.metadata?.url || "http://localhost";

  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/*",
        disallow: "/minisearch-feature/",
      },
      {
        userAgent: "*",
        allow: "/*",
        disallow: "/minisearch-feature/",
      },
    ],
    sitemap: new URL("/sitemap.xml", urlOrigin).toString(),
  };
}
