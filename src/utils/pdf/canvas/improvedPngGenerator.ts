// Improved PNG generator with better spacing, responsiveness and font handling
// This replaces the existing generators with a more reliable approach

import { PriceCategory } from "@/components/pricing/PriceCard";
import { 
  PngGenerationConfig, 
  DEFAULT_CONFIG, 
  getAutoConfig 
} from "@/services/pricing/pricingPngConfig";

// Use system fonts for better reliability
const SYSTEM_FONTS = {
  title: 'bold 18px system-ui, -apple-system, sans-serif',
  header: 'bold 16px system-ui, -apple-system, sans-serif',
  name: 'bold 15px system-ui, -apple-system, sans-serif',
  description: '14px system-ui, -apple-system, sans-serif',
  price: 'bold 15px system-ui, -apple-system, sans-serif',
  brand: 'bold 22px serif',
  footer: '12px system-ui, -apple-system, sans-serif'
};

// Better text wrapping that accounts for font metrics
const wrapTextImproved = (
  ctx: CanvasRenderingContext2D, 
  text: string, 
  maxWidth: number
): string[] => {
  if (!text || text.trim() === '') return [''];
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines.length > 0 ? lines : [''];
};

// Calculate accurate item height with padding
const calculateDynamicItemHeight = (
  ctx: CanvasRenderingContext2D, 
  item: any, 
  config: PngGenerationConfig
): number => {
  const hasDescription = item.description && item.description.trim() !== '';
  
  // Measure name
  ctx.font = SYSTEM_FONTS.name;
  const nameLines = wrapTextImproved(ctx, item.name || '', config.nameColumnWidth - 20);
  const nameHeight = nameLines.length * config.lineSpacing;
  
  // Measure description
  let descHeight = 0;
  if (hasDescription) {
    ctx.font = SYSTEM_FONTS.description;
    const descLines = wrapTextImproved(ctx, item.description, config.descColumnWidth - 20);
    descHeight = descLines.length * (config.lineSpacing - 2); // Slightly smaller line height for descriptions
  }
  
  // Calculate total height with proper padding
  const topPadding = 12;
  const bottomPadding = hasDescription ? 15 : 12;
  const spaceBetweenElements = hasDescription ? 8 : 0;
  
  const contentHeight = nameHeight + spaceBetweenElements + descHeight;
  const totalHeight = topPadding + contentHeight + bottomPadding;
  
  // Ensure minimum and maximum heights
  return Math.max(config.minItemHeight, Math.min(totalHeight, config.maxItemHeight));
};

// Check if items fit on a page based on actual heights
const canFitOnPage = (
  ctx: CanvasRenderingContext2D,
  items: any[],
  availableHeight: number,
  config: PngGenerationConfig
): boolean => {
  const totalHeight = items.reduce((sum, item) => 
    sum + calculateDynamicItemHeight(ctx, item, config), 0
  );
  return totalHeight <= availableHeight;
};

// Split category intelligently based on content height
const splitCategoryByHeight = (
  ctx: CanvasRenderingContext2D,
  category: PriceCategory, 
  config: PngGenerationConfig
): PriceCategory[] => {
  if (category.items.length <= 4) return [category]; // Small categories don't need splitting
  
  const availableHeight = 650; // Approximate available space for items
  const pages: PriceCategory[] = [];
  let currentItems: any[] = [];
  let currentHeight = 0;
  
  for (const item of category.items) {
    const itemHeight = calculateDynamicItemHeight(ctx, item, config);
    
    if (currentHeight + itemHeight > availableHeight && currentItems.length > 0) {
      // Create a page with current items
      pages.push({
        id: `${category.id}-page-${pages.length + 1}`,
        title: `${category.title} (${pages.length + 1})`,
        items: [...currentItems]
      });
      
      currentItems = [item];
      currentHeight = itemHeight;
    } else {
      currentItems.push(item);
      currentHeight += itemHeight;
    }
  }
  
  if (currentItems.length > 0) {
    pages.push({
      id: `${category.id}-page-${pages.length + 1}`,
      title: pages.length > 0 ? `${category.title} (${pages.length + 1})` : category.title,
      items: currentItems
    });
  }
  
  return pages;
};

// Draw rounded rectangle helper
const drawRoundedRect = (
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  radius: number = 8
): void => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fill();
};

