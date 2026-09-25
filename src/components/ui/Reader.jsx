import { MDXRemote } from "next-mdx-remote/rsc";
import mdxComponents from "@/components/mdx";
import PreBlock from "@/components/ui/PreBlock";

const baseComponents = {
  h1: (props) => (
    <h1
      className="mt-8 text-3xl font-bold tracking-tight first:mt-0"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="mt-8 border-b border-zinc-200 pb-2 text-2xl font-bold tracking-tight"
      {...props}
    />
  ),
  h3: (props) => <h3 className="mt-6 text-xl font-semibold" {...props} />,
  h4: (props) => <h4 className="mt-5 text-lg font-semibold" {...props} />,
  h5: (props) => <h5 className="mt-4 text-base font-semibold" {...props} />,
  h6: (props) => (
    <h6
      className="mt-4 text-sm font-semibold uppercase tracking-wide text-zinc-500"
      {...props}
    />
  ),
  p: (props) => <p className="mt-4 leading-7 text-zinc-950" {...props} />,
  a: (props) => (
    <a
      className="font-medium text-sky-600 underline decoration-sky-300 underline-offset-4 hover:text-sky-700"
      {...props}
    />
  ),
  ul: (props) => <ul className="mt-4 list-disc space-y-2 pl-6" {...props} />,
  ol: (props) => <ol className="mt-4 list-decimal space-y-2 pl-6" {...props} />,
  li: (props) => <li className="leading-7 text-zinc-950" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="mt-4 border-l-4 border-zinc-300 pl-4 italic text-zinc-700"
      {...props}
    />
  ),
  pre: PreBlock,
  // pre: (props) => (
  //   <div className="mt-4 w-full overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-900 [&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:p-0">
  //     {props.children}
  //   </div>
  // ),
  code: (props) => (
    <code
      className="rounded bg-zinc-200/70 px-1.5 py-0.5 font-mono text-[0.85em] text-zinc-800"
      {...props}
    />
  ),
  table: (props) => (
    <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200">
      <table className="w-full text-left text-sm" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-zinc-100 text-zinc-800" {...props} />,
  th: (props) => <th className="px-4 py-2 font-semibold" {...props} />,
  td: (props) => (
    <td className="border-t border-zinc-200 px-4 py-2" {...props} />
  ),
  hr: (props) => <hr className="my-8 border-zinc-200" {...props} />,
  img: (props) => (
    // biome-ignore lint/performance/noImgElement: MDX image src is dynamic, next/image needs fixed dimensions
    // biome-ignore lint/a11y/useAltText: alt comes from markdown syntax via props spread
    <img
      className="mt-4 h-auto max-w-full rounded-xl"
      loading="lazy"
      {...props}
    />
  ),
  strong: (props) => <strong className="font-semibold" {...props} />,
  em: (props) => <em className="italic" {...props} />,
  del: (props) => <del className="line-through opacity-70" {...props} />,
};

export default function Reader({ content = "" }) {
  if (!String(content || "").trim()) return null;
  return (
    <MDXRemote
      source={content}
      components={{ ...baseComponents, ...mdxComponents }}
    />
  );
}
