import { Fn_GetListArticleCard } from "@/lib/posts/globals";

export default async function Page_RecentPosts() {
  const getLists = await Fn_GetListArticleCard();

  return (
    <div>
      <pre>{JSON.stringify(getLists, null, 2)}</pre>
    </div>
  );
}
