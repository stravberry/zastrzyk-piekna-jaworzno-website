// Smart pagination system for optimal PNG generation
import { PriceItem, PriceCategory } from "@/components/pricing/PriceCard";
import { PngGenerationConfig } from "@/services/pricing/pricingPngConfig";

export interface PaginationConfig {
  maxPageHeight: number;
  headerHeight: number;
  footerHeight: number;
  minItemsPerPage: number;
  maxItemsPerPage: number;
  preferredItemsPerPage: number;
  qualityMode: 'maxItems' | 'readability' | 'aesthetic';
}

export interface PageBreakResult {
  pages: {
    items: PriceItem[];
    estimatedHeight: number;
    actualItemCount: number;
  }[];
  totalPages: number;
  averageItemsPerPage: number;
  utilizationRate: number; // How well we use available space
}

export interface FontConfig {
  treatmentName: number;
  description: number;
  price: number;
  categoryHeader: number;
  mainHeader: number;
}

// Dynamic font sizing based on content and quality mode
export function calculateOptimalFontSizes(
  itemCount: number,
  qualityMode: 'maxItems' | 'readability' | 'aesthetic',
  canvasHeight: number
): FontConfig {
  const baseConfig: FontConfig = {
    treatmentName: 32,
    description: 22,
    price: 26,
    categoryHeader: 32,
    mainHeader: 42
  };

  switch (qualityMode) {
    case 'maxItems':
      // Smaller fonts to fit more items but still readable
      return {
        treatmentName: Math.max(28, baseConfig.treatmentName - Math.floor(itemCount / 12)),
        description: Math.max(20, baseConfig.description - Math.floor(itemCount / 15)),
        price: Math.max(24, baseConfig.price - Math.floor(itemCount / 15)),
        categoryHeader: baseConfig.categoryHeader,
        mainHeader: baseConfig.mainHeader
      };
    
    case 'readability':
      // Larger fonts for better readability
      return {
        treatmentName: baseConfig.treatmentName + 4,
        description: baseConfig.description + 4,
        price: baseConfig.price + 4,
        categoryHeader: baseConfig.categoryHeader + 4,
        mainHeader: baseConfig.mainHeader + 4
      };
    
    case 'aesthetic':
    default:
      // Balanced approach
      return baseConfig;
  }
}

// Calculate the actual height of a single treatment card with given fonts
export function calculateSmartCardHeight(
  ctx: CanvasRenderingContext2D,
  item: PriceItem,
  fontConfig: FontConfig,
  cardWidth: number,
  padding: number
): number {
  let height = padding * 2; // Top and bottom padding

  // Treatment name height
  ctx.font = `bold ${fontConfig.treatmentName}px system-ui, -apple-system, sans-serif`;
  const nameLines = wrapTextSmart(ctx, item.name, cardWidth - padding * 2);
  height += nameLines.length * (fontConfig.treatmentName * 1.4);

  // Space between name and price
  height += 12;
  
  // Price height
  height += fontConfig.price * 1.4;

  // Description height (if exists)
  if (item.description) {
    height += 16; // Space before description
    ctx.font = `400 ${fontConfig.description}px system-ui, -apple-system, sans-serif`;
    const descLines = wrapTextSmart(ctx, item.description, cardWidth - padding * 2);
    height += descLines.length * (fontConfig.description * 1.3);
  }
  
  return Math.max(height, 140); // Minimum height for readability
}

// Improved text wrapping with better word breaking
export function wrapTextSmart(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  if (!text) return [''];
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Word too long, try to break it
        if (word.length > 15) {
          const parts = breakLongWord(ctx, word, maxWidth);
          lines.push(...parts.slice(0, -1));
          currentLine = parts[parts.length - 1];
        } else {
          lines.push(word);
        }
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines.length > 0 ? lines : [''];
}

// Break long words at reasonable points
function breakLongWord(ctx: CanvasRenderingContext2D, word: string, maxWidth: number): string[] {
  const parts: string[] = [];
  let current = '';
  
  for (let i = 0; i < word.length; i++) {
    const testChar = word[i];
    const testString = current + testChar;
    
    if (ctx.measureText(testString).width > maxWidth && current.length > 0) {
      parts.push(current + '-');
      current = testChar;
    } else {
      current = testString;
    }
  }
  
  if (current) {
    parts.push(current);
  }
  
  return parts.length > 0 ? parts : [word];
}

// Calculate optimal items per page dynamically
export function calculateOptimalItemsPerPage(
  items: PriceItem[],
  config: PaginationConfig,
  fontConfig: FontConfig,
  cardWidth: number,
  padding: number
): number {
  // Create temporary canvas for measurements
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d')!;
  
  const availableHeight = config.maxPageHeight - config.headerHeight - config.footerHeight;
  const marginBetweenCards = 20;
  
  // Start with preferred number and adjust
  let optimalCount = config.preferredItemsPerPage;
  
  // Test different counts to find the optimal one
  for (let testCount = config.maxItemsPerPage; testCount >= config.minItemsPerPage; testCount--) {
    const testItems = items.slice(0, testCount);
    let totalHeight = 0;
    
    for (const item of testItems) {
      const cardHeight = calculateSmartCardHeight(tempCtx, item, fontConfig, cardWidth, padding);
      totalHeight += cardHeight + marginBetweenCards;
    }
    
    if (totalHeight <= availableHeight) {
      optimalCount = testCount;
      break;
    }
  }
  
  return Math.max(optimalCount, config.minItemsPerPage);
}

