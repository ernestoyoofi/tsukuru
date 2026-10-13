import CardPost from "../ui/CardPost";

export default function ListArticle({ data = {}, tag = "", heading = "" }) {
  return (
    <div className="w-full max-w-7xl m-auto">
      <div className="w-full px-6 p-4 capitalize">
        {String(tag || "")?.trim() && (
          <span className="w-full block mb-1 uppercase font-mono text-[0.7rem] text-neutral-600">
            {String(tag)}
          </span>
        )}
        <b className="font-semibold text-3xl w-full block">
          {String(heading || "Posts")}
        </b>
      </div>
      <div className="w-full flex flex-wrap px-4">
        {data?.map((items, i) => (
          <div
            key={`${items.slug}-${i}`}
            className="w-full sm:w-[50%] xl:w-[calc(100%/3)] p-2 px-2"
          >
            <CardPost data={items} />
          </div>
        ))}
      </div>
    </div>
  );
}
