import Link from "next/link";
import ThumbnailPost from "./ThumbnailPost";
import { cn } from "@/lib/cn";
import { ArrowLeft, HourglassEnd, Calendar } from "@gravity-ui/icons";
import formatArticleDate from "@/lib/date-format";

export default function CardPost({
  data = {},
  forcestyle = null,
  titleclass = "",
  descriptionclass = "",
}) {
  const styleCard = String(forcestyle || data.cardtype || "basic");

  if (styleCard === "no_image_cover") {
    return (
      <Link
        className="w-full inline-block py-2"
        data-cardpost-slug={data?.slug || ""}
        href={`/${data?.slug || "no-generate"}`}
      >
        <h3
          className={cn("font-semibold text-xl mb-2 line-clamp-2", titleclass)}
          data-cardpost-title={data?.title || ""}
        >
          {data?.title || ""}
        </h3>
        <p className={cn("text-neutral-600 line-clamp-2", descriptionclass)}>
          {data?.description || "..."}
        </p>
        <div className="flex items-center gap-4 text-sm text-neutral-500 mt-2.5">
          <div
            className="flex items-center"
            title={data?.reading_time?.text || "Not A Time Format"}
          >
            <HourglassEnd width={14} height={14} className="rotate-6" />
            <span className="ml-2">{data?.reading_time?.text || "NaTF"}</span>
          </div>
          <div className="flex items-center">
            <Calendar width={14} height={14} className="rotate-2" />
            <span className="ml-2">{formatArticleDate(data?.date)}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (styleCard === "small_cover") {
    return (
      <Link
        className="w-full inline-flex py-2 items-start"
        data-cardpost-slug={data?.slug || ""}
        href={`/${data?.slug || "no-generate"}`}
      >
        <div className="w-[170px]">
          <ThumbnailPost
            url={data?.image || ""}
            alt={`Image of ${data?.title}`}
          />
        </div>
        <div className="w-[calc(100%-170px)] pl-4">
          <h3
            className={cn(
              "font-semibold text-xl mb-2 line-clamp-2",
              titleclass,
            )}
            data-cardpost-title={data?.title || ""}
          >
            {data?.title || ""}
          </h3>
          <p className={cn("text-neutral-600 line-clamp-2", descriptionclass)}>
            {data?.description || "..."}
          </p>
          <div className="flex items-center gap-4 text-sm text-neutral-500 mt-2.5">
            <div
              className="flex items-center"
              title={data?.reading_time?.text || "Not A Time Format"}
            >
              <HourglassEnd width={14} height={14} className="rotate-6" />
              <span className="ml-2">{data?.reading_time?.text || "NaTF"}</span>
            </div>
            <div className="flex items-center">
              <Calendar width={14} height={14} className="rotate-2" />
              <span className="ml-2">{formatArticleDate(data?.date)}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link className="w-full" href={`/${data?.slug || "no-generate"}`}>
      <ThumbnailPost url={data?.image || ""} />
      <div className="py-4">
        <h3
          className={cn("font-semibold text-xl mb-2 line-clamp-2", titleclass)}
        >
          {data?.title}
        </h3>
        <p className={cn("text-neutral-600 line-clamp-2", descriptionclass)}>
          {data?.description}
        </p>
        <div className="flex items-center gap-4 text-sm text-neutral-500 mt-2.5">
          <div
            className="flex items-center"
            title={data?.reading_time?.text || "Not A Time Format"}
          >
            <HourglassEnd width={14} height={14} className="rotate-6" />
            <span className="ml-2">{data?.reading_time?.text || "NaTF"}</span>
          </div>
          <div className="flex items-center">
            <Calendar width={14} height={14} className="rotate-2" />
            <span className="ml-2">{formatArticleDate(data?.date)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
