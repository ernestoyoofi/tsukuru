import ListArticle from "@/components/section/ListArticle";
import {
  Fn_GetListCategories,
  Fn_GetListArticleCard,
} from "@/lib/posts/globals";
import GenerateMetadata from "@/lib/metadata";

export default async function Page_ListArticle_ByCategory({ params }) {
  const { slug } = await params;
  const getLists = await Fn_GetListArticleCard({ filter_by: "category", filter_value: String(slug) });

  return <ListArticle data={getLists} tag="category" heading={String(slug)} />;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const joiningMetaConfig = GenerateMetadata({
    title: `Category: ${slug}`,
    description: `Category: ${slug}`,
  });
  return joiningMetaConfig;
}

export async function generateStaticParams() {
  const categories = await Fn_GetListCategories();
  if (!categories[0]) {
    return [{ slug: "no-generate" }];
  }
  return categories.map((c) => ({ slug: c.name }));
}
