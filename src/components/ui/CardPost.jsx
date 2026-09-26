import Link from "next/link";
import ThumbnailPost from "./ThumbnailPost";
import { cn } from "@/lib/cn";

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
      </Link>
    );
  }

  return (
    <Link className="w-full" href={`/${data?.slug || "no-generate"}`}>
      <ThumbnailPost url={data?.image || ""} />
      <div className="py-4">
        <h3 className={cn("font-semibold text-xl mb-2 line-clamp-2", titleclass)}>{data?.title}</h3>
        <p className={cn("text-neutral-600 line-clamp-2", descriptionclass)}>{data?.description}</p>
      </div>
    </Link>
  );
}
