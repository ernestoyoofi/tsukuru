import { notFound } from "next/navigation";
import {
  Fn_GetContentArticles,
  Fn_GetListSlugArticles,
} from "@/lib/posts/globals";
import Reader from "@/components/ui/Reader";

export default async function Page_ReadArticle({ params }) {
  const { slug } = await params;
  const readInfo = await Fn_GetContentArticles({ slug: slug });

  if (!readInfo) notFound();

  return (
    <div className="max-w-6xl w-full px-6 m-auto min-w-0">
      {/* <pre>{JSON.stringify(readInfo, null, 2)}</pre> */}
      <Reader content={readInfo.content} />
    </div>
  );
}

export async function generateStaticParams() {
  const getList = await Fn_GetListSlugArticles();
  if (!getList[0]) {
    return [{ slug: "no-generate" }];
  }
  return getList.map((c) => ({ slug: c }));
}
