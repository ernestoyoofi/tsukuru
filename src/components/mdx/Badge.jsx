const STYLES = {
  default: "bg-zinc-500/15 text-zinc-700",
  info: "bg-sky-500/15 text-sky-700",
  success: "bg-emerald-500/15 text-emerald-700",
  warning: "bg-amber-500/15 text-amber-700",
  danger: "bg-rose-500/15 text-rose-700",
};

export default function MDX_Component_Badge({
  variant = "default",
  children = null,
}) {
  const style = STYLES[variant] || STYLES.default;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {children}
    </span>
  );
}
