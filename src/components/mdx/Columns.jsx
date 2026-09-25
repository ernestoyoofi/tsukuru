export function Column({ children = null }) {
  return (
    <div className="min-w-0 flex-1 [&>*:first-child]:mt-0">{children}</div>
  );
}

export default function MDX_Component_Columns({ children = null }) {
  return <div className="mt-4 flex flex-col gap-4 md:flex-row">{children}</div>;
}
