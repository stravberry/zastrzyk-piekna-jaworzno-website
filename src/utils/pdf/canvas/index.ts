// Unified PNG generator exports with improved quality and spacing

import { PriceCategory } from "@/components/pricing/PriceCard";

// Use improved generators as primary exports
export { 
  generateImprovedFullPricingPng as generateFullPricingPng,
  generateImprovedCategoryPng as generateSingleCategoryPng,
  generateImprovedCategoryPages as generateCategoryPagesAsPng
} from './improvedPngGenerator';

// Legacy exports for backward compatibility
export { 
  generateSimpleFullPricingPng,
  generateSimpleCategoryPng,
  generateSimpleCategoryPagesAsPng
} from './simplePngGenerator';

// Keep utility exports
export { FONTS, loadGoogleFonts, formatPrice } from './fontUtils';
export { drawRoundedRect, wrapText, drawCenteredText, drawLeftText, drawRightText } from './drawingUtils';