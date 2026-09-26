import { ArrowRight } from "@gravity-ui/icons";
import Link from "next/link";

export default function CategoryItem({ name = "", count = 0 }) {
  const nameSlug = String(name || "no-generate");
  return (
    <Link
      href={`/category/${nameSlug}`}
      className="w-full flex items-center justify-between py-1 border-b border-dashed border-neutral-300 group hover:text-blue-500 overflow-hidden"
    >
      <div className="flex items-center">
        <span className="font-mono text-sm group-hover:underline duration-300">
          {nameSlug}
        </span>
        <ArrowRight className="-ml-[8px] blur-xs opacity-0 rotate-12 group-hover:ml-1 group-hover:blur-none group-hover:opacity-100 group-hover:-rotate-45 duration-200" />
      </div>
      <div className="flex items-center text-[0.8rem]">
        <span className="bg-neutral-100 group-hover:bg-blue-100 p-0.5 px-1 rounded-md duration-300 font-semibold">
          {String(count || 0)}
        </span>
      </div>
    </Link>
  );
}
