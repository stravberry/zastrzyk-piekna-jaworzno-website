// Main canvas PNG generator exports

import { PriceCategory } from "@/components/pricing/PriceCard";
import { generateFullPricingPng } from './fullPricingGenerator';
import { generateSingleCategoryPng } from './singleCategoryGenerator';
import { splitCategoryIntoPages } from './categoryUtils';

// Generate multiple PNG files for a category if needed
export const generateCategoryPagesAsPng = async (category: PriceCategory): Promise<Blob[]> => {
  const pages = splitCategoryIntoPages(category, 8);
  const blobs: Blob[] = [];

  for (const page of pages) {
    const blob = await generateSingleCategoryPng(page);
    blobs.push(blob);
  }

  return blobs;
};

// Re-export all functionality
export { generateFullPricingPng } from './fullPricingGenerator';
export { generateSingleCategoryPng } from './singleCategoryGenerator';
export { splitCategoryIntoPages } from './categoryUtils';
export { FONTS, loadGoogleFonts, formatPrice } from './fontUtils';
export { drawRoundedRect, wrapText, drawCenteredText, drawLeftText, drawRightText } from './drawingUtils';
export { calculateItemHeight } from './heightCalculator';