// Draw text with proper alignment
const drawText = (
  ctx: CanvasRenderingContext2D, 
  text: string, 
  x: number, 
  y: number, 
  align: 'left' | 'center' | 'right' = 'left'
): void => {
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillText(text, x, y);
};

// Generate single category PNG with improved layout
export const generateImprovedCategoryPng = async (
  category: PriceCategory,
  config: PngGenerationConfig = DEFAULT_CONFIG
): Promise<Blob> => {
  // Auto-adjust config based on content
  const hasLongDescriptions = category.items.some(item => 
    item.description && item.description.length > 50
  );
  const finalConfig = config === DEFAULT_CONFIG 
    ? getAutoConfig(category.items.length, hasLongDescriptions)
    : config;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Set canvas size from config
  canvas.width = finalConfig.canvasWidth;
  canvas.height = finalConfig.canvasHeight;
  
  // Enable anti-aliasing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  let currentY = finalConfig.padding;
  
  // Brand title
  ctx.fillStyle = '#EC4899';
  ctx.font = SYSTEM_FONTS.brand;
  drawText(ctx, 'Zastrzyk Piękna', canvas.width / 2, currentY, 'center');
  currentY += 50;
  
  // Category header
  ctx.fillStyle = '#EC4899';
  drawRoundedRect(ctx, finalConfig.padding, currentY, canvas.width - finalConfig.padding * 2, 45, 8);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = SYSTEM_FONTS.header;
  drawText(ctx, category.title, canvas.width / 2, currentY + 12, 'center');
  currentY += 65;
  
  // Draw items
  category.items.forEach((item, index) => {
    const itemHeight = calculateDynamicItemHeight(ctx, item, finalConfig);
    const isEven = index % 2 === 0;
    
    // Alternating background
    if (isEven) {
      ctx.fillStyle = '#FCF2F8';
      drawRoundedRect(ctx, finalConfig.padding, currentY, canvas.width - finalConfig.padding * 2, itemHeight, 6);
    }
    
    let textY = currentY + 12;
    
    // Service name
    ctx.fillStyle = '#1F2937';
    ctx.font = SYSTEM_FONTS.name;
    const nameLines = wrapTextImproved(ctx, item.name, finalConfig.nameColumnWidth);
    nameLines.forEach((line, lineIndex) => {
      drawText(ctx, line, finalConfig.padding + 15, textY + (lineIndex * finalConfig.lineSpacing));
    });
    
    textY += nameLines.length * finalConfig.lineSpacing + 8;
    
    // Price
    ctx.fillStyle = '#EC4899';
    ctx.font = SYSTEM_FONTS.price;
    const priceText = item.price.includes('zł') ? item.price : `${item.price} zł`;
    drawText(ctx, priceText, finalConfig.padding + 15, textY);
    textY += finalConfig.lineSpacing + 4;
    
    // Description
    if (item.description && item.description.trim() !== '') {
      ctx.fillStyle = '#4B5563';
      ctx.font = SYSTEM_FONTS.description;
      const descLines = wrapTextImproved(ctx, item.description, finalConfig.descColumnWidth);
      descLines.forEach((line, lineIndex) => {
        drawText(ctx, line, finalConfig.padding + 15, textY + (lineIndex * (finalConfig.lineSpacing - 2)));
      });
    }
    
    currentY += itemHeight;
  });
  
  // Footer
  currentY = canvas.height - 40;
  ctx.fillStyle = '#666666';
  ctx.font = SYSTEM_FONTS.footer;
  drawText(ctx, 'Gabinet Kosmetologii Estetycznej', canvas.width / 2, currentY, 'center');
  drawText(ctx, new Date().toLocaleDateString('pl-PL'), canvas.width / 2, currentY + 15, 'center');
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        throw new Error('Nie udało się utworzyć obrazu');
      }
    }, 'image/png', 1.0);
  });
};

