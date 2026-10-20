"use client";

import { useState } from "react";
import Image from "next/image";
import { resolveImageUrl } from "@/lib/image";

type GameImageProps = {
  path: string;
  title: string;
};

export function GameImage({ path, title }: GameImageProps) {
  const imageUrl = resolveImageUrl(path);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-border">
      {imageUrl !== null && imageUrl !== failedUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setFailedUrl(imageUrl)}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted">
          تصویری موجود نیست
        </div>
      )}
    </div>
  );
}
