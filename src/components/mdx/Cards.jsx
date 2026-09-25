export function Card({ title = "", href = "", children = null }) {
  const body = (
    <div className="rounded-xl border border-zinc-200 p-4 transition-colors hover:border-zinc-400">
      {title ? <p className="mb-1 font-semibold">{title}</p> : null}
      <div className="text-sm text-zinc-700">{children}</div>
    </div>
  );
  if (href) {
    return (
      <a href={href} className="block no-underline">
        {body}
      </a>
    );
  }
  return body;
}

export default function MDX_Component_Cards({ children = null }) {
  return <div className="my-4 grid gap-3 sm:grid-cols-2">{children}</div>;
}
