const STYLES = {
  info: "border-sky-500/30 bg-sky-400/5 text-sky-900 dark:border-sky-400/30 dark:bg-sky-950/50 dark:text-sky-100",
  success:
    "border-emerald-500/30 bg-emerald-400/5 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-950/50 dark:text-emerald-100",
  warning:
    "border-amber-500/30 bg-amber-400/5 text-amber-900 dark:border-amber-400/30 dark:bg-amber-950/50 dark:text-amber-100",
  danger:
    "border-rose-500/30 bg-rose-400/5 text-rose-900 dark:border-rose-400/30 dark:bg-rose-950/50 dark:text-rose-100",
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
