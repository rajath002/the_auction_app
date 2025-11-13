"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { StaticImport } from "next/dist/shared/lib/get-img-props";

interface IImageWithFallback {
  src: string;
  fallbackSrc: StaticImport | string;
  alt: string;
  priority?: boolean;
  width?: number;
  height?: number;
}

const ImageWithFallback = React.memo(function ImageWithFallback(props: IImageWithFallback) {
  const { src, fallbackSrc, alt, width, height, priority } = props;
  const [imgSrc, setImgSrc] = useState<StaticImport | string>(src);

  useEffect(() => setImgSrc(src), [src]);

  const handleError = useCallback(() => {
    setImgSrc(fallbackSrc);
  }, [fallbackSrc]);

  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const image = e.target as HTMLImageElement;
    if (image.naturalWidth === 0) {
      setImgSrc(fallbackSrc);
    }
  }, [fallbackSrc]);

  return (
    <Image
      width={width}
      height={height}
      src={imgSrc as any}
      alt={alt}
      priority={priority}
      style={{ objectFit: "contain" }}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
});

export default ImageWithFallback;
