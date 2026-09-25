const STYLES = {
  info: "border-sky-500/30 bg-sky-500/10 text-sky-900",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-900",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-900",
  danger: "border-rose-500/30 bg-rose-500/10 text-rose-900",
};

export default function MDX_Component_Callout({
  type = "info",
  title = "",
  children = null,
}) {
  const style = STYLES[type] || STYLES.info;
  return (
    <div className={`my-4 rounded-lg border p-4 ${style}`}>
      {title ? <p className="mb-1 font-semibold">{title}</p> : null}
      <div className="py-0 text-sm leading-relaxed [&>*:first-child]:mt-0">
        {children}
      </div>
    </div>
  );
}
