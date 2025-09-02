
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ImageWithLoadingProps {
  src: string;
  webpSrc?: string;
  thumbnailSrc?: string;
  alt: string;
  className?: string;
  lazy?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  sizes?: string;
  srcSet?: string;
}

const ImageWithLoading: React.FC<ImageWithLoadingProps> = ({
  src,
  webpSrc,
  thumbnailSrc,
  alt,
  className,
  lazy = true,
  onLoad,
  onError,
  priority = false,
  sizes,
  srcSet
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, priority, isInView]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      {/* Actual image */}
      {webpSrc ? (
        <picture>
          <source srcSet={webpSrc} type="image/webp" sizes={sizes} />
          <img
            ref={imgRef}
            src={isInView ? src : undefined}
            srcSet={srcSet}
            sizes={sizes}
            alt={alt}
            className={cn(
              "transition-opacity duration-300",
              isLoading ? "opacity-0" : "opacity-100",
              hasError ? "hidden" : ""
            )}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
          />
        </picture>
      ) : (
        <img
          ref={imgRef}
          src={isInView ? src : undefined}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          className={cn(
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            hasError ? "hidden" : ""
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      )}
      
      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Błąd ładowania obrazu</span>
        </div>
      )}
    </div>
  );
};

export default ImageWithLoading;
