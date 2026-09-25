import { Fn_GetListCategories } from "@/lib/posts/globals";

export default async function Page_ListArticle_ByCategory({ params }) {
  const { slug } = await params;

  return (
    <div>
      <p>Category / ListArticle: {slug}</p>
    </div>
  );
}

export async function generateStaticParams() {
  const categories = await Fn_GetListCategories();
  if (!categories[0]) {
    return [{ slug: "no-generate" }];
  }
  return categories.map((c) => ({ slug: c.name }));
}
