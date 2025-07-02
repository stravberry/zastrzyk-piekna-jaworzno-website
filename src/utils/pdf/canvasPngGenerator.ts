import { PriceCategory } from "@/components/pricing/PriceCard";

// Font configuration
const FONTS = {
  playfair: 'Playfair Display',
  poppins: 'Poppins'
};

// Load Google Fonts using FontFace API
const loadGoogleFonts = async (): Promise<void> => {
  try {
    // Load Playfair Display
    const playfairFont = new FontFace(FONTS.playfair, 'url(https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap)');
    await playfairFont.load();
    document.fonts.add(playfairFont);

    // Load Poppins
    const poppinsFont = new FontFace(FONTS.poppins, 'url(https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap)');
    await poppinsFont.load();
    document.fonts.add(poppinsFont);

    console.log('Google Fonts loaded successfully');
  } catch (error) {
    console.warn('Failed to load Google Fonts, using system fonts:', error);
  }
};

// Format price with Polish currency
const formatPrice = (price: string): string => {
  if (price.toLowerCase().includes('zł')) {
    return price;
  }
  return price.trim() + ' zł';
};

// Draw rounded rectangle
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
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
};

// Enhanced text wrapping with better word handling
const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] => {
  if (!text || text.trim() === '') return [''];
  
  const words = text.split(/\s+/);
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

// Enhanced centered text with proper multiline handling
const drawCenteredText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth?: number
): void => {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  if (maxWidth && text.length > 0) {
    const lines = wrapText(ctx, text, maxWidth);
    const lineHeight = 22;
    const totalHeight = (lines.length - 1) * lineHeight;
    const startY = y - totalHeight / 2;
    
    lines.forEach((line, index) => {
      ctx.fillText(line, x, startY + (index * lineHeight));
    });
  } else {
    ctx.fillText(text, x, y);
  }
};

// Enhanced left-aligned text with better line spacing
const drawLeftText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth?: number
): void => {
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  
  if (maxWidth && text && text.length > 0) {
    const lines = wrapText(ctx, text, maxWidth);
    const lineHeight = 20;
    
    lines.forEach((line, index) => {
      ctx.fillText(line, x, y + (index * lineHeight));
    });
  } else if (text) {
    ctx.fillText(text, x, y);
  }
};