// Generate full pricing table PNG with proper column layout
export const generateImprovedFullPricingPng = async (
  categories: PriceCategory[],
  config: PngGenerationConfig = DEFAULT_CONFIG
): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Calculate total height needed
  let totalHeight = 150; // Header space
  
  categories.forEach(category => {
    totalHeight += 90; // Category header
    totalHeight += 40; // Table header
    category.items.forEach(item => {
      totalHeight += calculateDynamicItemHeight(ctx, item, config);
    });
    totalHeight += 30; // Space between categories
  });
  
  totalHeight += 60; // Footer space
  
  canvas.width = 850;
  canvas.height = totalHeight;
  
  // Enable anti-aliasing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  let currentY = 50;
  
  // Main title
  ctx.fillStyle = '#EC4899';
  ctx.font = 'bold 32px serif';
  drawText(ctx, 'Cennik Usług', canvas.width / 2, currentY, 'center');
  currentY += 80;
  
  // Process categories
  categories.forEach((category, categoryIndex) => {
    // Category header
    ctx.fillStyle = '#EC4899';
    drawRoundedRect(ctx, 40, currentY, canvas.width - 80, 60, 8);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = SYSTEM_FONTS.header;
    drawText(ctx, category.title, canvas.width / 2, currentY + 18, 'center');
    currentY += 80;
    
    // Table headers
    ctx.fillStyle = '#FDF2F8';
    drawRoundedRect(ctx, 40, currentY, canvas.width - 80, 35, 6);
    
    ctx.fillStyle = '#333333';
    ctx.font = SYSTEM_FONTS.header;
    drawText(ctx, 'Nazwa zabiegu', 55, currentY + 10);
    drawText(ctx, 'Opis', 340, currentY + 10);
    drawText(ctx, 'Cena', canvas.width - 55, currentY + 10, 'right');
    currentY += 35;
    
    // Items
    category.items.forEach((item, itemIndex) => {
      const itemHeight = calculateDynamicItemHeight(ctx, item, config);
      const isEven = itemIndex % 2 === 0;
      
      // Alternating background
      ctx.fillStyle = isEven ? '#FCF2F8' : '#F8F9FA';
      drawRoundedRect(ctx, 40, currentY, canvas.width - 80, itemHeight, 4);
      
      let textY = currentY + 12;
      
      // Service name
      ctx.fillStyle = '#1F2937';
      ctx.font = SYSTEM_FONTS.name;
      const nameLines = wrapTextImproved(ctx, item.name, 260);
      nameLines.forEach((line, lineIndex) => {
        drawText(ctx, line, 55, textY + (lineIndex * config.lineSpacing));
      });
      
      // Description
      if (item.description && item.description.trim() !== '') {
        ctx.fillStyle = '#4B5563';
        ctx.font = SYSTEM_FONTS.description;
        const descLines = wrapTextImproved(ctx, item.description, 260);
        descLines.forEach((line, lineIndex) => {
          drawText(ctx, line, 340, textY + (lineIndex * (config.lineSpacing - 2)));
        });
      }
      
      // Price
      ctx.fillStyle = '#EC4899';
      ctx.font = SYSTEM_FONTS.price;
      const priceText = item.price.includes('zł') ? item.price : `${item.price} zł`;
      drawText(ctx, priceText, canvas.width - 55, currentY + itemHeight / 2, 'right');
      
      currentY += itemHeight;
    });
    
    // Space between categories
    if (categoryIndex < categories.length - 1) {
      currentY += 30;
    }
  });
  
  // Footer
  currentY += 30;
  ctx.fillStyle = '#666666';
  ctx.font = SYSTEM_FONTS.footer;
  drawText(ctx, 'Zastrzyk Piękna - Gabinet Kosmetologii Estetycznej', canvas.width / 2, currentY, 'center');
  drawText(ctx, `Wygenerowano ${new Date().toLocaleDateString('pl-PL')}`, canvas.width / 2, currentY + 15, 'center');
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        throw new Error('Nie udało się utworzyć obrazu');
      }
    }, 'image/png', 1.0);
  });
};

// Generate multiple pages for large categories
export const generateImprovedCategoryPages = async (
  category: PriceCategory,
  config: PngGenerationConfig = DEFAULT_CONFIG
): Promise<Blob[]> => {
  // Auto-adjust config based on content
  const hasLongDescriptions = category.items.some(item => 
    item.description && item.description.length > 50
  );
  const finalConfig = config === DEFAULT_CONFIG 
    ? getAutoConfig(category.items.length, hasLongDescriptions)
    : config;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  const pages = splitCategoryByHeight(ctx, category, finalConfig);
  const blobs: Blob[] = [];
  
  for (const page of pages) {
    const blob = await generateImprovedCategoryPng(page, finalConfig);
    blobs.push(blob);
  }
  
  return blobs;
};