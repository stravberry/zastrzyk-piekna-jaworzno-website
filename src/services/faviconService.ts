
/**
 * Generates an SVG favicon with elegant letter Z for beauty industry
 * @returns SVG string in data URI format for direct use in link tags
 */
export const generateZFavicon = (): string => {
  // Create elegant SVG with letter Z using sophisticated typography
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e91e63;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#9c27b0;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="6" fill="url(#grad1)"/>
      <text x="16" y="23" font-family="serif" font-size="20" font-weight="bold" text-anchor="middle" fill="white" style="font-style: italic;">Z</text>
    </svg>
  `;
  
  // Convert SVG string to data URI
  const dataUri = `data:image/svg+xml;base64,${btoa(svgString)}`;
  return dataUri;
};

/**
 * Updates the favicon dynamically with cache busting
 */
export const updateFavicon = () => {
  // Generate the favicon data URI with timestamp for cache busting
  const faviconUri = generateZFavicon();
  const timestamp = Date.now();
  
  // Find existing favicon link element or create a new one
  let linkElement = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
  if (!linkElement) {
    linkElement = document.createElement('link');
    linkElement.rel = 'icon';
    document.head.appendChild(linkElement);
  }
  
  // Update the href attribute with cache busting
  linkElement.href = `${faviconUri}?v=${timestamp}`;
  linkElement.type = 'image/svg+xml';
  
  // Force browser cache refresh
  const newLink = linkElement.cloneNode(true) as HTMLLinkElement;
  linkElement.parentNode?.insertBefore(newLink, linkElement);
  setTimeout(() => linkElement.remove(), 100);
};
