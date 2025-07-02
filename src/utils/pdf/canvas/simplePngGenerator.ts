// Simplified and reliable PNG generator based on research

import { PriceCategory } from "@/components/pricing/PriceCard";
import { loadGoogleFonts, FONTS, formatPrice } from './fontUtils';
import { drawRoundedRect, drawCenteredText } from './drawingUtils';

// Simple text measurement that actually works
const measureTextHeight = (ctx: CanvasRenderingContext2D, text: string, fontSize: number): number => {
  // Based on research: height = fontSize * 1.2 (accounts for ascenders/descenders)
  return Math.ceil(fontSize * 1.2);
};

// Wrap text with precise measurement
const wrapTextSimple = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
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

// Calculate exact item height with proper measurements
const calculateExactItemHeight = (ctx: CanvasRenderingContext2D, item: any): number => {
  const hasDescription = item.description && item.description.trim() !== '';
  
  // Set fonts for measurement
  ctx.font = `600 16px ${FONTS.poppins}, sans-serif`;
  const nameLines = wrapTextSimple(ctx, item.name || '', 240);
  const nameHeight = nameLines.length * 24; // 16px font + 8px line spacing
  
  let descHeight = 0;
  if (hasDescription) {
    ctx.font = `400 13px ${FONTS.poppins}, sans-serif`;
    const descLines = wrapTextSimple(ctx, item.description, 200);
    descHeight = descLines.length * 20; // 13px font + 7px line spacing
  }
  
  // Simple padding calculation
  const topPadding = 15;
  const bottomPadding = hasDescription ? 30 : 15; // Extra space for descriptions
  const spaceBetweenNameAndDesc = hasDescription ? 10 : 0;
  
  const totalHeight = topPadding + nameHeight + spaceBetweenNameAndDesc + descHeight + bottomPadding;
  const minHeight = hasDescription ? 90 : 60;
  
  return Math.max(totalHeight, minHeight);
};

// Split categories into pages
const splitCategoryIntoPages = (category: PriceCategory, maxItemsPerPage: number = 8): PriceCategory[] => {
  if (category.items.length <= maxItemsPerPage) {
    return [category];
  }

  const pages: PriceCategory[] = [];
  const totalPages = Math.ceil(category.items.length / maxItemsPerPage);

  for (let i = 0; i < totalPages; i++) {
    const startIndex = i * maxItemsPerPage;
    const endIndex = Math.min(startIndex + maxItemsPerPage, category.items.length);
    const pageItems = category.items.slice(startIndex, endIndex);

    pages.push({
      id: `${category.id}-page-${i + 1}`,
      title: `${category.title} (${i + 1}/${totalPages})`,
      items: pageItems
    });
  }

  return pages;
};

