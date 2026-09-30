"use client";

import { cn } from "@/lib/cn";
import { useState, useRef, useEffect } from "react";

export default function ThumbnailPost({
  url = "",
  className = "",
  alt = "Image",
}) {
  const [isLoading, setLoading] = useState(true);
  const [isError, setError] = useState(false);
  const imageRef = useRef(null);

  const imageSrc = url || "/image/default-img.webp";

  useEffect(() => {
    if (!!imageRef.current && !!imageRef.current?.complete) {
      setLoading(false);
    }
  }, []);

  return (
    <div
      className={cn(
        "aspect-video bg-neutral-100 rounded-md overflow-hidden flex items-center justify-center relative",
        className,
      )}
    >
      {/* Loading Shimmer State */}
      {isLoading && !isError && (
        <div className="absolute inset-0 z-10 w-full h-full bg-neutral-200 flex items-center justify-center select-none">
          <p className="text-neutral-400 font-semibold">Loading...</p>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="absolute inset-0 z-10 w-full h-full bg-neutral-200 flex items-center justify-center select-none">
          <p className="text-neutral-400 font-semibold">No Image...</p>
        </div>
      )}

      {/* Native Image Element */}
      <img
        ref={imageRef}
        width={1920}
        height={1080}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
        )}
        src={imageSrc}
        alt={alt || "Image"}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
    </div>
  );
}
