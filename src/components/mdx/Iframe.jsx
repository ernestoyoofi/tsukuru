const RATIOS = {
  "16:9": "16 / 9",
  "4:3": "4 / 3",
  "1:1": "1 / 1",
};

const VIDEO_HOSTS = ["youtube.com", "youtu.be", "vimeo.com"];

function resolveRatio(src, ratio) {
  if (ratio && RATIOS[ratio]) return ratio;
  try {
    const host = new URL(src).hostname.replace(/^www\./, "");
    if (VIDEO_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
      return "16:9";
    }
  } catch {
    return "16:9";
  }
  return "16:9";
}

export default function MDX_Component_Iframe({
  src = "",
  title = "Embedded content",
  ratio = "",
}) {
  if (!src) return null;

  return (
    <div
      className="relative my-4 w-full overflow-hidden rounded-xl border border-zinc-200"
      style={{ aspectRatio: RATIOS[resolveRatio(src, ratio)] }}
    >
      <iframe
        src={src}
        title={title}
        className="absolute inset-0 h-full w-full border-0"
        loading="lazy"
        allowFullScreen
      />
    </div>
  );
}
