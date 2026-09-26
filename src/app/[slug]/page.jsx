import { notFound } from "next/navigation";
import GenerateMetadata from "@/lib/metadata";
import {
  Fn_GetContentArticles,
  Fn_GetListSlugArticles,
  Fn_GetListArticleCard,
  Fn_GetListCategories,
} from "@/lib/posts/globals";
import ReadingArticle from "@/components/section/ReadingArticle";
import loadConfig from "@/lib/load-config";

export default async function Page_ReadArticle({ params }) {
  const { slug } = await params;
  const readInfo = await Fn_GetContentArticles({ slug: slug });

  // Not Found Page
  if (!readInfo) notFound();

  const configComments = await loadConfig().giscus;
  const articleList = await Fn_GetListArticleCard({ limit: 11 });
  const categoriesList = await Fn_GetListCategories();
  const filteringArticleList = articleList.filter((a) => a.slug !== slug);
  const dataContentStructure = {
    recommend: {
      categories: categoriesList.slice(0, 5),
      list_top_posts: filteringArticleList.slice(0, 5),
    },
    metadata: readInfo.metadata,
    content: readInfo.content,
    giscus: configComments,
  };

  return <ReadingArticle data={dataContentStructure} />;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const readInfo = await Fn_GetContentArticles({ slug: slug });

  if (!readInfo) {
    return {};
  }

  const matchJoiningConfig = await GenerateMetadata({
    title: readInfo.metadata.title || "",
    description: readInfo.metadata.description || "",
    image: readInfo.metadata.image || null,
  });
  return matchJoiningConfig;
}

export async function generateStaticParams() {
  const getList = await Fn_GetListSlugArticles();
  if (!getList[0]) {
    return [{ slug: "no-generate" }];
  }
  return getList.map((c) => ({ slug: c }));
}
