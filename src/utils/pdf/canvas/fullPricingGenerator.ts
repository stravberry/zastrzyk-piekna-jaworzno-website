// Full pricing table PNG generator

import { PriceCategory } from "@/components/pricing/PriceCard";
import { loadGoogleFonts, FONTS, formatPrice } from './fontUtils';
import { drawRoundedRect, drawCenteredText, wrapText } from './drawingUtils';
import { calculateItemHeight } from './heightCalculator';

// Generate full pricing table as PNG using Canvas API
export const generateFullPricingPng = async (categories: PriceCategory[]): Promise<Blob> => {
  await loadGoogleFonts();

  // Create temporary canvas for text measurement
  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d')!;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Wait for fonts to load properly
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Calculate canvas dimensions with dynamic item heights based on content
  const padding = 50;
  const headerHeight = 100;
  const categoryHeaderHeight = 70;
  const spaceBetweenCategories = 40;
  const tableHeaderHeight = 45;
  
  // Pre-calculate total height with proper font context
  let totalHeight = headerHeight + padding * 2 + 40;
  
  categories.forEach(category => {
    totalHeight += categoryHeaderHeight + tableHeaderHeight + spaceBetweenCategories;
    
    category.items.forEach(item => {
      totalHeight += calculateItemHeight(measureCtx, item);
    });
  });

  console.log('Total canvas height:', totalHeight);

  canvas.width = 850;
  canvas.height = totalHeight;

  // Set white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let currentY = 60; // Adequate top margin for 36px font

  // Draw main title with proper positioning
  ctx.fillStyle = '#EC4899';
  ctx.font = `bold 36px ${FONTS.playfair}, serif`;
  drawCenteredText(ctx, 'Cennik Usług', canvas.width / 2, currentY);
  currentY += 80; // Space after title (36px font + spacing)

  // Draw categories
  categories.forEach((category, categoryIndex) => {
    // Category header with rounded corners
    ctx.fillStyle = '#EC4899';
    drawRoundedRect(ctx, padding, currentY, canvas.width - padding * 2, categoryHeaderHeight, 12);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = `600 24px ${FONTS.poppins}, sans-serif`;
    drawCenteredText(ctx, category.title, canvas.width / 2, currentY + 20, canvas.width - padding * 4); // Use top positioning
    currentY += categoryHeaderHeight;

    // Table headers
    const nameColumnX = padding + 20;
    const descColumnX = nameColumnX + 250;
    const priceColumnX = canvas.width - padding - 20;

    ctx.fillStyle = '#FDF2F8';
    drawRoundedRect(ctx, padding, currentY, canvas.width - padding * 2, tableHeaderHeight, 8);
    
    ctx.fillStyle = '#333333';
    ctx.font = `600 16px ${FONTS.poppins}, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Nazwa zabiegu', nameColumnX, currentY + tableHeaderHeight / 2);
    ctx.fillText('Opis', descColumnX, currentY + tableHeaderHeight / 2);
    ctx.textAlign = 'right';
    ctx.fillText('Cena', priceColumnX, currentY + tableHeaderHeight / 2);
    currentY += tableHeaderHeight;

    // Table items with dynamic heights based on content
    category.items.forEach((item, itemIndex) => {
      const isEven = itemIndex % 2 === 0;
      const itemHeight = calculateItemHeight(measureCtx, item);
      
      console.log('=== RENDERING ITEM ===');
      console.log('Item name:', item.name);
      console.log('Item description:', item.description);
      console.log('Calculated height:', itemHeight);
      console.log('Current Y position:', currentY);
      console.log('Will draw background from Y:', currentY, 'to Y:', currentY + itemHeight);
      
      // Row background with rounded corners - ALWAYS draw background with calculated height
      ctx.fillStyle = isEven ? '#FCF2F8' : '#F8F9FA';
      drawRoundedRect(ctx, padding, currentY, canvas.width - padding * 2, itemHeight, 6);
      
      // Debug border to see actual drawn area - temporary for testing
      ctx.strokeStyle = '#FF0000'; // Red border for debugging
      ctx.lineWidth = 2;
      ctx.strokeRect(padding, currentY, canvas.width - padding * 2, itemHeight);
      
      console.log('Background drawn from:', padding, currentY, 'width:', canvas.width - padding * 2, 'height:', itemHeight);

      // Service name at top-left of the row with proper spacing
      const hasDescription = item.description && item.description.trim() !== '';
      const nameStartY = hasDescription ? currentY + 25 : currentY + 15; // Match heightCalculator padding
      
      ctx.fillStyle = '#1F2937';
      ctx.font = `600 16px ${FONTS.poppins}, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const nameLines = wrapText(ctx, item.name || '', 240);
      
      // Draw each line of the name
      nameLines.forEach((line, lineIndex) => {
        ctx.fillText(line, nameColumnX, nameStartY + (lineIndex * 22));
      });

      // Description below the name with proper spacing
      if (item.description && item.description.trim() !== '') {
        ctx.fillStyle = '#4B5563';
        ctx.font = `400 13px ${FONTS.poppins}, sans-serif`;
        const descLines = wrapText(ctx, item.description, 200);
        
        // Calculate starting Y position for description (after name + spacing) - match heightCalculator
        const nameEndY = currentY + 25 + (nameLines.length * 22) + 15; // Match heightCalculator spacing
        
        // Draw each line of description
        descLines.forEach((line, lineIndex) => {
          ctx.fillText(line, descColumnX, nameEndY + (lineIndex * 20));
        });
      }

      // Price centered vertically in row
      ctx.fillStyle = '#EC4899';
      ctx.font = `600 16px ${FONTS.poppins}, sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(formatPrice(item.price), priceColumnX, currentY + itemHeight / 2);

      currentY += itemHeight;
    });

    // Add spacing between categories
    if (categoryIndex < categories.length - 1) {
      currentY += spaceBetweenCategories;
    }
  });

  // Footer
  currentY += 30;
  ctx.fillStyle = '#666666';
  ctx.font = `400 12px ${FONTS.poppins}, sans-serif`;
  drawCenteredText(ctx, 'Zastrzyk Piękna - Gabinet Kosmetologii Estetycznej', canvas.width / 2, currentY);
  currentY += 20;
  drawCenteredText(ctx, `Wygenerowano ${new Date().toLocaleDateString('pl-PL')}`, canvas.width / 2, currentY);

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