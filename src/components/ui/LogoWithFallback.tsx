import React, { useState, useEffect, useCallback } from "react";
import ImageWithLoading from "./image-with-loading";
import logoFallback from "@/assets/logo-fallback.png";

interface LogoWithFallbackProps {
  className?: string;
  sizes?: string;
  priority?: boolean;
  alt?: string;
}

const LogoWithFallback: React.FC<LogoWithFallbackProps> = ({
  className = "",
  sizes,
  priority = true,
  alt = "Zastrzyk Piękna — logo gabinetu"
}) => {
  const [useOriginal, setUseOriginal] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [renderingIssue, setRenderingIssue] = useState(false);

  // Static cache busting - use build timestamp instead of Date.now()
  const BUILD_VERSION = "20250911-v5";
  
  // Intelligent fallback detection using image data check
  const checkImageRendering = useCallback((imgElement: HTMLImageElement) => {
    if (!imgElement || !useOriginal || hasError || renderingIssue) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 32;
    canvas.height = 32;
    
    try {
      ctx.drawImage(imgElement, 0, 0, 32, 32);
      const imageData = ctx.getImageData(0, 0, 32, 32);
      const data = imageData.data;
      
      // Check if image is predominantly black (indicating rendering issue)
      let blackPixels = 0;
      let totalPixels = 0;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        if (a > 0) { // Only count non-transparent pixels
          totalPixels++;
          if (r < 50 && g < 50 && b < 50) {
            blackPixels++;
          }
        }
      }
      
      // If more than 70% of visible pixels are black, switch to fallback
      if (totalPixels > 0 && (blackPixels / totalPixels) > 0.7) {
        console.warn("Logo rendering as predominantly black, switching to fallback");
        setRenderingIssue(true);
      }
    } catch (error) {
      console.warn("Logo rendering check failed:", error);
    }
  }, [useOriginal, hasError, renderingIssue]);

  const handleError = () => {
    if (useOriginal && !hasError) {
      console.log("Original logo failed, switching to fallback");
      setUseOriginal(false);
      setHasError(true);
    }
  };

  const handleLoad = useCallback(() => {
    // Find the actual image element after load and check it
    setTimeout(() => {
      const logoImages = document.querySelectorAll('.logo-image-v5-simplified img');
      const currentImg = Array.from(logoImages).find(img => 
        (img as HTMLImageElement).src.includes('ca8b4446-c52a-49cd-8797-c645d772eb94')
      ) as HTMLImageElement;
      
      if (currentImg) {
        checkImageRendering(currentImg);
      }
    }, 300);
  }, [checkImageRendering]);

  // Smart logo source selection
  const logoSrc = (useOriginal && !hasError && !renderingIssue) 
    ? `/lovable-uploads/ca8b4446-c52a-49cd-8797-c645d772eb94.png?v=${BUILD_VERSION}`
    : logoFallback;

  const logoClass = (useOriginal && !hasError && !renderingIssue) 
    ? `${className} logo-image-v5-simplified`
    : `${className} logo-fallback-clean`;

  return (
    <ImageWithLoading
      src={logoSrc}
      alt={alt}
      className={logoClass}
      sizes={sizes}
      priority={priority}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
};

export default LogoWithFallback;