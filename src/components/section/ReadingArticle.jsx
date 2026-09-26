import Reader from "../ui/Reader";
import ThumbnailPost from "../ui/ThumbnailPost";
import { ArrowLeft, HourglassEnd } from "@gravity-ui/icons";
import formatArticleDate from "@/lib/date-format";
import CategoryItem from "../ui/CategoryItem";
import CardPost from "../ui/CardPost";
import Comment from "../ui/Comment";
import Link from "next/link";

export default function ReadingArticle({ data = {} }) {
  return (
    <div className="w-full max-w-7xl m-auto px-6 flex flex-wrap justify-between">
      <div className="w-full xl:w-[calc(100%-400px)] pb-5 pt-3">
        <Link href="/" className="text-sm font-mono inline-flex items-center py-2 text-neutral-600 mb-4">
          <ArrowLeft className="mr-2" width={14} height={14}/>
          <span className="text-sm">Back</span>
        </Link>
        <div className="w-full text-sm text-neutral-500">
          <p>{formatArticleDate(data?.metadata?.date)}</p>
        </div>
        <h1
          data-section="title"
          className="font-semibold text-xl md:text-3xl my-4"
        >
          {data?.metadata?.title || "NoTitle"}
        </h1>
        <div
          data-section="box-info"
          className="flex items-center text-sm text-neutral-500"
        >
          <div
            className="flex items-center"
            title={data?.metadata?.reading_time?.text || "Not A Time Format"}
          >
            <HourglassEnd width={18} height={18} className="rotate-6" />
            <span className="ml-1">
              {data?.metadata?.reading_time?.text || "NaTF"}
            </span>
          </div>
        </div>
        <ThumbnailPost className="mt-4" url={data?.metadata?.image || ""} />
        <div className="my-5 border-b border-dashed border-neutral-300" />
        <Reader content={data?.content || ""} />
        <div className="mt-9 mb-4 border-b border-dashed border-neutral-300" />
        <Comment data={data?.giscus || {}} />
      </div>
      <div className="self-start sticky top-[66px] left-0 w-full md:h-[calc(100dvh-80px)] xl:w-[390px] xl:border-dashed xl:pl-3 xl:border-l border-neutral-300 py-3 overflow-y-auto overflow-x-hidden">
        {/* <h4 className="font-semibold mb-3">
          <span className="mr-1 font-bold text-blue-400 underline">#</span>On
          This Page
        </h4>
        <div className="w-full border-t border-dashed border-neutral-300"></div> */}
        <h4 className="font-semibold my-3">
          <span className="mr-1 font-bold text-blue-400 underline">#</span>
          Latest Posts
        </h4>
        <div className="w-full border-t border-dashed border-neutral-300">
          {data?.recommend?.list_top_posts?.map((data, i) => (
            <div
              className="w-full border-b border-dashed border-neutral-300"
              key={i}
            >
              <CardPost
                data={data}
                forcestyle="no_image_cover"
                titleclass="text-sm mb-1.5"
                descriptionclass="text-sm"
              />
            </div>
          ))}
        </div>
        <h4 className="font-semibold my-3">
          <span className="mr-1 font-bold text-blue-400 underline">#</span>
          Categories
        </h4>
        <div className="w-full border-t border-dashed border-neutral-300">
          {data?.recommend?.categories?.map((items, i) => (
            <CategoryItem {...items} key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
