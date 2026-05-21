"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type SafeImageProps = Omit<ImageProps, "onError"> & {
  label?: string;
};

export function SafeImage({ className, alt, label, src, ...props }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-[var(--brand-light-gray)] p-3 text-center text-xs font-medium text-[var(--brand-mid-gray)]",
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <span className="line-clamp-4">{label ?? alt}</span>
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
