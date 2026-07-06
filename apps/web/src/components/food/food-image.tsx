"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

type FoodImageProps = Omit<ImageProps, "onError"> & {
  fallbackClassName?: string;
};

export function FoodImage({ className, fallbackClassName, alt, ...props }: FoodImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-doora-orange-soft text-doora-orange",
          fallbackClassName,
          className,
        )}
        aria-label={alt}
      >
        <Utensils className="h-6 w-6 opacity-70" />
      </div>
    );
  }

  return (
    <Image
      {...props}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
