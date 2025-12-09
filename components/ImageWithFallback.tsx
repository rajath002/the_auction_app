"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { Modal, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

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
  const [isLoading, setIsLoading] = useState(true);
  const [imageKey, setImageKey] = useState(0);

  useEffect(() => {
    // Immediately show loading state when src changes
    setIsLoading(true);
    setImgSrc(src);
    // Force re-render of Image component with new key
    setImageKey(prev => prev + 1);
  }, [src]);

  const handleError = useCallback(() => {
    setImgSrc(fallbackSrc);
    setIsLoading(false);
  }, [fallbackSrc]);

  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const image = e.target as HTMLImageElement;
    if (image.naturalWidth === 0) {
      setImgSrc(fallbackSrc);
    }
    setIsLoading(false);
  }, [fallbackSrc]);

  const handleImageClick = () => {
    if (enablePreview) {
      setIsPreviewOpen(true);
    }
  };

  return (
    <>
      <div className="relative w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#38bdf8' }} spin />} />
          </div>
        )}
        <Image
          key={imageKey}
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
      </div>
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