// Enhanced right-aligned text
const drawRightText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth?: number
): void => {
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  
  if (maxWidth && text && text.length > 0) {
    const lines = wrapText(ctx, text, maxWidth);
    const lineHeight = 20;
    const totalHeight = (lines.length - 1) * lineHeight;
    const startY = y - totalHeight / 2;
    
    lines.forEach((line, index) => {
      ctx.fillText(line, x, startY + (index * lineHeight));
    });
  } else if (text) {
    ctx.fillText(text, x, y);
  }
};

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
  const baseItemRowHeight = 60; // Minimum height for items
  const spaceBetweenCategories = 40;
  const tableHeaderHeight = 45;
  
  // Enhanced function to calculate required height for an item
  const calculateItemHeight = (item: any): number => {
    const hasDescription = item.description && item.description.trim() !== '';
    const minHeight = hasDescription ? 100 : 70; // Bigger minimum height for items with descriptions
    const nameColumnWidth = 240;
    const descColumnWidth = 200;
    
    // Use measurement context with proper fonts
    measureCtx.font = `600 16px ${FONTS.poppins}, sans-serif`;
    const nameLines = wrapText(measureCtx, item.name || '', nameColumnWidth);
    const nameHeight = nameLines.length * 22; // Line height for names
    
    let descHeight = 0;
    if (hasDescription) {
      measureCtx.font = `400 13px ${FONTS.poppins}, sans-serif`;
      const descLines = wrapText(measureCtx, item.description, descColumnWidth);
      descHeight = descLines.length * 20; // Line height for descriptions
    }
    
    // Calculate total height with generous spacing for descriptions
    const paddingTop = hasDescription ? 20 : 15;
    const spaceBetweenNameAndDesc = hasDescription ? 12 : 0;
    const paddingBottom = hasDescription ? 25 : 15;
    
    const totalContentHeight = nameHeight + spaceBetweenNameAndDesc + descHeight;
    const finalHeight = Math.max(minHeight, totalContentHeight + paddingTop + paddingBottom);
    
    console.log('Item height calc:', {
      name: item.name?.substring(0, 30) + '...',
      hasDesc: hasDescription,
      nameLines: nameLines.length,
      descLines: hasDescription ? wrapText(measureCtx, item.description, descColumnWidth).length : 0,
      nameHeight,
      descHeight,
      totalContentHeight,
      finalHeight,
      minHeight,
      paddingTop,
      paddingBottom,
      spaceBetweenNameAndDesc
    });
    
    return finalHeight;
  };
  
  // Pre-calculate total height with proper font context
  let totalHeight = headerHeight + padding * 2 + 40;
  
  categories.forEach(category => {
    totalHeight += categoryHeaderHeight + tableHeaderHeight + spaceBetweenCategories;
    
    category.items.forEach(item => {
      totalHeight += calculateItemHeight(item);
    });
  });

  console.log('Total canvas height:', totalHeight);

  canvas.width = 850;
  canvas.height = totalHeight;

  // Set white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let currentY = padding + 20; // Extra top margin

  // Draw main title with better spacing
  ctx.fillStyle = '#EC4899';
  ctx.font = `bold 36px ${FONTS.playfair}, serif`;
  drawCenteredText(ctx, 'Cennik Usług', canvas.width / 2, currentY + 50);
  currentY += headerHeight + 30; // More space after title

  // Draw categories
  categories.forEach((category, categoryIndex) => {
    // Category header with rounded corners
    ctx.fillStyle = '#EC4899';
    drawRoundedRect(ctx, padding, currentY, canvas.width - padding * 2, categoryHeaderHeight, 12);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = `600 24px ${FONTS.poppins}, sans-serif`;
    drawCenteredText(ctx, category.title, canvas.width / 2, currentY + categoryHeaderHeight / 2, canvas.width - padding * 4);
    currentY += categoryHeaderHeight;

    // Table headers
    const tableStartY = currentY;
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
      const itemHeight = calculateItemHeight(item);
      
      console.log('Drawing item row:', {
        name: item.name?.substring(0, 20) + '...',
        height: itemHeight,
        y: currentY,
        hasDesc: !!item.description
      });
      
      // Row background with rounded corners - ALWAYS draw background with calculated height
      ctx.fillStyle = isEven ? '#FCF2F8' : '#F8F9FA';
      drawRoundedRect(ctx, padding, currentY, canvas.width - padding * 2, itemHeight, 6);
      
      // Optional: Debug border to see actual drawn area (commented out for production)
      // ctx.strokeStyle = isEven ? '#EC4899' : '#6B7280';
      // ctx.lineWidth = 1;
      // ctx.strokeRect(padding, currentY, canvas.width - padding * 2, itemHeight);

      // Service name at top-left of the row with proper spacing
      const hasDescription = item.description && item.description.trim() !== '';
      const nameStartY = hasDescription ? currentY + 20 : currentY + 15;
      
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
        
        // Calculate starting Y position for description (after name + spacing)
        const nameEndY = currentY + 20 + (nameLines.length * 22) + 12;
        
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

// Split category into pages if it has too many items
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

// Generate single category PNG in 9:16 format using Canvas API
export const generateSingleCategoryPng = async (category: PriceCategory): Promise<Blob> => {
  await loadGoogleFonts();

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

  // Category title with rounded corners
  ctx.fillStyle = '#EC4899';
  drawRoundedRect(ctx, padding, currentY, canvas.width - padding * 2, 50, 12);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = `600 18px ${FONTS.poppins}, sans-serif`;
  drawCenteredText(ctx, category.title, canvas.width / 2, currentY + 25, canvas.width - padding * 4);
  currentY += 70;

  // Items
  const itemHeight = 70;
  category.items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    
    // Item background with rounded corners
    ctx.fillStyle = isEven ? '#FCF2F8' : '#ffffff';
    if (isEven) {
      drawRoundedRect(ctx, padding, currentY, canvas.width - padding * 2, itemHeight, 8);
    }

    // Service name
    ctx.fillStyle = '#333333';
    ctx.font = `600 15px ${FONTS.poppins}, sans-serif`;
    drawLeftText(ctx, item.name, padding + 15, currentY + 18, canvas.width - padding * 2 - 30);

    // Price
    ctx.fillStyle = '#EC4899';
    ctx.font = `600 15px ${FONTS.poppins}, sans-serif`;
    drawLeftText(ctx, formatPrice(item.price), padding + 15, currentY + 38, canvas.width - padding * 2 - 30);

    // Description
    if (item.description) {
      ctx.fillStyle = '#666666';
      ctx.font = `400 13px ${FONTS.poppins}, sans-serif`;
      drawLeftText(ctx, item.description, padding + 15, currentY + 58, canvas.width - padding * 2 - 30);
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