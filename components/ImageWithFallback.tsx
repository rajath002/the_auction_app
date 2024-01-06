import React, { useState } from "react";
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
function ImageWithFallback(props: IImageWithFallback) {
  const { src, fallbackSrc, alt, width, height, priority } = props;
  const [imgSrc, setImgSrc] = useState<StaticImport | string>(src);

  console.log("THE SRC", src);
  return (
    <Image
      width={width}
      height={height}
      src={imgSrc as any}
      alt={alt}
      onError={() => {
        setImgSrc(fallbackSrc);
      }}
      onLoad={(e) => {
        const image = e.target as HTMLImageElement;
        if (image.naturalWidth === 0) {
          // Broken image
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}

export default ImageWithFallback;