// Smart page breaking algorithm
export function smartPageBreaking(
  items: PriceItem[],
  config: PaginationConfig,
  fontConfig: FontConfig,
  cardWidth: number,
  padding: number
): PageBreakResult {
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d')!;
  
  const availableHeight = config.maxPageHeight - config.headerHeight - config.footerHeight;
  const marginBetweenCards = 20;
  
  const pages: PageBreakResult['pages'] = [];
  let currentPageItems: PriceItem[] = [];
  let currentPageHeight = 0;
  let totalUtilizedHeight = 0;
  
  console.log('🧠 Smart page breaking started:', {
    totalItems: items.length,
    availableHeight,
    qualityMode: config.qualityMode || 'aesthetic'
  });
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const cardHeight = calculateSmartCardHeight(tempCtx, item, fontConfig, cardWidth, padding);
    const itemWithMargin = cardHeight + marginBetweenCards;
    
    // Check if we can fit this item on current page
    if (currentPageHeight + itemWithMargin <= availableHeight) {
      currentPageItems.push(item);
      currentPageHeight += itemWithMargin;
    } else {
      // Start new page if current page has items
      if (currentPageItems.length > 0) {
        pages.push({
          items: [...currentPageItems],
          estimatedHeight: currentPageHeight,
          actualItemCount: currentPageItems.length
        });
        totalUtilizedHeight += currentPageHeight;
        
        // Start new page with current item
        currentPageItems = [item];
        currentPageHeight = itemWithMargin;
      } else {
        // Item too large for any page, force it anyway
        pages.push({
          items: [item],
          estimatedHeight: itemWithMargin,
          actualItemCount: 1
        });
        totalUtilizedHeight += itemWithMargin;
        currentPageHeight = 0;
      }
    }
  }
  
  // Add last page if it has items
  if (currentPageItems.length > 0) {
    pages.push({
      items: currentPageItems,
      estimatedHeight: currentPageHeight,
      actualItemCount: currentPageItems.length
    });
    totalUtilizedHeight += currentPageHeight;
  }
  
  const totalPages = pages.length;
  const averageItemsPerPage = items.length / totalPages;
  const maxPossibleHeight = totalPages * availableHeight;
  const utilizationRate = totalUtilizedHeight / maxPossibleHeight;
  
  console.log('📊 Page breaking results:', {
    totalPages,
    averageItemsPerPage: Math.round(averageItemsPerPage * 10) / 10,
    utilizationRate: Math.round(utilizationRate * 100) + '%',
    pagesInfo: pages.map((page, i) => ({
      page: i + 1,
      items: page.actualItemCount,
      height: Math.round(page.estimatedHeight),
      utilization: Math.round((page.estimatedHeight / availableHeight) * 100) + '%'
    }))
  });
  
  return {
    pages,
    totalPages,
    averageItemsPerPage,
    utilizationRate
  };
}

// Get configuration based on quality mode and content
export function getSmartPaginationConfig(
  itemCount: number,
  qualityMode: 'maxItems' | 'readability' | 'aesthetic',
  canvasHeight: number = 1920
): PaginationConfig {
  const baseConfig: PaginationConfig = {
    maxPageHeight: canvasHeight,
    headerHeight: 120,
    footerHeight: 60,
    minItemsPerPage: 3,
    maxItemsPerPage: 20,
    preferredItemsPerPage: 10,
    qualityMode
  };
  
  switch (qualityMode) {
    case 'maxItems':
      return {
        ...baseConfig,
        maxItemsPerPage: 25,
        preferredItemsPerPage: 15,
        headerHeight: 100, // Smaller headers to fit more content
        footerHeight: 40
      };
    
    case 'readability':
      return {
        ...baseConfig,
        maxItemsPerPage: 12,
        preferredItemsPerPage: 6,
        headerHeight: 140, // Larger headers for better hierarchy
        footerHeight: 80
      };
    
    case 'aesthetic':
    default:
      return baseConfig;
  }
}

// Preview function to show optimization suggestions
export function previewOptimization(
  items: PriceItem[],
  canvasHeight: number = 1920
): {
  maxItems: { pages: number; itemsPerPage: number; utilization: number };
  readability: { pages: number; itemsPerPage: number; utilization: number };
  aesthetic: { pages: number; itemsPerPage: number; utilization: number };
  recommendation: 'maxItems' | 'readability' | 'aesthetic';
} {
  const modes: ('maxItems' | 'readability' | 'aesthetic')[] = ['maxItems', 'readability', 'aesthetic'];
  const results: any = {};
  
  modes.forEach(mode => {
    const config = getSmartPaginationConfig(items.length, mode, canvasHeight);
    const fontConfig = calculateOptimalFontSizes(items.length, mode, canvasHeight);
    const pageBreak = smartPageBreaking(items, config, fontConfig, 900, 36);
    
    results[mode] = {
      pages: pageBreak.totalPages,
      itemsPerPage: Math.round(pageBreak.averageItemsPerPage * 10) / 10,
      utilization: Math.round(pageBreak.utilizationRate * 100)
    };
  });
  
  // Determine best recommendation
  let recommendation: 'maxItems' | 'readability' | 'aesthetic' = 'aesthetic';
  
  if (items.length <= 4) {
    recommendation = 'readability';
  } else if (items.length >= 10) {
    recommendation = 'maxItems';
  }
  
  console.log('🎯 Optimization preview:', results);
  
  return {
    ...results,
    recommendation
  };
}