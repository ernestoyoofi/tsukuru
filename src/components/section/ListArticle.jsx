import { cn } from "@/lib/cn";
import CardPost from "../ui/CardPost";

export default function ListArticle({ data = {}, tag = "", heading = "" }) {
  return (
    <div className="w-full max-w-7xl m-auto">
      <div className="w-full px-6 p-4 capitalize">
        {String(tag || "")?.trim() && (
          <span className="w-full block mb-1 uppercase font-mono text-[0.7rem] text-neutral-600">{String(tag)}</span>
        )}
        <b className="font-semibold text-3xl w-full block">
          {String(heading || "Posts")}
        </b>
      </div>
      <div className="w-full flex flex-wrap px-3">
        {data?.map((items, i) => (
          <div
            key={i}
            className={cn(
              "w-full md:w-[calc(100%/2)] p-3 px-3 border-t border-dashed border-neutral-300",
              i % 2 === 0 ? "md:border-r" : "",
            )}
          >
            <CardPost data={items} />
          </div>
        ))}
      </div>
    </div>
  );
}
