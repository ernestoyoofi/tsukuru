import { cn } from "@/lib/cn";

export default function ThumbnailPost({
  url = "",
  className = "",
  alt = "Image",
}) {
  return (
    <div
      className={cn(
        "aspect-video bg-neutral-200 rounded-md overflow-hidden flex items-center justify-center",
        className,
      )}
    >
      <img
        width={1920}
        height={1080}
        className="w-full h-full object-cover"
        src={url}
        alt={alt || "Image"}
      />
    </div>
  );
}
