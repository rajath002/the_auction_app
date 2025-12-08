"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { Modal } from "antd";

interface IImageWithFallback {
  src: string | StaticImport;
  fallbackSrc: StaticImport | string;
  alt: string;
  priority?: boolean;
  width?: number;
  height?: number;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  objectPosition?: string;
  enablePreview?: boolean;
}

const ImageWithFallback = React.memo(function ImageWithFallback(props: IImageWithFallback) {
  const { src, fallbackSrc, alt, width, height, priority, objectFit = "cover", objectPosition = "top", enablePreview = false } = props;
  const [imgSrc, setImgSrc] = useState<StaticImport | string>(src);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  const handleImageClick = () => {
    if (enablePreview) {
      setIsPreviewOpen(true);
    }
  };

  return (
    <>
      <Image
        width={width}
        height={height}
        src={imgSrc as any}
        alt={alt}
        priority={priority}
        style={{ objectFit, objectPosition, cursor: enablePreview ? "pointer" : "default" }}
        onError={handleError}
        onLoad={handleLoad}
        onClick={handleImageClick}
        className="w-full h-full"
      />
      {enablePreview && (
        <Modal
          open={isPreviewOpen}
          onCancel={() => setIsPreviewOpen(false)}
          footer={null}
          centered
          width="auto"
          closable={false}
          styles={{
            body: { padding: 0, display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" },
            content: { background: "transparent", boxShadow: "none", maxWidth: "100vw", padding: 0 },
            mask: { background: "rgba(0, 0, 0, 0.9)" },
          }}
        >
          <div 
            onClick={() => setIsPreviewOpen(false)} 
            style={{ cursor: "pointer", width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}
          >
            <Image
              src={imgSrc as any}
              alt={alt}
              width={2400}
              height={1800}
              style={{ objectFit: "contain", height: "100vh", width: "100vw" }}
            />
          </div>
        </Modal>
      )}
    </>
  );
});

export default ImageWithFallback;