// Generate single category PNG with proper text handling
export const generateSimpleCategoryPng = async (category: PriceCategory): Promise<Blob> => {
  await loadGoogleFonts();
  await new Promise(resolve => setTimeout(resolve, 200)); // Wait for fonts

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // 9:16 aspect ratio
  canvas.width = 450;
  canvas.height = 800;

  // Set white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const padding = 20;
  let currentY = padding;

  // Brand title
  ctx.fillStyle = '#EC4899';
  ctx.font = `700 22px ${FONTS.playfair}, serif`;
  drawCenteredText(ctx, 'Zastrzyk Piękna', canvas.width / 2, currentY + 20);
  currentY += 60;

  // Category title
  ctx.fillStyle = '#EC4899';
  drawRoundedRect(ctx, padding, currentY, canvas.width - padding * 2, 50, 12);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = `600 18px ${FONTS.poppins}, sans-serif`;
  drawCenteredText(ctx, category.title, canvas.width / 2, currentY + 25, canvas.width - padding * 4);
  currentY += 70;

  // Items with proper spacing
  category.items.forEach((item, index) => {
    const itemHeight = calculateExactItemHeight(ctx, item);
    const isEven = index % 2 === 0;
    
    // Background
    ctx.fillStyle = isEven ? '#FCF2F8' : '#ffffff';
    if (isEven) {
      drawRoundedRect(ctx, padding, currentY, canvas.width - padding * 2, itemHeight, 8);
    }

    // Service name
    ctx.fillStyle = '#333333';
    ctx.font = `600 15px ${FONTS.poppins}, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const nameLines = wrapTextSimple(ctx, item.name, canvas.width - padding * 2 - 30);
    nameLines.forEach((line, lineIndex) => {
      ctx.fillText(line, padding + 15, currentY + 15 + (lineIndex * 20));
    });

    let textY = currentY + 15 + (nameLines.length * 20) + 5;

    // Price
    ctx.fillStyle = '#EC4899';
    ctx.font = `600 15px ${FONTS.poppins}, sans-serif`;
    ctx.fillText(formatPrice(item.price), padding + 15, textY);
    textY += 20;

    // Description if exists
    if (item.description && item.description.trim() !== '') {
      ctx.fillStyle = '#666666';
      ctx.font = `400 13px ${FONTS.poppins}, sans-serif`;
      
      const descLines = wrapTextSimple(ctx, item.description, canvas.width - padding * 2 - 30);
      descLines.forEach((line, lineIndex) => {
        ctx.fillText(line, padding + 15, textY + (lineIndex * 18));
      });
    }

    currentY += itemHeight;
  });

  // Footer
  currentY = canvas.height - 60;
  ctx.fillStyle = '#666666';
  ctx.font = `400 11px ${FONTS.poppins}, sans-serif`;
  drawCenteredText(ctx, 'Gabinet Kosmetologii Estetycznej', canvas.width / 2, currentY);
  drawCenteredText(ctx, new Date().toLocaleDateString('pl-PL'), canvas.width / 2, currentY + 20);

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

// Generate full pricing PNG with proper layout
export const generateSimpleFullPricingPng = async (categories: PriceCategory[]): Promise<Blob> => {
  await loadGoogleFonts();
  await new Promise(resolve => setTimeout(resolve, 200)); // Wait for fonts

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Calculate total height needed
  let totalHeight = 200; // Header space
  const padding = 50;
  
  categories.forEach(category => {
    totalHeight += 120; // Category header + table header
    category.items.forEach(item => {
      totalHeight += calculateExactItemHeight(ctx, item);
    });
    totalHeight += 40; // Space between categories
  });

  canvas.width = 850;
  canvas.height = totalHeight;

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let currentY = 70;

  // Main title
  ctx.fillStyle = '#EC4899';
  ctx.font = `bold 36px ${FONTS.playfair}, serif`;
  drawCenteredText(ctx, 'Cennik Usług', canvas.width / 2, currentY);
  currentY += 100;

  // Draw categories
  categories.forEach((category, categoryIndex) => {
    // Category header
    ctx.fillStyle = '#EC4899';
    drawRoundedRect(ctx, padding, currentY, canvas.width - padding * 2, 70, 12);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = `600 24px ${FONTS.poppins}, sans-serif`;
    drawCenteredText(ctx, category.title, canvas.width / 2, currentY + 35);
    currentY += 90;

    // Table headers
    ctx.fillStyle = '#FDF2F8';
    drawRoundedRect(ctx, padding, currentY, canvas.width - padding * 2, 45, 8);
    
    ctx.fillStyle = '#333333';
    ctx.font = `600 16px ${FONTS.poppins}, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Nazwa zabiegu', padding + 20, currentY + 22);
    ctx.fillText('Opis', padding + 270, currentY + 22);
    ctx.textAlign = 'right';
    ctx.fillText('Cena', canvas.width - padding - 20, currentY + 22);
    currentY += 45;

    // Items
    category.items.forEach((item, itemIndex) => {
      const itemHeight = calculateExactItemHeight(ctx, item);
      const isEven = itemIndex % 2 === 0;
      
      // Background
      ctx.fillStyle = isEven ? '#FCF2F8' : '#F8F9FA';
      drawRoundedRect(ctx, padding, currentY, canvas.width - padding * 2, itemHeight, 6);

      // Service name
      ctx.fillStyle = '#1F2937';
      ctx.font = `600 16px ${FONTS.poppins}, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      
      const nameLines = wrapTextSimple(ctx, item.name || '', 240);
      nameLines.forEach((line, lineIndex) => {
        ctx.fillText(line, padding + 20, currentY + 15 + (lineIndex * 24));
      });

      // Description
      if (item.description && item.description.trim() !== '') {
        ctx.fillStyle = '#4B5563';
        ctx.font = `400 13px ${FONTS.poppins}, sans-serif`;
        
        const descLines = wrapTextSimple(ctx, item.description, 200);
        const descStartY = currentY + 15 + (nameLines.length * 24) + 10;
        
        descLines.forEach((line, lineIndex) => {
          ctx.fillText(line, padding + 270, descStartY + (lineIndex * 20));
        });
      }

      // Price
      ctx.fillStyle = '#EC4899';
      ctx.font = `600 16px ${FONTS.poppins}, sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(formatPrice(item.price), canvas.width - padding - 20, currentY + itemHeight / 2);

      currentY += itemHeight;
    });

    // Space between categories
    if (categoryIndex < categories.length - 1) {
      currentY += 40;
    }
  });

  // Footer
  currentY += 30;
  ctx.fillStyle = '#666666';
  ctx.font = `400 12px ${FONTS.poppins}, sans-serif`;
  drawCenteredText(ctx, 'Zastrzyk Piękna - Gabinet Kosmetologii Estetycznej', canvas.width / 2, currentY);
  drawCenteredText(ctx, `Wygenerowano ${new Date().toLocaleDateString('pl-PL')}`, canvas.width / 2, currentY + 20);

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

// Generate multiple category pages
export const generateSimpleCategoryPagesAsPng = async (category: PriceCategory): Promise<Blob[]> => {
  const pages = splitCategoryIntoPages(category, 8);
  const blobs: Blob[] = [];

  for (const page of pages) {
    const blob = await generateSimpleCategoryPng(page);
    blobs.push(blob);
  }

  return blobs;
};