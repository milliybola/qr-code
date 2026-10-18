"use client";

import Image from "next/image";
import { useState } from "react";
import { IconPlate } from "./Icons";

/** Faqat backend media'si (next.config remotePatterns) Next orqali optimallashtiriladi */
function canOptimize(src: string): boolean {
  return /^https:\/\/mytizim\.uz\/media\//i.test(src) && !/\.(svg|ico|gif)(\?|#|$)/i.test(src);
}

/**
 * next/image (fill) + lazy + xato bo'lsa placeholder. Ota element `relative` va o'lchamli bo'lishi kerak.
 */
export default function SafeImage({
  src,
  alt,
  sizes,
  priority = false,
  fit = "cover",
  className = "",
  iconSize = 32,
}: {
  src?: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  fit?: "cover" | "contain";
  className?: string;
  iconSize?: number;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!src || failed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-chip text-faint" aria-hidden>
        <IconPlate size={iconSize} />
      </div>
    );
  }

  return (
    <>
      {!loaded && <div className="skeleton absolute inset-0" aria-hidden />}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={!canOptimize(src)}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`${fit === "cover" ? "object-cover" : "object-contain"} transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${className}`}
      />
    </>
  );
}
