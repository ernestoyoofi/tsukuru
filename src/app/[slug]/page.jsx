import { notFound, redirect } from "next/navigation";
import ReadingArticle from "@/components/section/ReadingArticle";
import loadConfig from "@/lib/load-config";
import GenerateMetadata from "@/lib/metadata";
import {
  Fn_GetContentArticles,
  Fn_GetListArticleCard,
  Fn_GetListCategories,
  Fn_GetListCodeLink,
  Fn_GetListSlugArticles,
  Fn_GetRealSlugCodeLink,
} from "@/lib/posts/globals";

export default async function Page_ReadArticle({ params }) {
  const { slug } = await params;
  const shortLink = await Fn_GetRealSlugCodeLink({ code: slug });
  const readInfo = await Fn_GetContentArticles({ slug: slug });

  // Redirect to real page
  if (shortLink) redirect(`/${shortLink}`);

  // Not found
  if (!readInfo) notFound();

  const configComments = (await loadConfig()).giscus;
  const articleList = await Fn_GetListArticleCard({ limit: 11 });
  const categoriesList = await Fn_GetListCategories();
  const filteringArticleList = articleList.filter((a) => a.slug !== slug);
  const dataContentStructure = {
    recommend: {
      categories: categoriesList.slice(0, 10),
      list_top_posts: filteringArticleList.slice(0, 3),
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

  const joiningMetaConfig = await GenerateMetadata({
    title: readInfo.metadata.title || "",
    description: readInfo.metadata.description || "",
    image: readInfo.metadata.image || null,
  });
  return joiningMetaConfig;
}

export async function generateStaticParams() {
  const getListArticles = await Fn_GetListSlugArticles();
  const getListSlugArticles = await Fn_GetListCodeLink();

  const getList = [
    ...getListArticles,
    ...getListSlugArticles.map((a) => a?.codelink),
  ];
  if (!getList[0]) {
    return [{ slug: "no-generate" }];
  }
  return getList.map((c) => ({ slug: c }));
}
