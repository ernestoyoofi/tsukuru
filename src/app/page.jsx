import ListArticle from "@/components/section/ListArticle";
import { Fn_GetListArticleCard } from "@/lib/posts/globals";

export default async function Page_RecentPosts() {
  const getLists = await Fn_GetListArticleCard();

  return <ListArticle data={getLists} />;
}
