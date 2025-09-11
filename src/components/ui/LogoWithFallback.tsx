import React, { useState } from "react";
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

  const handleError = () => {
    if (useOriginal && !hasError) {
      console.log("Original logo failed, switching to fallback");
      setUseOriginal(false);
      setHasError(true);
    }
  };

  // Add timestamp for aggressive cache busting
  const timestamp = Date.now();
  const logoSrc = useOriginal && !hasError 
    ? `/lovable-uploads/ca8b4446-c52a-49cd-8797-c645d772eb94.png?v=${timestamp}`
    : logoFallback;

  const logoClass = useOriginal && !hasError 
    ? `${className} logo-image-v4-20250911-fixed`
    : `${className} logo-fallback-clean`;

  return (
    <ImageWithLoading
      src={logoSrc}
      alt={alt}
      className={logoClass}
      sizes={sizes}
      priority={priority}
      onError={handleError}
    />
  );
};

export default LogoWithFallback;