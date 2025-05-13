
import { Z } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

/**
 * Generates an SVG favicon using Lucide React icons
 * @returns SVG string in data URI format for direct use in link tags
 */
export const generateZFavicon = (): string => {
  // Render the Lucide Z icon to a static SVG string
  const svgString = renderToStaticMarkup(
    <Z 
      size={32}
      color="#a33f96" // Używamy koloru dopasowanego do motywu strony
      strokeWidth={2}
    />
  );
  
  // Convert SVG string to data URI
  const dataUri = `data:image/svg+xml;base64,${btoa(svgString)}`;
  return dataUri;
};

/**
 * Updates the favicon dynamically
 */
export const updateFavicon = () => {
  // Generate the favicon data URI
  const faviconUri = generateZFavicon();
  
  // Find existing favicon link element or create a new one
  let linkElement = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
  if (!linkElement) {
    linkElement = document.createElement('link');
    linkElement.rel = 'icon';
    document.head.appendChild(linkElement);
  }
  
  // Update the href attribute with our new favicon
  linkElement.href = faviconUri;
  linkElement.type = 'image/svg+xml';
};
