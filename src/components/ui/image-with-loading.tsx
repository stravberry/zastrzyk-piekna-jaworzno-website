
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
  priority = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(thumbnailSrc || src);
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

  // Progressive loading: thumbnail → full image
  useEffect(() => {
    if (!isInView) return;

    if (thumbnailSrc && currentSrc === thumbnailSrc) {
      // Load full image in background
      const fullImg = new Image();
      fullImg.onload = () => {
        setCurrentSrc(webpSrc || src);
      };
      fullImg.onerror = () => {
        if (webpSrc && webpSrc !== src) {
          // Try fallback to original if WebP fails
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            setCurrentSrc(src);
          };
          fallbackImg.src = src;
        }
      };
      fullImg.src = webpSrc || src;
    }
  }, [isInView, currentSrc, thumbnailSrc, webpSrc, src]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    
    // Try fallback to original if WebP fails
    if (webpSrc && currentSrc === webpSrc && webpSrc !== src) {
      setCurrentSrc(src);
      setHasError(false);
      return;
    }
    
    onError?.();
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      {/* Actual image */}
      <img
        ref={imgRef}
        src={isInView ? currentSrc : undefined}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          hasError ? "hidden" : "",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
      
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
