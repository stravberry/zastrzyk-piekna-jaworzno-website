
import { ZIcon } from 'lucide-react';

/**
 * Generates an SVG favicon using Lucide React icons
 * @returns SVG string in data URI format for direct use in link tags
 */
export const generateZFavicon = (): string => {
  // Create SVG manually without JSX
  // Using the SVG path data from Lucide Z icon
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a33f96" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 3h18v4L7 17h14v4H3v-4l14-10H3z"></path>
    </svg>
  `;
  
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
